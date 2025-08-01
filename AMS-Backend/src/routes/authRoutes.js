const express = require('express');
const router = express.Router();

// Import controllers
const authController = require('../controllers/authController');

// Import middleware
const { authenticateToken } = require('../middleware/auth');
const { 
    validateUserRegistration, 
    validateUserLogin, 
    validateUserUpdate,
    validatePasswordChange 
} = require('../middleware/validation');

// Authentication routes
router.post('/register', validateUserRegistration, authController.register);
router.post('/login', validateUserLogin, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authenticateToken, authController.logout);

// Profile management routes (protected)
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, validateUserUpdate, authController.updateProfile);
router.put('/change-password', authenticateToken, validatePasswordChange, authController.changePassword);

module.exports = router;