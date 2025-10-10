/*
  routes/orderRoutes.js - CRUD for orders
*/

import { Router } from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { createOrder, listMyOrders, getOrder, updateOrderStatus, listAllOrders } from '../controllers/orderController.js';

const router = Router();

// user endpoints
router.post('/', protect, createOrder);
router.get('/my', protect, listMyOrders);
router.get('/:id', protect, getOrder);

// admin endpoints
router.get('/', protect, authorizeRoles('admin'), listAllOrders);
router.put('/:id', protect, authorizeRoles('admin'), updateOrderStatus);

export default router;
