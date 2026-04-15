import { Router } from 'express';
import { getMyNotifications, markAsRead } from '../controllers/notifications.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/my-notifications', authenticateToken, getMyNotifications);
router.patch('/:id/read', authenticateToken, markAsRead);

export default router;
