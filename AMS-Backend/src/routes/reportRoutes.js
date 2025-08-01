const express = require('express');
const router = express.Router();

// Import controllers
const reportsController = require('../controllers/reportsController');

// Import middleware
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateDateRange, validatePagination } = require('../middleware/validation');

// Dashboard and analytics routes (Admin/HR/Manager only)
router.get('/dashboard', 
    authenticateToken, 
    authorizeRoles('admin', 'hr', 'manager'), 
    validateDateRange,
    reportsController.getDashboardData
);

router.get('/attendance', 
    authenticateToken, 
    authorizeRoles('admin', 'hr', 'manager'), 
    validatePagination,
    validateDateRange,
    reportsController.getAttendanceReport
);

router.get('/monthly', 
    authenticateToken, 
    authorizeRoles('admin', 'hr', 'manager'), 
    reportsController.getMonthlyReport
);

router.get('/late-arrivals', 
    authenticateToken, 
    authorizeRoles('admin', 'hr', 'manager'), 
    validatePagination,
    validateDateRange,
    reportsController.getLateArrivalsReport
);

router.get('/overtime', 
    authenticateToken, 
    authorizeRoles('admin', 'hr', 'manager'), 
    validatePagination,
    validateDateRange,
    reportsController.getOvertimeReport
);

module.exports = router;