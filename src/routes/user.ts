import { Router } from 'express';
import { param } from 'express-validator';
import { UserController } from '../controllers/userController';
import { authenticate, authorizeAdmin, authorizeSelfOrAdmin } from '../middleware/auth';

const router = Router();

// @route   GET /api/users
// @desc    Get all users
// @access  Private/Admin
router.get('/', authenticate, authorizeAdmin, UserController.getAllUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (self or admin)
router.get('/:id', [
    param('id').isUUID()
], authenticate, authorizeSelfOrAdmin, UserController.getUserById);

// @route   PATCH /api/users/:id/block
// @desc    Block user
// @access  Private (self or admin)
router.patch('/:id/block', [
    param('id').isUUID()
], authenticate, authorizeSelfOrAdmin, UserController.blockUser);

export { router as userRoutes };