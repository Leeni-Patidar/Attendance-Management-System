const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required:true, unique:true, lowercase:true, trim:true },
  password: { type: String, required:true, select:false },
  role: { type: String, enum: ['student','subject_teacher','class_teacher','admin'], required:true },
  isActive: { type: Boolean, default: true },
  profileImage: { type: String, default: null },
  phoneNumber: { type: String },
  address: {
    street: String, city: String, state: String, pincode: String, country: { type: String, default: 'India' }
  },
  studentInfo: {
    rollNumber: { type: String, uppercase:true, index:true, sparse:true },
    class: { type: String },
    year: { type: String },
    semester: { type: String },
    branch: { type: String },
    program: { type: String },
    admissionYear: Number,
    guardianName: String,
    guardianPhone: String,
    guardianEmail: String
  },
  teacherInfo: {
    employeeId: { type: String, uppercase:true, index:true, sparse:true },
    department: { type: String },
    designation: { type: String },
    qualification: [String],
    experience: Number,
    joiningDate: Date,
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
    assignedClasses: [String]
  },
  lastLogin: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerified: { type: Boolean, default:false },
  emailVerificationToken: String,
  twoFactorSecret: String,
  twoFactorEnabled: { type: Boolean, default:false },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method
userSchema.methods.comparePassword = async function(candidate) {
  return await bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);