const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/student/:studentId/attendance-percentage', authorize('Admin','Teacher','Student'), reportController.attendancePercentageForStudent);
router.get('/class/:classId/summary', authorize('Admin','Teacher'), reportController.classSummary);

module.exports = router;
