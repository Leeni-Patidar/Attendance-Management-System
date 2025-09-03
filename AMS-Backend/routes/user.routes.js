const express = require('express');
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  updateProfile,
  uploadProfileImage,
  assignClassTeacher,
  getStudentsByClass,
  getTeachers
} = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes for all authenticated users
router.get('/profile', (req, res) => res.status(200).json({ success: true, data: req.user }));
router.put('/profile', updateProfile);
router.post('/profile/image', uploadProfileImage);

// Routes for admins and class teachers
router.get('/', authorize('admin', 'class_teacher'), getUsers);
router.post('/', authorize('admin', 'class_teacher'), createUser);

// Routes for admins
router.delete('/:id', authorize('admin'), deleteUser);
router.put('/:id/assign-class-teacher', authorize('admin'), assignClassTeacher);

// Routes with mixed authorization
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.put('/:id/change-password', changePassword);
router.get('/students/class/:classId', getStudentsByClass);
router.get('/teachers', getTeachers);

module.exports = router;

