import express from 'express';
import { 
  getUsers, 
  getAnalytics, 
  getOverrideLogs,
  getDashboard
} from '../controllers/adminController.js';
import { 
  authenticateToken, 
  requireAdmin 
} from '../middleware/auth.js';
import { 
  validatePagination,
  validateDateRange,
  handleValidationErrors 
} from '../middleware/validation.js';

const router = express.Router();

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard data
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/dashboard',
  authenticateToken,
  requireAdmin,
  getDashboard
);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users with filtering
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/users',
  authenticateToken,
  requireAdmin,
  validatePagination,
  handleValidationErrors,
  getUsers
);

/**
 * @swagger
 * /api/admin/analytics:
 *   get:
 *     summary: Get system analytics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/analytics',
  authenticateToken,
  requireAdmin,
  getAnalytics
);

/**
 * @swagger
 * /api/admin/override-logs:
 *   get:
 *     summary: Get override logs with filtering
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/override-logs',
  authenticateToken,
  requireAdmin,
  validatePagination,
  validateDateRange,
  handleValidationErrors,
  getOverrideLogs
);

export default router;