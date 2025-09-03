const { Attendance, User, Subject, Class, Log } = require('../models');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { sendAttendanceConfirmationEmail } = require('../utils/email');
const { logger } = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * Mark attendance manually
 * @route POST /api/attendance/mark
 */
const markAttendance = asyncHandler(async (req, res) => {
  const { studentId, subjectId, date, status, remarks } = req.body;
  const markedById = req.user.id;
  
  // Validate input
  if (!studentId || !subjectId || !date || !status) {
    throw new AppError('Student ID, subject ID, date, and status are required', 400);
  }
  
  // Check if user is authorized to mark attendance
  if (!['teacher', 'subject_teacher', 'class_teacher', 'admin'].includes(req.user.role)) {
    throw new AppError('Only teachers and admins can mark attendance manually', 403);
  }
  
  // Find student
  const student = await User.findOne({
    where: {
      id: studentId,
      role: 'student'
    }
  });
  
  if (!student) {
    throw new AppError('Student not found', 404);
  }
  
  // Find subject
  const subject = await Subject.findByPk(subjectId, {
    include: [{ model: Class, as: 'class' }]
  });
  
  if (!subject) {
    throw new AppError('Subject not found', 404);
  }
  
  // Check if teacher is authorized to mark attendance for this subject
  if (req.user.role !== 'admin' && req.user.role !== 'class_teacher' && subject.teacherId !== req.user.id) {
    throw new AppError('You are not authorized to mark attendance for this subject', 403);
  }
  
  // Check if student belongs to the class
  if (student.classId !== subject.classId) {
    throw new AppError('Student does not belong to this class', 400);
  }
  
  // Check if attendance already exists
  const existingAttendance = await Attendance.findOne({
    where: {
      studentId,
      subjectId,
      date
    }
  });
  
  if (existingAttendance) {
    // Update existing attendance
    existingAttendance.status = status;
    existingAttendance.markMethod = 'manual';
    existingAttendance.markTime = new Date();
    existingAttendance.remarks = remarks;
    existingAttendance.markedById = markedById;
    
    await existingAttendance.save();
    
    // Log the update
    await Log.create({
      action: 'attendance_update',
      details: `Attendance updated for student ${studentId}, subject ${subjectId}, date ${date}, status ${status}`,
      userId: markedById
    });
    
    // Return updated attendance
    res.status(200).json({
      success: true,
      message: 'Attendance updated successfully',
      data: existingAttendance
    });
  } else {
    // Create new attendance
    const attendance = await Attendance.create({
      studentId,
      subjectId,
      classId: subject.classId,
      date,
      status,
      markMethod: 'manual',
      markTime: new Date(),
      remarks,
      markedById
    });
    
    // Log the creation
    await Log.create({
      action: 'attendance_create',
      details: `Attendance created for student ${studentId}, subject ${subjectId}, date ${date}, status ${status}`,
      userId: markedById
    });
    
    // Send attendance confirmation email
    try {
      await sendAttendanceConfirmationEmail({
        to: student.email,
        name: student.name,
        attendance,
        subject
      });
    } catch (error) {
      logger.error('Error sending attendance confirmation email:', error);
      // Continue process even if email fails
    }
    
    // Return created attendance
    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: attendance
    });
  }
});

/**
 * Bulk mark attendance
 * @route POST /api/attendance/bulk
 */
const bulkMarkAttendance = asyncHandler(async (req, res) => {
  const { subjectId, date, attendanceData } = req.body;
  const markedById = req.user.id;
  
  // Validate input
  if (!subjectId || !date || !attendanceData || !Array.isArray(attendanceData)) {
    throw new AppError('Subject ID, date, and attendance data array are required', 400);
  }
  
  // Check if user is authorized to mark attendance
  if (!['teacher', 'subject_teacher', 'class_teacher', 'admin'].includes(req.user.role)) {
    throw new AppError('Only teachers and admins can mark attendance', 403);
  }
  
  // Find subject
  const subject = await Subject.findByPk(subjectId, {
    include: [{ model: Class, as: 'class' }]
  });
  
  if (!subject) {
    throw new AppError('Subject not found', 404);
  }
  
  // Check if teacher is authorized to mark attendance for this subject
  if (req.user.role !== 'admin' && req.user.role !== 'class_teacher' && subject.teacherId !== req.user.id) {
    throw new AppError('You are not authorized to mark attendance for this subject', 403);
  }
  
  // Get all students in the class
  const students = await User.findAll({
    where: {
      role: 'student',
      classId: subject.classId
    }
  });
  
  // Create a map of student IDs
  const studentMap = new Map();
  students.forEach(student => {
    studentMap.set(student.id, student);
  });
  
  // Validate attendance data
  for (const item of attendanceData) {
    if (!item.studentId || !item.status) {
      throw new AppError('Each attendance item must have studentId and status', 400);
    }
    
    if (!studentMap.has(item.studentId)) {
      throw new AppError(`Student with ID ${item.studentId} not found or does not belong to this class`, 400);
    }
  }
  
  // Process attendance data
  const results = [];
  
  for (const item of attendanceData) {
    const { studentId, status, remarks } = item;
    
    // Check if attendance already exists
    const existingAttendance = await Attendance.findOne({
      where: {
        studentId,
        subjectId,
        date
      }
    });
    
    if (existingAttendance) {
      // Update existing attendance
      existingAttendance.status = status;
      existingAttendance.markMethod = 'manual';
      existingAttendance.markTime = new Date();
      existingAttendance.remarks = remarks;
      existingAttendance.markedById = markedById;
      
      await existingAttendance.save();
      
      // Log the update
      await Log.create({
        action: 'attendance_update_bulk',
        details: `Attendance updated for student ${studentId}, subject ${subjectId}, date ${date}, status ${status}`,
        userId: markedById
      });
      
      results.push({
        studentId,
        action: 'updated',
        attendance: existingAttendance
      });
    } else {
      // Create new attendance
      const attendance = await Attendance.create({
        studentId,
        subjectId,
        classId: subject.classId,
        date,
        status,
        markMethod: 'manual',
        markTime: new Date(),
        remarks,
        markedById
      });
      
      // Log the creation
      await Log.create({
        action: 'attendance_create_bulk',
        details: `Attendance created for student ${studentId}, subject ${subjectId}, date ${date}, status ${status}`,
        userId: markedById
      });
      
      results.push({
        studentId,
        action: 'created',
        attendance
      });
      
      // Send attendance confirmation email
      try {
        const student = studentMap.get(studentId);
        await sendAttendanceConfirmationEmail({
          to: student.email,
          name: student.name,
          attendance,
          subject
        });
      } catch (error) {
        logger.error('Error sending attendance confirmation email:', error);
        // Continue process even if email fails
      }
    }
  }
  
  // Return results
  res.status(200).json({
    success: true,
    message: 'Bulk attendance marked successfully',
    data: {
      count: results.length,
      results
    }
  });
});

/**
 * Get attendance by student
 * @route GET /api/attendance/student/:studentId
 */
const getAttendanceByStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { startDate, endDate, subjectId } = req.query;
  
  // Check if user is authorized to view attendance
  if (req.user.role === 'student' && req.user.id !== parseInt(studentId)) {
    throw new AppError('You are not authorized to view this student\'s attendance', 403);
  }
  
  // Build where clause
  const whereClause = {
    studentId
  };
  
  // Filter by date range
  if (startDate && endDate) {
    whereClause.date = {
      [Op.between]: [startDate, endDate]
    };
  } else if (startDate) {
    whereClause.date = {
      [Op.gte]: startDate
    };
  } else if (endDate) {
    whereClause.date = {
      [Op.lte]: endDate
    };
  }
  
  // Filter by subject
  if (subjectId) {
    whereClause.subjectId = subjectId;
  }
  
  // Find attendance records
  const attendanceRecords = await Attendance.findAll({
    where: whereClause,
    include: [
      { model: Subject, as: 'subject' },
      { model: Class, as: 'class' },
      { model: User, as: 'student', attributes: ['id', 'name', 'email', 'rollNumber'] },
      { model: User, as: 'markedBy', attributes: ['id', 'name', 'email'] }
    ],
    order: [['date', 'DESC'], ['markTime', 'DESC']]
  });
  
  // Return attendance records
  res.status(200).json({
    success: true,
    count: attendanceRecords.length,
    data: attendanceRecords
  });
});

/**
 * Get attendance by subject
 * @route GET /api/attendance/subject/:subjectId
 */
const getAttendanceBySubject = asyncHandler(async (req, res) => {
  const { subjectId } = req.params;
  const { date, startDate, endDate } = req.query;
  
  // Find subject
  const subject = await Subject.findByPk(subjectId);
  
  if (!subject) {
    throw new AppError('Subject not found', 404);
  }
  
  // Check if user is authorized to view attendance for this subject
  if (req.user.role === 'teacher' || req.user.role === 'subject_teacher') {
    if (subject.teacherId !== req.user.id) {
      throw new AppError('You are not authorized to view attendance for this subject', 403);
    }
  } else if (req.user.role === 'student') {
    // Students can only view their own attendance
    whereClause.studentId = req.user.id;
  }
  
  // Build where clause
  const whereClause = {
    subjectId
  };
  
  // Filter by specific date
  if (date) {
    whereClause.date = date;
  }
  // Filter by date range
  else if (startDate && endDate) {
    whereClause.date = {
      [Op.between]: [startDate, endDate]
    };
  } else if (startDate) {
    whereClause.date = {
      [Op.gte]: startDate
    };
  } else if (endDate) {
    whereClause.date = {
      [Op.lte]: endDate
    };
  }
  
  // Find attendance records
  const attendanceRecords = await Attendance.findAll({
    where: whereClause,
    include: [
      { model: Subject, as: 'subject' },
      { model: Class, as: 'class' },
      { model: User, as: 'student', attributes: ['id', 'name', 'email', 'rollNumber'] },
      { model: User, as: 'markedBy', attributes: ['id', 'name', 'email'] }
    ],
    order: [['date', 'DESC'], ['studentId', 'ASC']]
  });
  
  // Return attendance records
  res.status(200).json({
    success: true,
    count: attendanceRecords.length,
    data: attendanceRecords
  });
});

/**
 * Get attendance by class
 * @route GET /api/attendance/class/:classId
 */
const getAttendanceByClass = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const { date, subjectId, startDate, endDate } = req.query;
  
  // Find class
  const classRecord = await Class.findByPk(classId);
  
  if (!classRecord) {
    throw new AppError('Class not found', 404);
  }
  
  // Check if user is authorized to view attendance for this class
  if (req.user.role === 'class_teacher') {
    if (classRecord.classTeacherId !== req.user.id) {
      throw new AppError('You are not authorized to view attendance for this class', 403);
    }
  } else if (req.user.role === 'teacher' || req.user.role === 'subject_teacher') {
    // Teachers can only view attendance for their subjects
    if (!subjectId) {
      throw new AppError('Subject ID is required for teachers', 400);
    }
    
    const subject = await Subject.findOne({
      where: {
        id: subjectId,
        teacherId: req.user.id
      }
    });
    
    if (!subject) {
      throw new AppError('You are not authorized to view attendance for this subject', 403);
    }
  } else if (req.user.role === 'student') {
    // Students can only view their own attendance
    if (req.user.classId !== parseInt(classId)) {
      throw new AppError('You are not authorized to view attendance for this class', 403);
    }
  }
  
  // Build where clause
  const whereClause = {
    classId
  };
  
  // Filter by specific date
  if (date) {
    whereClause.date = date;
  }
  // Filter by date range
  else if (startDate && endDate) {
    whereClause.date = {
      [Op.between]: [startDate, endDate]
    };
  } else if (startDate) {
    whereClause.date = {
      [Op.gte]: startDate
    };
  } else if (endDate) {
    whereClause.date = {
      [Op.lte]: endDate
    };
  }
  
  // Filter by subject
  if (subjectId) {
    whereClause.subjectId = subjectId;
  }
  
  // If student, filter by studentId
  if (req.user.role === 'student') {
    whereClause.studentId = req.user.id;
  }
  
  // Find attendance records
  const attendanceRecords = await Attendance.findAll({
    where: whereClause,
    include: [
      { model: Subject, as: 'subject' },
      { model: Class, as: 'class' },
      { model: User, as: 'student', attributes: ['id', 'name', 'email', 'rollNumber'] },
      { model: User, as: 'markedBy', attributes: ['id', 'name', 'email'] }
    ],
    order: [['date', 'DESC'], ['subjectId', 'ASC'], ['studentId', 'ASC']]
  });
  
  // Return attendance records
  res.status(200).json({
    success: true,
    count: attendanceRecords.length,
    data: attendanceRecords
  });
});

/**
 * Update attendance
 * @route PUT /api/attendance/:id
 */
const updateAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, remarks } = req.body;
  
  // Find attendance record
  const attendance = await Attendance.findByPk(id, {
    include: [
      { model: Subject, as: 'subject' },
      { model: Class, as: 'class' },
      { model: User, as: 'student', attributes: ['id', 'name', 'email', 'rollNumber'] }
    ]
  });
  
  if (!attendance) {
    throw new AppError('Attendance record not found', 404);
  }
  
  // Check if user is authorized to update attendance
  if (req.user.role === 'admin') {
    // Admin can update any attendance
  } else if (req.user.role === 'class_teacher') {
    // Class teacher can update attendance for their class
    const classRecord = await Class.findByPk(attendance.classId);
    if (classRecord.classTeacherId !== req.user.id) {
      throw new AppError('You are not authorized to update attendance for this class', 403);
    }
  } else if (req.user.role === 'teacher' || req.user.role === 'subject_teacher') {
    // Teachers can only update attendance for their subjects
    const subject = await Subject.findByPk(attendance.subjectId);
    if (subject.teacherId !== req.user.id) {
      throw new AppError('You are not authorized to update attendance for this subject', 403);
    }
  } else {
    throw new AppError('You are not authorized to update attendance', 403);
  }
  
  // Update attendance
  attendance.status = status || attendance.status;
  attendance.remarks = remarks !== undefined ? remarks : attendance.remarks;
  attendance.markMethod = 'manual';
  attendance.markTime = new Date();
  attendance.markedById = req.user.id;
  
  await attendance.save();
  
  // Log the update
  await Log.create({
    action: 'attendance_update',
    details: `Attendance updated for ID ${id}, status ${status}`,
    userId: req.user.id
  });
  
  // Return updated attendance
  res.status(200).json({
    success: true,
    message: 'Attendance updated successfully',
    data: attendance
  });
});

/**
 * Delete attendance
 * @route DELETE /api/attendance/:id
 */
const deleteAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Find attendance record
  const attendance = await Attendance.findByPk(id, {
    include: [
      { model: Subject, as: 'subject' },
      { model: Class, as: 'class' }
    ]
  });
  
  if (!attendance) {
    throw new AppError('Attendance record not found', 404);
  }
  
  // Check if user is authorized to delete attendance
  if (req.user.role === 'admin') {
    // Admin can delete any attendance
  } else if (req.user.role === 'class_teacher') {
    // Class teacher can delete attendance for their class
    const classRecord = await Class.findByPk(attendance.classId);
    if (classRecord.classTeacherId !== req.user.id) {
      throw new AppError('You are not authorized to delete attendance for this class', 403);
    }
  } else {
    throw new AppError('You are not authorized to delete attendance', 403);
  }
  
  // Log the deletion
  await Log.create({
    action: 'attendance_delete',
    details: `Attendance deleted for ID ${id}, student ${attendance.studentId}, subject ${attendance.subjectId}, date ${attendance.date}`,
    userId: req.user.id
  });
  
  // Delete attendance
  await attendance.destroy();
  
  // Return success
  res.status(200).json({
    success: true,
    message: 'Attendance deleted successfully'
  });
});

module.exports = {
  markAttendance,
  bulkMarkAttendance,
  getAttendanceByStudent,
  getAttendanceBySubject,
  getAttendanceByClass,
  updateAttendance,
  deleteAttendance
};

