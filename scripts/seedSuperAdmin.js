import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

const { MONGODB_URI, INITIAL_SUPER_ADMIN_NAME, INITIAL_SUPER_ADMIN_EMAIL, INITIAL_SUPER_ADMIN_PASSWORD } = process.env;

if (!MONGODB_URI) throw new Error('MONGODB_URI must be configured.');
if (!INITIAL_SUPER_ADMIN_NAME || !INITIAL_SUPER_ADMIN_EMAIL || !INITIAL_SUPER_ADMIN_PASSWORD) {
  throw new Error('Initial super-admin name, email, and password must be configured in environment variables.');
}
if (INITIAL_SUPER_ADMIN_PASSWORD.length < 12) {
  throw new Error('Initial super-admin password must be at least 12 characters.');
}

try {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  const existing = await User.exists({ role: 'super_admin' });
  if (existing) {
    console.log('A super-admin account already exists; no account was created.');
  } else {
    await User.create({
      name: INITIAL_SUPER_ADMIN_NAME.trim(),
      email: INITIAL_SUPER_ADMIN_EMAIL.trim().toLowerCase(),
      password: INITIAL_SUPER_ADMIN_PASSWORD,
      role: 'super_admin',
    });
    console.log('Initial super-admin account created.');
  }
} catch (error) {
  console.error(`Super-admin seed failed (${error instanceof Error ? error.name : 'UnknownError'}).`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
