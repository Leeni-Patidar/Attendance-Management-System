const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', authorize('Admin'), classController.createClass);
router.get('/', classController.getClasses);
router.get('/:id', classController.getClass);
router.put('/:id', authorize('Admin','Teacher'), classController.updateClass);
router.delete('/:id', authorize('Admin'), classController.deleteClass);
router.post('/:classId/assign-student', authorize('Admin','Teacher'), classController.assignStudent);
router.post('/:classId/remove-student', authorize('Admin','Teacher'), classController.removeStudent);

module.exports = router;
