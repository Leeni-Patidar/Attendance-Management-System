const mongoose = require('mongoose');
const timetableSchema = new mongoose.Schema({
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  dayOfWeek: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Timetable', timetableSchema);