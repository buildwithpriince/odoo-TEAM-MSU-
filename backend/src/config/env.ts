
import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  databasePath: process.env.DATABASE_PATH || './data/globetrotter.sqlite',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
};
if (env.nodeEnv === 'production' && env.jwtSecret === 'change-me-in-production') {
  throw new Error('JWT_SECRET must be set in production.');
}
