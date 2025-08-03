import mongoose from 'mongoose';
import crypto from 'crypto';

const sessionSchema = new mongoose.Schema({
  // Session identification
  sessionId: {
    type: String,
    required: true,
    unique: true,
    default: () => crypto.randomBytes(16).toString('hex')
  },
  
  // Faculty who created the session
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Faculty is required'],
    index: true
  },
  
  // Subject/Class information
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    index: true
  },
  subjectCode: {
    type: String,
    required: [true, 'Subject code is required'],
    trim: true,
    uppercase: true
  },
  className: {
    type: String,
    required: [true, 'Class name is required'],
    trim: true,
    index: true
  },
  
  // Session details
  topic: {
    type: String,
    required: [true, 'Topic is required'],
    trim: true,
    maxlength: [200, 'Topic cannot exceed 200 characters']
  },
  sessionType: {
    type: String,
    enum: ['lecture', 'practical', 'tutorial', 'seminar', 'exam'],
    default: 'lecture'
  },
  
  // Timing information
  startTime: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  endTime: {
    type: Date,
    required: true,
    index: true
  },
  validityDuration: {
    type: Number, // Duration in minutes
    required: true,
    min: [1, 'Validity duration must be at least 1 minute'],
    max: [60, 'Validity duration cannot exceed 60 minutes'],
    default: 5
  },
  
  // QR Code information
  qrToken: {
    type: String,
    required: true,
    unique: true
  },
  encryptedData: {
    type: String,
    required: true
  },
  qrCodeImage: {
    type: String, // Base64 encoded QR code image or URL
    required: true
  },
  
  // Session status
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'completed'],
    default: 'active',
    index: true
  },
  
  // Location information (optional)
  location: {
    room: String,
    building: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Attendance tracking
  totalStudents: {
    type: Number,
    default: 0
  },
  attendanceCount: {
    type: Number,
    default: 0
  },
  
  // Manual override tracking
  manualOverrides: {
    type: Number,
    default: 0
  },
  maxManualOverrides: {
    type: Number,
    default: 5,
    min: 0,
    max: 10
  },
  
  // Session metadata
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  tags: [String], // For categorization
  
  // Auto-close session
  autoClose: {
    type: Boolean,
    default: true
  },
  
  // Validation settings
  deviceBindingEnabled: {
    type: Boolean,
    default: true
  },
  locationValidationEnabled: {
    type: Boolean,
    default: false
  },
  locationValidationRadius: {
    type: Number, // Radius in meters
    default: 100
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
sessionSchema.index({ faculty: 1, status: 1 });
sessionSchema.index({ className: 1, subject: 1 });
sessionSchema.index({ startTime: 1, endTime: 1 });
sessionSchema.index({ status: 1, endTime: 1 });
sessionSchema.index({ qrToken: 1 }, { unique: true });

// Virtual for checking if session is currently active
sessionSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'active' && 
         this.startTime <= now && 
         this.endTime >= now;
});

// Virtual for checking if session is expired
sessionSchema.virtual('isExpired').get(function() {
  const now = new Date();
  return this.status === 'active' && this.endTime < now;
});

// Virtual for attendance percentage
sessionSchema.virtual('attendancePercentage').get(function() {
  if (this.totalStudents === 0) return 0;
  return Math.round((this.attendanceCount / this.totalStudents) * 100);
});

// Virtual for remaining time
sessionSchema.virtual('remainingTime').get(function() {
  if (this.status !== 'active') return 0;
  const now = new Date();
  const remaining = Math.max(0, this.endTime - now);
  return Math.floor(remaining / 1000 / 60); // Return in minutes
});

// Pre-save middleware to calculate end time
sessionSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('startTime') || this.isModified('validityDuration')) {
    this.endTime = new Date(this.startTime.getTime() + (this.validityDuration * 60 * 1000));
  }
  next();
});

// Pre-save middleware to update status based on time
sessionSchema.pre('save', function(next) {
  const now = new Date();
  
  if (this.status === 'active' && this.endTime < now) {
    this.status = 'expired';
  }
  
  next();
});

// Method to check if session can accept more scans
sessionSchema.methods.canAcceptScan = function() {
  return this.isActive && this.status === 'active';
};

// Method to check if manual override is allowed
sessionSchema.methods.canOverride = function() {
  return this.manualOverrides < this.maxManualOverrides;
};

// Method to increment attendance count
sessionSchema.methods.incrementAttendance = function() {
  this.attendanceCount += 1;
  return this.save();
};

// Method to increment manual override count
sessionSchema.methods.incrementOverride = function() {
  this.manualOverrides += 1;
  return this.save();
};

// Method to extend session validity
sessionSchema.methods.extendValidity = function(additionalMinutes) {
  if (this.status !== 'active') {
    throw new Error('Cannot extend expired or cancelled session');
  }
  
  const maxExtension = 60; // Maximum 60 minutes extension
  const extension = Math.min(additionalMinutes, maxExtension);
  
  this.endTime = new Date(this.endTime.getTime() + (extension * 60 * 1000));
  this.validityDuration += extension;
  
  return this.save();
};

// Method to cancel session
sessionSchema.methods.cancel = function(reason) {
  this.status = 'cancelled';
  this.notes = (this.notes || '') + `\nCancelled: ${reason}`;
  return this.save();
};

// Method to complete session manually
sessionSchema.methods.complete = function() {
  this.status = 'completed';
  return this.save();
};

// Static method to find active sessions for a faculty
sessionSchema.statics.findActiveSessions = function(facultyId) {
  return this.find({
    faculty: facultyId,
    status: 'active',
    endTime: { $gte: new Date() }
  }).populate('faculty', 'name teacherInfo.employeeId');
};

// Static method to find sessions by class and date range
sessionSchema.statics.findByClassAndDateRange = function(className, startDate, endDate) {
  return this.find({
    className: className,
    startTime: {
      $gte: startDate,
      $lte: endDate
    }
  }).populate('faculty', 'name teacherInfo.employeeId');
};

// Static method to clean up expired sessions
sessionSchema.statics.cleanupExpiredSessions = function() {
  return this.updateMany(
    {
      status: 'active',
      endTime: { $lt: new Date() }
    },
    {
      $set: { status: 'expired' }
    }
  );
};

// Static method to get session statistics
sessionSchema.statics.getSessionStats = async function(facultyId, dateRange) {
  const match = { faculty: facultyId };
  
  if (dateRange) {
    match.startTime = {
      $gte: dateRange.start,
      $lte: dateRange.end
    };
  }
  
  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        activeSessions: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        completedSessions: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        averageAttendance: { $avg: '$attendancePercentage' },
        totalStudentsReached: { $sum: '$attendanceCount' }
      }
    }
  ]);
  
  return stats[0] || {
    totalSessions: 0,
    activeSessions: 0,
    completedSessions: 0,
    averageAttendance: 0,
    totalStudentsReached: 0
  };
};

const Session = mongoose.model('Session', sessionSchema);

export default Session;