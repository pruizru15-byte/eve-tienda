import { Router } from 'express';
import { getActiveBundles } from '../controllers/bundles.public.controller.js';

const router = Router();

router.get('/active', getActiveBundles);

export default router;
