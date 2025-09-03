const { QRSession, Subject, Class, User, Attendance } = require('../models');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { generateQRCode, verifyQRCode } = require('../utils/qrCode');
const { sendAttendanceConfirmationEmail } = require('../utils/email');
const { logger } = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * Generate QR code for attendance
 * @route POST /api/qr/generate
 */
const generateQR = asyncHandler(async (req, res) => {
  const { subjectId, topic, validityDuration = 10, location } = req.body;
  const teacherId = req.user.id;
  
  // Validate input
  if (!subjectId) {
    throw new AppError('Subject ID is required', 400);
  }
  
  // Find subject
  const subject = await Subject.findByPk(subjectId, {
    include: [{ model: Class, as: 'class' }]
  });
  
  if (!subject) {
    throw new AppError('Subject not found', 404);
  }
  
  // Check if user is authorized to generate QR code for this subject
  if (subject.teacherId !== teacherId && req.user.role !== 'admin') {
    throw new AppError('You are not authorized to generate QR code for this subject', 403);
  }
  
  // Check if there is already an active QR session for this subject
  const activeSession = await QRSession.findOne({
    where: {
      subjectId,
      teacherId,
      isActive: true,
      validTill: {
        [Op.gt]: new Date()
      }
    }
  });
  
  if (activeSession) {
    throw new AppError('There is already an active QR session for this subject', 400);
  }
  
  // Generate QR code
  const qrData = await generateQRCode({
    subjectCode: subject.code,
    subjectId,
    classId: subject.classId,
    teacherId
  });
  
  // Calculate validity period
  const validFrom = new Date();
  const validTill = new Date(validFrom.getTime() + validityDuration * 60 * 1000);
  
  // Create QR session
  const qrSession = await QRSession.create({
    code: qrData.code,
    topic: topic || `${subject.name} Attendance`,
    validFrom,
    validTill,
    isActive: true,
    location,
    qrImage: qrData.qrImage,
    subjectId,
    classId: subject.classId,
    teacherId
  });
  
  // Return QR session data
  res.status(201).json({
    success: true,
    message: 'QR code generated successfully',
    data: {
      qrSession: {
        id: qrSession.id,
        code: qrSession.code,
        topic: qrSession.topic,
        validFrom: qrSession.validFrom,
        validTill: qrSession.validTill,
        isActive: qrSession.isActive,
        location: qrSession.location,
        qrImage: qrSession.qrImage
      },
      subject: {
        id: subject.id,
        name: subject.name,
        code: subject.code
      },
      class: {
        id: subject.class.id,
        name: subject.class.name
      },
      qrImageUrl: `${req.protocol}://${req.get('host')}${qrSession.qrImage}`
    }
  });
});

/**
 * Scan QR code for attendance
 * @route POST /api/qr/scan
 */
const scanQR = asyncHandler(async (req, res) => {
  const { qrCode, location, deviceInfo } = req.body;
  const studentId = req.user.id;
  
  // Validate input
  if (!qrCode) {
    throw new AppError('QR code is required', 400);
  }
  
  // Check if user is a student
  if (req.user.role !== 'student') {
    throw new AppError('Only students can mark attendance', 403);
  }
  
  // Find QR session
  const qrSession = await QRSession.findOne({
    where: {
      code: qrCode,
      isActive: true,
      validTill: {
        [Op.gt]: new Date()
      }
    },
    include: [
      { model: Subject, as: 'subject' },
      { model: Class, as: 'class' }
    ]
  });
  
  if (!qrSession) {
    throw new AppError('Invalid or expired QR code', 400);
  }
  
  // Check if student belongs to the class
  if (req.user.classId !== qrSession.classId) {
    throw new AppError('You are not authorized to mark attendance for this class', 403);
  }
  
  // Check if attendance already marked
  const existingAttendance = await Attendance.findOne({
    where: {
      studentId,
      subjectId: qrSession.subjectId,
      date: new Date().toISOString().split('T')[0]
    }
  });
  
  if (existingAttendance) {
    throw new AppError('Attendance already marked for today', 400);
  }
  
  // Mark attendance
  const attendance = await Attendance.create({
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    markMethod: 'qr',
    markTime: new Date(),
    location,
    deviceInfo,
    studentId,
    subjectId: qrSession.subjectId,
    classId: qrSession.classId,
    qrSessionId: qrSession.id
  });
  
  // Send attendance confirmation email
  try {
    await sendAttendanceConfirmationEmail({
      to: req.user.email,
      name: req.user.name,
      attendance,
      subject: qrSession.subject
    });
  } catch (error) {
    logger.error('Error sending attendance confirmation email:', error);
    // Continue process even if email fails
  }
  
  // Return attendance data
  res.status(200).json({
    success: true,
    message: 'Attendance marked successfully',
    data: {
      attendance: {
        id: attendance.id,
        date: attendance.date,
        status: attendance.status,
        markTime: attendance.markTime,
        location: attendance.location,
        deviceInfo: attendance.deviceInfo
      },
      subject: {
        id: qrSession.subject.id,
        name: qrSession.subject.name,
        code: qrSession.subject.code
      },
      class: {
        id: qrSession.class.id,
        name: qrSession.class.name
      }
    }
  });
});

/**
 * Get active QR sessions for teacher
 * @route GET /api/qr/active
 */
const getActiveQRSessions = asyncHandler(async (req, res) => {
  const teacherId = req.user.id;
  
  // Check if user is a teacher or admin
  if (!['teacher', 'subject_teacher', 'class_teacher', 'admin'].includes(req.user.role)) {
    throw new AppError('Only teachers and admins can view QR sessions', 403);
  }
  
  // Find active QR sessions
  const whereClause = {
    isActive: true,
    validTill: {
      [Op.gt]: new Date()
    }
  };
  
  // If not admin, filter by teacherId
  if (req.user.role !== 'admin') {
    whereClause.teacherId = teacherId;
  }
  
  const qrSessions = await QRSession.findAll({
    where: whereClause,
    include: [
      { model: Subject, as: 'subject' },
      { model: Class, as: 'class' },
      { model: User, as: 'teacher', attributes: ['id', 'name', 'email'] }
    ],
    order: [['validTill', 'ASC']]
  });
  
  // Return QR sessions
  res.status(200).json({
    success: true,
    count: qrSessions.length,
    data: qrSessions.map(session => ({
      id: session.id,
      code: session.code,
      topic: session.topic,
      validFrom: session.validFrom,
      validTill: session.validTill,
      isActive: session.isActive,
      location: session.location,
      qrImage: session.qrImage,
      qrImageUrl: `${req.protocol}://${req.get('host')}${session.qrImage}`,
      subject: {
        id: session.subject.id,
        name: session.subject.name,
        code: session.subject.code
      },
      class: {
        id: session.class.id,
        name: session.class.name
      },
      teacher: session.teacher
    }))
  });
});

/**
 * Get QR session history
 * @route GET /api/qr/history
 */
const getQRSessionHistory = asyncHandler(async (req, res) => {
  const teacherId = req.user.id;
  const { page = 1, limit = 10, subjectId } = req.query;
  
  // Check if user is a teacher or admin
  if (!['teacher', 'subject_teacher', 'class_teacher', 'admin'].includes(req.user.role)) {
    throw new AppError('Only teachers and admins can view QR sessions', 403);
  }
  
  // Build where clause
  const whereClause = {};
  
  // If not admin, filter by teacherId
  if (req.user.role !== 'admin') {
    whereClause.teacherId = teacherId;
  }
  
  // Filter by subjectId if provided
  if (subjectId) {
    whereClause.subjectId = subjectId;
  }
  
  // Calculate pagination
  const offset = (page - 1) * limit;
  
  // Find QR sessions
  const { count, rows: qrSessions } = await QRSession.findAndCountAll({
    where: whereClause,
    include: [
      { model: Subject, as: 'subject' },
      { model: Class, as: 'class' },
      { model: User, as: 'teacher', attributes: ['id', 'name', 'email'] }
    ],
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
  
  // Return QR sessions
  res.status(200).json({
    success: true,
    count,
    totalPages: Math.ceil(count / limit),
    currentPage: parseInt(page),
    data: qrSessions.map(session => ({
      id: session.id,
      code: session.code,
      topic: session.topic,
      validFrom: session.validFrom,
      validTill: session.validTill,
      isActive: session.isActive,
      location: session.location,
      qrImage: session.qrImage,
      qrImageUrl: `${req.protocol}://${req.get('host')}${session.qrImage}`,
      subject: {
        id: session.subject.id,
        name: session.subject.name,
        code: session.subject.code
      },
      class: {
        id: session.class.id,
        name: session.class.name
      },
      teacher: session.teacher,
      createdAt: session.createdAt
    }))
  });
});

/**
 * Get QR session details with attendance list
 * @route GET /api/qr/:id
 */
const getQRSessionDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if user is a teacher or admin
  if (!['teacher', 'subject_teacher', 'class_teacher', 'admin'].includes(req.user.role)) {
    throw new AppError('Only teachers and admins can view QR session details', 403);
  }
  
  // Find QR session
  const qrSession = await QRSession.findByPk(id, {
    include: [
      { model: Subject, as: 'subject' },
      { model: Class, as: 'class' },
      { model: User, as: 'teacher', attributes: ['id', 'name', 'email'] },
      {
        model: Attendance,
        as: 'attendanceRecords',
        include: [
          { model: User, as: 'student', attributes: ['id', 'name', 'email', 'rollNumber'] }
        ]
      }
    ]
  });
  
  if (!qrSession) {
    throw new AppError('QR session not found', 404);
  }
  
  // Check if user is authorized to view this QR session
  if (req.user.role !== 'admin' && qrSession.teacherId !== req.user.id) {
    throw new AppError('You are not authorized to view this QR session', 403);
  }
  
  // Return QR session details
  res.status(200).json({
    success: true,
    data: {
      id: qrSession.id,
      code: qrSession.code,
      topic: qrSession.topic,
      validFrom: qrSession.validFrom,
      validTill: qrSession.validTill,
      isActive: qrSession.isActive,
      location: qrSession.location,
      qrImage: qrSession.qrImage,
      qrImageUrl: `${req.protocol}://${req.get('host')}${qrSession.qrImage}`,
      subject: {
        id: qrSession.subject.id,
        name: qrSession.subject.name,
        code: qrSession.subject.code
      },
      class: {
        id: qrSession.class.id,
        name: qrSession.class.name
      },
      teacher: qrSession.teacher,
      createdAt: qrSession.createdAt,
      attendanceCount: qrSession.attendanceRecords.length,
      attendanceRecords: qrSession.attendanceRecords.map(record => ({
        id: record.id,
        date: record.date,
        status: record.status,
        markTime: record.markTime,
        location: record.location,
        deviceInfo: record.deviceInfo,
        student: record.student
      }))
    }
  });
});

/**
 * Cancel QR session
 * @route PUT /api/qr/:id/cancel
 */
const cancelQRSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if user is a teacher or admin
  if (!['teacher', 'subject_teacher', 'class_teacher', 'admin'].includes(req.user.role)) {
    throw new AppError('Only teachers and admins can cancel QR sessions', 403);
  }
  
  // Find QR session
  const qrSession = await QRSession.findByPk(id);
  
  if (!qrSession) {
    throw new AppError('QR session not found', 404);
  }
  
  // Check if user is authorized to cancel this QR session
  if (req.user.role !== 'admin' && qrSession.teacherId !== req.user.id) {
    throw new AppError('You are not authorized to cancel this QR session', 403);
  }
  
  // Check if QR session is already inactive
  if (!qrSession.isActive) {
    throw new AppError('QR session is already inactive', 400);
  }
  
  // Cancel QR session
  qrSession.isActive = false;
  await qrSession.save();
  
  // Return success
  res.status(200).json({
    success: true,
    message: 'QR session cancelled successfully'
  });
});

module.exports = {
  generateQR,
  scanQR,
  getActiveQRSessions,
  getQRSessionHistory,
  getQRSessionDetails,
  cancelQRSession
};

