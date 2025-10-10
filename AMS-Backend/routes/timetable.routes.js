const express = require('express');
const router = express.Router();
const ttCtrl = require('../controllers/timetable.controller');
const { protect } = require('../middleware/auth.middleware');
router.post('/', protect(['admin','class_teacher']), ttCtrl.createSlot);
router.get('/', protect(), ttCtrl.list);
module.exports = router;