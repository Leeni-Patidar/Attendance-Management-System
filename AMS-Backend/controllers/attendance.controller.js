const { Attendance, User, Log } = require('../models');
const asyncHandler = fn => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next);

// manual mark (faculty)
exports.manualMark = asyncHandler(async (req, res) => {
  const { studentId, subjectId, date, status='present', remarks='' } = req.body;
  const markedBy = req.user.id;
  if (!studentId || !subjectId) return res.status(400).json({ message: 'studentId and subjectId required' });
  const attendanceDate = date ? new Date(date) : new Date();
  const startOfDay = new Date(attendanceDate.setHours(0,0,0,0));
  const existing = await Attendance.findOne({ student: studentId, subject: subjectId, date: { $gte: startOfDay } });
  if (existing) return res.status(400).json({ message: 'Already marked' });
  const att = await Attendance.create({ student: studentId, subject: subjectId, date: new Date(), status, method: 'manual', markedBy, remarks });
  await Log.create({ action: 'manual_override', user: markedBy, meta: { studentId, subjectId, attendanceId: att._id, remarks } });
  res.json({ message: 'Attendance manually marked', attendance: att });
});

// get student attendance
exports.getStudentAttendance = asyncHandler(async (req, res) => {
  const studentId = req.params.id || req.user.id;
  const records = await Attendance.find({ student: studentId }).populate('subject class markedBy', '-password');
  res.json({ attendance: records });
});