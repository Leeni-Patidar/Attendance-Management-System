import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  // Basic subject information
  name: {
    type: String,
    required: [true, 'Subject name is required'],
    trim: true,
    maxlength: [100, 'Subject name cannot exceed 100 characters'],
    index: true
  },
  code: {
    type: String,
    required: [true, 'Subject code is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z0-9]{3,10}$/, 'Subject code must be 3-10 alphanumeric characters'],
    index: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    trim: true
  },
  
  // Academic information
  credits: {
    type: Number,
    required: [true, 'Credits are required'],
    min: [1, 'Credits must be at least 1'],
    max: [10, 'Credits cannot exceed 10']
  },
  type: {
    type: String,
    enum: ['theory', 'practical', 'project', 'seminar', 'elective'],
    required: [true, 'Subject type is required'],
    index: true
  },
  category: {
    type: String,
    enum: ['core', 'elective', 'optional', 'mandatory'],
    default: 'core',
    index: true
  },
  
  // Department and program information
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
    index: true
  },
  program: {
    type: String,
    enum: ['B.Tech', 'M.Tech', 'BCA', 'MCA', 'BSc', 'MSc', 'BA', 'MA', 'Other'],
    required: [true, 'Program is required'],
    index: true
  },
  year: {
    type: String,
    enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'],
    required: [true, 'Year is required'],
    index: true
  },
  semester: {
    type: String,
    enum: ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', 
           '5th Semester', '6th Semester', '7th Semester', '8th Semester',
           '9th Semester', '10th Semester'],
    required: [true, 'Semester is required'],
    index: true
  },
  
  // Teaching assignments
  teachers: [{
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['primary', 'assistant', 'guest', 'substitute'],
      default: 'primary'
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Class assignments
  assignedClasses: [{
    className: {
      type: String,
      required: true,
      trim: true
    },
    section: {
      type: String,
      trim: true
    },
    totalStudents: {
      type: Number,
      min: 0,
      default: 0
    },
    enrolledStudents: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Schedule information
  schedule: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true
    },
    startTime: {
      type: String, // HH:MM format
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format']
    },
    endTime: {
      type: String, // HH:MM format
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format']
    },
    room: {
      type: String,
      trim: true
    },
    building: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      enum: ['lecture', 'practical', 'tutorial', 'seminar'],
      default: 'lecture'
    },
    className: String, // Which class this schedule is for
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Prerequisites and dependencies
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  corequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  
  // Syllabus and content
  syllabus: {
    outline: String,
    topics: [String],
    textbooks: [{
      title: String,
      author: String,
      edition: String,
      publisher: String,
      isbn: String
    }],
    referenceBooks: [{
      title: String,
      author: String,
      edition: String,
      publisher: String,
      isbn: String
    }],
    onlineResources: [String]
  },
  
  // Assessment configuration
  assessment: {
    attendanceWeightage: {
      type: Number,
      min: 0,
      max: 100,
      default: 10 // 10% weightage for attendance
    },
    minimumAttendance: {
      type: Number,
      min: 0,
      max: 100,
      default: 75 // 75% minimum attendance required
    },
    examSchedule: [{
      type: {
        type: String,
        enum: ['midterm', 'final', 'quiz', 'assignment', 'project']
      },
      date: Date,
      duration: Number, // Duration in minutes
      maxMarks: Number,
      weightage: Number // Percentage weightage
    }]
  },
  
  // Status and metadata
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
    match: [/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY'],
    index: true
  },
  
  // Statistics
  stats: {
    totalSessions: {
      type: Number,
      default: 0
    },
    completedSessions: {
      type: Number,
      default: 0
    },
    averageAttendance: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    totalStudentsEnrolled: {
      type: Number,
      default: 0
    }
  },
  
  // Additional metadata
  tags: [String],
  notes: String,
  
  // Approval workflow (for new subjects)
  approvalStatus: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected'],
    default: 'draft'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  
  // Archive information
  archivedAt: Date,
  archiveReason: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
subjectSchema.index({ code: 1, academicYear: 1 }, { unique: true });
subjectSchema.index({ department: 1, program: 1, year: 1, semester: 1 });
subjectSchema.index({ 'teachers.teacher': 1, 'teachers.isActive': 1 });
subjectSchema.index({ 'assignedClasses.className': 1 });
subjectSchema.index({ isActive: 1, academicYear: 1 });
subjectSchema.index({ approvalStatus: 1 });

// Virtual for total weekly hours
subjectSchema.virtual('totalWeeklyHours').get(function() {
  return this.schedule.reduce((total, slot) => {
    if (!slot.isActive) return total;
    const start = new Date(`2000-01-01T${slot.startTime}:00`);
    const end = new Date(`2000-01-01T${slot.endTime}:00`);
    const hours = (end - start) / (1000 * 60 * 60);
    return total + hours;
  }, 0);
});

// Virtual for active teachers count
subjectSchema.virtual('activeTeachersCount').get(function() {
  return this.teachers.filter(t => t.isActive).length;
});

// Virtual for primary teacher
subjectSchema.virtual('primaryTeacher').get(function() {
  return this.teachers.find(t => t.role === 'primary' && t.isActive);
});

// Virtual for total enrolled students across all classes
subjectSchema.virtual('totalEnrolledStudents').get(function() {
  return this.assignedClasses.reduce((total, cls) => {
    return total + (cls.enrolledStudents ? cls.enrolledStudents.length : 0);
  }, 0);
});

// Pre-save middleware to update stats
subjectSchema.pre('save', function(next) {
  this.stats.totalStudentsEnrolled = this.totalEnrolledStudents;
  next();
});

// Method to add teacher
subjectSchema.methods.addTeacher = function(teacherId, role = 'assistant') {
  // Check if teacher is already assigned
  const existingTeacher = this.teachers.find(t => 
    t.teacher.toString() === teacherId.toString() && t.isActive
  );
  
  if (existingTeacher) {
    throw new Error('Teacher is already assigned to this subject');
  }
  
  // If adding primary teacher, demote existing primary teacher
  if (role === 'primary') {
    this.teachers.forEach(t => {
      if (t.role === 'primary' && t.isActive) {
        t.role = 'assistant';
      }
    });
  }
  
  this.teachers.push({
    teacher: teacherId,
    role: role,
    assignedAt: new Date(),
    isActive: true
  });
  
  return this.save();
};

// Method to remove teacher
subjectSchema.methods.removeTeacher = function(teacherId) {
  const teacher = this.teachers.find(t => 
    t.teacher.toString() === teacherId.toString() && t.isActive
  );
  
  if (!teacher) {
    throw new Error('Teacher not found in this subject');
  }
  
  teacher.isActive = false;
  return this.save();
};

// Method to add class
subjectSchema.methods.addClass = function(className, section, totalStudents = 0) {
  // Check if class is already assigned
  const existingClass = this.assignedClasses.find(cls => 
    cls.className === className && cls.section === section && cls.isActive
  );
  
  if (existingClass) {
    throw new Error('Class is already assigned to this subject');
  }
  
  this.assignedClasses.push({
    className,
    section,
    totalStudents,
    enrolledStudents: [],
    isActive: true
  });
  
  return this.save();
};

// Method to remove class
subjectSchema.methods.removeClass = function(className, section) {
  const classIndex = this.assignedClasses.findIndex(cls => 
    cls.className === className && cls.section === section && cls.isActive
  );
  
  if (classIndex === -1) {
    throw new Error('Class not found in this subject');
  }
  
  this.assignedClasses[classIndex].isActive = false;
  return this.save();
};

// Method to enroll student in a class
subjectSchema.methods.enrollStudent = function(studentId, className, section) {
  const classObj = this.assignedClasses.find(cls => 
    cls.className === className && cls.section === section && cls.isActive
  );
  
  if (!classObj) {
    throw new Error('Class not found');
  }
  
  if (classObj.enrolledStudents.includes(studentId)) {
    throw new Error('Student is already enrolled in this class');
  }
  
  classObj.enrolledStudents.push(studentId);
  return this.save();
};

// Method to unenroll student from a class
subjectSchema.methods.unenrollStudent = function(studentId, className, section) {
  const classObj = this.assignedClasses.find(cls => 
    cls.className === className && cls.section === section && cls.isActive
  );
  
  if (!classObj) {
    throw new Error('Class not found');
  }
  
  const studentIndex = classObj.enrolledStudents.indexOf(studentId);
  if (studentIndex === -1) {
    throw new Error('Student not found in this class');
  }
  
  classObj.enrolledStudents.splice(studentIndex, 1);
  return this.save();
};

// Method to add schedule slot
subjectSchema.methods.addScheduleSlot = function(day, startTime, endTime, room, building, type, className) {
  // Validate time format and logic
  if (startTime >= endTime) {
    throw new Error('Start time must be before end time');
  }
  
  // Check for conflicts
  const conflict = this.schedule.find(slot => 
    slot.day === day && 
    slot.className === className &&
    slot.isActive &&
    ((startTime >= slot.startTime && startTime < slot.endTime) ||
     (endTime > slot.startTime && endTime <= slot.endTime) ||
     (startTime <= slot.startTime && endTime >= slot.endTime))
  );
  
  if (conflict) {
    throw new Error('Schedule conflict detected');
  }
  
  this.schedule.push({
    day,
    startTime,
    endTime,
    room,
    building,
    type: type || 'lecture',
    className,
    isActive: true
  });
  
  return this.save();
};

// Method to remove schedule slot
subjectSchema.methods.removeScheduleSlot = function(scheduleId) {
  const scheduleIndex = this.schedule.findIndex(slot => 
    slot._id.toString() === scheduleId.toString()
  );
  
  if (scheduleIndex === -1) {
    throw new Error('Schedule slot not found');
  }
  
  this.schedule[scheduleIndex].isActive = false;
  return this.save();
};

// Method to update attendance statistics
subjectSchema.methods.updateAttendanceStats = async function() {
  const Session = mongoose.model('Session');
  const Attendance = mongoose.model('Attendance');
  
  // Get all sessions for this subject
  const sessions = await Session.find({ subject: this.name, subjectCode: this.code });
  const sessionIds = sessions.map(s => s._id);
  
  // Calculate attendance statistics
  const attendanceStats = await Attendance.aggregate([
    { $match: { session: { $in: sessionIds } } },
    {
      $group: {
        _id: null,
        totalRecords: { $sum: 1 },
        presentCount: {
          $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
        }
      }
    }
  ]);
  
  this.stats.totalSessions = sessions.length;
  this.stats.completedSessions = sessions.filter(s => s.status === 'completed').length;
  
  if (attendanceStats.length > 0) {
    const stats = attendanceStats[0];
    this.stats.averageAttendance = stats.totalRecords > 0 
      ? Math.round((stats.presentCount / stats.totalRecords) * 100)
      : 0;
  }
  
  return this.save();
};

// Method to approve subject
subjectSchema.methods.approve = function(approvedBy) {
  this.approvalStatus = 'approved';
  this.approvedBy = approvedBy;
  this.approvedAt = new Date();
  this.isActive = true;
  return this.save();
};

// Method to reject subject
subjectSchema.methods.reject = function(rejectedBy, reason) {
  this.approvalStatus = 'rejected';
  this.approvedBy = rejectedBy;
  this.approvedAt = new Date();
  this.notes = (this.notes || '') + `\nRejected: ${reason}`;
  return this.save();
};

// Method to archive subject
subjectSchema.methods.archive = function(reason) {
  this.isActive = false;
  this.archivedAt = new Date();
  this.archiveReason = reason;
  return this.save();
};

// Static method to find subjects by teacher
subjectSchema.statics.findByTeacher = function(teacherId, academicYear) {
  const query = {
    'teachers.teacher': teacherId,
    'teachers.isActive': true,
    isActive: true
  };
  
  if (academicYear) {
    query.academicYear = academicYear;
  }
  
  return this.find(query).populate('teachers.teacher', 'name teacherInfo.employeeId');
};

// Static method to find subjects by class
subjectSchema.statics.findByClass = function(className, academicYear) {
  const query = {
    'assignedClasses.className': className,
    'assignedClasses.isActive': true,
    isActive: true
  };
  
  if (academicYear) {
    query.academicYear = academicYear;
  }
  
  return this.find(query).populate('teachers.teacher', 'name teacherInfo.employeeId');
};

// Static method to find subjects by department and program
subjectSchema.statics.findByDepartmentAndProgram = function(department, program, year, semester, academicYear) {
  const query = {
    department,
    program,
    isActive: true
  };
  
  if (year) query.year = year;
  if (semester) query.semester = semester;
  if (academicYear) query.academicYear = academicYear;
  
  return this.find(query).populate('teachers.teacher', 'name teacherInfo.employeeId');
};

// Static method to get subject statistics
subjectSchema.statics.getSubjectStats = async function(academicYear) {
  const match = { isActive: true };
  if (academicYear) match.academicYear = academicYear;
  
  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalSubjects: { $sum: 1 },
        theorySubjects: {
          $sum: { $cond: [{ $eq: ['$type', 'theory'] }, 1, 0] }
        },
        practicalSubjects: {
          $sum: { $cond: [{ $eq: ['$type', 'practical'] }, 1, 0] }
        },
        electiveSubjects: {
          $sum: { $cond: [{ $eq: ['$category', 'elective'] }, 1, 0] }
        },
        averageCredits: { $avg: '$credits' },
        totalCredits: { $sum: '$credits' },
        averageAttendance: { $avg: '$stats.averageAttendance' }
      }
    }
  ]);
  
  return stats[0] || {
    totalSubjects: 0,
    theorySubjects: 0,
    practicalSubjects: 0,
    electiveSubjects: 0,
    averageCredits: 0,
    totalCredits: 0,
    averageAttendance: 0
  };
};

const Subject = mongoose.model('Subject', subjectSchema);

export default Subject;