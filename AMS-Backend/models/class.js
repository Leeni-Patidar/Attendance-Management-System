const mongoose = require('mongoose');
const classSchema = new mongoose.Schema({
  name: { type: String, required: true },
  year: String,
  semester: String,
  classTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);