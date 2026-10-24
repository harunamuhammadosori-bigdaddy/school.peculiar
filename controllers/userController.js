import { randomInt } from 'node:crypto';
import mongoose from 'mongoose';
import User from '../models/User.js';

// Role ceilings are enforced here even when a route guard also restricts access.
const CREATE_ROLES = Object.freeze({
  super_admin: new Set(['admin', 'principal', 'teacher', 'bursar', 'parent', 'student']),
  admin: new Set(['principal', 'teacher', 'bursar', 'parent', 'student']),
  principal: new Set(['teacher', 'bursar', 'parent', 'student']),
  teacher: new Set(['student']),
});
const DELETE_ROLES = Object.freeze({
  super_admin: new Set(['admin', 'principal', 'teacher', 'bursar', 'parent', 'student']),
  admin: new Set(['principal', 'teacher', 'bursar', 'parent', 'student']),
  principal: new Set(['teacher', 'bursar', 'parent', 'student']),
  teacher: new Set(['student']),
});
const GLOBAL_VIEW_ROLES = new Set(['super_admin', 'admin']);
const PRINCIPAL_VIEW_ROLES = ['teacher', 'student', 'parent', 'bursar'];

function isValidId(value) {
  return typeof value === 'string' && mongoose.isValidObjectId(value);
}

function toPublicUser(user) {
  const value = user.toObject ? user.toObject() : { ...user };
  delete value.password;
  delete value.__v;
  return value;
}

function makeStudentId() {
  return `PCD-STU-${Date.now()}-${randomInt(1000, 10000)}`;
}

async function verifyStudentIds(ids) {
  if (!Array.isArray(ids) || !ids.every(isValidId)) return null;
  const students = await User.find({ _id: { $in: ids }, role: 'student' }).select('_id');
  return students.length === new Set(ids.map(String)).size ? students : null;
}

export async function createUser(req, res, next) {
  try {
    const actor = await User.findById(req.user.id);
    if (!actor) return res.status(401).json({ error: 'Account is no longer active.' });

    const role = typeof req.body?.role === 'string' ? req.body.role : '';
    if (!CREATE_ROLES[actor.role]?.has(role)) {
      return res.status(403).json({ error: 'You are not allowed to create this role.' });
    }

    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const requestedEmail = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    if (!name || (!requestedEmail && role !== 'student')) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    const studentId = role === 'student'
      ? (typeof req.body?.studentId === 'string' && req.body.studentId.trim() ? req.body.studentId.trim().toUpperCase() : makeStudentId())
      : undefined;
    const email = requestedEmail || `${studentId.toLowerCase()}@students.peculiar.local`;
    const password = req.body?.password;
    if (typeof password !== 'string' || password.length < 12 || ['@Admin2005', 'Peculiar@2026', 'admin123', '123456'].includes(password)) {
      return res.status(400).json({ error: 'A unique password of at least 12 characters is required.' });
    }

    const userData = {
      name,
      email,
      password,
      role,
      isActive: true,
      ...(studentId ? { studentId, mustChangePassword: !submittedPassword } : {}),
      ...(role === 'student' && typeof req.body?.className === 'string' ? { className: req.body.className.trim() } : {}),
    };

    if (role === 'student' && req.body?.parentId) {
      if (!isValidId(req.body.parentId)) return res.status(400).json({ error: 'Invalid parent ID.' });
      const parent = await User.findOne({ _id: req.body.parentId, role: 'parent' });
      if (!parent) return res.status(400).json({ error: 'The selected parent account does not exist.' });
      userData.parentId = parent._id;
    }

    if (role === 'parent' && Array.isArray(req.body?.children) && req.body.children.length) {
      const children = await verifyStudentIds(req.body.children);
      if (!children) return res.status(400).json({ error: 'Every child ID must identify an existing student.' });
      userData.children = children.map((child) => child._id);
    }

    const user = await User.create(userData);
    if (role === 'student' && actor.role === 'teacher') {
      actor.assignedStudents.addToSet(user._id);
      await actor.save();
      user.assignedStudents.addToSet(actor._id);
      await user.save();
    }
    if (role === 'student' && user.parentId) {
      await User.updateOne({ _id: user.parentId, role: 'parent' }, { $addToSet: { children: user._id } });
    }
    if (role === 'parent' && userData.children?.length) {
      await User.updateMany({ _id: { $in: userData.children }, role: 'student' }, { $set: { parentId: user._id } });
    }

    return res.status(201).json({ user: toPublicUser(user) });
  } catch (error) {
    return next(error);
  }
}

export async function deleteUser(req, res, next) {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid user ID.' });
    const actor = await User.findById(req.user.id);
    const target = await User.findById(req.params.id);
    if (!actor) return res.status(401).json({ error: 'Account is no longer active.' });
    if (!target) return res.status(404).json({ error: 'User not found.' });

    if (!DELETE_ROLES[actor.role]?.has(target.role)) {
      return res.status(403).json({ error: 'You are not allowed to delete this role.' });
    }
    if (actor.role === 'teacher' && !actor.assignedStudents.some((id) => id.equals(target._id))) {
      return res.status(403).json({ error: 'Teachers may delete only students assigned to them.' });
    }

    if (target.role === 'student') {
      await User.updateMany({ role: 'parent' }, { $pull: { children: target._id } });
      await User.updateMany({ role: 'teacher' }, { $pull: { assignedStudents: target._id } });
    }
    if (target.role === 'teacher') {
      await User.updateMany({ role: 'student' }, { $pull: { assignedStudents: target._id } });
    }
    if (target.role === 'parent') {
      await User.updateMany({ role: 'student', parentId: target._id }, { $set: { parentId: null } });
    }

    await target.deleteOne();
    return res.json({ success: true, deletedUserId: target._id.toString() });
  } catch (error) {
    return next(error);
  }
}

export async function getUsers(req, res, next) {
  try {
    const actor = await User.findById(req.user.id).select('role children assignedStudents');
    if (!actor) return res.status(401).json({ error: 'Account is no longer active.' });

    let users;
    if (GLOBAL_VIEW_ROLES.has(actor.role)) {
      const visibility = actor.role === 'super_admin' ? {} : { role: { $ne: 'super_admin' } };
      users = await User.find(visibility).sort({ name: 1 });
    } else if (actor.role === 'principal') {
      users = await User.find({ role: { $in: PRINCIPAL_VIEW_ROLES } }).sort({ name: 1 });
    } else if (actor.role === 'teacher') {
      users = await User.find({ _id: { $in: actor.assignedStudents }, role: 'student' }).sort({ name: 1 });
    } else if (actor.role === 'parent') {
      users = await User.find({ _id: { $in: actor.children }, role: 'student' }).sort({ name: 1 });
    } else if (actor.role === 'student') {
      users = await User.find({ _id: actor._id, role: 'student' });
    } else {
      return res.status(403).json({ error: 'You are not allowed to list user accounts.' });
    }
    return res.json({ users: users.map(toPublicUser) });
  } catch (error) {
    return next(error);
  }
}

export async function getParentChildren(req, res, next) {
  try {
    const parent = await User.findOne({ _id: req.user.id, role: 'parent' }).select('children');
    if (!parent) return res.status(401).json({ error: 'Parent account is no longer active.' });
    const children = await User.find({ _id: { $in: parent.children }, role: 'student' }).sort({ name: 1 });
    return res.json({ students: children.map(toPublicUser) });
  } catch (error) {
    return next(error);
  }
}

export async function getTeacherStudents(req, res, next) {
  try {
    const teacher = await User.findOne({ _id: req.user.id, role: 'teacher' }).select('assignedStudents');
    if (!teacher) return res.status(401).json({ error: 'Teacher account is no longer active.' });
    const students = await User.find({ _id: { $in: teacher.assignedStudents }, role: 'student' }).sort({ name: 1 });
    return res.json({ students: students.map(toPublicUser) });
  } catch (error) {
    return next(error);
  }
}

export async function getStudents(req, res, next) {
  try {
    const actor = await User.findById(req.user.id).select('role children assignedStudents');
    if (!actor) return res.status(401).json({ error: 'Account is no longer active.' });

    let query;
    if (GLOBAL_VIEW_ROLES.has(actor.role) || actor.role === 'principal') query = { role: 'student' };
    else if (actor.role === 'teacher') query = { _id: { $in: actor.assignedStudents }, role: 'student' };
    else if (actor.role === 'parent') query = { _id: { $in: actor.children }, role: 'student' };
    else if (actor.role === 'student') query = { _id: actor._id, role: 'student' };
    else return res.status(403).json({ error: 'You are not allowed to view student data.' });

    const students = await User.find(query).sort({ name: 1 });
    return res.json({ students: students.map(toPublicUser) });
  } catch (error) {
    return next(error);
  }
}

export async function getSelf(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    return res.json({ user: toPublicUser(user) });
  } catch (error) {
    return next(error);
  }
}
