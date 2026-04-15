import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller.js';
import { submitContactForm, getMessagesHistory } from '../controllers/contact.controller.js';
import { authenticateToken, isAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Public Routes
router.get('/company', getSettings); // Get About Us and Contact info
router.post('/contact', submitContactForm); // Send message and email

// Admin Routes (Protected)
router.put('/company', authenticateToken, isAdmin, updateSettings); // Update settings
router.get('/messages', authenticateToken, isAdmin, getMessagesHistory); // Get contact history

export default router;
