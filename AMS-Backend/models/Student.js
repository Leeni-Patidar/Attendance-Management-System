const mongoose = require('mongoose');

// A flexible student schema that mirrors the external `student` collection shown in the attachment.
const StudentSchema = new mongoose.Schema({
  name: { type: String },
  rollNo: { type: String },
  email: { type: String },
  sem: { type: Number },
  year: { type: Number },
  program: { type: String },
  branch: { type: String },
  studentID: { type: String },
  admissionDate: { type: Date },
  bloodGroup: { type: String },
  dob: { type: Date },
  phoneNumber: { type: String },
  class: { type: String },
  address: { type: String },
  fatherName: { type: String },
  motherName: { type: String },
  guardianPhoneNumber: { type: String },
  subjects: { type: mongoose.Schema.Types.Mixed },
  password:{ type:String},
}, { collection: 'student', timestamps: false });

module.exports = mongoose.model('Student', StudentSchema);
