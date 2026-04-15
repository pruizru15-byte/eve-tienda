import { Router } from 'express';
import * as forumController from '../controllers/forum.controller.js';
import { authenticateToken, optionalAuthenticateToken } from '../middlewares/auth.middleware.js';
import { uploadMiddleware } from '../middlewares/upload.middleware.js';

import * as messagesController from '../controllers/admin/messages.controller.js';

const router = Router();

router.get('/my-activity', authenticateToken, forumController.getMyActivity);
router.get('/topics', optionalAuthenticateToken, forumController.getPublicTopics);
router.post('/topics', authenticateToken, uploadMiddleware.single('media'), forumController.createTopic);
router.put('/topics/:id', authenticateToken, forumController.updateTopic);
router.delete('/topics/:id', authenticateToken, forumController.deleteTopic);
router.patch('/topics/:id/status', authenticateToken, forumController.toggleTopicStatus);

router.post('/comments', authenticateToken, uploadMiddleware.single('media'), forumController.postComment);
router.post('/reactions', authenticateToken, messagesController.toggleReaction);

export default router;
