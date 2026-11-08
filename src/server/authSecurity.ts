import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AcademicResult, Student, User, UserRole } from '../types';

const TOKEN_ISSUER = 'peculiar-college-doma';
const TOKEN_AUDIENCE = 'pcd-web';
const TOKEN_ALGORITHM = 'HS256';
const DEMO_CREDENTIALS: Record<string, string> = {
  'usr-super-admin': '@Admin2005',
  'usr-admin': 'Peculiar@2026',
  'usr-principal': 'Peculiar@2026',
  'usr-teacher': 'Peculiar@2026',
  'usr-accountant': 'Peculiar@2026',
  'usr-parent': 'Peculiar@2026',
  'usr-applicant': 'Peculiar@2026',
  'usr-student': 'Peculiar@2026',
  'usr-student-2': 'Peculiar@2026',
  'usr-student-3': 'Peculiar@2026',
};
const LEGACY_SHARED_PASSWORDS = new Set(['@Admin2005', 'Peculiar@2026', 'admin123']);
const VALID_ROLES: UserRole[] = [
  'SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'TEACHER', 'ACCOUNTANT', 'PARENT', 'STUDENT', 'APPLICANT',
];

export function isSharedPassword(password: string): boolean {
  return LEGACY_SHARED_PASSWORDS.has(password);
}

export function markSeedDemoUsers(users: User[], seedUsers: User[], enabled: boolean): void {
  const seedKeys = new Set(seedUsers.map((user) => `${user.id}\u0000${user.email.toLowerCase()}\u0000${user.role}`));
  for (const user of users) {
    const key = `${user.id}\u0000${user.email.toLowerCase()}\u0000${user.role}`;
    user.isDemo = enabled && seedKeys.has(key);
  }
}

export function isBcryptHash(value: unknown): value is string {
  return typeof value === 'string' && /^\$2[aby]\$\d{2}\$/.test(value);
}

export function issueSessionToken(userId: string, secret: string, nowMs = Date.now()): string {
  return issueVersionedSessionToken(userId, secret, 0, nowMs);
}

export function issueVersionedSessionToken(userId: string, secret: string, tokenVersion = 0, nowMs = Date.now()): string {
  return jwt.sign({ ver: tokenVersion, iat: Math.floor(nowMs / 1000) }, secret, {
    algorithm: TOKEN_ALGORITHM,
    subject: userId,
    issuer: TOKEN_ISSUER,
    audience: TOKEN_AUDIENCE,
    expiresIn: '8h',
  });
}

export function verifySessionToken(
  token: string,
  secret: string,
  users: User[],
  nowMs = Date.now()
): User | null {
  try {
    const payload = jwt.verify(token, secret, {
      algorithms: [TOKEN_ALGORITHM],
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
      clockTimestamp: Math.floor(nowMs / 1000),
    });
    if (
      typeof payload === 'string' ||
      typeof payload.sub !== 'string' ||
      !Number.isInteger(payload.ver)
    ) return null;
    const user = users.find((candidate) => candidate.id === payload.sub);
    if (
      !user ||
      user.isActive === false ||
      (user.tokenVersion || 0) !== payload.ver ||
      !VALID_ROLES.includes(user.role)
    ) return null;
    return user;
  } catch {
    return null;
  }
}

export function authenticateBearer(
  authorization: string | undefined,
  secret: string,
  users: User[],
  nowMs = Date.now()
): User | null {
  if (!authorization) return null;
  const match = /^Bearer\s+([^\s]+)$/i.exec(authorization.trim());
  return match ? verifySessionToken(match[1], secret, users, nowMs) : null;
}

export function isPhoneNumberMatch(input: string, targetPhone?: string): boolean {
  if (!input || !targetPhone) return false;
  const cleanInput = input.trim();
  const cleanTarget = targetPhone.trim();
  if (cleanInput === cleanTarget) return true;

  const inputDigits = cleanInput.replace(/\D/g, '');
  const targetDigits = cleanTarget.replace(/\D/g, '');
  if (!inputDigits || !targetDigits) return false;
  if (inputDigits === targetDigits) return true;

  // Compare standard Nigerian phone digits (last 10 digits match)
  const inputLast10 = inputDigits.slice(-10);
  const targetLast10 = targetDigits.slice(-10);
  if (inputLast10.length >= 8 && targetLast10.length >= 8 && inputLast10 === targetLast10) {
    return true;
  }
  return false;
}

export function verifyAccountPassword(
  user: User,
  password: string,
  allowDemoCredentials: boolean
): boolean {
  // 1. Student-specific authentication:
  if (user.role === 'STUDENT') {
    // If student has changed their password after login, require the new password
    if (user.hasCustomPassword === true) {
      if (isBcryptHash(user.password)) return bcrypt.compareSync(password, user.password);
      return password === user.password;
    }

    // Default password for student is their parent's phone number
    if (isPhoneNumberMatch(password, user.phone)) {
      return true;
    }

    // Allow fallback demo credential or existing hash if applicable
    if (isBcryptHash(user.password) && bcrypt.compareSync(password, user.password)) {
      return true;
    }
    if (allowDemoCredentials && (password === 'Peculiar@2026' || password === DEMO_CREDENTIALS[user.id])) {
      return true;
    }
    return false;
  }

  // 2. Non-student accounts:
  const demoPassword = user.isDemo === true ? DEMO_CREDENTIALS[user.id] : undefined;
  if (demoPassword) {
    if (!allowDemoCredentials) return false;
    if (isBcryptHash(user.password)) return bcrypt.compareSync(password, user.password);
    return password === demoPassword || password === user.password;
  }

  if (user.isDemo === true) return false;
  if (isSharedPassword(password)) return false;

  if (isBcryptHash(user.password)) return bcrypt.compareSync(password, user.password);
  if (typeof user.password !== 'string' || isSharedPassword(user.password)) return false;
  return password === user.password;
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12);
}

export function canManageRole(user: User, roles: UserRole[]): boolean {
  return roles.includes(user.role);
}

export function canUseProtectedRoute(user: User, path: string): boolean {
  return !user.mustChangePassword || path === '/api/auth/change-password' || path === '/api/auth/me';
}

function teacherAssignedToStudent(user: User, student: Student): boolean {
  const assigned = user.assignedClasses || [];
  return student.status === 'ACTIVE' && (
    assigned.includes(student.classId) ||
    assigned.includes(student.className) ||
    assigned.includes(student.arm)
  );
}

export function canAccessStudent(user: User, student: Student): boolean {
  if (['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'ACCOUNTANT'].includes(user.role)) return true;
  if (user.role === 'TEACHER') return teacherAssignedToStudent(user, student);
  if (user.role === 'PARENT') {
    return (user.linkedStudentIds || []).includes(student.id) || student.parentId === user.id;
  }
  if (user.role === 'STUDENT') {
    if (student.status === 'SUSPENDED' || student.status === 'DEACTIVATED') return false;
    return (user.linkedStudentIds || []).includes(student.id);
  }
  return false;
}

export function canReadResult(user: User, result: AcademicResult, student: Student | undefined): boolean {
  if (!student) return false;
  if (['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL'].includes(user.role)) return true;
  if (user.role === 'TEACHER') return teacherAssignedToStudent(user, student);
  if (!result.published) return false;
  if (user.role === 'PARENT') {
    return (user.linkedStudentIds || []).includes(result.studentId);
  }
  if (user.role === 'STUDENT') {
    if (student.status === 'SUSPENDED' || student.status === 'DEACTIVATED') return false;
    return (user.linkedStudentIds || []).includes(result.studentId);
  }
  return false;
}

export function canManageResult(user: User, student: Student): boolean {
  if (['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL'].includes(user.role)) return true;
  return user.role === 'TEACHER' && teacherAssignedToStudent(user, student);
}