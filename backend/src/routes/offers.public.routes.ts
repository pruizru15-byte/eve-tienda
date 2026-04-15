import { Router } from 'express';
import { getActiveOffers } from '../controllers/offers.public.controller.js';

const router = Router();

router.get('/active', getActiveOffers);

export default router;
