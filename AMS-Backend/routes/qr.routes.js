const express = require('express');
const router = express.Router();
const qrCtrl = require('../controllers/qr.controller');
const { protect } = require('../middleware/auth.middleware');
router.post('/generate', protect(['subject_teacher','class_teacher','admin']), qrCtrl.generateQR);
router.post('/scan', protect(['student']), qrCtrl.scanQR);
module.exports = router;