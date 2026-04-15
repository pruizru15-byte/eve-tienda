import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

/**
 * @section Public Endpoints
 */

// Obtener todas las secciones de ayuda activas para la Landing Page
export const getHelpSections = async (req: Request, res: Response): Promise<any> => {
  try {
    const sections = await prisma.helpSection.findMany({
      where: { is_active: true },
      orderBy: { order_index: 'asc' }
    });
    res.json(sections);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las secciones de ayuda' });
  }
};

/**
 * @section Admin Endpoints
 */

// Obtener todas las secciones (incluyendo inactivas) para el panel de admin
export const getAllHelpSections = async (req: Request, res: Response): Promise<any> => {
  try {
    const sections = await prisma.helpSection.findMany({
      orderBy: { order_index: 'asc' }
    });
    res.json(sections);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener secciones de ayuda para admin' });
  }
};

export const createHelpSection = async (req: Request, res: Response): Promise<any> => {
  const { title, description, content, is_active, order_index } = req.body;
  try {
    const newSection = await prisma.helpSection.create({
      data: {
        title,
        description,
        content,
        is_active: is_active ?? true,
        order_index: order_index ?? 0
      }
    });
    res.status(201).json(newSection);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear la sección de ayuda' });
  }
};

export const updateHelpSection = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const { title, description, content, is_active, order_index } = req.body;
  try {
    const updatedSection = await prisma.helpSection.update({
      where: { id },
      data: {
        title,
        description,
        content,
        is_active,
        order_index
      }
    });
    res.json(updatedSection);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la sección de ayuda' });
  }
};

export const deleteHelpSection = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  try {
    await prisma.helpSection.delete({
      where: { id }
    });
    res.json({ message: 'Sección eliminada con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la sección de ayuda' });
  }
};
