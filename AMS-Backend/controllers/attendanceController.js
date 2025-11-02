
const Attendance = require('../models/Attendance');
const Class = require('../models/Class');

// @desc    Mark attendance
// @route   POST /api/attendance/mark
// @access  Private/Teacher
exports.markAttendance = async (req, res, next) => {
  try {
    const { classId, studentId, status } = req.body;

    const newAttendance = new Attendance({
      class: classId,
      student: studentId,
      status,
    });

    const savedAttendance = await newAttendance.save();
    res.status(201).json(savedAttendance);
  } catch (err) {
    next(err);
  }
};

// @desc    Get attendance by class
// @route   GET /api/attendance/class/:classId
// @access  Private
exports.getAttendanceByClass = async (req, res, next) => {
  try {
    const attendance = await Attendance.find({ class: req.params.classId }).populate('student', 'name');
    res.json(attendance);
  } catch (err) {
    next(err);
  }
};

// @desc    Get attendance by student
// @route   GET /api/attendance/student/:studentId
// @access  Private
exports.getAttendanceByStudent = async (req, res, next) => {
  try {
    const attendance = await Attendance.find({ student: req.params.studentId }).populate('class', 'name');
    res.json(attendance);
  } catch (err) {
    next(err);
  }
};

// @desc    Update attendance record
// @route   PUT /api/attendance/:attendanceId
// @access  Private/Admin or Teacher
exports.updateAttendanceRecord = async (req, res, next) => {
  try {
    const { status } = req.body;
    const updatedAttendance = await Attendance.findByIdAndUpdate(
      req.params.attendanceId,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedAttendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.json(updatedAttendance);
  } catch (err) {
    next(err);
  }
};
