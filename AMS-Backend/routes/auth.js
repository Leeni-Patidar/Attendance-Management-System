const express = require('express');
const router = express.Router();
const { signup, login, changePassword, resetPassword, deleteAccount } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/signup', signup);
router.post('/login', login);

// Change password for authenticated user
router.put('/change-password', protect, changePassword);

// Admin resets a user's password
router.put('/reset-password/:id', protect, authorize('Admin'), resetPassword);

// Delete authenticated user's account
router.delete('/delete-account', protect, deleteAccount);

module.exports = router;
