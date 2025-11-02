const express = require('express');
const router = express.Router();

const {
  signup,
  login,
  changePassword,
  resetPassword,
  deleteAccount
} = require('../controllers/authController');

const { protect, authorize } = require('../middleware/auth');

// ---------------------
// Public Routes
// ---------------------
router.post('/signup', signup);
router.post('/login', login);

// ---------------------
// Protected Routes (User/Admin)
// ---------------------
router.put('/change-password', protect, changePassword);
router.delete('/delete-account', protect, deleteAccount);

// ---------------------
// Admin-Only Route
// ---------------------
router.put('/reset-password/:id', protect, authorize('Admin'), resetPassword);

module.exports = router;
