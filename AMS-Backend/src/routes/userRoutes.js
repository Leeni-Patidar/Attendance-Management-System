const express = require('express');
const router = express.Router();

// Import controllers
const userController = require('../controllers/userController');

// Import middleware
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { 
    validateUserRegistration, 
    validateUserUpdate,
    validateId,
    validatePagination 
} = require('../middleware/validation');

// User management routes (Admin/HR only)
router.get('/', 
    authenticateToken, 
    authorizeRoles('admin', 'hr'), 
    validatePagination, 
    userController.getAllUsers
);

router.get('/statistics', 
    authenticateToken, 
    authorizeRoles('admin', 'hr'), 
    userController.getUserStatistics
);

router.get('/:id', 
    authenticateToken, 
    authorizeRoles('admin', 'hr'), 
    validateId, 
    userController.getUserById
);

router.post('/', 
    authenticateToken, 
    authorizeRoles('admin', 'hr'), 
    validateUserRegistration, 
    userController.createUser
);

router.put('/:id', 
    authenticateToken, 
    authorizeRoles('admin', 'hr'), 
    validateId, 
    validateUserUpdate, 
    userController.updateUser
);

router.delete('/:id', 
    authenticateToken, 
    authorizeRoles('admin'), 
    validateId, 
    userController.deleteUser
);

router.put('/:id/reset-password', 
    authenticateToken, 
    authorizeRoles('admin', 'hr'), 
    validateId, 
    userController.resetPassword
);

module.exports = router;