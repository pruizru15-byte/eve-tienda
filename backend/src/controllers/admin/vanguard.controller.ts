import type { Request, Response } from 'express';
import prisma from '../../lib/prisma.js';

export const getVanguard = async (req: Request, res: Response) => {
  try {
    const vanguard = await (prisma as any).vanguardSection.findUnique({
      where: { id: 'singleton' },
      include: { features: true }
    });
    res.json(vanguard);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener datos de vanguardia' });
  }
};

export const updateVanguard = async (req: Request, res: Response) => {
  try {
    const { 
      badge_top, title, quote_text, author_name, 
      author_role, main_image_url, image_badge_text, features 
    } = req.body;

    const vanguard = await (prisma as any).vanguardSection.upsert({
      where: { id: 'singleton' },
      update: {
        badge_top, title, quote_text, author_name, 
        author_role, main_image_url, image_badge_text
      },
      create: {
        id: 'singleton',
        badge_top, title, quote_text, author_name, 
        author_role, main_image_url, image_badge_text
      }
    });

    if (Array.isArray(features)) {
      await (prisma as any).vanguardFeature.deleteMany({ where: { vanguard_id: 'singleton' } });
      await (prisma as any).vanguardFeature.createMany({
        data: features.map((f: any) => ({
          vanguard_id: 'singleton',
          icon_name: f.icon_name || "CheckCircle2",
          title: f.title,
          description: f.description
        }))
      });
    }

    res.json({ ...vanguard, features });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar sección vanguardia' });
  }
};
