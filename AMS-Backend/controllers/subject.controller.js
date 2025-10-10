const { Subject } = require('../models');
const asyncHandler = fn => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next);

exports.createSubject = asyncHandler(async (req,res) => {
  const { name, code, classId, teacherId } = req.body;
  const subject = await Subject.create({ name, code, class: classId, teacher: teacherId });
  res.status(201).json({ subject });
});

exports.listSubjects = asyncHandler(async (req,res) => {
  const subs = await Subject.find().populate('teacher class', '-password');
  res.json({ subjects: subs });
});