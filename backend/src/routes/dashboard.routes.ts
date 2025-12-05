import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import * as dashboardController from '../controllers/dashboard.controller.js';

const router = Router();

// All dashboard routes require authentication
router.use(authenticate);

router.get('/stats', dashboardController.getDashboardStats);

export default router;
