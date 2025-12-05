import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.js';
import { updateUserProfileSchema } from '../utils/validation.js';
import * as userController from '../controllers/user.controller.js';
import * as invitationController from '../controllers/invitation.controller.js';

const router = Router();

// Public invitation endpoints (no auth required)
router.post('/accept-invitation', invitationController.acceptInvitation);

// All other routes require authentication
router.use(authenticate);

// User profile routes (all users)
router.get('/profile', userController.getUserProfile);
router.put('/profile', validate(updateUserProfileSchema), userController.updateUserProfile);
router.post('/change-password', userController.changePassword);

// Team management routes (admin only)
router.post('/invite', authorize('Admin'), invitationController.inviteUsers);
router.get('/invitations', authorize('Admin'), invitationController.getInvitations);
router.delete('/invitations/:id', authorize('Admin'), invitationController.cancelInvitation);
router.post('/invitations/:id/resend', authorize('Admin'), invitationController.resendInvitation);

// User management routes
router.get('/', authorize('Admin'), userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', authorize('Admin'), userController.updateUser);
router.delete('/:id', authorize('Admin'), userController.deactivateUser);
router.post('/:id/reactivate', authorize('Admin'), userController.reactivateUser);

export default router;
