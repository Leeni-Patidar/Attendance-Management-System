const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
router.get('/me', protect(), userCtrl.getProfile);
router.put('/me', protect(), userCtrl.updateProfile);
router.get('/', protect(['admin']), userCtrl.listUsers);
module.exports = router;