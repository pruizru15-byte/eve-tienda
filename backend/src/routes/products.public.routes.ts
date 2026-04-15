import { Router } from 'express';
import { getPublicProducts, getWeeklyBestSellers, getProductById, submitProductRating } from '../controllers/products.public.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', getPublicProducts);
router.get('/weekly-best-sellers', getWeeklyBestSellers);
router.get('/:id', getProductById);
router.post('/:id/rate', authenticateToken, submitProductRating);

export default router;
