import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

const SINGLETON_ID = 'singleton';

export const getSettings = async (req: Request, res: Response): Promise<any> => {
  try {
    let settings = await prisma.companySettings.findUnique({
      where: { id: SINGLETON_ID }
    });

    if (!settings) {
      // Initialize if not exists
      settings = await prisma.companySettings.create({
        data: { id: SINGLETON_ID }
      });
    }

    return res.status(200).json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return res.status(500).json({ error: 'Error al obtener la información de la empresa' });
  }
};

export const updateSettings = async (req: Request, res: Response): Promise<any> => {
  try {
    const data = req.body;
    
    // We don't want to change the ID
    delete data.id;

    const updated = await prisma.companySettings.upsert({
      where: { id: SINGLETON_ID },
      update: data,
      create: { 
        id: SINGLETON_ID,
        ...data 
      }
    });

    return res.status(200).json({
      message: 'Configuración actualizada correctamente',
      settings: updated
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return res.status(500).json({ error: 'Error al actualizar la configuración' });
  }
};
