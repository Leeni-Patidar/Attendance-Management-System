const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, required: true },
  records: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      status: { type: String, enum: ['Present', 'Absent', 'Late', 'Excused'], default: 'Absent' },
      remark: { type: String },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

attendanceSchema.index({ class: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
