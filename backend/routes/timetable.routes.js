const express = require('express');
const {
  getTimetable,
  getTimetableById,
  createTimetable,
  updateTimetable,
  deleteTimetable,
  getTimetableByClass,
  getTimetableByTeacher,
  getCurrentClass
} = require('../controllers/timetable.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes for all authenticated users
router.get('/', getTimetable);
router.get('/:id', getTimetableById);
router.get('/class/:classId', getTimetableByClass);
router.get('/teacher/:teacherId', getTimetableByTeacher);
router.get('/current-class/:teacherId', getCurrentClass);

// Routes for admins and class teachers
router.post('/', authorize('admin', 'class_teacher'), createTimetable);
router.put('/:id', authorize('admin', 'class_teacher'), updateTimetable);
router.delete('/:id', authorize('admin', 'class_teacher'), deleteTimetable);

module.exports = router;

