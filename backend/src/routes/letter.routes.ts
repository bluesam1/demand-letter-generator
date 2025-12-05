import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import * as letterController from '../controllers/letter.controller.js';
import * as exportController from '../controllers/export.controller.js';

const router = Router();

// All letter routes require authentication
router.use(authenticate);

router.get('/', letterController.getAllLetters);
router.get('/:id', letterController.getLetterById);
router.post('/', letterController.createLetter);
router.put('/:id', letterController.updateLetter);
router.delete('/:id', letterController.deleteLetter);
router.post('/:id/generate', letterController.generateLetter);

// Version history routes
router.get('/:id/versions', letterController.getLetterVersions);
router.post('/:id/versions', letterController.createLetterVersion);
router.post('/:id/versions/:versionId/restore', letterController.restoreLetterVersion);

// Export routes
router.post('/:id/export', exportController.exportLetter);
router.get('/:id/exports', exportController.getLetterExports);

export default router;
