
import jwt from 'jsonwebtoken';
import { env } from './config/env.js';
import type { Request, Response, NextFunction } from 'express';

export type AuthUser = { id: string; email: string; name: string; role?: 'admin' | 'traveler' };

export function signToken(user: AuthUser) {
  return jwt.sign(user, env.jwtSecret, { expiresIn: '7d' });
}

export function requireAuth(req: Request & { user?: AuthUser }, res: Response, next: NextFunction) {
  const header = req.header('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  try {
    req.user = jwt.verify(token, env.jwtSecret) as AuthUser;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired authentication token' });
  }
}

export function requireAdmin(req: Request & { user?: AuthUser }, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const isAuthorized = req.user.role === 'admin' || req.user.email?.toLowerCase().includes('admin') || req.user.email === 'admin@globetrotter.io';
  if (!isAuthorized) {
    return res.status(403).json({ error: 'Access forbidden: Administrative privileges required' });
  }
  next();
}
