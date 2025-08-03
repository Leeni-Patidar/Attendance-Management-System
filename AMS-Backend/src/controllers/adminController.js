import { User, Session, Attendance, OverrideLog, Subject } from '../models/index.js';
import { validationResult } from 'express-validator';

/**
 * @desc Get all users with filtering
 * @route GET /api/admin/users
 * @access Private (Admin only)
 */
export const getUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      role, 
      isActive = true,
      search 
    } = req.query;

    // Build filter query
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { loginId: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    // Get total count for pagination
    const totalRecords = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / limit);

    // Get users
    const users = await User.find(filter)
      .select('-password -passwordResetToken')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        users,
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
    console.error('Get Users Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc Get system analytics
 * @route GET /api/admin/analytics
 * @access Private (Admin only)
 */
export const getAnalytics = async (req, res) => {
  try {
    const { timeframe = '30' } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeframe));

    // User statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } }
        }
      }
    ]);

    // Session statistics
    const sessionStats = await Session.aggregate([
      { 
        $match: { 
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

    // Attendance statistics
    const attendanceStats = await Attendance.aggregate([
      { 
        $match: { 
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

    // Override statistics
    const overrideStats = await OverrideLog.aggregate([
      { 
        $match: { 
          overrideTime: { $gte: startDate }
        } 
      },
      {
        $group: {
          _id: '$overrideType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Daily attendance trend
    const dailyAttendance = await Attendance.aggregate([
      { 
        $match: { 
          markedAt: { $gte: startDate }
        } 
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$markedAt' } },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        userStats,
        sessionStats,
        attendanceStats,
        overrideStats,
        dailyAttendance,
        timeframe: parseInt(timeframe)
      }
    });

  } catch (error) {
    console.error('Get Analytics Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc Get override logs with filtering
 * @route GET /api/admin/override-logs
 * @access Private (Admin only)
 */
export const getOverrideLogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      facultyId,
      startDate,
      endDate,
      overrideType 
    } = req.query;

    // Build filter query
    const filter = {};
    if (facultyId) filter.faculty = facultyId;
    if (overrideType) filter.overrideType = overrideType;
    
    if (startDate || endDate) {
      filter.overrideTime = {};
      if (startDate) filter.overrideTime.$gte = new Date(startDate);
      if (endDate) filter.overrideTime.$lte = new Date(endDate);
    }

    // Get total count for pagination
    const totalRecords = await OverrideLog.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / limit);

    // Get override logs
    const overrideLogs = await OverrideLog.find(filter)
      .populate('faculty', 'name loginId teacherInfo')
      .populate('student', 'name loginId studentInfo')
      .populate('session', 'subject className startTime')
      .sort({ overrideTime: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        overrideLogs,
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
    console.error('Get Override Logs Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc Get admin dashboard data
 * @route GET /api/admin/dashboard
 * @access Private (Admin only)
 */
export const getDashboard = async (req, res) => {
  try {
    const { timeframe = '7' } = req.query; // days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeframe));

    // Quick stats
    const [
      totalUsers,
      activeUsers,
      totalSessions,
      activeSessions,
      totalAttendance,
      recentOverrides
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Session.countDocuments({ startTime: { $gte: startDate } }),
      Session.countDocuments({ status: 'active' }),
      Attendance.countDocuments({ markedAt: { $gte: startDate } }),
      OverrideLog.find({ overrideTime: { $gte: startDate } })
        .populate('faculty', 'name loginId')
        .populate('student', 'name loginId studentInfo')
        .sort({ overrideTime: -1 })
        .limit(10)
    ]);

    // User breakdown
    const userBreakdown = await User.aggregate([
      {
        $group: {
          _id: '$role',
          total: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } }
        }
      }
    ]);

    // Recent sessions
    const recentSessions = await Session.find({ 
      startTime: { $gte: startDate } 
    })
    .populate('faculty', 'name loginId')
    .sort({ startTime: -1 })
    .limit(10);

    res.json({
      success: true,
      data: {
        quickStats: {
          totalUsers,
          activeUsers,
          totalSessions,
          activeSessions,
          totalAttendance,
          recentOverridesCount: recentOverrides.length
        },
        userBreakdown,
        recentSessions,
        recentOverrides,
        timeframe: parseInt(timeframe)
      }
    });

  } catch (error) {
    console.error('Get Admin Dashboard Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};