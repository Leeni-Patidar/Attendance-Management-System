const mongoose = require('mongoose');
const otpSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  otp: String,
  expiresAt: Date,
  purpose: String
});
module.exports = mongoose.model('OTP', otpSchema);