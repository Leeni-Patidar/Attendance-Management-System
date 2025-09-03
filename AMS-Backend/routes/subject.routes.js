const express = require('express');
const {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  getSubjectsByTeacher,
  getSubjectsByClass,
  assignTeacher
} = require('../controllers/subject.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes for all authenticated users
router.get('/', getSubjects);
router.get('/:id', getSubjectById);
router.get('/teacher/:teacherId', getSubjectsByTeacher);
router.get('/class/:classId', getSubjectsByClass);

// Routes for admins and class teachers
router.post('/', authorize('admin', 'class_teacher'), createSubject);
router.put('/:id', authorize('admin', 'class_teacher'), updateSubject);
router.delete('/:id', authorize('admin', 'class_teacher'), deleteSubject);
router.put('/:id/assign-teacher', authorize('admin', 'class_teacher'), assignTeacher);

module.exports = router;

