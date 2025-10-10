const { Attendance, User, Subject, Class } = require('../models');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');
const { Op, Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');
const { Parser } = require('json2csv');

// Create reports directory if it doesn't exist
const reportsDir = path.join(__dirname, '../reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

/**
 * Generate student attendance report
 * @route GET /api/reports/student/:studentId
 */
const generateStudentReport = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { format = 'json', startDate, endDate, subjectId } = req.query;
  
  // Check if user is authorized to view report
  if (req.user.role === 'student' && req.user.id !== parseInt(studentId)) {
    throw new AppError('You are not authorized to view this student\'s report', 403);
  }
  
  // Find student
  const student = await User.findOne({
    where: {
      id: studentId,
      role: 'student'
    },
    include: [{ model: Class, as: 'studentClass' }]
  });
  
  if (!student) {
    throw new AppError('Student not found', 404);
  }
  
  // Build where clause for attendance
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
  } else {
    // Default to current semester if no dates provided
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    // Determine semester date range
    let semesterStartDate, semesterEndDate;
    
    if (currentMonth >= 0 && currentMonth <= 5) {
      // Spring semester (January - June)
      semesterStartDate = `${currentYear}-01-01`;
      semesterEndDate = `${currentYear}-06-30`;
    } else {
      // Fall semester (July - December)
      semesterStartDate = `${currentYear}-07-01`;
      semesterEndDate = `${currentYear}-12-31`;
    }
    
    whereClause.date = {
      [Op.between]: [semesterStartDate, semesterEndDate]
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
      { model: Class, as: 'class' }
    ],
    order: [['date', 'DESC']]
  });
  
  // Get all subjects for the student's class
  const subjects = await Subject.findAll({
    where: {
      classId: student.classId
    }
  });
  
  // Calculate statistics
  const totalClasses = attendanceRecords.length;
  const presentCount = attendanceRecords.filter(record => record.status === 'present').length;
  const absentCount = attendanceRecords.filter(record => record.status === 'absent').length;
  const lateCount = attendanceRecords.filter(record => record.status === 'late').length;
  const attendancePercentage = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;
  
  // Calculate subject-wise attendance
  const subjectAttendance = [];
  
  for (const subject of subjects) {
    const subjectRecords = attendanceRecords.filter(record => record.subjectId === subject.id);
    const subjectTotal = subjectRecords.length;
    const subjectPresent = subjectRecords.filter(record => record.status === 'present').length;
    const subjectAbsent = subjectRecords.filter(record => record.status === 'absent').length;
    const subjectLate = subjectRecords.filter(record => record.status === 'late').length;
    const subjectPercentage = subjectTotal > 0 ? Math.round((subjectPresent / subjectTotal) * 100) : 0;
    
    subjectAttendance.push({
      subject: {
        id: subject.id,
        name: subject.name,
        code: subject.code
      },
      total: subjectTotal,
      present: subjectPresent,
      absent: subjectAbsent,
      late: subjectLate,
      percentage: subjectPercentage
    });
  }
  
  // Prepare report data
  const reportData = {
    student: {
      id: student.id,
      name: student.name,
      rollNumber: student.rollNumber,
      class: student.studentClass ? student.studentClass.name : null,
      department: student.department,
      year: student.year,
      semester: student.semester
    },
    reportPeriod: {
      startDate: startDate || (whereClause.date ? whereClause.date[Op.between][0] : null),
      endDate: endDate || (whereClause.date ? whereClause.date[Op.between][1] : null)
    },
    stats: {
      totalClasses,
      presentCount,
      absentCount,
      lateCount,
      attendancePercentage
    },
    subjectAttendance,
    attendanceRecords: attendanceRecords.map(record => ({
      date: record.date,
      subject: record.subject.name,
      subjectCode: record.subject.code,
      status: record.status,
      markTime: record.markTime
    }))
  };
  
  // Return report based on format
  if (format === 'csv') {
    try {
      // Flatten attendance records for CSV
      const flattenedRecords = attendanceRecords.map(record => ({
        Date: record.date,
        Subject: record.subject.name,
        'Subject Code': record.subject.code,
        Status: record.status,
        'Mark Time': record.markTime
      }));
      
      // Create CSV
      const fields = ['Date', 'Subject', 'Subject Code', 'Status', 'Mark Time'];
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(flattenedRecords);
      
      // Generate filename
      const filename = `student_attendance_${studentId}_${new Date().toISOString().split('T')[0]}.csv`;
      const filepath = path.join(reportsDir, filename);
      
      // Write to file
      fs.writeFileSync(filepath, csv);
      
      // Set headers for download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      
      // Send file
      res.download(filepath, filename, (err) => {
        if (err) {
          logger.error('Error downloading file:', err);
        }
        
        // Delete file after download
        fs.unlinkSync(filepath);
      });
    } catch (error) {
      logger.error('Error generating CSV:', error);
      throw new AppError('Error generating CSV report', 500);
    }
  } else {
    // Return JSON
    res.status(200).json({
      success: true,
      data: reportData
    });
  }
});

/**
 * Generate class attendance report
 * @route GET /api/reports/class/:classId
 */
const generateClassReport = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const { format = 'json', startDate, endDate, subjectId } = req.query;
  
  // Find class
  const classRecord = await Class.findByPk(classId);
  
  if (!classRecord) {
    throw new AppError('Class not found', 404);
  }
  
  // Check if user is authorized to view report
  if (req.user.role === 'class_teacher') {
    if (classRecord.classTeacherId !== req.user.id) {
      throw new AppError('You are not authorized to view this class\'s report', 403);
    }
  } else if (req.user.role === 'teacher' || req.user.role === 'subject_teacher') {
    // Teachers can only view reports for their subjects
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
      throw new AppError('You are not authorized to view reports for this subject', 403);
    }
  } else if (req.user.role === 'student') {
    throw new AppError('Students cannot view class reports', 403);
  }
  
  // Get all students in the class
  const students = await User.findAll({
    where: {
      role: 'student',
      classId
    },
    order: [['rollNumber', 'ASC']]
  });
  
  // Build where clause for attendance
  const whereClause = {
    classId
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
  } else {
    // Default to current semester if no dates provided
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    // Determine semester date range
    let semesterStartDate, semesterEndDate;
    
    if (currentMonth >= 0 && currentMonth <= 5) {
      // Spring semester (January - June)
      semesterStartDate = `${currentYear}-01-01`;
      semesterEndDate = `${currentYear}-06-30`;
    } else {
      // Fall semester (July - December)
      semesterStartDate = `${currentYear}-07-01`;
      semesterEndDate = `${currentYear}-12-31`;
    }
    
    whereClause.date = {
      [Op.between]: [semesterStartDate, semesterEndDate]
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
      { model: User, as: 'student', attributes: ['id', 'name', 'rollNumber'] }
    ],
    order: [['date', 'DESC'], ['studentId', 'ASC']]
  });
  
  // Get subjects for the class
  const subjects = await Subject.findAll({
    where: {
      classId
    }
  });
  
  // Calculate student-wise attendance
  const studentAttendance = [];
  
  for (const student of students) {
    const studentRecords = attendanceRecords.filter(record => record.studentId === student.id);
    const totalClasses = studentRecords.length;
    const presentCount = studentRecords.filter(record => record.status === 'present').length;
    const absentCount = studentRecords.filter(record => record.status === 'absent').length;
    const lateCount = studentRecords.filter(record => record.status === 'late').length;
    const attendancePercentage = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;
    
    // Calculate subject-wise attendance for this student
    const subjectStats = [];
    
    for (const subject of subjects) {
      const subjectRecords = studentRecords.filter(record => record.subjectId === subject.id);
      const subjectTotal = subjectRecords.length;
      const subjectPresent = subjectRecords.filter(record => record.status === 'present').length;
      const subjectPercentage = subjectTotal > 0 ? Math.round((subjectPresent / subjectTotal) * 100) : 0;
      
      subjectStats.push({
        subjectId: subject.id,
        subjectName: subject.name,
        subjectCode: subject.code,
        total: subjectTotal,
        present: subjectPresent,
        percentage: subjectPercentage
      });
    }
    
    studentAttendance.push({
      student: {
        id: student.id,
        name: student.name,
        rollNumber: student.rollNumber
      },
      stats: {
        totalClasses,
        presentCount,
        absentCount,
        lateCount,
        attendancePercentage
      },
      subjectStats
    });
  }
  
  // Calculate overall class statistics
  const totalStudents = students.length;
  const totalAttendanceRecords = attendanceRecords.length;
  const averageAttendance = studentAttendance.length > 0
    ? Math.round(studentAttendance.reduce((sum, student) => sum + student.stats.attendancePercentage, 0) / studentAttendance.length)
    : 0;
  
  // Calculate subject-wise class statistics
  const subjectStats = [];
  
  for (const subject of subjects) {
    const subjectRecords = attendanceRecords.filter(record => record.subjectId === subject.id);
    const subjectTotal = subjectRecords.length;
    const subjectPresent = subjectRecords.filter(record => record.status === 'present').length;
    const subjectAbsent = subjectRecords.filter(record => record.status === 'absent').length;
    const subjectLate = subjectRecords.filter(record => record.status === 'late').length;
    const subjectPercentage = subjectTotal > 0 ? Math.round((subjectPresent / subjectTotal) * 100) : 0;
    
    // Get unique dates for this subject
    const uniqueDates = [...new Set(subjectRecords.map(record => record.date))];
    
    subjectStats.push({
      subject: {
        id: subject.id,
        name: subject.name,
        code: subject.code
      },
      totalSessions: uniqueDates.length,
      totalAttendance: subjectTotal,
      presentCount: subjectPresent,
      absentCount: subjectAbsent,
      lateCount: subjectLate,
      attendancePercentage: subjectPercentage
    });
  }
  
  // Prepare report data
  const reportData = {
    class: {
      id: classRecord.id,
      name: classRecord.name,
      year: classRecord.year,
      semester: classRecord.semester,
      department: classRecord.department,
      academicYear: classRecord.academicYear
    },
    reportPeriod: {
      startDate: startDate || (whereClause.date ? whereClause.date[Op.between][0] : null),
      endDate: endDate || (whereClause.date ? whereClause.date[Op.between][1] : null)
    },
    stats: {
      totalStudents,
      totalAttendanceRecords,
      averageAttendance
    },
    subjectStats,
    studentAttendance
  };
  
  // Return report based on format
  if (format === 'csv') {
    try {
      // Prepare CSV data
      const csvData = [];
      
      // Add header row with student info and subject codes
      const headerRow = {
        'Roll Number': 'Roll Number',
        'Student Name': 'Student Name'
      };
      
      // Add subject columns
      for (const subject of subjects) {
        headerRow[subject.code] = subject.code;
      }
      
      headerRow['Overall'] = 'Overall';
      
      csvData.push(headerRow);
      
      // Add data rows
      for (const student of studentAttendance) {
        const dataRow = {
          'Roll Number': student.student.rollNumber,
          'Student Name': student.student.name
        };
        
        // Add subject attendance percentages
        for (const subject of subjects) {
          const subjectStat = student.subjectStats.find(stat => stat.subjectId === subject.id);
          dataRow[subject.code] = subjectStat ? `${subjectStat.percentage}%` : 'N/A';
        }
        
        dataRow['Overall'] = `${student.stats.attendancePercentage}%`;
        
        csvData.push(dataRow);
      }
      
      // Create CSV
      const fields = Object.keys(csvData[0]);
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(csvData);
      
      // Generate filename
      const filename = `class_attendance_${classId}_${new Date().toISOString().split('T')[0]}.csv`;
      const filepath = path.join(reportsDir, filename);
      
      // Write to file
      fs.writeFileSync(filepath, csv);
      
      // Set headers for download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      
      // Send file
      res.download(filepath, filename, (err) => {
        if (err) {
          logger.error('Error downloading file:', err);
        }
        
        // Delete file after download
        fs.unlinkSync(filepath);
      });
    } catch (error) {
      logger.error('Error generating CSV:', error);
      throw new AppError('Error generating CSV report', 500);
    }
  } else {
    // Return JSON
    res.status(200).json({
      success: true,
      data: reportData
    });
  }
});

/**
 * Generate subject attendance report
 * @route GET /api/reports/subject/:subjectId
 */
const generateSubjectReport = asyncHandler(async (req, res) => {
  const { subjectId } = req.params;
  const { format = 'json', startDate, endDate } = req.query;
  
  // Find subject
  const subject = await Subject.findByPk(subjectId, {
    include: [
      { model: Class, as: 'class' },
      { model: User, as: 'teacher', attributes: ['id', 'name', 'email'] }
    ]
  });
  
  if (!subject) {
    throw new AppError('Subject not found', 404);
  }
  
  // Check if user is authorized to view report
  if (req.user.role === 'teacher' || req.user.role === 'subject_teacher') {
    if (subject.teacherId !== req.user.id) {
      throw new AppError('You are not authorized to view reports for this subject', 403);
    }
  } else if (req.user.role === 'student') {
    // Students can only view their own subject reports
    if (req.user.classId !== subject.classId) {
      throw new AppError('You are not authorized to view reports for this subject', 403);
    }
  }
  
  // Get all students in the class
  const students = await User.findAll({
    where: {
      role: 'student',
      classId: subject.classId
    },
    order: [['rollNumber', 'ASC']]
  });
  
  // Build where clause for attendance
  const whereClause = {
    subjectId
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
  } else {
    // Default to current semester if no dates provided
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    // Determine semester date range
    let semesterStartDate, semesterEndDate;
    
    if (currentMonth >= 0 && currentMonth <= 5) {
      // Spring semester (January - June)
      semesterStartDate = `${currentYear}-01-01`;
      semesterEndDate = `${currentYear}-06-30`;
    } else {
      // Fall semester (July - December)
      semesterStartDate = `${currentYear}-07-01`;
      semesterEndDate = `${currentYear}-12-31`;
    }
    
    whereClause.date = {
      [Op.between]: [semesterStartDate, semesterEndDate]
    };
  }
  
  // If student, filter by studentId
  if (req.user.role === 'student') {
    whereClause.studentId = req.user.id;
  }
  
  // Find attendance records
  const attendanceRecords = await Attendance.findAll({
    where: whereClause,
    include: [
      { model: User, as: 'student', attributes: ['id', 'name', 'rollNumber'] }
    ],
    order: [['date', 'DESC'], ['studentId', 'ASC']]
  });
  
  // Get unique dates (sessions)
  const uniqueDates = [...new Set(attendanceRecords.map(record => record.date))].sort((a, b) => new Date(b) - new Date(a));
  
  // Calculate student-wise attendance
  const studentAttendance = [];
  
  for (const student of students) {
    // Skip if student role and not the current user
    if (req.user.role === 'student' && req.user.id !== student.id) {
      continue;
    }
    
    const studentRecords = attendanceRecords.filter(record => record.studentId === student.id);
    const totalSessions = uniqueDates.length;
    const attendedSessions = new Set(studentRecords.filter(record => record.status === 'present').map(record => record.date)).size;
    const absentSessions = totalSessions - attendedSessions;
    const attendancePercentage = totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : 0;
    
    // Get session-wise attendance
    const sessionAttendance = [];
    
    for (const date of uniqueDates) {
      const sessionRecord = studentRecords.find(record => record.date === date);
      
      sessionAttendance.push({
        date,
        status: sessionRecord ? sessionRecord.status : 'absent',
        markTime: sessionRecord ? sessionRecord.markTime : null
      });
    }
    
    studentAttendance.push({
      student: {
        id: student.id,
        name: student.name,
        rollNumber: student.rollNumber
      },
      stats: {
        totalSessions,
        attendedSessions,
        absentSessions,
        attendancePercentage
      },
      sessionAttendance
    });
  }
  
  // Calculate overall subject statistics
  const totalStudents = students.length;
  const totalSessions = uniqueDates.length;
  const totalAttendanceRecords = attendanceRecords.length;
  const presentCount = attendanceRecords.filter(record => record.status === 'present').length;
  const absentCount = attendanceRecords.filter(record => record.status === 'absent').length;
  const lateCount = attendanceRecords.filter(record => record.status === 'late').length;
  const averageAttendance = studentAttendance.length > 0
    ? Math.round(studentAttendance.reduce((sum, student) => sum + student.stats.attendancePercentage, 0) / studentAttendance.length)
    : 0;
  
  // Calculate session-wise statistics
  const sessionStats = [];
  
  for (const date of uniqueDates) {
    const sessionRecords = attendanceRecords.filter(record => record.date === date);
    const sessionTotal = sessionRecords.length;
    const sessionPresent = sessionRecords.filter(record => record.status === 'present').length;
    const sessionAbsent = sessionRecords.filter(record => record.status === 'absent').length;
    const sessionLate = sessionRecords.filter(record => record.status === 'late').length;
    const sessionPercentage = sessionTotal > 0 ? Math.round((sessionPresent / sessionTotal) * 100) : 0;
    
    sessionStats.push({
      date,
      totalStudents: sessionTotal,
      presentCount: sessionPresent,
      absentCount: sessionAbsent,
      lateCount: sessionLate,
      attendancePercentage: sessionPercentage
    });
  }
  
  // Prepare report data
  const reportData = {
    subject: {
      id: subject.id,
      name: subject.name,
      code: subject.code,
      credits: subject.credits,
      teacher: subject.teacher
    },
    class: {
      id: subject.class.id,
      name: subject.class.name,
      year: subject.class.year,
      semester: subject.class.semester
    },
    reportPeriod: {
      startDate: startDate || (whereClause.date ? whereClause.date[Op.between][0] : null),
      endDate: endDate || (whereClause.date ? whereClause.date[Op.between][1] : null)
    },
    stats: {
      totalStudents,
      totalSessions,
      totalAttendanceRecords,
      presentCount,
      absentCount,
      lateCount,
      averageAttendance
    },
    sessionStats,
    studentAttendance
  };
  
  // Return report based on format
  if (format === 'csv') {
    try {
      // Prepare CSV data
      const csvData = [];
      
      // Add header row with student info and dates
      const headerRow = {
        'Roll Number': 'Roll Number',
        'Student Name': 'Student Name'
      };
      
      // Add date columns
      for (const date of uniqueDates) {
        headerRow[date] = date;
      }
      
      headerRow['Percentage'] = 'Percentage';
      
      csvData.push(headerRow);
      
      // Add data rows
      for (const student of studentAttendance) {
        const dataRow = {
          'Roll Number': student.student.rollNumber,
          'Student Name': student.student.name
        };
        
        // Add session attendance
        for (const date of uniqueDates) {
          const sessionRecord = student.sessionAttendance.find(session => session.date === date);
          dataRow[date] = sessionRecord ? sessionRecord.status : 'absent';
        }
        
        dataRow['Percentage'] = `${student.stats.attendancePercentage}%`;
        
        csvData.push(dataRow);
      }
      
      // Create CSV
      const fields = Object.keys(csvData[0]);
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(csvData);
      
      // Generate filename
      const filename = `subject_attendance_${subjectId}_${new Date().toISOString().split('T')[0]}.csv`;
      const filepath = path.join(reportsDir, filename);
      
      // Write to file
      fs.writeFileSync(filepath, csv);
      
      // Set headers for download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      
      // Send file
      res.download(filepath, filename, (err) => {
        if (err) {
          logger.error('Error downloading file:', err);
        }
        
        // Delete file after download
        fs.unlinkSync(filepath);
      });
    } catch (error) {
      logger.error('Error generating CSV:', error);
      throw new AppError('Error generating CSV report', 500);
    }
  } else {
    // Return JSON
    res.status(200).json({
      success: true,
      data: reportData
    });
  }
});

module.exports = {
  generateStudentReport,
  generateClassReport,
  generateSubjectReport
};

