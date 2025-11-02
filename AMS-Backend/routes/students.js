const express = require('express');
const router = express.Router();
const { getAllStudents, getStudent, getMyStudent } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

// Protect all student routes
router.use(protect);

// Only Admins and Teachers can list all students
router.get('/', authorize('Admin','Teacher'), getAllStudents);

// Admin/Teacher/Student can view individual student (subject to authorization middleware)
// current authenticated student
router.get('/me', authorize('Student','Admin','Teacher'), getMyStudent);

// Admin/Teacher/Student can view individual student (subject to authorization middleware)
router.get('/:id', authorize('Admin','Teacher','Student'), getStudent);

module.exports = router;
