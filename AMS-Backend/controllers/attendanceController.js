const Attendance = require('../models/Attendance');
const Class = require('../models/Class');

exports.markAttendance = async (req, res, next) => {
  try {
    const { classId, date, records } = req.body;
    const parsedDate = new Date(date);
    const existing = await Attendance.findOne({ class: classId, date: parsedDate });
    if (existing) return res.status(400).json({ message: 'Attendance already marked for this class and date' });
    const attendance = await Attendance.create({ class: classId, teacher: req.user.id, date: parsedDate, records });
    res.status(201).json(attendance);
  } catch (err) {
    next(err);
  }
};

exports.getAttendanceByClass = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const attendances = await Attendance.find({ class: classId }).populate('records.student', 'name email');
    res.json(attendances);
  } catch (err) {
    next(err);
  }
};

exports.getAttendanceByStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const attendances = await Attendance.find({ 'records.student': studentId }).populate('class', 'name code');
    res.json(attendances);
  } catch (err) {
    next(err);
  }
};

exports.updateAttendanceRecord = async (req, res, next) => {
  try {
    const { attendanceId } = req.params;
    const { studentId, status, remark } = req.body;
    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) return res.status(404).json({ message: 'Attendance not found' });
    const rec = attendance.records.find(r => r.student.toString() === studentId.toString());
    if (!rec) return res.status(404).json({ message: 'Record not found' });
    if (status) rec.status = status;
    if (remark !== undefined) rec.remark = remark;
    await attendance.save();
    res.json(attendance);
  } catch (err) {
    next(err);
  }
};
