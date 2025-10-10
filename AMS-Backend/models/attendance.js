const mongoose = require('mongoose');
const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['present','absent','late','manual'], default: 'present' },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  method: { type: String, enum: ['scan','manual'], default: 'scan' },
  remarks: String
}, { timestamps: true });

attendanceSchema.index({ student:1, subject:1, date:1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Attendance', attendanceSchema);