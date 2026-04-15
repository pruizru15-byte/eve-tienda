import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { uploadMiddleware } from '../middlewares/upload.middleware.js';

const router = Router();

router.post('/register', authController.register);
router.get('/verify', authController.verify);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.patch('/accept-terms', authenticateToken, authController.acceptTerms);
router.post('/avatar', authenticateToken, uploadMiddleware.single('avatar'), authController.updateAvatar);
router.put('/profile', authenticateToken, authController.updateProfile);
router.put('/change-password', authenticateToken, authController.changePassword);
router.put('/status', authenticateToken, authController.updateUserStatus);
router.get('/messages', authenticateToken, authController.getUserMessages);

export default router;
