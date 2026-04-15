import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../lib/prisma.js';
import { sendVerificationEmail, sendResetPasswordEmail } from '../lib/email.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export const register = async (req: Request, res: Response): Promise<any> => {
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = 'USER'; // Restringido: No se pueden registrar administradores por API pública
    const verificationToken = crypto.randomBytes(32).toString('hex');

    await prisma.user.create({
      data: {
        name,
        email,
        password_hash: hashedPassword,
        role: userRole,
        verification_token: verificationToken,
      },
    });

    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({ message: 'Usuario registrado. Por favor, revisa tu correo para confirmar tu cuenta.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

export const verify = async (req: Request, res: Response): Promise<any> => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Token inválido' });

  try {
    const user = await prisma.user.findFirst({ where: { verification_token: token as string } });
    if (!user) return res.status(400).json({ error: 'Token inválido o expirado' });

    await prisma.user.update({
      where: { id: user.id },
      data: { is_verified: true, verification_token: null },
    });

    res.json({ message: 'Cuenta confirmada con éxito. Ya puedes iniciar sesión.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al verificar cuenta' });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Credenciales inválidas' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ error: 'Credenciales inválidas' });

    if (!user.is_verified) {
      return res.status(403).json({ error: 'Por favor, confirma tu cuenta en tu correo.' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    res.json({ 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        terms_accepted: user.terms_accepted,
        terms_accepted_at: user.terms_accepted_at
      }, 
      token 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<any> => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.json({ message: 'Si el correo existe, recibirás instrucciones.' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000);

    await prisma.user.update({
      where: { id: user.id },
      data: { reset_token: resetToken, reset_expires: resetExpires },
    });

    await sendResetPasswordEmail(email, resetToken);
    res.json({ message: 'Si el correo existe, recibirás instrucciones.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar solicitud' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<any> => {
  const { token, password } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: { reset_token: token, reset_expires: { gt: new Date() } },
    });

    if (!user) return res.status(400).json({ error: 'Token inválido o expirado' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password_hash: hashedPassword, reset_token: null, reset_expires: null },
    });

    res.json({ message: 'Contraseña actualizada con éxito.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al restablecer contraseña' });
  }
};

export const acceptTerms = async (req: any, res: Response): Promise<any> => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Usuario no autenticado' });

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { 
        terms_accepted: true, 
        terms_accepted_at: new Date() 
      },
    });

    res.json({ 
      message: 'Términos aceptados con éxito', 
      user: { 
        id: user.id, 
        terms_accepted: user.terms_accepted,
        terms_accepted_at: user.terms_accepted_at 
      } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al aceptar términos' });
  }
};

export const updateAvatar = async (req: any, res: Response): Promise<any> => {
    const userId = req.user?.id;
    if (!req.file) return res.status(400).json({ error: 'No se subió ningún archivo' });

    try {
        const avatar_url = `http://localhost:3000/public/uploads/${req.file.filename}`;
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { avatar_url }
        });

        res.json({
            message: 'Avatar actualizado',
            avatar_url: updatedUser.avatar_url,
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                avatar_url: updatedUser.avatar_url,
                role: updatedUser.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar avatar' });
    }
};


export const updateProfile = async (req: any, res: Response): Promise<any> => {
  const userId = req.user?.id;
  const { name, email } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, email }
    });

    res.json({
      message: 'Perfil actualizado con éxito',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
};

export const changePassword = async (req: any, res: Response): Promise<any> => {
  const userId = req.user?.id;
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) return res.status(400).json({ error: 'La contraseña actual es incorrecta' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password_hash: hashedPassword }
    });

    res.json({ message: 'Contraseña actualizada con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al cambiar contraseña' });
  }
};

export const updateUserStatus = async (req: any, res: Response): Promise<any> => {
  const userId = req.user?.id;
  const { last_page_view } = req.body;
  if (!userId) return res.status(401).json({ error: 'No autenticado' });

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { 
        is_online: true, 
        last_activity: new Date(),
        last_page_view: last_page_view || undefined
      }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
};
 
export const getUserMessages = async (req: any, res: Response): Promise<any> => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'No autenticado' });

  try {
    const messages = await prisma.contactMessage.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tus mensajes' });
  }
};

