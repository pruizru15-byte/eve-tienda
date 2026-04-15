import { Router } from 'express';
import * as ordersController from '../controllers/orders.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/my-orders', authenticateToken, ordersController.getMyOrders);
router.post('/', authenticateToken, ordersController.createOrder);

export default router;
