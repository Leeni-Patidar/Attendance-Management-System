const mongoose = require('mongoose');
const logSchema = new mongoose.Schema({
  action: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  meta: Object,
  timestamp: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Log', logSchema);