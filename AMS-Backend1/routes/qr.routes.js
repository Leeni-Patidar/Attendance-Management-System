const express = require('express');
const {
  generateQR,
  scanQR,
  getActiveQRSessions,
  getQRSessionHistory,
  getQRSessionDetails,
  cancelQRSession
} = require('../controllers/qr.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes for all authenticated users
router.post('/scan', scanQR);

// Routes for teachers and admins
router.post('/generate', authorize('teacher', 'subject_teacher', 'class_teacher', 'admin'), generateQR);
router.get('/active', authorize('teacher', 'subject_teacher', 'class_teacher', 'admin'), getActiveQRSessions);
router.get('/history', authorize('teacher', 'subject_teacher', 'class_teacher', 'admin'), getQRSessionHistory);
router.get('/:id', authorize('teacher', 'subject_teacher', 'class_teacher', 'admin'), getQRSessionDetails);
router.put('/:id/cancel', authorize('teacher', 'subject_teacher', 'class_teacher', 'admin'), cancelQRSession);

module.exports = router;

