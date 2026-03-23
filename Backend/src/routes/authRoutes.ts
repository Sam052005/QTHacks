import { Router } from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../db.js';
import { AuthService } from '../services/authService.js';

const router = Router();

// Middleware to protect routes
export const authenticate = async (req: any, res: Response, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const decoded = AuthService.verifyToken(token);
  if (!decoded) return res.status(401).json({ error: 'Invalid token' });

  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!user) return res.status(401).json({ error: 'User not found' });

  req.user = user;
  next();
};

// Register
router.post('/register', async (req: Request, res: Response) => {
  const { username, password, collegeYear, course } = req.body;

  try {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) return res.status(400).json({ error: 'Username already taken' });

    const hashedPassword = await AuthService.hashPassword(password);
    const user = await prisma.user.create({
      data: { username, password: hashedPassword, collegeYear, course }
    });

    const token = AuthService.generateToken(user.id);
    res.status(201).json({ user, token });
  } catch (e) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await AuthService.comparePassword(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = AuthService.generateToken(user.id);
    res.json({ user, token });
  } catch (e) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get Current User
router.get('/me', authenticate, (req: any, res: Response) => {
  res.json(req.user);
});

export default router;
