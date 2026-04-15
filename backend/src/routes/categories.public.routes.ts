import { Router } from 'express';
import * as categoriesController from '../controllers/categories.public.controller.js';

const router = Router();

router.get('/', categoriesController.getAllCategories);
router.get('/featured', categoriesController.getFeaturedCategories);

export default router;
