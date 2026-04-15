import { Router } from 'express';
import * as helpController from '../controllers/help.controller.js';

const router = Router();

// Ruta pública para la Landing Page
router.get('/', helpController.getHelpSections);

export default router;
