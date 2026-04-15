import type { Request, Response } from 'express';
import prisma from '../../lib/prisma.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendVerificationEmail } from '../../lib/email.js';

export const getUsers = async (req: Request, res: Response): Promise<any> => {
  try {
    const users = await (prisma.user as any).findMany({
      include: {
        _count: { select: { orders: true, ForumTopics: true } }
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const data = req.body;
  try {
    const user = await (prisma.user as any).update({
      where: { id },
      data
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

export const getUserDetails = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  try {
    const user = await (prisma.user as any).findUnique({
      where: { id },
      include: {
        orders: { orderBy: { created_at: 'desc' } },
        ForumTopics: true
      }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener detalles' });
  }
};

export const getUserStats = async (req: Request, res: Response): Promise<any> => {
  try {
    const totalUsers = await (prisma.user as any).count();
    
    // Consider online if active in the last 2 minutes
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    const onlineUsers = await (prisma.user as any).count({ 
      where: { 
        last_activity: { gte: twoMinutesAgo }
      } 
    });
    
    const totalSpentAggregation = await (prisma.user as any).aggregate({ _sum: { total_spent: true } });
    
    res.json({
      totalUsers,
      onlineUsers,
      totalSpent: totalSpentAggregation._sum.total_spent || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

export const createUser = async (req: Request, res: Response): Promise<any> => {
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password_hash: hashedPassword,
        role: role || 'USER',
        is_verified: false,
        verification_token: verificationToken,
      },
    });

    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({ 
      message: 'Usuario registrado. Se ha enviado un correo de confirmación.',
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};
