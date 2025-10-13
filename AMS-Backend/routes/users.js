const express = require('express');
const router = express.Router();
const { getAllUsers, getUser, updateUser, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', authorize('Admin'), getAllUsers);
router.get('/:id', authorize('Admin','Teacher','Student'), getUser);
router.put('/:id', authorize('Admin','Teacher','Student'), updateUser);
router.delete('/:id', authorize('Admin'), deleteUser);

module.exports = router;
