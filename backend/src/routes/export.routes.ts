import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import * as exportController from '../controllers/export.controller.js';

const router = Router();

// All export routes require authentication
router.use(authenticate);

// Download and delete exports
router.get('/:id/download', exportController.downloadExport);
router.delete('/:id', exportController.deleteExport);

export default router;
