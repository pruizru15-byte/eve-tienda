import { Router } from 'express';
import * as locationController from '../controllers/location.controller.js';

const router = Router();

router.post('/', locationController.saveLocation);
router.get('/', locationController.getLocations);

export default router;
