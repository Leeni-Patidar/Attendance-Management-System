import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // Common fields for all users
  loginId: {
    type: String,
    required: [true, 'Login ID is required'],
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: {
      values: ['student', 'subject_teacher', 'class_teacher', 'admin'],
      message: 'Role must be student, subject_teacher, class_teacher, or admin'
    },
    index: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profileImage: {
    type: String, // URL to profile image
    default: null
  },
  phoneNumber: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },
  
  // Student-specific fields
  studentInfo: {
    rollNumber: {
      type: String,
      sparse: true, // Allows null values but maintains uniqueness for non-null values
      unique: true,
      trim: true,
      uppercase: true
    },
    class: {
      type: String,
      trim: true
    },
    year: {
      type: String,
      enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year']
    },
    semester: {
      type: String,
      enum: ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', 
             '5th Semester', '6th Semester', '7th Semester', '8th Semester',
             '9th Semester', '10th Semester']
    },
    branch: {
      type: String,
      trim: true
    },
    program: {
      type: String,
      enum: ['B.Tech', 'M.Tech', 'BCA', 'MCA', 'BSc', 'MSc', 'BA', 'MA', 'Other']
    },
    admissionYear: {
      type: Number,
      min: 2000,
      max: new Date().getFullYear()
    },
    guardianName: String,
    guardianPhone: String,
    guardianEmail: String
  },

  // Faculty-specific fields (for both subject and class teachers)
  teacherInfo: {
    employeeId: {
      type: String,
      sparse: true,
      unique: true,
      trim: true,
      uppercase: true
    },
    department: {
      type: String,
      trim: true
    },
    designation: {
      type: String,
      enum: ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Other']
    },
    qualification: [String], // Array of qualifications
    experience: {
      type: Number, // Years of experience
      min: 0
    },
    joiningDate: {
      type: Date
    },
    subjects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject'
    }], // Subjects they can teach
    assignedClasses: [String] // Array of class names they're assigned to
  },

  // Security and metadata fields
  lastLogin: {
    type: Date,
    default: null
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  twoFactorSecret: String,
  twoFactorEnabled: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      delete ret.emailVerificationToken;
      delete ret.twoFactorSecret;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes for better performance
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ 'studentInfo.rollNumber': 1 }, { sparse: true });
userSchema.index({ 'teacherInfo.employeeId': 1 }, { sparse: true });
userSchema.index({ 'teacherInfo.department': 1 }, { sparse: true });

// Virtual for checking if account is locked
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Static method to find user by login credentials
userSchema.statics.findByCredentials = async function(loginId, password, role) {
  const user = await this.findOne({ 
    loginId: loginId.toLowerCase(), 
    role: role,
    isActive: true 
  }).select('+password');
  
  if (!user) {
    throw new Error('Invalid login credentials');
  }
  
  if (user.isLocked) {
    throw new Error('Account is temporarily locked due to too many failed login attempts');
  }
  
  const isMatch = await user.comparePassword(password);
  
  if (!isMatch) {
    await user.incLoginAttempts();
    throw new Error('Invalid login credentials');
  }
  
  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }
  
  // Update last login
  user.lastLogin = new Date();
  await user.save();
  
  return user;
};

// Static method to get users by role
userSchema.statics.findByRole = function(role, isActive = true) {
  return this.find({ role, isActive }).select('-password');
};

// Validation for role-specific required fields
userSchema.pre('validate', function(next) {
  if (this.role === 'student') {
    if (!this.studentInfo || !this.studentInfo.rollNumber) {
      this.invalidate('studentInfo.rollNumber', 'Roll number is required for students');
    }
    if (!this.studentInfo.class) {
      this.invalidate('studentInfo.class', 'Class is required for students');
    }
  }
  
  if (this.role === 'subject_teacher' || this.role === 'class_teacher') {
    if (!this.teacherInfo || !this.teacherInfo.employeeId) {
      this.invalidate('teacherInfo.employeeId', 'Employee ID is required for teachers');
    }
    if (!this.teacherInfo.department) {
      this.invalidate('teacherInfo.department', 'Department is required for teachers');
    }
  }
  
  next();
});

const User = mongoose.model('User', userSchema);

export default User;