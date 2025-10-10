const mongoose = require('mongoose');
const qrSchema = new mongoose.Schema({
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  code: { type: String, unique: true, required: true },
  validTill: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QRSession', qrSchema);