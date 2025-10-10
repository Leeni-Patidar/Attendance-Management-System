const express = require('express');
const router = express.Router();
const subCtrl = require('../controllers/subject.controller');
const { protect } = require('../middleware/auth.middleware');
router.post('/', protect(['admin','class_teacher']), subCtrl.createSubject);
router.get('/', protect(), subCtrl.listSubjects);
module.exports = router;