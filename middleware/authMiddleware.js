import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const ALLOWED_ROLES = new Set([
  'super_admin', 'admin', 'principal', 'teacher', 'bursar', 'parent', 'student',
]);

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) throw new Error('JWT_SECRET must be configured with at least 32 characters.');
  return secret;
}

export async function protect(req, res, next) {
  const authorization = req.get('authorization') || '';
  const [scheme, token] = authorization.split(' ');
  if (scheme !== 'Bearer' || !token) return res.status(401).json({ error: 'Authentication required.' });

  let payload;
  try {
    payload = jwt.verify(token, getJwtSecret(), {
      issuer: 'peculiar-college-doma',
      algorithms: ['HS256'],
      audience: 'pcd-rbac-api',
    });
    if (
      typeof payload !== 'object' ||
      typeof payload.id !== 'string' ||
      typeof payload.role !== 'string' ||
      !Number.isInteger(payload.ver) ||
      !ALLOWED_ROLES.has(payload.role)
    ) return res.status(401).json({ error: 'Invalid authentication token.' });
  } catch {
    return res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }

  try {
    const account = await User.findById(payload.id).select('role isActive tokenVersion');
    if (
      !account ||
      account.isActive === false ||
      account.role !== payload.role ||
      (account.tokenVersion || 0) !== payload.ver
    ) return res.status(401).json({ error: 'Session is no longer valid.' });
    req.user = { id: account._id.toString(), role: account.role };
    return next();
  } catch (error) {
    return next(error);
  }
}

export function restrictTo(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required.' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You are not authorized to perform this action.' });
    }
    return next();
  };
}
