import mongoose from 'mongoose';
import crypto from 'crypto';

const deviceBindingSchema = new mongoose.Schema({
  // Student reference
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required'],
    index: true
  },
  
  // Device identification
  deviceId: {
    type: String,
    required: [true, 'Device ID is required'],
    unique: true,
    index: true
  },
  deviceFingerprint: {
    type: String,
    required: true,
    unique: true // Combination of multiple device characteristics
  },
  
  // Device information
  deviceInfo: {
    userAgent: {
      type: String,
      required: true
    },
    platform: String, // iOS, Android, Windows, etc.
    browser: String, // Chrome, Safari, Firefox, etc.
    browserVersion: String,
    screenResolution: String,
    timezone: String,
    language: String,
    hardwareConcurrency: Number, // Number of CPU cores
    maxTouchPoints: Number,
    colorDepth: Number,
    pixelRatio: Number
  },
  
  // Additional security fingerprints
  canvasFingerprint: String, // HTML5 canvas fingerprint
  webglFingerprint: String, // WebGL fingerprint
  audioFingerprint: String, // Web Audio API fingerprint
  
  // Device status
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isPrimary: {
    type: Boolean,
    default: false // One primary device per student
  },
  
  // Registration details
  registeredAt: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  registeredFrom: {
    ipAddress: String,
    location: {
      country: String,
      region: String,
      city: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    }
  },
  
  // Verification details
  verificationMethod: {
    type: String,
    enum: ['otp_sms', 'otp_email', 'biometric', 'admin_approval', 'auto'],
    default: 'auto'
  },
  verifiedAt: Date,
  verificationToken: String,
  verificationExpires: Date,
  
  // Usage tracking
  lastUsed: {
    type: Date,
    default: Date.now,
    index: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  attendanceScans: {
    type: Number,
    default: 0
  },
  
  // Security monitoring
  suspiciousActivities: [{
    activity: {
      type: String,
      enum: ['location_change', 'fingerprint_mismatch', 'rapid_requests', 'unusual_timing', 'multiple_sessions']
    },
    description: String,
    detectedAt: {
      type: Date,
      default: Date.now
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    resolved: {
      type: Boolean,
      default: false
    },
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Device restrictions
  restrictions: {
    locationBased: {
      enabled: {
        type: Boolean,
        default: false
      },
      allowedLocations: [{
        name: String,
        coordinates: {
          latitude: Number,
          longitude: Number
        },
        radius: Number // Radius in meters
      }]
    },
    timeBased: {
      enabled: {
        type: Boolean,
        default: false
      },
      allowedHours: {
        start: String, // HH:MM format
        end: String    // HH:MM format
      },
      allowedDays: [Number] // 0-6, Sunday=0
    }
  },
  
  // Device health
  lastHealthCheck: Date,
  healthStatus: {
    type: String,
    enum: ['healthy', 'warning', 'critical', 'unknown'],
    default: 'unknown'
  },
  healthDetails: {
    batteryLevel: Number,
    networkType: String, // wifi, cellular, etc.
    connectionQuality: String, // good, poor, etc.
    gpsAccuracy: Number
  },
  
  // Backup and recovery
  backupDevices: [{
    deviceId: String,
    deviceInfo: Object,
    registeredAt: Date,
    isActive: Boolean
  }],
  
  // Administrative actions
  adminActions: [{
    action: {
      type: String,
      enum: ['approve', 'reject', 'suspend', 'unsuspend', 'reset', 'delete']
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    performedAt: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  
  // Metadata
  tags: [String],
  notes: String,
  
  // Expiration
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 } // TTL index for automatic cleanup
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
deviceBindingSchema.index({ student: 1, isActive: 1 });
deviceBindingSchema.index({ student: 1, isPrimary: 1 });
deviceBindingSchema.index({ deviceFingerprint: 1, isActive: 1 });
deviceBindingSchema.index({ lastUsed: 1 });
deviceBindingSchema.index({ 'registeredFrom.ipAddress': 1 }, { sparse: true });
deviceBindingSchema.index({ healthStatus: 1 }, { sparse: true });

// Ensure only one primary device per student
deviceBindingSchema.index({ student: 1, isPrimary: 1 }, { 
  unique: true, 
  partialFilterExpression: { isPrimary: true } 
});

// Virtual for checking if device is expired
deviceBindingSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

// Virtual for checking if device needs verification
deviceBindingSchema.virtual('needsVerification').get(function() {
  if (!this.verificationToken) return false;
  return this.verificationExpires && this.verificationExpires > new Date();
});

// Virtual for device age in days
deviceBindingSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const registered = new Date(this.registeredAt);
  const diffTime = Math.abs(now - registered);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for last used in days
deviceBindingSchema.virtual('daysSinceLastUsed').get(function() {
  if (!this.lastUsed) return Infinity;
  const now = new Date();
  const lastUsed = new Date(this.lastUsed);
  const diffTime = Math.abs(now - lastUsed);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to generate device fingerprint
deviceBindingSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('deviceInfo')) {
    this.generateFingerprint();
  }
  next();
});

// Pre-save middleware to set expiration (default 1 year)
deviceBindingSchema.pre('save', function(next) {
  if (this.isNew && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)); // 1 year
  }
  next();
});

// Method to generate device fingerprint
deviceBindingSchema.methods.generateFingerprint = function() {
  const info = this.deviceInfo;
  const fingerprintData = [
    info.userAgent,
    info.platform,
    info.screenResolution,
    info.timezone,
    info.language,
    info.hardwareConcurrency,
    info.maxTouchPoints,
    info.colorDepth,
    info.pixelRatio,
    this.canvasFingerprint,
    this.webglFingerprint,
    this.audioFingerprint
  ].filter(Boolean).join('|');
  
  this.deviceFingerprint = crypto
    .createHash('sha256')
    .update(fingerprintData)
    .digest('hex');
};

// Method to verify device fingerprint
deviceBindingSchema.methods.verifyFingerprint = function(currentDeviceInfo) {
  const currentFingerprint = this.generateFingerprintFromInfo(currentDeviceInfo);
  return this.deviceFingerprint === currentFingerprint;
};

// Method to generate fingerprint from device info
deviceBindingSchema.methods.generateFingerprintFromInfo = function(deviceInfo) {
  const fingerprintData = [
    deviceInfo.userAgent,
    deviceInfo.platform,
    deviceInfo.screenResolution,
    deviceInfo.timezone,
    deviceInfo.language,
    deviceInfo.hardwareConcurrency,
    deviceInfo.maxTouchPoints,
    deviceInfo.colorDepth,
    deviceInfo.pixelRatio,
    deviceInfo.canvasFingerprint,
    deviceInfo.webglFingerprint,
    deviceInfo.audioFingerprint
  ].filter(Boolean).join('|');
  
  return crypto
    .createHash('sha256')
    .update(fingerprintData)
    .digest('hex');
};

// Method to mark as primary device
deviceBindingSchema.methods.markAsPrimary = async function() {
  // First, remove primary status from other devices of the same student
  await this.constructor.updateMany(
    { student: this.student, _id: { $ne: this._id } },
    { $set: { isPrimary: false } }
  );
  
  this.isPrimary = true;
  return this.save();
};

// Method to update usage tracking
deviceBindingSchema.methods.updateUsage = function() {
  this.lastUsed = new Date();
  this.usageCount += 1;
  return this.save();
};

// Method to increment attendance scans
deviceBindingSchema.methods.incrementScans = function() {
  this.attendanceScans += 1;
  this.lastUsed = new Date();
  this.usageCount += 1;
  return this.save();
};

// Method to add suspicious activity
deviceBindingSchema.methods.addSuspiciousActivity = function(activity, description, severity = 'medium') {
  this.suspiciousActivities.push({
    activity,
    description,
    severity
  });
  
  // Auto-suspend device if critical activities detected
  if (severity === 'critical') {
    this.isActive = false;
  }
  
  return this.save();
};

// Method to resolve suspicious activity
deviceBindingSchema.methods.resolveSuspiciousActivity = function(activityIndex, resolvedBy) {
  if (this.suspiciousActivities[activityIndex]) {
    this.suspiciousActivities[activityIndex].resolved = true;
    this.suspiciousActivities[activityIndex].resolvedAt = new Date();
    this.suspiciousActivities[activityIndex].resolvedBy = resolvedBy;
  }
  return this.save();
};

// Method to add admin action
deviceBindingSchema.methods.addAdminAction = function(action, performedBy, reason, notes) {
  this.adminActions.push({
    action,
    performedBy,
    reason,
    notes
  });
  
  // Apply the action
  switch (action) {
    case 'approve':
      this.isVerified = true;
      this.isActive = true;
      break;
    case 'reject':
      this.isVerified = false;
      this.isActive = false;
      break;
    case 'suspend':
      this.isActive = false;
      break;
    case 'unsuspend':
      this.isActive = true;
      break;
    case 'reset':
      this.verificationToken = crypto.randomBytes(32).toString('hex');
      this.verificationExpires = new Date(Date.now() + (24 * 60 * 60 * 1000)); // 24 hours
      this.isVerified = false;
      break;
  }
  
  return this.save();
};

// Method to check location restrictions
deviceBindingSchema.methods.checkLocationRestriction = function(latitude, longitude) {
  if (!this.restrictions.locationBased.enabled) {
    return { allowed: true };
  }
  
  const allowedLocations = this.restrictions.locationBased.allowedLocations;
  
  for (const location of allowedLocations) {
    const distance = this.calculateDistance(
      latitude, longitude,
      location.coordinates.latitude, location.coordinates.longitude
    );
    
    if (distance <= location.radius) {
      return { allowed: true, location: location.name, distance };
    }
  }
  
  return { allowed: false, reason: 'Location not in allowed areas' };
};

// Method to check time restrictions
deviceBindingSchema.methods.checkTimeRestriction = function() {
  if (!this.restrictions.timeBased.enabled) {
    return { allowed: true };
  }
  
  const now = new Date();
  const currentDay = now.getDay(); // 0-6, Sunday=0
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  const { allowedDays, allowedHours } = this.restrictions.timeBased;
  
  if (!allowedDays.includes(currentDay)) {
    return { allowed: false, reason: 'Current day not allowed' };
  }
  
  if (currentTime < allowedHours.start || currentTime > allowedHours.end) {
    return { allowed: false, reason: 'Current time not in allowed hours' };
  }
  
  return { allowed: true };
};

// Method to calculate distance between two coordinates (Haversine formula)
deviceBindingSchema.methods.calculateDistance = function(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return R * c; // Distance in meters
};

// Static method to find device by student and device ID
deviceBindingSchema.statics.findByStudentAndDevice = function(studentId, deviceId) {
  return this.findOne({
    student: studentId,
    deviceId: deviceId,
    isActive: true
  });
};

// Static method to get primary device for student
deviceBindingSchema.statics.getPrimaryDevice = function(studentId) {
  return this.findOne({
    student: studentId,
    isPrimary: true,
    isActive: true
  });
};

// Static method to get device statistics
deviceBindingSchema.statics.getDeviceStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalDevices: { $sum: 1 },
        activeDevices: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
        },
        verifiedDevices: {
          $sum: { $cond: [{ $eq: ['$isVerified', true] }, 1, 0] }
        },
        primaryDevices: {
          $sum: { $cond: [{ $eq: ['$isPrimary', true] }, 1, 0] }
        },
        averageUsage: { $avg: '$usageCount' },
        totalScans: { $sum: '$attendanceScans' }
      }
    }
  ]);
  
  return stats[0] || {
    totalDevices: 0,
    activeDevices: 0,
    verifiedDevices: 0,
    primaryDevices: 0,
    averageUsage: 0,
    totalScans: 0
  };
};

// Static method to find suspicious devices
deviceBindingSchema.statics.findSuspiciousDevices = function() {
  return this.find({
    $or: [
      { 'suspiciousActivities.resolved': false },
      { healthStatus: 'critical' },
      { isActive: true, lastUsed: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } // Inactive for 30 days
    ]
  }).populate('student', 'name studentInfo.rollNumber');
};

// Static method to cleanup expired devices
deviceBindingSchema.statics.cleanupExpiredDevices = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

// Static method to find devices by platform
deviceBindingSchema.statics.findByPlatform = function(platform) {
  return this.find({
    'deviceInfo.platform': platform,
    isActive: true
  }).populate('student', 'name studentInfo.rollNumber');
};

const DeviceBinding = mongoose.model('DeviceBinding', deviceBindingSchema);

export default DeviceBinding;