/*
  routes/productRoutes.js - CRUD for products
*/

import { Router } from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { createProduct, listProducts, getProduct, updateProduct, deleteProduct } from '../controllers/productController.js';

const router = Router();

router.get('/', listProducts);
router.get('/:id', getProduct);

router.post('/', protect, authorizeRoles('admin'), createProduct);
router.put('/:id', protect, authorizeRoles('admin'), updateProduct);
router.delete('/:id', protect, authorizeRoles('admin'), deleteProduct);

export default router;
