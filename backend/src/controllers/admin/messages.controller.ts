import type { Request, Response } from 'express';
import prisma from '../../lib/prisma.js';
import { sendContactReplyEmail } from '../../lib/email.js';

// CONTACT MESSAGES (INBOX)
export const getInboxMessages = async (req: Request, res: Response): Promise<any> => {
  try {
    const messages = await (prisma as any).contactMessage.findMany({
      orderBy: { created_at: 'desc' }
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
};

export const updateInboxMessageStatus = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const { status } = req.body; 
  try {
    const message = await (prisma as any).contactMessage.update({
      where: { id },
      data: { status }
    });
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar estado del mensaje' });
  }
};
 
export const replyToInboxMessage = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const { reply } = req.body;

  if (!reply) return res.status(400).json({ error: 'La respuesta no puede estar vacía' });

  try {
    const existingMessage = await (prisma as any).contactMessage.findUnique({
      where: { id }
    });

    if (!existingMessage) return res.status(404).json({ error: 'Mensaje no encontrado' });

    const message = await (prisma as any).contactMessage.update({
      where: { id },
      data: { 
        reply,
        status: 'REPLIED',
        replied_at: new Date()
      }
    });

    // Send Email
    await sendContactReplyEmail(
      existingMessage.email,
      existingMessage.name,
      existingMessage.message,
      reply
    );

    // If user is linked, send a notification
    if (existingMessage.user_id) {
       await (prisma as any).notification.create({
          data: {
             user_id: existingMessage.user_id,
             title: 'Nueva respuesta de soporte',
             message: `Has recibido una respuesta a tu consulta: "${existingMessage.subject || 'Sin asunto'}"`,
             type: 'info'
          }
       });
    }

    res.json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al procesar la respuesta' });
  }
};

// FORUM ANNOUNCEMENTS (PUBLIC)
export const createForumAnnouncement = async (req: any, res: Response): Promise<any> => {
  const { title, content, media_url, media_type } = req.body;
  const author_id = req.user.id; 
  
  try {
    const topic = await (prisma as any).forumTopic.create({
      data: {
        title,
        content,
        media_url,
        media_type,
        author_id,
        views_count: 0,
        likes_count: 0
      }
    });
    res.status(201).json(topic);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al publicar anuncio en el foro' });
  }
};

export const getForumTopics = async (req: Request, res: Response): Promise<any> => {
   try {
      const topics = await (prisma as any).forumTopic.findMany({
        include: { 
          author: { select: { id: true, name: true, role: true, avatar_url: true } },
          reactions: true,
          comments: {
            include: {
              author: { select: { id: true, name: true, role: true, avatar_url: true } },
              reactions: true
            },
            orderBy: { created_at: 'asc' }
          },
          _count: { select: { comments: true } }
        },
        orderBy: { created_at: 'desc' }
      });
     res.json(topics);
   } catch (error) {
     res.status(500).json({ error: 'Error al obtener topics del foro' });
   }
}

// REACTIONS
export const toggleReaction = async (req: any, res: Response): Promise<any> => {
  const { type, topic_id, comment_id } = req.body;
  const user_id = req.user.id;

  try {
    const existing = await (prisma as any).reaction.findFirst({
      where: {
        user_id,
        topic_id: topic_id || undefined,
        comment_id: comment_id || undefined,
        type
      }
    });

    if (existing) {
      await (prisma as any).reaction.delete({ where: { id: existing.id } });
      return res.json({ action: 'removed' });
    } else {
      const reaction = await (prisma as any).reaction.create({
        data: {
          type,
          user_id,
          topic_id: topic_id || undefined,
          comment_id: comment_id || undefined
        }
      });
      return res.json({ action: 'added', reaction });
    }
  } catch (error) {
     console.error(error);
    res.status(500).json({ error: 'Error al procesar reacción' });
  }
};
