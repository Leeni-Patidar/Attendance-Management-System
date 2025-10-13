const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/mark', authorize('Teacher'), attendanceController.markAttendance);
router.get('/class/:classId', authorize('Admin','Teacher','Student'), attendanceController.getAttendanceByClass);
router.get('/student/:studentId', authorize('Admin','Teacher','Student'), attendanceController.getAttendanceByStudent);
router.put('/:attendanceId', authorize('Admin','Teacher'), attendanceController.updateAttendanceRecord);

module.exports = router;
