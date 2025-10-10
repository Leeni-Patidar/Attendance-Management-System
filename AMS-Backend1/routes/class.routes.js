const express = require('express');
const {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  promoteStudents
} = require('../controllers/class.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes for all authenticated users
router.get('/', getClasses);
router.get('/:id', getClassById);

// Routes for admins
router.post('/', authorize('admin'), createClass);
router.put('/:id', authorize('admin'), updateClass);
router.delete('/:id', authorize('admin'), deleteClass);

// Routes for admins and class teachers
router.post('/:id/promote', authorize('admin', 'class_teacher'), promoteStudents);

module.exports = router;

