import { Router } from 'express';
import { getHeroProducts } from '../controllers/hero.controller.js';

const router = Router();

router.get('/', getHeroProducts);

export default router;
