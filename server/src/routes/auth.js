import { PrismaClient, Prisma } from '@prisma/client';
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const router = Router();

const signToken = (user) => {
  const payload = { sub: user.id, email: user.email, name: user.name, role: user.role };
  return jwt.sign(payload, process.env.JWT_SECRET || 'changeme', { expiresIn: '7d' });
};

router.post('/signup', async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    // Derive allowed roles from Prisma enum to avoid hardcoding mismatches
    const allowedRoles = Object.values(Prisma.Role || {});
    const defaultRole = allowedRoles.includes('ENGINEER') ? 'ENGINEER' : allowedRoles[0];
    const roleToUse = allowedRoles.includes(role) ? role : defaultRole;
    const user = await prisma.user.create({ data: { email, passwordHash, name: name || null, role: roleToUse } });
    const token = signToken(user);
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (e) {
    next(e);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (e) {
    next(e);
  }
});

// Simple auth middleware to protect role change endpoint
const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Missing token' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'changeme');
    req.user = decoded; // contains sub, email, name, role
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Change the current user's role (ENGINEER/OWNER)
router.patch('/role', requireAuth, async (req, res, next) => {
  try {
    const { role } = req.body || {};
    // Derive allowed roles from Prisma enum to avoid hardcoding mismatches
    const allowedRoles = Object.values(Prisma.Role || {});
    if (!allowedRoles.includes(role)) return res.status(400).json({ message: 'Invalid role' });
    const user = await prisma.user.update({ where: { id: req.user.sub }, data: { role } });
    const token = signToken(user);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (e) {
    next(e);
  }
});

export default router;
