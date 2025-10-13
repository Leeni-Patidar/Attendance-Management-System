const Attendance = require('../models/Attendance');
const Class = require('../models/Class');
const User = require('../models/User');

exports.attendancePercentageForStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const records = await Attendance.find({ 'records.student': studentId });
    let total = 0, present = 0;
    records.forEach(att => {
      const rec = att.records.find(r => r.student.toString() === studentId.toString());
      if (rec) {
        total += 1;
        if (rec.status === 'Present') present += 1;
      }
    });
    const percentage = total === 0 ? 0 : (present / total) * 100;
    res.json({ studentId, total, present, percentage });
  } catch (err) {
    next(err);
  }
};

exports.classSummary = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const cls = await Class.findById(classId).populate('students', 'name email');
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    const students = cls.students;
    const summaries = [];
    for (const s of students) {
      const records = await Attendance.find({ class: classId, 'records.student': s._id });
      let total = 0, present = 0;
      records.forEach(att => {
        const rec = att.records.find(r => r.student.toString() === s._id.toString());
        if (rec) { total += 1; if (rec.status === 'Present') present += 1; }
      });
      summaries.push({ student: s, total, present, percentage: total === 0 ? 0 : (present / total) * 100 });
    }
    res.json({ class: cls.name, summaries });
  } catch (err) {
    next(err);
  }
};
