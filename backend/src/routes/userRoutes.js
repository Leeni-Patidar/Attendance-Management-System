/*
  routes/userRoutes.js - User self and admin management
*/

import { Router } from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { getMe, updateMe, listUsers, getUserById, updateUser, deleteUser } from '../controllers/userController.js';

const router = Router();

// Self
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

// Admin
router.get('/', protect, authorizeRoles('admin'), listUsers);
router.get('/:id', protect, authorizeRoles('admin'), getUserById);
router.put('/:id', protect, authorizeRoles('admin'), updateUser);
router.delete('/:id', protect, authorizeRoles('admin'), deleteUser);

export default router;
