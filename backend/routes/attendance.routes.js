const express = require('express');
const {
  markAttendance,
  bulkMarkAttendance,
  getAttendanceByStudent,
  getAttendanceBySubject,
  getAttendanceByClass,
  updateAttendance,
  deleteAttendance
} = require('../controllers/attendance.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes for all authenticated users
router.get('/student/:studentId', getAttendanceByStudent);

// Routes for teachers and admins
router.post('/mark', authorize('teacher', 'subject_teacher', 'class_teacher', 'admin'), markAttendance);
router.post('/bulk', authorize('teacher', 'subject_teacher', 'class_teacher', 'admin'), bulkMarkAttendance);
router.get('/subject/:subjectId', authorize('student', 'teacher', 'subject_teacher', 'class_teacher', 'admin'), getAttendanceBySubject);
router.get('/class/:classId', authorize('student', 'teacher', 'subject_teacher', 'class_teacher', 'admin'), getAttendanceByClass);
router.put('/:id', authorize('teacher', 'subject_teacher', 'class_teacher', 'admin'), updateAttendance);
router.delete('/:id', authorize('class_teacher', 'admin'), deleteAttendance);

module.exports = router;

