import { Session, Attendance, DeviceBinding, User } from '../models/index.js';
import { QRGenerator } from '../utils/qrGenerator.js';
import { validationResult } from 'express-validator';

const qrGenerator = new QRGenerator();

/**
 * @desc Scan QR code for attendance
 * @route POST /api/students/scan-qr
 * @access Private (Student only)
 */
export const scanQR = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { qrData, deviceInfo, location, capturedImage } = req.body;
    const studentId = req.user._id;
    const deviceId = req.headers['x-device-id'];

    // Verify device binding
    const deviceBinding = await DeviceBinding.findOne({
      student: studentId,
      deviceId: deviceId,
      isActive: true
    });

    if (!deviceBinding) {
      return res.status(403).json({
        success: false,
        message: 'Device not registered. Please register your device first.'
      });
    }

    // Verify and decrypt QR code
    let sessionData;
    try {
      sessionData = qrGenerator.verifyAttendanceQR(qrData);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired QR code',
        error: error.message
      });
    }

    // Find the session
    const session = await Session.findById(sessionData.sessionId)
      .populate('faculty', 'name loginId teacherInfo');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if session is still active
    if (!session.canAcceptScan()) {
      return res.status(400).json({
        success: false,
        message: 'Session has expired or is no longer accepting attendance'
      });
    }

    // Check if student already marked attendance for this session
    const existingAttendance = await Attendance.findOne({
      student: studentId,
      session: session._id
    });

    if (existingAttendance) {
      return res.status(409).json({
        success: false,
        message: 'Attendance already marked for this session',
        attendance: {
          status: existingAttendance.status,
          markedAt: existingAttendance.markedAt,
          method: existingAttendance.method
        }
      });
    }

    // Calculate marking delay
    const markingDelay = Date.now() - session.startTime.getTime();

    // Create attendance record
    const attendance = new Attendance({
      student: studentId,
      session: session._id,
      status: 'present',
      method: 'qr_scan',
      markedAt: new Date(),
      markingDelay: markingDelay,
      qrScanData: {
        deviceInfo: {
          deviceId: deviceId,
          userAgent: deviceInfo?.userAgent,
          platform: deviceInfo?.platform,
          location: location
        },
        scanLocation: location,
        capturedImage: capturedImage,
        scanTimestamp: new Date()
      }
    });

    await attendance.save();

    // Update device binding last used
    deviceBinding.lastUsed = new Date();
    await deviceBinding.save();

    // Update session attendance count
    session.totalScans = (session.totalScans || 0) + 1;
    await session.save();

    // Populate the attendance record for response
    await attendance.populate([
      { path: 'student', select: 'name loginId studentInfo' },
      { path: 'session', select: 'subject className topic faculty startTime endTime' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: {
        attendance: attendance,
        session: {
          subject: session.subject,
          className: session.className,
          topic: session.topic,
          faculty: session.faculty,
          startTime: session.startTime,
          endTime: session.endTime
        },
        markingDelay: markingDelay
      }
    });

  } catch (error) {
    console.error('QR Scan Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc Get student's attendance history
 * @route GET /api/students/attendance
 * @access Private (Student only)
 */
export const getAttendanceHistory = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { 
      page = 1, 
      limit = 10, 
      subject, 
      status, 
      startDate, 
      endDate,
      className 
    } = req.query;

    // Build filter query
    const filter = { student: studentId };
    
    if (subject) {
      const sessions = await Session.find({ subject: new RegExp(subject, 'i') }).select('_id');
      filter.session = { $in: sessions.map(s => s._id) };
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (startDate || endDate) {
      filter.markedAt = {};
      if (startDate) filter.markedAt.$gte = new Date(startDate);
      if (endDate) filter.markedAt.$lte = new Date(endDate);
    }

    // Get total count for pagination
    const totalRecords = await Attendance.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / limit);

    // Get attendance records
    const attendanceRecords = await Attendance.find(filter)
      .populate({
        path: 'session',
        select: 'subject className topic faculty startTime endTime',
        populate: {
          path: 'faculty',
          select: 'name loginId teacherInfo'
        }
      })
      .sort({ markedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Calculate attendance statistics
    const stats = await Attendance.aggregate([
      { $match: { student: studentId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const attendanceStats = {
      total: totalRecords,
      present: stats.find(s => s._id === 'present')?.count || 0,
      absent: stats.find(s => s._id === 'absent')?.count || 0,
      late: stats.find(s => s._id === 'late')?.count || 0
    };

    attendanceStats.percentage = totalRecords > 0 ? 
      ((attendanceStats.present / totalRecords) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        attendanceRecords,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalRecords,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        stats: attendanceStats
      }
    });

  } catch (error) {
    console.error('Get Attendance History Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc Submit reason for missed class
 * @route POST /api/students/missed-class
 * @access Private (Student only)
 */
export const submitMissedClassReason = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { sessionId, reason, supportingDocument } = req.body;
    const studentId = req.user._id;

    // Find the session
    const session = await Session.findById(sessionId)
      .populate('faculty', 'name loginId teacherInfo');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if session has ended
    if (session.status === 'active') {
      return res.status(400).json({
        success: false,
        message: 'Cannot submit reason for an active session'
      });
    }

    // Find existing attendance record
    let attendance = await Attendance.findOne({
      student: studentId,
      session: sessionId
    });

    if (!attendance) {
      // Create new attendance record for absent student
      attendance = new Attendance({
        student: studentId,
        session: sessionId,
        status: 'absent',
        method: 'missed',
        markedAt: session.endTime || new Date()
      });
    }

    // Add student submission
    attendance.studentSubmission = {
      reason: reason,
      submittedAt: new Date(),
      supportingDocument: supportingDocument,
      status: 'pending'
    };

    await attendance.save();

    // Populate the attendance record for response
    await attendance.populate([
      { path: 'session', select: 'subject className topic faculty startTime endTime' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Missed class reason submitted successfully',
      data: {
        attendance,
        submission: attendance.studentSubmission
      }
    });

  } catch (error) {
    console.error('Submit Missed Class Reason Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc Get student dashboard data
 * @route GET /api/students/dashboard
 * @access Private (Student only)
 */
export const getDashboard = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { timeframe = '30' } = req.query; // days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeframe));

    // Get recent attendance
    const recentAttendance = await Attendance.find({
      student: studentId,
      markedAt: { $gte: startDate }
    })
    .populate({
      path: 'session',
      select: 'subject className topic faculty startTime endTime',
      populate: {
        path: 'faculty',
        select: 'name loginId'
      }
    })
    .sort({ markedAt: -1 })
    .limit(10);

    // Get attendance statistics
    const attendanceStats = await Attendance.aggregate([
      { 
        $match: { 
          student: studentId,
          markedAt: { $gte: startDate }
        } 
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      present: attendanceStats.find(s => s._id === 'present')?.count || 0,
      absent: attendanceStats.find(s => s._id === 'absent')?.count || 0,
      late: attendanceStats.find(s => s._id === 'late')?.count || 0
    };
    stats.total = stats.present + stats.absent + stats.late;
    stats.percentage = stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(2) : 0;

    // Get active sessions (sessions that are currently accepting attendance)
    const activeSessions = await Session.find({
      status: 'active',
      endTime: { $gt: new Date() }
    })
    .populate('faculty', 'name loginId teacherInfo')
    .sort({ startTime: 1 })
    .limit(5);

    // Get device info
    const deviceBinding = await DeviceBinding.findOne({
      student: studentId,
      isActive: true,
      isPrimary: true
    });

    res.json({
      success: true,
      data: {
        student: {
          name: req.user.name,
          loginId: req.user.loginId,
          rollNumber: req.user.studentInfo?.rollNumber,
          class: req.user.studentInfo?.class,
          semester: req.user.studentInfo?.semester
        },
        recentAttendance,
        attendanceStats: stats,
        activeSessions,
        deviceInfo: deviceBinding ? {
          deviceId: deviceBinding.deviceId,
          registeredAt: deviceBinding.registeredAt,
          lastUsed: deviceBinding.lastUsed,
          isVerified: deviceBinding.isVerified
        } : null,
        timeframe: parseInt(timeframe)
      }
    });

  } catch (error) {
    console.error('Get Dashboard Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc Get attendance summary by subject
 * @route GET /api/students/attendance/summary
 * @access Private (Student only)
 */
export const getAttendanceSummary = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { academicYear, semester } = req.query;

    // Build match criteria
    const matchCriteria = { student: studentId };
    
    if (academicYear || semester) {
      const sessionFilter = {};
      if (academicYear) sessionFilter.academicYear = academicYear;
      if (semester) sessionFilter.semester = semester;
      
      const sessions = await Session.find(sessionFilter).select('_id');
      matchCriteria.session = { $in: sessions.map(s => s._id) };
    }

    // Aggregate attendance by subject
    const attendanceSummary = await Attendance.aggregate([
      { $match: matchCriteria },
      {
        $lookup: {
          from: 'sessions',
          localField: 'session',
          foreignField: '_id',
          as: 'sessionData'
        }
      },
      { $unwind: '$sessionData' },
      {
        $group: {
          _id: '$sessionData.subject',
          totalClasses: { $sum: 1 },
          present: {
            $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
          },
          absent: {
            $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] }
          },
          late: {
            $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] }
          }
        }
      },
      {
        $addFields: {
          attendancePercentage: {
            $multiply: [
              { $divide: ['$present', '$totalClasses'] },
              100
            ]
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        summary: attendanceSummary,
        filters: {
          academicYear,
          semester
        }
      }
    });

  } catch (error) {
    console.error('Get Attendance Summary Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};