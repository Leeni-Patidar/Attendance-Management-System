import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  // Student information
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required'],
    index: true
  },
  
  // Session information
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: [true, 'Session is required'],
    index: true
  },
  
  // Attendance details
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    required: [true, 'Attendance status is required'],
    default: 'present',
    index: true
  },
  
  // How attendance was marked
  method: {
    type: String,
    enum: ['qr_scan', 'manual_override', 'bulk_upload', 'auto_present'],
    required: [true, 'Attendance method is required'],
    default: 'qr_scan',
    index: true
  },
  
  // Timing information
  markedAt: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  markingDelay: {
    type: Number, // Minutes after session start
    default: 0
  },
  
  // QR scan specific data
  qrScanData: {
    scanTime: Date,
    deviceInfo: {
      userAgent: String,
      platform: String,
      deviceId: String, // Hashed device identifier
      ipAddress: String
    },
    location: {
      latitude: Number,
      longitude: Number,
      accuracy: Number
    },
    scanImage: String, // Optional selfie or captured image
    scanAttempts: {
      type: Number,
      default: 1
    }
  },
  
  // Manual override data
  overrideData: {
    overriddenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' // Faculty who made the override
    },
    overrideReason: {
      type: String,
      maxlength: [200, 'Override reason cannot exceed 200 characters']
    },
    originalStatus: String, // Status before override
    overrideTime: Date
  },
  
  // Student submission data (for missed classes)
  studentSubmission: {
    reason: {
      type: String,
      maxlength: [500, 'Reason cannot exceed 500 characters']
    },
    documents: [String], // URLs to uploaded documents (medical certificates, etc.)
    submittedAt: Date,
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvalNotes: String,
    approvedAt: Date
  },
  
  // Validation and security
  isValid: {
    type: Boolean,
    default: true
  },
  validationFlags: [{
    flag: {
      type: String,
      enum: ['duplicate_scan', 'late_submission', 'location_mismatch', 'device_mismatch', 'suspicious_activity']
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    description: String,
    flaggedAt: {
      type: Date,
      default: Date.now
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date,
    resolution: String
  }],
  
  // Additional metadata
  notes: {
    type: String,
    maxlength: [300, 'Notes cannot exceed 300 characters']
  },
  tags: [String], // For categorization
  
  // Audit trail
  lastModified: {
    type: Date,
    default: Date.now
  },
  modifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for better performance
attendanceSchema.index({ student: 1, session: 1 }, { unique: true }); // Prevent duplicate attendance
attendanceSchema.index({ student: 1, markedAt: 1 });
attendanceSchema.index({ session: 1, status: 1 });
attendanceSchema.index({ method: 1, markedAt: 1 });
attendanceSchema.index({ 'qrScanData.deviceInfo.deviceId': 1 }, { sparse: true });
attendanceSchema.index({ 'overrideData.overriddenBy': 1 }, { sparse: true });

// Virtual for getting session details
attendanceSchema.virtual('sessionDetails', {
  ref: 'Session',
  localField: 'session',
  foreignField: '_id',
  justOne: true
});

// Virtual for getting student details
attendanceSchema.virtual('studentDetails', {
  ref: 'User',
  localField: 'student',
  foreignField: '_id',
  justOne: true
});

// Virtual for checking if attendance was marked late
attendanceSchema.virtual('isLate').get(function() {
  return this.markingDelay > 10; // Consider late if marked more than 10 minutes after session start
});

// Virtual for getting attendance age in days
attendanceSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const markedDate = new Date(this.markedAt);
  const diffTime = Math.abs(now - markedDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to calculate marking delay
attendanceSchema.pre('save', async function(next) {
  if (this.isNew && this.session) {
    try {
      const session = await mongoose.model('Session').findById(this.session);
      if (session) {
        const sessionStart = new Date(session.startTime);
        const markingTime = new Date(this.markedAt);
        this.markingDelay = Math.max(0, Math.floor((markingTime - sessionStart) / (1000 * 60)));
      }
    } catch (error) {
      console.error('Error calculating marking delay:', error);
    }
  }
  next();
});

// Pre-save middleware to update version and last modified
attendanceSchema.pre('save', function(next) {
  if (!this.isNew) {
    this.version += 1;
    this.lastModified = new Date();
  }
  next();
});

// Method to mark as invalid with reason
attendanceSchema.methods.markInvalid = function(reason, flaggedBy) {
  this.isValid = false;
  this.validationFlags.push({
    flag: 'suspicious_activity',
    severity: 'high',
    description: reason,
    flaggedBy: flaggedBy
  });
  return this.save();
};

// Method to add validation flag
attendanceSchema.methods.addValidationFlag = function(flag, severity, description, flaggedBy) {
  this.validationFlags.push({
    flag,
    severity,
    description,
    flaggedBy
  });
  return this.save();
};

// Method to resolve validation flag
attendanceSchema.methods.resolveValidationFlag = function(flagIndex, resolution, resolvedBy) {
  if (this.validationFlags[flagIndex]) {
    this.validationFlags[flagIndex].resolvedBy = resolvedBy;
    this.validationFlags[flagIndex].resolvedAt = new Date();
    this.validationFlags[flagIndex].resolution = resolution;
  }
  return this.save();
};

// Method to update status with override
attendanceSchema.methods.updateWithOverride = function(newStatus, reason, overriddenBy) {
  this.overrideData = {
    overriddenBy,
    overrideReason: reason,
    originalStatus: this.status,
    overrideTime: new Date()
  };
  this.status = newStatus;
  this.method = 'manual_override';
  this.modifiedBy = overriddenBy;
  return this.save();
};

// Static method to get attendance statistics for a student
attendanceSchema.statics.getStudentStats = async function(studentId, dateRange) {
  const match = { student: studentId };
  
  if (dateRange) {
    match.markedAt = {
      $gte: dateRange.start,
      $lte: dateRange.end
    };
  }
  
  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalClasses: { $sum: 1 },
        presentCount: {
          $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
        },
        absentCount: {
          $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] }
        },
        lateCount: {
          $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] }
        },
        excusedCount: {
          $sum: { $cond: [{ $eq: ['$status', 'excused'] }, 1, 0] }
        },
        qrScanCount: {
          $sum: { $cond: [{ $eq: ['$method', 'qr_scan'] }, 1, 0] }
        },
        manualOverrideCount: {
          $sum: { $cond: [{ $eq: ['$method', 'manual_override'] }, 1, 0] }
        }
      }
    }
  ]);
  
  const result = stats[0] || {
    totalClasses: 0,
    presentCount: 0,
    absentCount: 0,
    lateCount: 0,
    excusedCount: 0,
    qrScanCount: 0,
    manualOverrideCount: 0
  };
  
  result.attendancePercentage = result.totalClasses > 0 
    ? Math.round((result.presentCount / result.totalClasses) * 100) 
    : 0;
    
  return result;
};

// Static method to get session attendance summary
attendanceSchema.statics.getSessionSummary = async function(sessionId) {
  const stats = await this.aggregate([
    { $match: { session: sessionId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const summary = {
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    total: 0
  };
  
  stats.forEach(stat => {
    summary[stat._id] = stat.count;
    summary.total += stat.count;
  });
  
  summary.attendancePercentage = summary.total > 0 
    ? Math.round((summary.present / summary.total) * 100) 
    : 0;
  
  return summary;
};

// Static method to get attendance by subject and date range
attendanceSchema.statics.getSubjectAttendance = async function(studentId, subject, dateRange) {
  const pipeline = [
    {
      $lookup: {
        from: 'sessions',
        localField: 'session',
        foreignField: '_id',
        as: 'sessionInfo'
      }
    },
    {
      $unwind: '$sessionInfo'
    },
    {
      $match: {
        student: mongoose.Types.ObjectId(studentId),
        'sessionInfo.subject': subject,
        markedAt: {
          $gte: dateRange.start,
          $lte: dateRange.end
        }
      }
    },
    {
      $group: {
        _id: null,
        totalClasses: { $sum: 1 },
        presentCount: {
          $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
        }
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || { totalClasses: 0, presentCount: 0 };
};

// Static method to find duplicate attendance records
attendanceSchema.statics.findDuplicates = function() {
  return this.aggregate([
    {
      $group: {
        _id: { student: '$student', session: '$session' },
        count: { $sum: 1 },
        records: { $push: '$_id' }
      }
    },
    {
      $match: { count: { $gt: 1 } }
    }
  ]);
};

// Static method to get attendance trends
attendanceSchema.statics.getAttendanceTrends = async function(studentId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        student: mongoose.Types.ObjectId(studentId),
        markedAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$markedAt' },
          month: { $month: '$markedAt' },
          day: { $dayOfMonth: '$markedAt' }
        },
        present: {
          $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
        },
        absent: {
          $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] }
        },
        total: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);
};

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;