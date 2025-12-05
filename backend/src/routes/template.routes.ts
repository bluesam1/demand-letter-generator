import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import * as templateController from '../controllers/template.controller.js';

const router = Router();

// All template routes require authentication
router.use(authenticate);

router.get('/', templateController.getAllTemplates);
router.get('/:id', templateController.getTemplateById);
router.post('/', authorize('Admin', 'Attorney'), templateController.createTemplate);
router.put('/:id', authorize('Admin', 'Attorney'), templateController.updateTemplate);
router.delete('/:id', authorize('Admin'), templateController.deleteTemplate);
router.post('/:id/duplicate', authorize('Admin', 'Attorney'), templateController.duplicateTemplate);
router.put('/:id/default', authorize('Admin'), templateController.setDefaultTemplate);

export default router;
