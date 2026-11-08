import express from 'express';
import path from 'path';
import fs from 'fs';
import { randomBytes, randomUUID } from 'node:crypto';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import {
  INITIAL_USERS,
  INITIAL_STUDENTS,
  INITIAL_CLASSES,
  INITIAL_RESULTS,
  INITIAL_ADMISSIONS,
  INITIAL_FEES,
  INITIAL_NEWS,
  INITIAL_CONTACT_MESSAGES,
  INITIAL_AUDIT_LOGS,
} from './src/data/mockData';
import { INITIAL_GALLERY_MEDIA } from './src/data/mediaData';
import {
  AdmissionApplication,
  AcademicResult,
  FeeLedger,
  FeePayment,
  NewsArticle,
  GalleryMedia,
  ContactMessage,
  AuditLog,
  Student,
  User,
  UserRole,
} from './src/types';
import {
  authenticateBearer,
  canAccessStudent,
  canManageResult,
  canManageRole,
  canReadResult,
  canUseProtectedRoute,
  hashPassword,
  isBcryptHash,
  isSharedPassword,
  issueVersionedSessionToken,
  markSeedDemoUsers,
  verifyAccountPassword,
} from './src/server/authSecurity';
import { createIpRateLimiter } from './src/server/rateLimit';

dotenv.config();

const PORT = Number(process.env.PORT || 3000);
const DB_FILE = path.join(process.cwd(), '.data-store.json');
const jwtSecret = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : randomBytes(32).toString('hex'));
const allowDemoCredentials = process.env.NODE_ENV !== 'production' && process.env.DEMO_AUTH_ENABLED !== 'false';

// In-memory / File-backed Database Store
interface DatabaseState {
  users: User[];
  students: Student[];
  admissions: AdmissionApplication[];
  results: AcademicResult[];
  fees: FeeLedger[];
  news: NewsArticle[];
  gallery: GalleryMedia[];
  contactMessages: ContactMessage[];
  auditLogs: AuditLog[];
}

function loadDatabase(): DatabaseState {
  let state: DatabaseState | null = null;
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      state = JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error loading DB file, fallback to initial state', err);
  }

  if (!state && process.env.NODE_ENV === 'production') {
    throw new Error('Production requires an existing initialized data store.');
  }

  if (!state) {
    state = {
      users: INITIAL_USERS.map((user) => ({ ...user, isDemo: true })),
      students: INITIAL_STUDENTS,
      admissions: INITIAL_ADMISSIONS,
      results: INITIAL_RESULTS,
      fees: INITIAL_FEES,
      news: INITIAL_NEWS,
      gallery: INITIAL_GALLERY_MEDIA,
      contactMessages: INITIAL_CONTACT_MESSAGES,
      auditLogs: INITIAL_AUDIT_LOGS,
    };
  }

  if (!state.gallery || state.gallery.length < INITIAL_GALLERY_MEDIA.length) {
    state.gallery = INITIAL_GALLERY_MEDIA;
  }
  if (!state.news || state.news.length < INITIAL_NEWS.length) {
    state.news = INITIAL_NEWS;
  }

  markSeedDemoUsers(state.users, INITIAL_USERS, allowDemoCredentials);
  for (const user of state.users) {
    if (typeof user.password !== 'string' || !user.password || isBcryptHash(user.password)) continue;
    const legacyPassword = user.password;
    user.password = hashPassword(legacyPassword);
    if (isSharedPassword(legacyPassword) && user.isDemo !== true) {
      user.mustChangePassword = true;
      user.tokenVersion = (user.tokenVersion || 0) + 1;
    }
  }

  saveDatabase(state);
  return state;
}

function saveDatabase(state: DatabaseState) {
  const temporaryPath = `${DB_FILE}.tmp`;
  fs.writeFileSync(temporaryPath, JSON.stringify(state, null, 2), { encoding: 'utf-8', mode: 0o600 });
  fs.renameSync(temporaryPath, DB_FILE);
}

const db = loadDatabase();

// Helper to log audit trail
function addAuditLog(actorEmail: string, actorRole: UserRole, action: string, target: string, details: string, ip = '127.0.0.1') {
  const entry: AuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    actorEmail,
    actorRole,
    action,
    target,
    details,
    ipAddress: ip,
  };
  db.auditLogs.unshift(entry);
  saveDatabase(db);
}

// Token simulation / session validator
function extractUserFromHeader(req: express.Request): User | null {
  if (!jwtSecret) return null;
  return authenticateBearer(req.headers.authorization, jwtSecret, db.users);
}

function requireRole(req: express.Request, res: express.Response, roles: UserRole[]): User | null {
  const user = extractUserFromHeader(req);
  if (!user) {
    res.status(401).json({ error: 'Authentication required' });
    return null;
  }
  if (!canManageRole(user, roles)) {
    res.status(403).json({ error: 'Unauthorized' });
    return null;
  }
  if (!canUseProtectedRoute(user, req.path)) {
    res.status(403).json({ error: 'Change your temporary password before using the portal' });
    return null;
  }
  return user;
}

async function startServer() {
  if (!jwtSecret || (process.env.NODE_ENV === 'production' && jwtSecret.length < 32)) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters in production.');
  }
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  const loginRateLimit = createIpRateLimiter(15 * 60 * 1000, 10, 'Too many login attempts. Try again later.');
  const publicFormRateLimit = createIpRateLimiter(15 * 60 * 1000, 20, 'Too many requests. Try again later.');

  // Security Headers Middleware
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
  });

  // Connect to MongoDB if MONGODB_URI is configured
  if (process.env.MONGODB_URI) {
    mongoose.set('bufferCommands', false);
    mongoose
      .connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      })
      .then(() => {
        console.log('[MongoDB] Connected successfully to MongoDB Atlas cluster');
      })
      .catch((err) => {
        console.warn('[MongoDB] MongoDB Atlas connection pending IP whitelist or offline:', err.message);
      });
  }

  // 1. Health check
  app.get('/api/health', (req, res) => {
    const mongoReady = mongoose.connection.readyState;
    const mongoStatus = mongoReady === 1 ? 'connected' : mongoReady === 2 ? 'connecting' : 'disconnected';
    res.json({
      status: 'ok',
      school: 'Peculiar College Doma',
      academicSession: '2026/2027',
      mongodb: mongoStatus,
      timestamp: new Date().toISOString(),
    });
  });

  // OTP Store for student password resets
  interface PasswordResetOtp {
    otp: string;
    expiresAt: number;
    userId: string;
    studentName: string;
    parentPhone: string;
  }
  const passwordResetOtps = new Map<string, PasswordResetOtp>();

  // 2. Authentication routes
  app.post('/api/auth/login', loginRateLimit, (req, res) => {
    const rawIdentifier = (req.body.identifier || req.body.email || '').trim();
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    if (!rawIdentifier || !password) {
      return res.status(400).json({ error: 'School email/admission number and password are required' });
    }

    const normalizedId = rawIdentifier.toLowerCase();
    
    // 1. Try finding user directly by email or admissionNo
    let user = db.users.find(
      (u) => u.email.toLowerCase() === normalizedId || (u.admissionNo && u.admissionNo.toLowerCase() === normalizedId)
    );

    // Check if identifier directly matches a student whose status is suspended or deactivated
    const directStudentMatch = db.students.find(
      (s) => s.admissionNo.toLowerCase() === normalizedId || s.id.toLowerCase() === normalizedId
    );
    if (directStudentMatch && (directStudentMatch.status === 'DEACTIVATED' || directStudentMatch.status === 'SUSPENDED')) {
      return res.status(403).json({
        error: `Your student portal account has been ${directStudentMatch.status.toLowerCase()}. Access is restricted. Please contact the school administration.`,
      });
    }

    // 2. If not found, check if identifier matches a student's admission number or ID
    if (!user && directStudentMatch) {
      // Find existing user linked to this student
      user = db.users.find((u) => (u.linkedStudentIds || []).includes(directStudentMatch.id) && u.role === 'STUDENT');
      if (!user) {
        // Auto-provision user account for student
        const studentEmail = `${directStudentMatch.firstName.toLowerCase()}${directStudentMatch.lastName.toLowerCase()}@peculiarschools.edu.ng`;
        user = {
          id: `usr-${directStudentMatch.id}`,
          email: studentEmail,
          admissionNo: directStudentMatch.admissionNo,
          name: `${directStudentMatch.firstName} ${directStudentMatch.lastName}`,
          role: 'STUDENT',
          phone: directStudentMatch.parentPhone,
          linkedStudentIds: [directStudentMatch.id],
          hasCustomPassword: false,
          isDemo: true,
          isActive: directStudentMatch.status === 'ACTIVE',
          createdAt: new Date().toISOString(),
        };
        db.users.push(user);
        saveDatabase(db);
      }
    }

    // Ensure student user has phone set to parentPhone from student record
    if (user && user.role === 'STUDENT') {
      const student = db.students.find((s) => (user?.linkedStudentIds || []).includes(s.id));
      if (student?.parentPhone && !user.phone) {
        user.phone = student.parentPhone;
      }
      if (student && (student.status === 'DEACTIVATED' || student.status === 'SUSPENDED')) {
        return res.status(403).json({
          error: `Your student portal account has been ${student.status.toLowerCase()}. Access is restricted. Please contact the school administration.`,
        });
      }
    }

    // Check account active state
    if (user && user.isActive === false) {
      const restrictedMessage = user.role === 'STUDENT'
        ? 'Your student portal account has been deactivated. Access is restricted. Please contact the school administration.'
        : 'This account has been deactivated. Access is restricted. Please contact the school administration.';
      return res.status(403).json({ error: restrictedMessage });
    }

    if (!user || !verifyAccountPassword(user, password, allowDemoCredentials)) {
      const errorMessage =
        user?.role === 'STUDENT'
          ? 'Invalid credentials. (Note: Student default password is your registered parent phone number).'
          : 'Invalid email/admission number or password credentials';
      return res.status(401).json({ error: errorMessage });
    }

    if (!isBcryptHash(user.password) && user.hasCustomPassword) {
      user.password = hashPassword(password);
      saveDatabase(db);
    }

    const token = issueVersionedSessionToken(user.id, jwtSecret, user.tokenVersion || 0);

    addAuditLog(user.email, user.role, 'USER_LOGIN', user.name, 'Successful authentication', req.ip);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        admissionNo: user.admissionNo,
        name: user.name,
        role: user.role,
        phone: user.phone,
        linkedStudentIds: user.linkedStudentIds,
        assignedClasses: user.assignedClasses,
        hasCustomPassword: user.hasCustomPassword || false,
        mustChangePassword: user.mustChangePassword || false,
      },
    });
  });

  // Request OTP for student password reset via parent phone
  app.post('/api/auth/forgot-password/request-otp', publicFormRateLimit, (req, res) => {
    const rawId = (req.body.identifier || req.body.email || '').trim();
    if (!rawId) {
      return res.status(400).json({ error: 'Please enter your school email or student admission number' });
    }

    const normalized = rawId.toLowerCase();

    // Find student by admissionNo, student ID, or user email
    let student = db.students.find(
      (s) => s.admissionNo.toLowerCase() === normalized || s.id.toLowerCase() === normalized
    );
    let user = db.users.find(
      (u) => u.email.toLowerCase() === normalized || (u.admissionNo && u.admissionNo.toLowerCase() === normalized)
    );

    if (!student && user) {
      student = db.students.find((s) => (user?.linkedStudentIds || []).includes(s.id));
    }
    if (!user && student) {
      user = db.users.find((u) => (u.linkedStudentIds || []).includes(student?.id || '') && u.role === 'STUDENT');
    }

    if (!student && !user) {
      return res.status(404).json({ error: 'No student account found with this admission number or email.' });
    }

    if (student && (student.status === 'DEACTIVATED' || student.status === 'SUSPENDED')) {
      return res.status(403).json({
        error: `Student account is currently ${student.status.toLowerCase()}. Password reset is disabled. Please contact the school administration.`,
      });
    }

    const studentName = student ? `${student.firstName} ${student.lastName}` : user?.name || 'Student';
    const parentPhone = student?.parentPhone || user?.phone;

    if (!parentPhone) {
      return res.status(400).json({ error: 'No parent phone number registered for this student. Contact school administration.' });
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    passwordResetOtps.set(normalized, {
      otp,
      expiresAt,
      userId: user?.id || (student ? `usr-${student.id}` : ''),
      studentName,
      parentPhone,
    });

    // Also index by student's admissionNo and email so verify can match either
    if (student?.admissionNo) {
      passwordResetOtps.set(student.admissionNo.toLowerCase(), {
        otp,
        expiresAt,
        userId: user?.id || `usr-${student.id}`,
        studentName,
        parentPhone,
      });
    }
    if (user?.email) {
      passwordResetOtps.set(user.email.toLowerCase(), {
        otp,
        expiresAt,
        userId: user.id,
        studentName,
        parentPhone,
      });
    }

    // Mask phone number for security
    const cleanPhone = parentPhone.trim();
    const maskedPhone =
      cleanPhone.length > 7
        ? cleanPhone.slice(0, cleanPhone.length - 7) + ' ••• ' + cleanPhone.slice(-4)
        : cleanPhone;

    addAuditLog(user?.email || rawId, 'STUDENT', 'OTP_REQUESTED', studentName, `Password reset OTP generated for parent phone ${maskedPhone}`, req.ip);

    res.json({
      success: true,
      studentName,
      maskedPhone,
      parentPhone,
      demoOtp: otp,
      message: `A 6-digit verification code has been dispatched to parent phone (${maskedPhone}).`,
    });
  });

  // Verify OTP and set new password
  app.post('/api/auth/forgot-password/verify-otp', publicFormRateLimit, (req, res) => {
    const rawId = (req.body.identifier || req.body.email || '').trim();
    const otp = (req.body.otp || '').trim();
    const newPassword = typeof req.body.newPassword === 'string' ? req.body.newPassword.trim() : '';

    if (!rawId || !otp || !newPassword) {
      return res.status(400).json({ error: 'Admission number/email, OTP code, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const normalized = rawId.toLowerCase();
    const record = passwordResetOtps.get(normalized);

    if (!record) {
      return res.status(400).json({ error: 'No active OTP request found for this student. Please request a new code.' });
    }

    if (Date.now() > record.expiresAt) {
      passwordResetOtps.delete(normalized);
      return res.status(400).json({ error: 'OTP code has expired (valid for 10 minutes). Please request a new code.' });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ error: 'Incorrect OTP code. Please enter the 6-digit code sent to parent phone.' });
    }

    // Find student and user
    let user = db.users.find(
      (u) => u.id === record.userId || u.email.toLowerCase() === normalized || (u.admissionNo && u.admissionNo.toLowerCase() === normalized)
    );

    if (!user) {
      const student = db.students.find(
        (s) => s.admissionNo.toLowerCase() === normalized || s.id.toLowerCase() === normalized
      );
      if (student) {
        user = {
          id: `usr-${student.id}`,
          email: `${student.firstName.toLowerCase()}${student.lastName.toLowerCase()}@peculiarschools.edu.ng`,
          admissionNo: student.admissionNo,
          name: `${student.firstName} ${student.lastName}`,
          role: 'STUDENT',
          phone: student.parentPhone,
          linkedStudentIds: [student.id],
          isDemo: true,
          hasCustomPassword: true,
          createdAt: new Date().toISOString(),
        };
        db.users.push(user);
      }
    }

    if (!user) {
      return res.status(404).json({ error: 'Student user account not found.' });
    }

    // Update password
    user.password = hashPassword(newPassword);
    user.hasCustomPassword = true;
    user.mustChangePassword = false;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    saveDatabase(db);

    // Clean up used OTP
    passwordResetOtps.delete(normalized);

    addAuditLog(user.email, user.role, 'PASSWORD_RESET_SUCCESS', user.name, 'Password successfully reset via parent phone OTP', req.ip);

    res.json({
      success: true,
      message: 'Password successfully updated! You can now sign in using your new password.',
    });
  });

  app.get('/api/auth/me', (req, res) => {
    const user = requireRole(req, res, ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'TEACHER', 'ACCOUNTANT', 'PARENT', 'STUDENT', 'APPLICANT']);
    if (!user) return;
    const { password: _password, ...safeUser } = user;
    res.json({ user: safeUser });
  });

  app.post('/api/auth/change-password', (req, res) => {
    const user = requireRole(req, res, ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'TEACHER', 'ACCOUNTANT', 'PARENT', 'STUDENT', 'APPLICANT']);
    if (!user) return;
    const currentPassword = typeof req.body?.currentPassword === 'string' ? req.body.currentPassword : '';
    const newPassword = typeof req.body?.newPassword === 'string' ? req.body.newPassword : '';
    if (!verifyAccountPassword(user, currentPassword, allowDemoCredentials)) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    const minLength = user.role === 'STUDENT' ? 6 : 8;
    if (newPassword.length < minLength || newPassword === currentPassword) {
      return res.status(400).json({ error: `Choose a different password with at least ${minLength} characters` });
    }
    user.password = hashPassword(newPassword);
    user.hasCustomPassword = true;
    user.mustChangePassword = false;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    saveDatabase(db);
    addAuditLog(user.email, user.role, 'PASSWORD_CHANGED', user.id, 'Changed account password', req.ip);
    res.json({ success: true, message: 'Password changed. Sign in again to continue.' });
  });

  app.get('/api/users', (req, res) => {
    const actor = requireRole(req, res, ['SUPER_ADMIN']);
    if (!actor) return;
    const accounts = db.users.map(({ password: _password, ...account }) => account);
    res.json({ accounts });
  });

  app.post('/api/users', (req, res) => {
    const actor = requireRole(req, res, ['SUPER_ADMIN']);
    if (!actor) return;
    const data = req.body || {};
    const name = typeof data.name === 'string' ? data.name.trim() : '';
    const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
    const allowedRoles: UserRole[] = ['ADMIN', 'PRINCIPAL', 'ACCOUNTANT', 'TEACHER', 'PARENT', 'STUDENT', 'APPLICANT'];
    if (!name || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return res.status(400).json({ error: 'A valid name and email are required' });
    }
    if (!allowedRoles.includes(data.role)) return res.status(400).json({ error: 'Select a supported account role' });
    if (db.users.some((account) => account.email.toLowerCase() === email)) {
      return res.status(409).json({ error: 'An account already uses this email' });
    }

    const linkedStudentIds: string[] = Array.isArray(data.linkedStudentIds)
      ? Array.from<string>(new Set(data.linkedStudentIds.filter((id: unknown): id is string => typeof id === 'string')))
      : [];
    if (linkedStudentIds.length > 50 || linkedStudentIds.some((id: string) => !db.students.some((student) => student.id === id))) {
      return res.status(400).json({ error: 'One or more linked students are invalid' });
    }
    if (data.role === 'STUDENT' && linkedStudentIds.length !== 1) {
      return res.status(400).json({ error: 'A student account must be linked to exactly one student record' });
    }

    const assignedClasses: string[] = Array.isArray(data.assignedClasses)
      ? Array.from<string>(new Set(data.assignedClasses.filter((id: unknown): id is string => typeof id === 'string')))
      : [];
    if (data.role === 'TEACHER' && assignedClasses.some((id: string) => !INITIAL_CLASSES.some((schoolClass) => schoolClass.id === id))) {
      return res.status(400).json({ error: 'One or more assigned classes are invalid' });
    }

    const temporaryPassword = randomBytes(24).toString('base64url');
    const account: User = {
      id: `usr-${randomUUID()}`,
      name,
      email,
      role: data.role,
      phone: typeof data.phone === 'string' ? data.phone.trim().slice(0, 40) : '',
      password: hashPassword(temporaryPassword),
      linkedStudentIds,
      assignedClasses,
      isActive: true,
      isDemo: false,
      tokenVersion: 0,
      mustChangePassword: true,
      createdAt: new Date().toISOString(),
    };
    db.users.unshift(account);
    saveDatabase(db);
    addAuditLog(actor.email, actor.role, 'ACCOUNT_CREATED', account.id, `Created ${account.role} account ${account.email}`, req.ip);
    const { password: _password, ...safeAccount } = account;
    res.status(201).json({ account: safeAccount, temporaryPassword });
  });

  app.patch('/api/users/:id/status', (req, res) => {
    const actor = requireRole(req, res, ['SUPER_ADMIN']);
    if (!actor) return;
    const target = db.users.find((account) => account.id === req.params.id);
    if (!target) return res.status(404).json({ error: 'Account not found' });
    if (target.role === 'SUPER_ADMIN') return res.status(403).json({ error: 'Super Admin accounts cannot be deactivated here' });
    if (typeof req.body?.isActive !== 'boolean') return res.status(400).json({ error: 'isActive must be true or false' });
    target.isActive = req.body.isActive;
    target.tokenVersion = (target.tokenVersion || 0) + 1;
    saveDatabase(db);
    addAuditLog(actor.email, actor.role, req.body.isActive ? 'ACCOUNT_REACTIVATED' : 'ACCOUNT_DEACTIVATED', target.id, `${target.email} ${req.body.isActive ? 'reactivated' : 'deactivated'}`, req.ip);
    const { password: _password, ...safeAccount } = target;
    res.json({ account: safeAccount });
  });

  // 3. Admissions API
  app.post('/api/admissions', publicFormRateLimit, (req, res) => {
    const data = req.body;

    // Strict input validation
    if (!data.firstName || !data.lastName || !data.classApplying || !data.parentFullName || !data.parentPhone) {
      return res.status(400).json({ error: 'Missing required admission fields' });
    }

    const applicationCount = db.admissions.length + 1;
    const padded = String(applicationCount).padStart(4, '0');
    const newId = `PCD-2026-${padded}`;

    const newApplication: AdmissionApplication = {
      id: newId,
      firstName: String(data.firstName).trim(),
      middleName: data.middleName ? String(data.middleName).trim() : undefined,
      lastName: String(data.lastName).trim(),
      gender: data.gender === 'Female' ? 'Female' : 'Male',
      dateOfBirth: data.dateOfBirth || '2016-01-01',
      classApplying: data.classApplying,
      arm: data.arm || 'SECONDARY',
      previousSchool: data.previousSchool || 'None',
      residentialAddress: String(data.residentialAddress || '').trim(),
      stateOfOrigin: data.stateOfOrigin || 'Nasarawa',
      lga: data.lga || 'Doma',
      parentFullName: String(data.parentFullName).trim(),
      parentPhone: String(data.parentPhone).trim(),
      parentEmail: String(data.parentEmail || '').trim(),
      relationship: data.relationship || 'Father',
      parentOccupation: data.parentOccupation || 'Self-Employed',
      parentAddress: String(data.parentAddress || data.residentialAddress || '').trim(),
      passportPhotoUrl: data.passportPhotoUrl,
      birthCertificateUrl: data.birthCertificateUrl,
      previousResultUrl: data.previousResultUrl,
      status: 'SUBMITTED',
      submissionDate: new Date().toISOString().split('T')[0],
      reviewNotes: 'Application successfully received. Under preliminary review by admissions team.',
    };

    db.admissions.unshift(newApplication);
    saveDatabase(db);

    addAuditLog('public_applicant', 'PARENT', 'ADMISSION_SUBMITTED', newId, `Application for ${newApplication.firstName} ${newApplication.lastName}`);

    res.status(201).json({
      success: true,
      applicationId: newId,
      application: newApplication,
      message: `Application submitted successfully! Your application reference number is ${newId}.`,
    });
  });

  app.get('/api/admissions', (req, res) => {
    // 1. Public tracking query lookup (by application reference PCD-2026-XXXX, parent phone, or email)
    const rawQuery = typeof req.query?.query === 'string' ? req.query.query.trim() : '';
    if (rawQuery) {
      const normalizedQuery = rawQuery.toLowerCase();
      const normalizedPhone = rawQuery.replace(/\D/g, '');

      const matched = db.admissions.find((app) => {
        if (app.id.toLowerCase() === normalizedQuery) return true;
        if (normalizedPhone && normalizedPhone.length >= 7) {
          const appPhone = (app.parentPhone || '').replace(/\D/g, '');
          if (appPhone.includes(normalizedPhone) || normalizedPhone.includes(appPhone)) return true;
        }
        if (app.parentEmail && app.parentEmail.toLowerCase() === normalizedQuery) return true;
        return false;
      });

      if (!matched) {
        return res.status(404).json({ error: 'No application found with the provided reference number or phone number.' });
      }

      return res.json({ success: true, application: matched });
    }

    // 2. Authenticated administrative or applicant listing
    const user = requireRole(req, res, ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'APPLICANT']);
    if (!user) return;

    if (user.role === 'APPLICANT') {
      const applicantAdmissions = db.admissions.filter((a) => {
        const sameEmail = !!a.parentEmail && !!user.email && a.parentEmail.toLowerCase() === user.email.toLowerCase();
        const samePhone = !!user.phone && a.parentPhone.replace(/\s+/g, '') === user.phone.replace(/\s+/g, '');
        return sameEmail || samePhone;
      });
      return res.json({ admissions: applicantAdmissions });
    }

    res.json({ admissions: db.admissions });
  });

  app.get('/api/admissions/status', (req, res) => {
    const rawQuery = typeof req.query?.query === 'string' ? req.query.query.trim() : '';
    if (!rawQuery) {
      return res.status(400).json({ error: 'Please enter your application reference number or phone number.' });
    }
    const normalizedQuery = rawQuery.toLowerCase();
    const normalizedPhone = rawQuery.replace(/\D/g, '');

    const matched = db.admissions.find((app) => {
      if (app.id.toLowerCase() === normalizedQuery) return true;
      if (normalizedPhone && normalizedPhone.length >= 7) {
        const appPhone = (app.parentPhone || '').replace(/\D/g, '');
        if (appPhone.includes(normalizedPhone) || normalizedPhone.includes(appPhone)) return true;
      }
      if (app.parentEmail && app.parentEmail.toLowerCase() === normalizedQuery) return true;
      return false;
    });

    if (!matched) {
      return res.status(404).json({ error: 'No application found with the provided reference number or phone number.' });
    }

    return res.json({ success: true, application: matched });
  });

  app.patch('/api/admissions/:id/status', (req, res) => {
    const user = extractUserFromHeader(req);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'PRINCIPAL')) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const { status, reviewNotes, interviewDate } = req.body;

    const item = db.admissions.find((a) => a.id === id);
    if (!item) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (status) item.status = status;
    if (reviewNotes !== undefined) item.reviewNotes = reviewNotes;
    if (interviewDate) item.interviewDate = interviewDate;
    item.reviewedBy = user.name;
    item.reviewedAt = new Date().toISOString();

    saveDatabase(db);
    addAuditLog(user.email, user.role, 'ADMISSION_STATUS_UPDATED', id, `Updated to ${status}`);

    res.json({ success: true, application: item });
  });

  // 4. Students API (with strict Parent/Student isolation)
  app.get('/api/students', (req, res) => {
    const user = requireRole(req, res, ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'ACCOUNTANT', 'TEACHER', 'PARENT', 'STUDENT']);
    if (!user) return;
    const visibleStudents = db.students.filter((student) => canAccessStudent(user, student));
    if (user.role === 'ACCOUNTANT' || user.role === 'TEACHER') {
      return res.json({
        students: visibleStudents.map((student) => ({
          id: student.id,
          admissionNo: student.admissionNo,
          firstName: student.firstName,
          lastName: student.lastName,
          arm: student.arm,
          classId: student.classId,
          className: student.className,
          status: student.status,
        })),
      });
    }
    res.json({ students: visibleStudents });
  });

  app.post('/api/students', (req, res) => {
    const user = requireRole(req, res, ['ADMIN', 'SUPER_ADMIN', 'PRINCIPAL']);
    if (!user) return;

    const data = req.body;
    const clean = (value: unknown) => typeof value === 'string' ? value.trim() : '';
    const firstName = clean(data.firstName);
    const lastName = clean(data.lastName);
    const parentName = clean(data.parentName);
    const parentPhone = clean(data.parentPhone);
    const classId = clean(data.classId);
    const schoolClass = INITIAL_CLASSES.find((item) => item.id === classId);
    const admissionNo = (clean(data.admissionNo) || `PCD/${new Date().getFullYear()}/${String(db.students.length + 1).padStart(4, '0')}`).toUpperCase();
    if (!firstName || !lastName || !parentName || !parentPhone || !schoolClass) {
      return res.status(400).json({ error: 'Student name, guardian contact, and a valid class are required' });
    }
    if (db.students.some((student) => student.admissionNo.toUpperCase() === admissionNo)) {
      return res.status(409).json({ error: 'Admission number already exists' });
    }
    const gender = data.gender === 'Female' ? 'Female' : data.gender === 'Male' ? 'Male' : null;
    if (!gender) return res.status(400).json({ error: 'Select a valid gender' });
    const parentId = clean(data.parentId);
    if (parentId && !db.users.some((candidate) => candidate.id === parentId && candidate.role === 'PARENT')) {
      return res.status(400).json({ error: 'The selected parent account is invalid' });
    }
    const parentAccount = parentId ? db.users.find((candidate) => candidate.id === parentId) : undefined;

    const newStudent: Student = {
      id: `stu-${randomUUID()}`,
      admissionNo,
      firstName,
      lastName,
      otherName: clean(data.otherName),
      gender,
      dateOfBirth: clean(data.dateOfBirth) || '2015-01-01',
      arm: schoolClass.arm,
      classId: schoolClass.id,
      className: schoolClass.name,
      parentId,
      parentName,
      parentPhone,
      parentEmail: clean(data.parentEmail),
      address: clean(data.address),
      sportsHouse: data.sportsHouse || 'Purple (Faith)',
      status: 'ACTIVE',
      enrolledDate: new Date().toISOString().split('T')[0],
    };

    const normalizedBaseName = `${newStudent.firstName}${newStudent.lastName}`.replace(/[^a-z0-9]/gi, '').toLowerCase();
    if (!normalizedBaseName) return res.status(400).json({ error: 'Student name cannot be used to create a portal account' });
    const generatedEmail = `${normalizedBaseName}@peculiarschools.edu.ng`;
    const existingPortalUser = db.users.find((u) => u.email.toLowerCase() === generatedEmail.toLowerCase());
    if (existingPortalUser && existingPortalUser.role !== 'STUDENT') {
      return res.status(409).json({ error: 'An account already uses the generated student email; resolve the account conflict first' });
    }

    let temporaryPassword: string | undefined;
    db.students.unshift(newStudent);
    if (parentAccount) {
      parentAccount.linkedStudentIds = Array.from(new Set([...(parentAccount.linkedStudentIds || []), newStudent.id]));
    }
    if (existingPortalUser) {
      existingPortalUser.linkedStudentIds = Array.from(new Set([...(existingPortalUser.linkedStudentIds || []), newStudent.id]));
      existingPortalUser.name = `${newStudent.firstName} ${newStudent.lastName}`;
      existingPortalUser.phone = newStudent.parentPhone;
      if (!existingPortalUser.password) {
        temporaryPassword = randomBytes(24).toString('base64url');
        existingPortalUser.password = hashPassword(temporaryPassword);
        existingPortalUser.mustChangePassword = true;
      }
      if (parentId) existingPortalUser.linkedStudentIds = Array.from(new Set([...(existingPortalUser.linkedStudentIds || []), newStudent.id]));
    } else {
      temporaryPassword = randomBytes(24).toString('base64url');
      db.users.unshift({
        id: `usr-student-${randomUUID()}`,
        email: generatedEmail,
        name: `${newStudent.firstName} ${newStudent.lastName}`,
        role: 'STUDENT',
        phone: newStudent.parentPhone,
        password: hashPassword(temporaryPassword),
        linkedStudentIds: [newStudent.id],
        isActive: true,
        isDemo: false,
        mustChangePassword: true,
        createdAt: new Date().toISOString(),
      });
    }

    saveDatabase(db);
    addAuditLog(user.email, user.role, 'STUDENT_ENROLLED', newStudent.admissionNo, `Enrolled ${newStudent.firstName} ${newStudent.lastName} into ${newStudent.className}`);

    res.status(201).json({ student: newStudent, studentPortal: { email: generatedEmail, temporaryPassword } });
  });

  // 4b. Update Student Status (Active, Deactivated, Suspended)
  app.patch('/api/students/:id/status', (req, res) => {
    const user = requireRole(req, res, ['ADMIN', 'SUPER_ADMIN', 'PRINCIPAL']);
    if (!user) return;

    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses: Student['status'][] = ['ACTIVE', 'DEACTIVATED', 'SUSPENDED', 'GRADUATED', 'TRANSFERRED'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid student status provided. Must be ACTIVE, DEACTIVATED, or SUSPENDED.' });
    }

    const student = db.students.find((s) => s.id === id);
    if (!student) {
      return res.status(404).json({ error: 'Student record not found.' });
    }

    const previousStatus = student.status;
    student.status = status;

    // Immediately toggle active access on all student portal accounts associated with this student
    const studentUsers = db.users.filter((u) => u.role === 'STUDENT' && (u.linkedStudentIds || []).includes(student.id));
    studentUsers.forEach((stuUser) => {
      // If student is DEACTIVATED or SUSPENDED, set isActive to false and bump tokenVersion to revoke active JWTs
      stuUser.isActive = (status === 'ACTIVE');
      stuUser.tokenVersion = (stuUser.tokenVersion || 0) + 1;
    });

    saveDatabase(db);
    addAuditLog(
      user.email,
      user.role,
      'STUDENT_STATUS_UPDATED',
      student.admissionNo,
      `Changed student status from ${previousStatus} to ${status} for ${student.firstName} ${student.lastName}`
    );

    res.json({ success: true, student, message: `Student status updated to ${status}.` });
  });

  // 4c. Edit Student Details
  app.patch('/api/students/:id', (req, res) => {
    const user = requireRole(req, res, ['ADMIN', 'SUPER_ADMIN', 'PRINCIPAL']);
    if (!user) return;

    const { id } = req.params;
    const student = db.students.find((s) => s.id === id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    const data = req.body;
    const clean = (val: unknown) => typeof val === 'string' ? val.trim() : '';

    if (data.firstName) student.firstName = clean(data.firstName);
    if (data.lastName) student.lastName = clean(data.lastName);
    if (data.parentName) student.parentName = clean(data.parentName);
    if (data.parentPhone) student.parentPhone = clean(data.parentPhone);
    if (data.address) student.address = clean(data.address);
    if (data.sportsHouse) student.sportsHouse = data.sportsHouse;
    if (data.gender === 'Male' || data.gender === 'Female') student.gender = data.gender;
    if (data.classId) {
      const cls = INITIAL_CLASSES.find((c) => c.id === data.classId);
      if (cls) {
        student.classId = cls.id;
        student.className = cls.name;
        student.arm = cls.arm;
      }
    }
    if (data.status && ['ACTIVE', 'DEACTIVATED', 'SUSPENDED', 'GRADUATED', 'TRANSFERRED'].includes(data.status)) {
      student.status = data.status;
      const studentUsers = db.users.filter((u) => u.role === 'STUDENT' && (u.linkedStudentIds || []).includes(student.id));
      studentUsers.forEach((stuUser) => {
        stuUser.isActive = (student.status === 'ACTIVE');
        stuUser.tokenVersion = (stuUser.tokenVersion || 0) + 1;
      });
    }

    saveDatabase(db);
    addAuditLog(user.email, user.role, 'STUDENT_UPDATED', student.admissionNo, `Updated record for ${student.firstName} ${student.lastName}`);

    res.json({ success: true, student });
  });

  // 5. Academic Results API
  app.get('/api/results', (req, res) => {
    const user = requireRole(req, res, ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT']);
    if (!user) return;
    const visibleResults = db.results.filter((result) =>
      canReadResult(user, result, db.students.find((student) => student.id === result.studentId))
    );
    res.json({ results: visibleResults });
  });

  app.post('/api/results', (req, res) => {
    const user = requireRole(req, res, ['ADMIN', 'SUPER_ADMIN', 'PRINCIPAL', 'TEACHER']);
    if (!user) return;

    const data = req.body;
    const student = db.students.find((candidate) => candidate.id === data.studentId);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    if (!canManageResult(user, student)) return res.status(403).json({ error: 'You are not assigned to this student’s class' });
    const existingIndex = db.results.findIndex((r) => r.id === data.id);
    const existingResult = existingIndex >= 0 ? db.results[existingIndex] : undefined;
    if (existingResult && existingResult.studentId !== student.id) {
      return res.status(400).json({ error: 'A result cannot be reassigned to another student' });
    }
    if (existingResult?.published && user.role === 'TEACHER') {
      return res.status(403).json({ error: 'Teachers cannot change a published result' });
    }
    if (!Array.isArray(data.subjects) || data.subjects.length === 0 || data.subjects.length > 30) {
      return res.status(400).json({ error: 'Add between 1 and 30 subject scores' });
    }
    const validTerms = ['First Term', 'Second Term', 'Third Term'];
    if (!validTerms.includes(data.term)) return res.status(400).json({ error: 'Select a valid academic term' });
    const invalidScore = data.subjects.some((subject: any) => {
      const ca = Number(subject.caScore);
      const exam = Number(subject.examScore);
      return !String(subject.subject || '').trim() || !Number.isFinite(ca) || !Number.isFinite(exam) || ca < 0 || ca > 40 || exam < 0 || exam > 60;
    });
    if (invalidScore) return res.status(400).json({ error: 'CA scores must be 0-40 and exam scores 0-60' });
    const subjectsSeen = new Set<string>();
    for (const subject of data.subjects) {
      const key = String(subject.subject).trim().toLowerCase();
      if (subjectsSeen.has(key)) return res.status(400).json({ error: 'Subject names must be unique in a result' });
      subjectsSeen.add(key);
    }

    // Calculate total score, average, and grades
    const subjects = (data.subjects || []).map((s: any) => {
      const total = Number(s.caScore || 0) + Number(s.examScore || 0);
      let grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' = 'F';
      let remark: any = 'Fail';
      if (total >= 80) { grade = 'A'; remark = 'Distinction'; }
      else if (total >= 70) { grade = 'B'; remark = 'Very Good'; }
      else if (total >= 60) { grade = 'C'; remark = 'Credit'; }
      else if (total >= 50) { grade = 'D'; remark = 'Pass'; }
      else if (total >= 40) { grade = 'E'; remark = 'Fair'; }

      return {
        subject: s.subject,
        caScore: Number(s.caScore || 0),
        examScore: Number(s.examScore || 0),
        total,
        grade,
        remark,
      };
    });

    const totalScore = subjects.reduce((sum: number, s: any) => sum + s.total, 0);
    const maxScore = subjects.length * 100;
    const average = subjects.length ? Math.round((totalScore / subjects.length) * 10) / 10 : 0;

    const resultRecord: AcademicResult = {
      id: existingResult?.id || `res-${randomUUID()}`,
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      admissionNo: student.admissionNo,
      classId: student.classId,
      className: student.className,
      arm: student.arm,
      academicSession: data.academicSession || '2025/2026',
      term: data.term || 'Second Term',
      subjects,
      totalScore,
      maxScore,
      average,
      positionInClass: data.positionInClass || 1,
      totalStudentsInClass: data.totalStudentsInClass || 30,
      attendanceDays: data.attendanceDays || 60,
      totalDays: 65,
      teacherRemark: data.teacherRemark || 'Good performance, keep striving for excellence.',
      principalRemark: data.principalRemark || 'Commendable result and moral standing.',
      published: existingResult?.published ?? (user.role !== 'TEACHER' && data.published === true),
      publishedDate: existingResult?.publishedDate || (user.role !== 'TEACHER' && data.published === true ? new Date().toISOString().split('T')[0] : undefined),
    };

    if (existingIndex >= 0) {
      db.results[existingIndex] = resultRecord;
    } else {
      db.results.push(resultRecord);
    }

    saveDatabase(db);
    addAuditLog(user.email, user.role, 'RESULT_SAVED', resultRecord.admissionNo, `Saved result for ${resultRecord.studentName}`);

    res.json({ success: true, result: resultRecord });
  });

  // 6. Fees & Payments API
  app.get('/api/fees', (req, res) => {
    const user = requireRole(req, res, ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'ACCOUNTANT', 'PARENT', 'STUDENT']);
    if (!user) return;

    if (user.role === 'PARENT') {
      const linked = user.linkedStudentIds || [];
      const parentFees = db.fees.filter((f) => linked.includes(f.studentId));
      return res.json({ fees: parentFees });
    }

    if (user.role === 'STUDENT') {
      const linked = user.linkedStudentIds || [];
      const studentFees = db.fees.filter((f) => linked.includes(f.studentId));
      return res.json({ fees: studentFees });
    }

    if (user.role === 'TEACHER') {
      return res.status(403).json({ error: 'Teachers are not authorized to view the school fee ledger' });
    }

    // Accountant, Admin, Principal see full fees ledger
    if (['ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN', 'PRINCIPAL'].includes(user.role)) {
      return res.json({ fees: db.fees });
    }

    return res.status(403).json({ error: 'Unauthorized to access fee records' });
  });

  app.post('/api/fees/record-payment', (req, res) => {
    const user = requireRole(req, res, ['ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN', 'PRINCIPAL']);
    if (!user) return;

    const { feeLedgerId, studentId, admissionNo, term, session, amount, paymentMethod, reference, paymentDate } = req.body;
    const targetTerm = String(term || 'First Term 2026/2027').trim();
    const targetSession = String(session || '2026/2027').trim();

    let ledger = feeLedgerId
      ? db.fees.find((fee) => fee.id === String(feeLedgerId))
      : db.fees.find(
          (fee) =>
            (fee.studentId === studentId ||
              (admissionNo && String(fee.admissionNo).toLowerCase() === String(admissionNo).toLowerCase())) &&
            fee.term === targetTerm
        );

    // If not found for target term, but studentId is provided, check if ledger exists for any term
    if (!ledger && studentId) {
      ledger = db.fees.find((fee) => fee.studentId === studentId && fee.term === targetTerm);
    }

    // If student has no fee obligation yet for this term, automatically create it!
    if (!ledger) {
      const student = db.students.find(
        (s) =>
          s.id === studentId ||
          (admissionNo && s.admissionNo.toLowerCase() === String(admissionNo).toLowerCase())
      );
      if (!student) {
        return res.status(404).json({ error: 'Active student record not found' });
      }

      const arm = student.arm || 'SECONDARY';
      const tuitionFee = arm === 'NURSERY' ? 35000 : arm === 'PRIMARY' ? 42000 : 55000;
      const developmentLevy = arm === 'NURSERY' ? 4500 : arm === 'PRIMARY' ? 6000 : 8500;
      const sportsLevy = arm === 'SECONDARY' ? 6500 : 3500;
      const examinationFee = 5000;
      const uniformFee = 0;
      const totalPayable = tuitionFee + developmentLevy + sportsLevy + examinationFee + uniformFee;

      ledger = {
        id: `fee-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        admissionNo: student.admissionNo,
        className: student.className,
        term: targetTerm,
        session: targetSession,
        tuitionFee,
        developmentLevy,
        sportsLevy,
        examinationFee,
        uniformFee,
        totalPayable,
        totalPaid: 0,
        balanceDue: totalPayable,
        status: 'UNPAID',
        payments: [],
      };
      db.fees.unshift(ledger);
    }

    const amountPaid = Number(amount);
    if (!Number.isFinite(amountPaid) || amountPaid <= 0 || Math.round(amountPaid * 100) !== amountPaid * 100) {
      return res.status(400).json({ error: 'Invalid payment amount' });
    }

    const allowedMethods = ['Bank Transfer', 'Cash (Bursary)', 'POS', 'Online Transfer'];
    if (!allowedMethods.includes(paymentMethod)) {
      return res.status(400).json({ error: 'Select a valid payment method (Bank Transfer, Cash (Bursary), POS, or Online Transfer)' });
    }

    const transactionReference = String(reference || `PCD-TXN-${Date.now().toString().slice(-6)}`).trim().toUpperCase();
    if (transactionReference.length < 3 || transactionReference.length > 80) {
      return res.status(400).json({ error: 'A payment reference of 3 to 80 characters is required' });
    }
    const duplicateReference = db.fees.some((fee) =>
      (fee.payments || []).some((payment) => String(payment.transactionReference || '').trim().toUpperCase() === transactionReference)
    );
    if (duplicateReference) {
      return res.status(409).json({ error: 'This payment reference has already been recorded' });
    }

    const paymentDateValue = String(paymentDate || new Date().toISOString().slice(0, 10));
    if (!/^\d{4}-\d{2}-\d{2}$/.test(paymentDateValue) || Number.isNaN(Date.parse(`${paymentDateValue}T00:00:00Z`))) {
      return res.status(400).json({ error: 'Payment date must use YYYY-MM-DD format' });
    }

    const historicalPaymentTotal = (ledger.payments || []).reduce((total, payment) => total + (Number(payment.amountPaid) || 0), 0);
    const currentTotalPaid = Math.max(Number(ledger.totalPaid) || 0, historicalPaymentTotal);
    const balanceDue = Math.max(0, Number(ledger.totalPayable) - currentTotalPaid);
    if (amountPaid > balanceDue) {
      return res.status(400).json({ error: `Payment exceeds outstanding balance of N${balanceDue.toLocaleString()}` });
    }

    const receiptYear = new Date().getFullYear();
    const receiptPrefix = `PCD/REC/${receiptYear}-`;
    const nextReceiptNumber = db.fees.reduce((largest, fee) => {
      for (const payment of fee.payments || []) {
        if (!payment.receiptNumber?.startsWith(receiptPrefix)) continue;
        const sequence = Number(payment.receiptNumber.slice(receiptPrefix.length));
        if (Number.isSafeInteger(sequence)) largest = Math.max(largest, sequence);
      }
      return largest;
    }, 0) + 1;
    const receiptNo = `${receiptPrefix}${String(nextReceiptNumber).padStart(6, '0')}`;
    const paymentEntry: FeePayment = {
      id: `pay-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      receiptNumber: receiptNo,
      studentId: ledger.studentId,
      studentName: ledger.studentName,
      admissionNo: ledger.admissionNo,
      className: ledger.className,
      amountPaid,
      paymentDate: paymentDateValue,
      paymentMethod: paymentMethod as any,
      transactionReference,
      term: ledger.term,
      session: ledger.session,
      recordedBy: user.name,
    };

    ledger.payments = [...(ledger.payments || []), paymentEntry];
    ledger.totalPaid = currentTotalPaid + amountPaid;
    ledger.balanceDue = Math.max(0, ledger.totalPayable - ledger.totalPaid);
    ledger.status = ledger.balanceDue === 0 ? 'PAID' : 'PARTIAL';

    saveDatabase(db);
    addAuditLog(user.email, user.role, 'FEE_PAYMENT_RECORDED', receiptNo, `Recorded payment of N${amountPaid} for ${ledger.studentName}`);

    res.status(201).json({ success: true, receipt: paymentEntry, updatedLedger: ledger });
  });

  // 7. News & Announcements CMS
  app.get('/api/news', (req, res) => {
    const user = extractUserFromHeader(req);
    const canManageSchoolContent = user && ['ADMIN', 'SUPER_ADMIN', 'PRINCIPAL'].includes(user.role);
    if (canManageSchoolContent) {
      return res.json({ news: db.news });
    }
    const publishedNews = db.news.filter((n) => n.published);
    res.json({ news: publishedNews });
  });

  app.post('/api/news', (req, res) => {
    const user = requireRole(req, res, ['ADMIN', 'SUPER_ADMIN', 'PRINCIPAL']);
    if (!user) return;

    const data = req.body;
    const newArticle: NewsArticle = {
      id: `news-${Date.now()}`,
      title: data.title,
      slug: (data.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      excerpt: data.excerpt,
      content: data.content,
      category: data.category || 'Announcement',
      featuredImage: data.featuredImage || 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80',
      author: user.name,
      authorRole: user.role === 'PRINCIPAL' ? 'Principal' : 'Admin',
      publishDate: new Date().toISOString().split('T')[0],
      published: data.published ?? true,
      isImportantNotice: data.isImportantNotice || false,
    };

    db.news.unshift(newArticle);
    saveDatabase(db);
    addAuditLog(user.email, user.role, 'NEWS_CREATED', newArticle.title, 'Created news article');

    res.status(201).json({ article: newArticle });
  });

  app.delete('/api/news/:id', (req, res) => {
    const user = requireRole(req, res, ['ADMIN', 'SUPER_ADMIN', 'PRINCIPAL']);
    if (!user) return;

    const { id } = req.params;
    const idx = db.news.findIndex((n) => n.id === id);
    if (idx >= 0) {
      const removed = db.news.splice(idx, 1)[0];
      saveDatabase(db);
      addAuditLog(user.email, user.role, 'NEWS_DELETED', removed.title, 'Deleted news article');
      return res.json({ success: true });
    }
    res.status(404).json({ error: 'Article not found' });
  });

  // 8. Gallery CMS
  app.get('/api/gallery', (req, res) => {
    const user = extractUserFromHeader(req);
    if (user && ['ADMIN', 'SUPER_ADMIN', 'PRINCIPAL'].includes(user.role)) {
      return res.json({ gallery: db.gallery });
    }
    const published = db.gallery.filter((g) => g.published);
    res.json({ gallery: published });
  });

  app.post('/api/gallery', (req, res) => {
    const user = requireRole(req, res, ['ADMIN', 'SUPER_ADMIN', 'PRINCIPAL']);
    if (!user) return;

    const data = req.body;
    const newItem: GalleryMedia = {
      id: `gal-${Date.now()}`,
      title: data.title,
      category: data.category || 'School Life',
      description: data.description || '',
      imageUrl: data.imageUrl,
      date: new Date().toISOString().split('T')[0],
      published: data.published ?? true,
      featured: data.featured || false,
    };

    db.gallery.unshift(newItem);
    saveDatabase(db);
    addAuditLog(user.email, user.role, 'GALLERY_UPLOAD', newItem.title, 'Added new photo to gallery');

    res.status(201).json({ item: newItem });
  });

  app.delete('/api/gallery/:id', (req, res) => {
    const user = requireRole(req, res, ['ADMIN', 'SUPER_ADMIN', 'PRINCIPAL']);
    if (!user) return;

    const { id } = req.params;
    const idx = db.gallery.findIndex((g) => g.id === id);
    if (idx >= 0) {
      const removed = db.gallery.splice(idx, 1)[0];
      saveDatabase(db);
      addAuditLog(user.email, user.role, 'GALLERY_DELETED', removed.title, 'Removed photo from gallery');
      return res.json({ success: true });
    }
    res.status(404).json({ error: 'Gallery item not found' });
  });

  // 9. Contact Inquiries API
  app.post('/api/contact', publicFormRateLimit, (req, res) => {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    const newMsg: ContactMessage = {
      id: `msg-${Date.now()}`,
      name: String(name).trim(),
      email: String(email).trim(),
      phone: String(phone || '').trim(),
      subject: String(subject || 'General Inquiry').trim(),
      message: String(message).trim(),
      createdAt: new Date().toISOString(),
      status: 'UNREAD',
    };

    db.contactMessages.unshift(newMsg);
    saveDatabase(db);

    res.status(201).json({
      success: true,
      message: 'Thank you for contacting Peculiar College Doma. Our administrative office will get back to you shortly.',
    });
  });

  app.get('/api/contact', (req, res) => {
    const user = requireRole(req, res, ['ADMIN', 'SUPER_ADMIN', 'PRINCIPAL']);
    if (!user) return;
    res.json({ messages: db.contactMessages });
  });

  app.get('/api/contact/messages', (req, res) => {
    const user = requireRole(req, res, ['ADMIN', 'SUPER_ADMIN', 'PRINCIPAL']);
    if (!user) return;
    res.json({ messages: db.contactMessages });
  });

  // 10. Audit Logs API
  app.get('/api/audit-logs', (req, res) => {
    const user = requireRole(req, res, ['ADMIN', 'SUPER_ADMIN', 'PRINCIPAL']);
    if (!user) return;
    res.json({ auditLogs: db.auditLogs });
  });

  // 11. Server-Side Gemini AI Assistant (Safe, prompt-grounded)
  app.post('/api/ai/draft', async (req, res) => {
    const user = requireRole(req, res, ['ADMIN', 'SUPER_ADMIN', 'PRINCIPAL', 'TEACHER']);
    if (!user) return;

    const { type, topic, context } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Fallback template when API key is pending configuration
      return res.json({
        content: `[Peculiar College Doma - Official Draft]\n\nRE: ${topic || 'School Announcement'}\n\nDear Parents, Guardians, and Esteemed Staff,\n\nWe bring you warm greetings from the management of Peculiar College Doma. In alignment with our motto of Knowledge, Character, and Excellence, we wish to inform you regarding ${topic || 'upcoming school activities'}.\n\nKey Highlights:\n1. Punctuality and attendance must remain exemplary.\n2. All students are required to be in complete and proper school uniform.\n3. The school compound remains safe, disciplined, and focused on holistic educational growth.\n\nThank you for your continuous partnership.\n\nYours faithfully,\nSchool Administration\nPeculiar College Doma`,
        isFallback: true,
        note: 'Generated using default school editorial template (configure GEMINI_API_KEY for custom AI generation).',
      });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are the executive communication officer for Peculiar College Doma, an esteemed private school in Doma, Nasarawa State, Nigeria providing Nursery, Primary, and Secondary education. The school's motto is "Knowledge, Character and Excellence" and its mission is "Nurturing minds, building character, and raising leaders".
      
Please write a professional, warm, and dignified ${type || 'announcement'} on the topic: "${topic}".
Additional context provided by staff: "${context || 'Standard school communication'}".

Tone: Respectful, clear, welcoming, academic, culturally grounded for Nigerian parents and guardians. Avoid generic clichés. Sign off as "School Administration, Peculiar College Doma".`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const text = response.text || 'Draft generated successfully.';
      res.json({ content: text, isFallback: false });
    } catch (err: any) {
      console.error('Error generating AI draft:', err);
      res.status(500).json({
        error: 'Failed to generate content with Gemini API',
        details: err?.message || 'Unknown error',
      });
    }
  });

  app.use((error: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.headersSent) return next(error);
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    console.error(`Request failed (${errorName}) on ${req.method} ${req.path}`);
    res.status(500).json({ error: 'Internal server error' });
  });

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Peculiar College Doma Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup failure:', err);
});
