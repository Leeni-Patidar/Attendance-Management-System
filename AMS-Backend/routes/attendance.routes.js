const express = require('express');
const router = express.Router();
const attCtrl = require('../controllers/attendance.controller');
const { protect } = require('../middleware/auth.middleware');
router.post('/mark-manual', protect(['subject_teacher','class_teacher','admin']), attCtrl.manualMark);
router.get('/student/:id', protect(['student','subject_teacher','class_teacher','admin']), attCtrl.getStudentAttendance);
module.exports = router;