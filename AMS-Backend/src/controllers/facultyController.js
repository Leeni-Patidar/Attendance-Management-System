import { Session, Attendance, OverrideLog, Subject, User } from '../models/index.js';
import { QRGenerator } from '../utils/qrGenerator.js';
import { validationResult } from 'express-validator';
import { stringify } from 'csv-stringify';

const qrGenerator = new QRGenerator();

/**
 * @desc Generate QR code for attendance session
 * @route POST /api/faculty/generate-qr
 * @access Private (Faculty only)
 */
export const generateQR = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { subject, className, topic, validityDuration = 5 } = req.body;
    const facultyId = req.user._id;

    // Calculate session timing
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + (validityDuration * 60 * 1000));

    // Create new session
    const session = new Session({
      faculty: facultyId,
      subject,
      className,
      topic,
      startTime,
      endTime,
      validityDuration,
      status: 'active'
    });

    // Generate QR code
    const qrResult = await qrGenerator.generateAttendanceQR({
      sessionId: session._id.toString(),
      facultyId: facultyId.toString(),
      subject,
      className,
      timestamp: startTime.toISOString(),
      validUntil: endTime.toISOString()
    });

    // Store QR data in session
    session.qrToken = qrResult.token;
    session.encryptedData = qrResult.encryptedData;
    session.qrCodeImage = qrResult.qrCodeDataURL;

    await session.save();

    // Populate faculty info for response
    await session.populate('faculty', 'name loginId teacherInfo');

    res.status(201).json({
      success: true,
      message: 'QR code generated successfully',
      data: {
        session: {
          _id: session._id,
          subject: session.subject,
          className: session.className,
          topic: session.topic,
          faculty: session.faculty,
          startTime: session.startTime,
          endTime: session.endTime,
          validityDuration: session.validityDuration,
          status: session.status
        },
        qrCode: {
          token: session.qrToken,
          image: session.qrCodeImage,
          validUntil: session.endTime
        },
        scanUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/scan?token=${session.qrToken}`
      }
    });

  } catch (error) {
    console.error('Generate QR Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc Get faculty's sessions
 * @route GET /api/faculty/sessions
 * @access Private (Faculty only)
 */
export const getSessions = async (req, res) => {
  try {
    const facultyId = req.user._id;
    const { 
      page = 1, 
      limit = 10, 
      status, 
      subject, 
      startDate, 
      endDate 
    } = req.query;

    // Build filter query
    const filter = { faculty: facultyId };
    
    if (status) {
      filter.status = status;
    }
    
    if (subject) {
      filter.subject = new RegExp(subject, 'i');
    }
    
    if (startDate || endDate) {
      filter.startTime = {};
      if (startDate) filter.startTime.$gte = new Date(startDate);
      if (endDate) filter.startTime.$lte = new Date(endDate);
    }

    // Get total count for pagination
    const totalRecords = await Session.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / limit);

    // Get sessions
    const sessions = await Session.find(filter)
      .populate('faculty', 'name loginId teacherInfo')
      .sort({ startTime: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Get attendance count for each session
    const sessionsWithStats = await Promise.all(
      sessions.map(async (session) => {
        const attendanceStats = await Attendance.aggregate([
          { $match: { session: session._id } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]);

        const stats = {
          total: attendanceStats.reduce((sum, stat) => sum + stat.count, 0),
          present: attendanceStats.find(s => s._id === 'present')?.count || 0,
          absent: attendanceStats.find(s => s._id === 'absent')?.count || 0,
          late: attendanceStats.find(s => s._id === 'late')?.count || 0
        };

        return {
          ...session.toObject(),
          attendanceStats: stats
        };
      })
    );

    res.json({
      success: true,
      data: {
        sessions: sessionsWithStats,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalRecords,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get Sessions Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc Get real-time attendance for a session
 * @route GET /api/faculty/sessions/:sessionId/attendance
 * @access Private (Faculty only)
 */
export const getSessionAttendance = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const facultyId = req.user._id;

    // Find session and verify ownership
    const session = await Session.findOne({
      _id: sessionId,
      faculty: facultyId
    }).populate('faculty', 'name loginId teacherInfo');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or unauthorized'
      });
    }

    // Get attendance records
    const attendanceRecords = await Attendance.find({ session: sessionId })
      .populate('student', 'name loginId studentInfo')
      .sort({ markedAt: -1 });

    // Get attendance statistics
    const stats = await Attendance.aggregate([
      { $match: { session: session._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const attendanceStats = {
      total: stats.reduce((sum, stat) => sum + stat.count, 0),
      present: stats.find(s => s._id === 'present')?.count || 0,
      absent: stats.find(s => s._id === 'absent')?.count || 0,
      late: stats.find(s => s._id === 'late')?.count || 0
    };

    // Get students who haven't marked attendance yet (if needed)
    const expectedStudents = await User.find({
      role: 'student',
      'studentInfo.class': session.className,
      isActive: true
    }).select('name loginId studentInfo');

    const presentStudentIds = attendanceRecords.map(record => record.student._id.toString());
    const absentStudents = expectedStudents.filter(
      student => !presentStudentIds.includes(student._id.toString())
    );

    res.json({
      success: true,
      data: {
        session: {
          _id: session._id,
          subject: session.subject,
          className: session.className,
          topic: session.topic,
          faculty: session.faculty,
          startTime: session.startTime,
          endTime: session.endTime,
          status: session.status,
          isActive: session.isActive,
          isExpired: session.isExpired
        },
        attendanceRecords,
        attendanceStats,
        absentStudents: absentStudents.map(student => ({
          _id: student._id,
          name: student.name,
          loginId: student.loginId,
          rollNumber: student.studentInfo?.rollNumber,
          status: 'absent'
        }))
      }
    });

  } catch (error) {
    console.error('Get Session Attendance Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc Manual attendance override
 * @route POST /api/faculty/manual-override
 * @access Private (Faculty only)
 */
export const manualOverride = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { sessionId, studentId, newStatus, reason, evidence } = req.body;
    const facultyId = req.user._id;

    // Verify session ownership
    const session = await Session.findOne({
      _id: sessionId,
      faculty: facultyId
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or unauthorized'
      });
    }

    // Check daily override limit for this faculty
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayOverrides = await OverrideLog.countDocuments({
      faculty: facultyId,
      overrideTime: { $gte: today, $lt: tomorrow }
    });

    const maxDailyOverrides = 10; // Configure as needed
    if (todayOverrides >= maxDailyOverrides) {
      return res.status(429).json({
        success: false,
        message: `Daily override limit reached (${maxDailyOverrides})`
      });
    }

    // Check session-specific override limit
    const sessionOverrides = await OverrideLog.countDocuments({
      session: sessionId,
      faculty: facultyId
    });

    const maxSessionOverrides = 5; // Configure as needed
    if (sessionOverrides >= maxSessionOverrides) {
      return res.status(429).json({
        success: false,
        message: `Session override limit reached (${maxSessionOverrides})`
      });
    }

    // Find or create attendance record
    let attendance = await Attendance.findOne({
      student: studentId,
      session: sessionId
    });

    const previousStatus = attendance ? attendance.status : 'absent';

    if (!attendance) {
      attendance = new Attendance({
        student: studentId,
        session: sessionId,
        status: newStatus,
        method: 'manual',
        markedAt: new Date()
      });
    } else {
      attendance.status = newStatus;
    }

    // Add override data
    attendance.overrideData = {
      overriddenBy: facultyId,
      overrideTime: new Date(),
      previousStatus: previousStatus,
      newStatus: newStatus,
      reason: reason,
      evidence: evidence
    };

    await attendance.save();

    // Create override log
    const overrideLog = new OverrideLog({
      session: sessionId,
      student: studentId,
      faculty: facultyId,
      overrideType: 'manual_marking',
      previousStatus: previousStatus,
      newStatus: newStatus,
      reason: reason,
      evidence: evidence,
      overrideTime: new Date()
    });

    await overrideLog.save();

    // Populate the attendance record for response
    await attendance.populate([
      { path: 'student', select: 'name loginId studentInfo' },
      { path: 'session', select: 'subject className topic' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Attendance override completed successfully',
      data: {
        attendance,
        overrideLog: {
          _id: overrideLog._id,
          overrideType: overrideLog.overrideType,
          previousStatus: overrideLog.previousStatus,
          newStatus: overrideLog.newStatus,
          reason: overrideLog.reason,
          overrideTime: overrideLog.overrideTime
        },
        limits: {
          sessionOverrides: sessionOverrides + 1,
          maxSessionOverrides,
          dailyOverrides: todayOverrides + 1,
          maxDailyOverrides
        }
      }
    });

  } catch (error) {
    console.error('Manual Override Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc Export attendance as CSV
 * @route GET /api/faculty/export-csv/:sessionId
 * @access Private (Faculty only)
 */
export const exportAttendanceCSV = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const facultyId = req.user._id;

    // Verify session ownership
    const session = await Session.findOne({
      _id: sessionId,
      faculty: facultyId
    }).populate('faculty', 'name loginId');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or unauthorized'
      });
    }

    // Get attendance records with student details
    const attendanceRecords = await Attendance.find({ session: sessionId })
      .populate('student', 'name loginId studentInfo')
      .sort({ 'student.studentInfo.rollNumber': 1 });

    // Prepare CSV data
    const csvData = attendanceRecords.map(record => ({
      'Roll Number': record.student.studentInfo?.rollNumber || 'N/A',
      'Student Name': record.student.name,
      'Login ID': record.student.loginId,
      'Class': record.student.studentInfo?.class || 'N/A',
      'Status': record.status,
      'Method': record.method,
      'Marked At': record.markedAt.toLocaleString(),
      'Marking Delay (minutes)': record.markingDelay ? Math.round(record.markingDelay / 60000) : 'N/A',
      'Override Reason': record.overrideData?.reason || 'N/A'
    }));

    // Generate CSV
    stringify(csvData, {
      header: true,
      columns: [
        'Roll Number', 'Student Name', 'Login ID', 'Class', 
        'Status', 'Method', 'Marked At', 'Marking Delay (minutes)', 'Override Reason'
      ]
    }, (err, output) => {
      if (err) {
        console.error('CSV generation error:', err);
        return res.status(500).json({
          success: false,
          message: 'Error generating CSV'
        });
      }

      const filename = `attendance_${session.subject}_${session.className}_${session.startTime.toISOString().split('T')[0]}.csv`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(output);
    });

  } catch (error) {
    console.error('Export CSV Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc Update session details
 * @route PUT /api/faculty/sessions/:sessionId
 * @access Private (Faculty only)
 */
export const updateSession = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { sessionId } = req.params;
    const { topic, validityDuration, status } = req.body;
    const facultyId = req.user._id;

    // Find session and verify ownership
    const session = await Session.findOne({
      _id: sessionId,
      faculty: facultyId
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or unauthorized'
      });
    }

    // Update allowed fields
    if (topic !== undefined) session.topic = topic;
    if (status !== undefined) session.status = status;
    
    if (validityDuration !== undefined && session.status === 'active') {
      const newEndTime = new Date(session.startTime.getTime() + (validityDuration * 60 * 1000));
      session.endTime = newEndTime;
      session.validityDuration = validityDuration;
    }

    await session.save();
    await session.populate('faculty', 'name loginId teacherInfo');

    res.json({
      success: true,
      message: 'Session updated successfully',
      data: {
        session
      }
    });

  } catch (error) {
    console.error('Update Session Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc Get faculty dashboard data
 * @route GET /api/faculty/dashboard
 * @access Private (Faculty only)
 */
export const getDashboard = async (req, res) => {
  try {
    const facultyId = req.user._id;
    const { timeframe = '30' } = req.query; // days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeframe));

    // Get recent sessions
    const recentSessions = await Session.find({
      faculty: facultyId,
      startTime: { $gte: startDate }
    })
    .sort({ startTime: -1 })
    .limit(10);

    // Get session statistics
    const sessionStats = await Session.aggregate([
      { 
        $match: { 
          faculty: facultyId,
          startTime: { $gte: startDate }
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
      total: sessionStats.reduce((sum, stat) => sum + stat.count, 0),
      active: sessionStats.find(s => s._id === 'active')?.count || 0,
      completed: sessionStats.find(s => s._id === 'completed')?.count || 0,
      cancelled: sessionStats.find(s => s._id === 'cancelled')?.count || 0
    };

    // Get recent override logs
    const recentOverrides = await OverrideLog.find({
      faculty: facultyId,
      overrideTime: { $gte: startDate }
    })
    .populate('student', 'name loginId studentInfo')
    .populate('session', 'subject className startTime')
    .sort({ overrideTime: -1 })
    .limit(5);

    // Get subjects taught
    const subjects = await Session.distinct('subject', {
      faculty: facultyId,
      startTime: { $gte: startDate }
    });

    res.json({
      success: true,
      data: {
        faculty: {
          name: req.user.name,
          loginId: req.user.loginId,
          employeeId: req.user.teacherInfo?.employeeId,
          department: req.user.teacherInfo?.department
        },
        recentSessions,
        sessionStats: stats,
        recentOverrides,
        subjects,
        timeframe: parseInt(timeframe)
      }
    });

  } catch (error) {
    console.error('Get Faculty Dashboard Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};