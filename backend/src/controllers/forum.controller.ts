import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getPublicTopics = async (req: any, res: Response): Promise<any> => {
  try {
    const isAdmin = req.user?.role === 'ADMIN';

    // Announcements (Latest 3)
    const announcements = await (prisma as any).forumTopic.findMany({
      where: { 
        author: { role: 'ADMIN' },
        is_active: true
      },
      include: { 
        author: { select: { name: true, role: true, avatar_url: true } },
        reactions: true,
        _count: { select: { comments: true } }
      },
      orderBy: { created_at: 'desc' },
      take: 3
    });

    // Regular Topics
    const topics = await (prisma as any).forumTopic.findMany({
      where: isAdmin ? {} : { is_active: true },
      include: { 
        author: { select: { name: true, role: true, avatar_url: true } },
        reactions: true,
        comments: {
          where: isAdmin ? {} : { is_active: true },
          include: { 
            author: { select: { name: true, avatar_url: true, role: true } },
            reactions: true 
          },
          orderBy: { created_at: 'asc' }
        },
        _count: { select: { comments: true } }
      },
      orderBy: { created_at: 'desc' },
      take: 20
    });

    res.json({ announcements, topics });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener topics del foro' });
  }
};

export const deleteTopic = async (req: any, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const user = req.user;

    const topic = await (prisma as any).forumTopic.findUnique({ where: { id } });
    if (!topic) return res.status(404).json({ error: 'Post no encontrado' });

    if (user.role !== 'ADMIN' && topic.author_id !== user.id) {
      return res.status(403).json({ error: 'No autorizado para eliminar este post' });
    }

    await (prisma as any).forumTopic.delete({ where: { id } });
    res.json({ message: 'Post eliminado con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el post' });
  }
};

export const updateTopic = async (req: any, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const user = req.user;

    const topic = await (prisma as any).forumTopic.findUnique({ where: { id } });
    if (!topic) return res.status(404).json({ error: 'Post no encontrado' });

    if (user.role !== 'ADMIN' && topic.author_id !== user.id) {
      return res.status(403).json({ error: 'No autorizado para editar este post' });
    }

    const updated = await (prisma as any).forumTopic.update({
      where: { id },
      data: { title, content }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el post' });
  }
};

export const toggleTopicStatus = async (req: any, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Solo administradores pueden desactivar posts' });
    }

    const updated = await (prisma as any).forumTopic.update({
      where: { id },
      data: { is_active }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Error al cambiar estado del post' });
  }
};
export const createTopic = async (req: any, res: Response): Promise<any> => {
  try {
    const { title, content } = req.body;
    const author_id = req.user?.id;

    if (!author_id) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    if (!title || !content) {
      return res.status(400).json({ error: 'Título y contenido son requeridos' });
    }

    const media_url = req.file ? `http://localhost:3000/public/uploads/${req.file.filename}` : null;
    const media_type = req.file ? 'IMAGE' : null;

    const topic = await (prisma as any).forumTopic.create({
      data: {
        title,
        content,
        author_id,
        media_url,
        media_type,
      },
      include: {
        author: { select: { name: true, avatar_url: true } }
      }
    });

    res.status(201).json(topic);
  } catch (error) {
    console.error('Error creating topic:', error);
    res.status(500).json({ error: 'Error al crear el post en el foro' });
  }
};

export const postComment = async (req: any, res: Response): Promise<any> => {
  try {
    const { topic_id, content } = req.body;
    const author_id = req.user?.id;

    if (!author_id) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    if (!topic_id || !content) {
      return res.status(400).json({ error: 'Topic ID y contenido son requeridos' });
    }

    const media_url = req.file ? `http://localhost:3000/public/uploads/${req.file.filename}` : null;
    const media_type = req.file ? 'IMAGE' : null;

    const comment = await (prisma as any).forumComment.create({
      data: {
        topic_id,
        content,
        author_id,
        media_url,
        media_type,
      },
      include: {
        author: { select: { name: true, avatar_url: true, role: true } }
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Error al responder en el foro' });
  }
};

export const getMyActivity = async (req: any, res: Response) => {
  const userId = req.user?.id;
  try {
    const [topics, comments] = await Promise.all([
      (prisma as any).forumTopic.findMany({
        where: { author_id: userId },
        orderBy: { created_at: 'desc' },
        include: { _count: { select: { comments: true } } }
      }),
      (prisma as any).forumComment.findMany({
        where: { author_id: userId },
        include: {
          topic: {
            select: { id: true, title: true }
          }
        },
        orderBy: { created_at: 'desc' }
      })
    ]);
    res.json({ topics, comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener actividad del foro' });
  }
};

