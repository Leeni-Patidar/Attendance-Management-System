const express = require('express');
const router = express.Router();

// Import controllers
const attendanceController = require('../controllers/attendanceController');

// Import middleware
const { authenticateToken, authorizeOwnerOrAdmin } = require('../middleware/auth');
const { 
    validateCheckIn, 
    validateCheckOut,
    validatePagination,
    validateDateRange 
} = require('../middleware/validation');

// Attendance operations
router.post('/check-in', 
    authenticateToken, 
    validateCheckIn, 
    attendanceController.checkIn
);

router.post('/check-out', 
    authenticateToken, 
    validateCheckOut, 
    attendanceController.checkOut
);

router.post('/break/start', 
    authenticateToken, 
    attendanceController.startBreak
);

router.post('/break/end', 
    authenticateToken, 
    attendanceController.endBreak
);

router.get('/status', 
    authenticateToken, 
    attendanceController.getCurrentStatus
);

// Attendance records
router.get('/records', 
    authenticateToken, 
    validatePagination,
    validateDateRange,
    attendanceController.getAttendanceRecords
);

router.get('/summary', 
    authenticateToken, 
    validateDateRange,
    attendanceController.getAttendanceSummary
);

module.exports = router;