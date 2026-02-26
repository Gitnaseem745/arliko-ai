import { Router } from 'express';
import { checkHealth, checkReadiness } from '../controllers/health.controller.js';

const router = Router()

router.get('/health', checkHealth);
router.get('/ready', checkReadiness)

export default router
