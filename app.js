import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const port = Number(process.env.RBAC_PORT || 3001);
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) throw new Error('MONGODB_URI must be configured.');
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be configured with at least 32 characters.');
}

app.disable('x-powered-by');
app.use(helmet());
app.use(express.json({ limit: '32kb' }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again later.' },
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);

app.use((req, res) => res.status(404).json({ error: 'Route not found.' }));

app.use((error, _req, res, _next) => {
  if (res.headersSent) return;
  if (error?.name === 'ValidationError' || error?.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid request data.' });
  }
  if (error?.code === 11000) {
    return res.status(409).json({ error: 'An account with that email or student ID already exists.' });
  }
  console.error(`Request failed (${error instanceof Error ? error.name : 'UnknownError'}).`);
  return res.status(500).json({ error: 'Internal server error.' });
});

try {
  await mongoose.connect(mongoUri, {
    autoIndex: process.env.NODE_ENV !== 'production',
    serverSelectionTimeoutMS: 10000,
  });
  app.listen(port, '0.0.0.0', () => console.log(`RBAC API listening on port ${port}.`));
} catch (error) {
  console.error(`MongoDB startup failed (${error instanceof Error ? error.name : 'UnknownError'}).`);
  process.exitCode = 1;
}

export default app;
