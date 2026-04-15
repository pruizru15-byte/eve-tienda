import { Router } from 'express';
import { createBundle, updateBundle, deleteBundle } from '../controllers/bundles.admin.controller.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect, adminOnly);

router.post('/', createBundle);
router.put('/:id', updateBundle);
router.delete('/:id', deleteBundle);

export default router;
