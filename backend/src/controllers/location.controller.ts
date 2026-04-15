import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const saveLocation = async (req: Request, res: Response) => {
  try {
    const { user_id, name, province, region, country } = req.body;

    // Reset other current locations for this user/session if needed
    // But let's just create a new record
    
    const location = await prisma.locationHistory.create({
      data: {
        user_id: user_id || null,
        name,
        province,
        region,
        country,
        is_current: true,
      },
    });

    res.status(201).json(location);
  } catch (error) {
    console.error('Error saving location:', error);
    res.status(500).json({ error: 'Failed to save location' });
  }
};

export const getLocations = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.query;

    const locations = await prisma.locationHistory.findMany({
      where: {
        OR: [
          { user_id: (user_id as string) || undefined },
          { user_id: null } // Get shared or recently used if no user
        ]
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 5
    });

    res.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
};
