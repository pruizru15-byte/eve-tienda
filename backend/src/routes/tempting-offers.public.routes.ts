import { Router } from 'express';
import * as temptingOffersController from '../controllers/tempting-offers.public.controller.js';

const router = Router();

router.get('/', temptingOffersController.getActiveTemptingOffers);
router.post('/:id/click', temptingOffersController.trackClick);
router.post('/:id/conversion', temptingOffersController.trackConversion);

export default router;
