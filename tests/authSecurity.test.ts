import assert from 'node:assert/strict';
import test from 'node:test';
import jwt from 'jsonwebtoken';
import {
  authenticateBearer,
  canAccessStudent,
  canManageResult,
  canUseProtectedRoute,
  canReadResult,
  hashPassword,
  issueSessionToken,
  markSeedDemoUsers,
  verifyAccountPassword,
  verifySessionToken,
} from '../src/server/authSecurity';
import { AcademicResult, Student, User } from '../src/types';

const secret = 'test-secret-with-more-than-32-characters';
const now = Date.UTC(2026, 0, 1);
const teacher: User = {
  id: 'teacher-1', email: 'teacher@test.local', name: 'Teacher', role: 'TEACHER',
  assignedClasses: ['class-a'], createdAt: '2026-01-01T00:00:00.000Z',
};
const superAdmin: User = {
  id: 'usr-super-admin', email: 'admin@test.local', name: 'Super Admin', role: 'SUPER_ADMIN',
  createdAt: '2026-01-01T00:00:00.000Z',
};
const student: Student = {
  id: 'student-1', admissionNo: 'PCD/2026/0001', firstName: 'Test', lastName: 'Student',
  gender: 'Female', dateOfBirth: '2015-01-01', arm: 'PRIMARY', classId: 'class-a',
  className: 'Primary 1', parentId: 'parent-1', parentName: 'Parent', parentPhone: '08000000000',
  parentEmail: 'parent@test.local', address: 'Doma', sportsHouse: 'Purple (Faith)', status: 'ACTIVE',
  enrolledDate: '2026-01-01',
};
const result: AcademicResult = {
  id: 'result-1', studentId: student.id, studentName: 'Test Student', admissionNo: student.admissionNo,
  classId: student.classId, className: student.className, arm: student.arm, academicSession: '2025/2026',
  term: 'First Term', subjects: [], totalScore: 0, maxScore: 0, average: 0, attendanceDays: 0,
  totalDays: 0, teacherRemark: '', principalRemark: '', published: false,
};

test('accepts a valid signed session and resolves role from the database user', () => {
  const token = issueSessionToken(teacher.id, secret, now);
  assert.equal(verifySessionToken(token, secret, [teacher], now)?.role, 'TEACHER');
  assert.equal(authenticateBearer(`Bearer ${token}`, secret, [teacher], now)?.id, teacher.id);
});

test('rejects forged, malformed, wrong-secret, and expired tokens', () => {
  const forged = `${teacher.id}:SUPER_ADMIN:admin@test.local`;
  const expired = jwt.sign({ iat: Math.floor(now / 1000) - 10 }, secret, {
    algorithm: 'HS256', subject: teacher.id, issuer: 'peculiar-college-doma', audience: 'pcd-web',
    expiresIn: -1,
  });
  assert.equal(verifySessionToken(forged, secret, [teacher], now), null);
  assert.equal(verifySessionToken(issueSessionToken(teacher.id, 'different-secret-over-32-chars'), secret, [teacher], now), null);
  assert.equal(verifySessionToken(expired, secret, [teacher], now), null);
  assert.equal(authenticateBearer(`Basic ${issueSessionToken(teacher.id, secret, now)}`, secret, [teacher], now), null);
});

test('does not accept a role claim as authority or allow inactive Super Admin sessions', () => {
  const escalated = jwt.sign({ role: 'SUPER_ADMIN', ver: 0 }, secret, {
    algorithm: 'HS256', subject: teacher.id, issuer: 'peculiar-college-doma', audience: 'pcd-web', expiresIn: '1h',
  });
  assert.equal(verifySessionToken(escalated, secret, [teacher], now)?.role, 'TEACHER');
  assert.equal(verifySessionToken(issueSessionToken(superAdmin.id, secret, now), secret, [{ ...superAdmin, isActive: false }], now), null);
});

test('verifies bcrypt passwords and rejects shared demo passwords for real accounts', () => {
  const bcryptUser = { ...teacher, password: hashPassword('A long unique password!') };
  assert.equal(verifyAccountPassword(bcryptUser, 'A long unique password!', false), true);
  assert.equal(verifyAccountPassword(bcryptUser, 'Peculiar@2026', false), false);
  assert.equal(verifyAccountPassword({ ...teacher, password: hashPassword('admin123') }, 'admin123', false), false);
  assert.equal(verifyAccountPassword({ ...teacher, password: undefined }, 'Peculiar@2026', false), false);
  assert.equal(verifyAccountPassword({ ...superAdmin, password: '@Admin2005' }, '@Admin2005', false), false);
  assert.equal(verifyAccountPassword({ ...superAdmin, isDemo: true, password: undefined }, '@Admin2005', true), true);
});

test('enforces class and student resource boundaries', () => {
  const otherClassStudent = { ...student, classId: 'class-b', className: 'Primary 2' };
  const parent: User = { ...teacher, id: 'parent-1', role: 'PARENT', assignedClasses: undefined, linkedStudentIds: [student.id] };
  const unrelatedStudent: User = { ...teacher, id: 'student-user', role: 'STUDENT', assignedClasses: undefined, linkedStudentIds: ['another-student'] };
  assert.equal(canAccessStudent(teacher, student), true);
  assert.equal(canAccessStudent(teacher, otherClassStudent), false);
  assert.equal(canAccessStudent(parent, student), true);
  assert.equal(canAccessStudent(unrelatedStudent, student), false);
  assert.equal(canManageResult(teacher, student), true);
  assert.equal(canManageResult(teacher, otherClassStudent), false);
  assert.equal(canReadResult(parent, result, student), false);
  assert.equal(canReadResult(unrelatedStudent, { ...result, published: true }, student), false);
  assert.equal(canReadResult(teacher, result, student), true);
});

test('enables demo mode only for exact seeded identities and clears it when disabled', () => {
  const seeded: User = { ...superAdmin, isDemo: false };
  const impersonating: User = { ...superAdmin, id: `${superAdmin.id}-copy`, isDemo: true };
  markSeedDemoUsers([seeded, impersonating], [superAdmin], true);
  assert.equal(seeded.isDemo, true);
  assert.equal(impersonating.isDemo, false);
  markSeedDemoUsers([seeded], [superAdmin], false);
  assert.equal(seeded.isDemo, false);
});

test('temporary-password accounts may only access password-change and session endpoints', () => {
  const temporaryAccount = { ...teacher, mustChangePassword: true };
  assert.equal(canUseProtectedRoute(temporaryAccount, '/api/auth/change-password'), true);
  assert.equal(canUseProtectedRoute(temporaryAccount, '/api/auth/me'), true);
  assert.equal(canUseProtectedRoute(temporaryAccount, '/api/students'), false);
});