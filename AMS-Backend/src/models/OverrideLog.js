import mongoose from 'mongoose';

const overrideLogSchema = new mongoose.Schema({
  // Reference to the session
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: [true, 'Session is required'],
    index: true
  },
  
  // Student whose attendance was overridden
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required'],
    index: true
  },
  
  // Faculty who performed the override
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Faculty is required'],
    index: true
  },
  
  // Override details
  overrideType: {
    type: String,
    enum: ['mark_present', 'mark_absent', 'mark_late', 'mark_excused', 'update_existing'],
    required: [true, 'Override type is required'],
    index: true
  },
  
  // Previous and new status
  previousStatus: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused', 'not_marked'],
    default: 'not_marked'
  },
  newStatus: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    required: [true, 'New status is required']
  },
  
  // Reason for override
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    maxlength: [500, 'Reason cannot exceed 500 characters'],
    trim: true
  },
  
  // Additional context
  context: {
    type: String,
    enum: ['late_arrival', 'early_departure', 'technical_issue', 'medical_emergency', 'family_emergency', 'official_duty', 'other'],
    default: 'other'
  },
  
  // Timing information
  overrideTime: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  sessionStartTime: Date, // Cached from session for reporting
  timeDifference: Number, // Minutes between session start and override
  
  // Supporting evidence
  evidence: {
    documents: [String], // URLs to uploaded documents
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    attachments: [{
      filename: String,
      url: String,
      type: String, // image, document, etc.
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // Approval workflow (for sensitive overrides)
  requiresApproval: {
    type: Boolean,
    default: false
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'not_required'],
    default: 'not_required'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalNotes: String,
  approvedAt: Date,
  
  // Impact tracking
  impactLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  affectedMetrics: [{
    metric: String, // e.g., "attendance_percentage", "subject_attendance"
    previousValue: Number,
    newValue: Number,
    change: Number
  }],
  
  // Validation and flags
  isValid: {
    type: Boolean,
    default: true
  },
  flags: [{
    type: {
      type: String,
      enum: ['suspicious_pattern', 'frequent_overrides', 'late_override', 'unauthorized_override', 'bulk_override']
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    description: String,
    flaggedAt: {
      type: Date,
      default: Date.now
    },
    flaggedBy: {
      type: String,
      enum: ['system', 'admin', 'audit'],
      default: 'system'
    },
    resolved: {
      type: Boolean,
      default: false
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date,
    resolution: String
  }],
  
  // Audit trail
  ipAddress: String,
  userAgent: String,
  sessionInfo: {
    deviceId: String,
    platform: String,
    browser: String
  },
  
  // Related attendance record
  attendanceRecord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attendance'
  },
  
  // Metadata
  tags: [String],
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
overrideLogSchema.index({ session: 1, overrideTime: 1 });
overrideLogSchema.index({ faculty: 1, overrideTime: 1 });
overrideLogSchema.index({ student: 1, overrideTime: 1 });
overrideLogSchema.index({ overrideType: 1, overrideTime: 1 });
overrideLogSchema.index({ approvalStatus: 1 }, { sparse: true });
overrideLogSchema.index({ 'flags.type': 1, 'flags.resolved': 1 }, { sparse: true });

// Virtual for calculating time since override
overrideLogSchema.virtual('timeSinceOverride').get(function() {
  const now = new Date();
  const overrideTime = new Date(this.overrideTime);
  const diffTime = Math.abs(now - overrideTime);
  return Math.floor(diffTime / (1000 * 60)); // Return in minutes
});

// Virtual for checking if override is recent
overrideLogSchema.virtual('isRecent').get(function() {
  const timeSince = this.timeSinceOverride;
  return timeSince <= 60; // Consider recent if within 1 hour
});

// Virtual for getting status change description
overrideLogSchema.virtual('statusChangeDescription').get(function() {
  if (this.previousStatus === 'not_marked') {
    return `Marked as ${this.newStatus}`;
  }
  return `Changed from ${this.previousStatus} to ${this.newStatus}`;
});

// Pre-save middleware to calculate time difference
overrideLogSchema.pre('save', async function(next) {
  if (this.isNew && this.session) {
    try {
      const session = await mongoose.model('Session').findById(this.session);
      if (session) {
        this.sessionStartTime = session.startTime;
        const overrideTime = new Date(this.overrideTime);
        const sessionStart = new Date(session.startTime);
        this.timeDifference = Math.floor((overrideTime - sessionStart) / (1000 * 60));
      }
    } catch (error) {
      console.error('Error calculating time difference:', error);
    }
  }
  next();
});

// Pre-save middleware to determine approval requirement
overrideLogSchema.pre('save', function(next) {
  if (this.isNew) {
    // Require approval for certain scenarios
    const requiresApprovalConditions = [
      this.timeDifference > 1440, // Override more than 24 hours after session
      this.overrideType === 'mark_present' && this.timeDifference > 60, // Mark present more than 1 hour late
      this.context === 'other' && !this.evidence.documents.length // Other reason without evidence
    ];
    
    this.requiresApproval = requiresApprovalConditions.some(condition => condition);
    this.approvalStatus = this.requiresApproval ? 'pending' : 'not_required';
  }
  next();
});

// Pre-save middleware to set impact level
overrideLogSchema.pre('save', function(next) {
  if (this.isNew) {
    // Determine impact level based on various factors
    if (this.timeDifference > 2880) { // More than 48 hours
      this.impactLevel = 'high';
    } else if (this.timeDifference > 1440) { // More than 24 hours
      this.impactLevel = 'medium';
    } else {
      this.impactLevel = 'low';
    }
  }
  next();
});

// Method to add flag
overrideLogSchema.methods.addFlag = function(type, severity, description, flaggedBy = 'system') {
  this.flags.push({
    type,
    severity,
    description,
    flaggedBy
  });
  return this.save();
};

// Method to resolve flag
overrideLogSchema.methods.resolveFlag = function(flagIndex, resolution, resolvedBy) {
  if (this.flags[flagIndex]) {
    this.flags[flagIndex].resolved = true;
    this.flags[flagIndex].resolvedBy = resolvedBy;
    this.flags[flagIndex].resolvedAt = new Date();
    this.flags[flagIndex].resolution = resolution;
  }
  return this.save();
};

// Method to approve override
overrideLogSchema.methods.approve = function(approvedBy, notes) {
  this.approvalStatus = 'approved';
  this.approvedBy = approvedBy;
  this.approvalNotes = notes;
  this.approvedAt = new Date();
  return this.save();
};

// Method to reject override
overrideLogSchema.methods.reject = function(rejectedBy, notes) {
  this.approvalStatus = 'rejected';
  this.approvedBy = rejectedBy;
  this.approvalNotes = notes;
  this.approvedAt = new Date();
  return this.save();
};

// Static method to get override statistics for a faculty
overrideLogSchema.statics.getFacultyStats = async function(facultyId, dateRange) {
  const match = { faculty: facultyId };
  
  if (dateRange) {
    match.overrideTime = {
      $gte: dateRange.start,
      $lte: dateRange.end
    };
  }
  
  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalOverrides: { $sum: 1 },
        presentOverrides: {
          $sum: { $cond: [{ $eq: ['$newStatus', 'present'] }, 1, 0] }
        },
        absentOverrides: {
          $sum: { $cond: [{ $eq: ['$newStatus', 'absent'] }, 1, 0] }
        },
        lateOverrides: {
          $sum: { $cond: [{ $eq: ['$newStatus', 'late'] }, 1, 0] }
        },
        excusedOverrides: {
          $sum: { $cond: [{ $eq: ['$newStatus', 'excused'] }, 1, 0] }
        },
        flaggedOverrides: {
          $sum: { $cond: [{ $gt: [{ $size: '$flags' }, 0] }, 1, 0] }
        },
        averageTimeDifference: { $avg: '$timeDifference' }
      }
    }
  ]);
  
  return stats[0] || {
    totalOverrides: 0,
    presentOverrides: 0,
    absentOverrides: 0,
    lateOverrides: 0,
    excusedOverrides: 0,
    flaggedOverrides: 0,
    averageTimeDifference: 0
  };
};

// Static method to get overrides by session
overrideLogSchema.statics.getSessionOverrides = function(sessionId) {
  return this.find({ session: sessionId })
    .populate('student', 'name studentInfo.rollNumber')
    .populate('faculty', 'name teacherInfo.employeeId')
    .sort({ overrideTime: -1 });
};

// Static method to find suspicious patterns
overrideLogSchema.statics.findSuspiciousPatterns = async function(facultyId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const patterns = await this.aggregate([
    {
      $match: {
        faculty: facultyId,
        overrideTime: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          faculty: '$faculty',
          student: '$student'
        },
        overrideCount: { $sum: 1 },
        overrides: { $push: '$$ROOT' }
      }
    },
    {
      $match: {
        overrideCount: { $gte: 5 } // Flag if same faculty overrides same student 5+ times
      }
    }
  ]);
  
  return patterns;
};

// Static method to get pending approvals
overrideLogSchema.statics.getPendingApprovals = function() {
  return this.find({ approvalStatus: 'pending' })
    .populate('student', 'name studentInfo.rollNumber')
    .populate('faculty', 'name teacherInfo.employeeId')
    .populate('session', 'subject className startTime')
    .sort({ overrideTime: -1 });
};

// Static method to get override trends
overrideLogSchema.statics.getOverrideTrends = async function(dateRange) {
  return this.aggregate([
    {
      $match: {
        overrideTime: {
          $gte: dateRange.start,
          $lte: dateRange.end
        }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$overrideTime' },
          month: { $month: '$overrideTime' },
          day: { $dayOfMonth: '$overrideTime' }
        },
        count: { $sum: 1 },
        presentCount: {
          $sum: { $cond: [{ $eq: ['$newStatus', 'present'] }, 1, 0] }
        },
        absentCount: {
          $sum: { $cond: [{ $eq: ['$newStatus', 'absent'] }, 1, 0] }
        }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);
};

const OverrideLog = mongoose.model('OverrideLog', overrideLogSchema);

export default OverrideLog;