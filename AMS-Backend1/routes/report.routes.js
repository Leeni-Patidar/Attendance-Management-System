const express = require('express');
const {
  generateStudentReport,
  generateClassReport,
  generateSubjectReport
} = require('../controllers/report.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes for all authenticated users
router.get('/student/:studentId', generateStudentReport);

// Routes for teachers and admins
router.get('/class/:classId', authorize('teacher', 'subject_teacher', 'class_teacher', 'admin'), generateClassReport);
router.get('/subject/:subjectId', authorize('student', 'teacher', 'subject_teacher', 'class_teacher', 'admin'), generateSubjectReport);

module.exports = router;

