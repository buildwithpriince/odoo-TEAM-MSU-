
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from './config/env.js';
import './db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import tripRoutes from './routes/trips.js';
import aiRoutes from './routes/ai.js';
import adminRoutes from './routes/admin.js';
import communityRoutes from './routes/community.js';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.disable('x-powered-by');
const allowedOrigins = env.corsOrigin.split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS origin not allowed'));
  },
  credentials: false,
}));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'globetrotter-backend' }));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/community', communityRoutes);
app.use('/api', aiRoutes);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.use('/api', (_req, res) => res.status(404).json({ error: 'API route not found' }));

if (env.nodeEnv === 'production') {
  const frontendDist = path.resolve(process.cwd(), 'dist');
  app.use(express.static(frontendDist));
  app.get('*', (_req, res) => res.sendFile(path.join(frontendDist, 'index.html')));
}

app.listen(env.port, '0.0.0.0', () => {
  console.log(`GlobeTrotter API listening on http://localhost:${env.port}`);
});
