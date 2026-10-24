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
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost/mock';
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'development-secret-with-more-than-32-characters';
}

mongoose.set('bufferCommands', false);
mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 2000,
}).catch(() => {
  console.warn('[AI Studio] MongoDB not connected — offline fallback active');
});

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

app.use((error, req, res, _next) => {
  if (res.headersSent) return;
  if (error?.name === 'MongooseError' || error?.name === 'MongoNetworkError' || (error?.message && error.message.includes('buffering timed out'))) {
    console.warn('[AI Studio] Database offline — returning mock empty response');
    if (req.method === 'GET') {
      return res.json(req.path.endsWith('s') || req.path.endsWith('s/') ? [] : {});
    }
    return res.status(503).json({ error: 'Service temporarily unavailable (database offline)' });
  }
  if (error?.name === 'ValidationError' || error?.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid request data.' });
  }
  if (error?.code === 11000) {
    return res.status(409).json({ error: 'An account with that email or student ID already exists.' });
  }
  console.error(`Request failed (${error instanceof Error ? error.name : 'UnknownError'}).`);
  return res.status(500).json({ error: 'Internal server error.' });
});

if (process.env.RBAC_PORT || process.env.RUN_RBAC_STANDALONE) {
  app.listen(port, '0.0.0.0', () => console.log(`RBAC API listening on port ${port}.`));
}

export default app;
