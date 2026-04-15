import { Router } from 'express';
import { getPublicCategories, getPublicServices } from '../controllers/services.controller.js';

const router = Router();

/**
 * Public Routes for Services
 */
router.get('/categories', getPublicCategories);
router.get('/', getPublicServices);

export default router;
