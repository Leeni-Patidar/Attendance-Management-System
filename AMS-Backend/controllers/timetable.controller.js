const { Timetable } = require('../models');
const asyncHandler = fn => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next);

exports.createSlot = asyncHandler(async (req,res) => {
  const { subjectId, classId, dayOfWeek, startTime, endTime } = req.body;
  // basic overlap check
  const overlap = await Timetable.findOne({ subject: subjectId, class: classId, dayOfWeek, $or: [
    { startTime: { $lt: endTime, $gte: startTime } },
    { endTime: { $gt: startTime, $lte: endTime } }
  ]});
  if (overlap) return res.status(400).json({ message: 'Overlapping slot' });
  const slot = await Timetable.create({ subject: subjectId, class: classId, dayOfWeek, startTime, endTime });
  res.status(201).json({ slot });
});

exports.list = asyncHandler(async (req,res) => {
  const slots = await Timetable.find().populate('subject class');
  res.json({ slots });
});