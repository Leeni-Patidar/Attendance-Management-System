import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware to verify JWT token
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is inactive'
      });
    }

    // Check if user account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to failed login attempts'
      });
    }

    // Attach user to request object
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Middleware to check user roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// Middleware specifically for student access
export const requireStudent = authorize('student');

// Middleware specifically for faculty access (both subject and class teachers)
export const requireFaculty = authorize('subject_teacher', 'class_teacher');

// Middleware specifically for subject teacher access
export const requireSubjectTeacher = authorize('subject_teacher');

// Middleware specifically for class teacher access
export const requireClassTeacher = authorize('class_teacher');

// Middleware specifically for admin access
export const requireAdmin = authorize('admin');

// Middleware for admin or faculty access
export const requireAdminOrFaculty = authorize('admin', 'subject_teacher', 'class_teacher');

// Advanced authorization middleware with custom conditions
export const authorizeWithCondition = (roleCondition) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Call the custom role condition function
      const isAuthorized = await roleCondition(req.user, req);

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions'
        });
      }

      next();
    } catch (error) {
      console.error('Authorization condition error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization check failed'
      });
    }
  };
};

// Middleware to check if user can access specific student data
export const canAccessStudentData = authorizeWithCondition(async (user, req) => {
  // Admin can access any student data
  if (user.role === 'admin') {
    return true;
  }

  // Students can only access their own data
  if (user.role === 'student') {
    const studentId = req.params.studentId || req.params.id;
    return user._id.toString() === studentId;
  }

  // Faculty can access students in their assigned classes
  if (user.role === 'subject_teacher' || user.role === 'class_teacher') {
    // This would require additional logic to check if the student is in faculty's class
    // For now, allow all faculty to access student data
    return true;
  }

  return false;
});

// Middleware to check if user can access specific session data
export const canAccessSessionData = authorizeWithCondition(async (user, req) => {
  // Admin can access any session data
  if (user.role === 'admin') {
    return true;
  }

  // Faculty can access sessions they created
  if (user.role === 'subject_teacher' || user.role === 'class_teacher') {
    const Session = (await import('../models/Session.js')).default;
    const sessionId = req.params.sessionId || req.params.id;
    
    const session = await Session.findById(sessionId);
    if (!session) {
      return false;
    }
    
    return session.faculty.toString() === user._id.toString();
  }

  // Students can access sessions for their classes
  if (user.role === 'student') {
    // This would require additional logic to check if the session is for student's class
    // For now, allow students to access session data
    return true;
  }

  return false;
});

// Middleware to track API usage
export const trackApiUsage = async (req, res, next) => {
  try {
    if (req.user) {
      // Log API usage for analytics (implement as needed)
      const usage = {
        userId: req.user._id,
        endpoint: req.path,
        method: req.method,
        timestamp: new Date(),
        userAgent: req.get('User-Agent'),
        ip: req.ip
      };
      
      // You can save this to a separate collection for analytics
      console.log('API Usage:', usage);
    }
    
    next();
  } catch (error) {
    console.error('API tracking error:', error);
    next(); // Continue even if tracking fails
  }
};

// Middleware to check device binding for students
export const checkDeviceBinding = async (req, res, next) => {
  try {
    // Only check device binding for students and if it's enabled
    if (req.user.role !== 'student' || process.env.ENABLE_DEVICE_BINDING !== 'true') {
      return next();
    }

    const DeviceBinding = (await import('../models/DeviceBinding.js')).default;
    
    // Get device information from request headers
    const deviceId = req.headers['x-device-id'];
    const userAgent = req.get('User-Agent');
    
    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: 'Device ID required for students'
      });
    }

    // Check if device is registered and active for this student
    const deviceBinding = await DeviceBinding.findOne({
      student: req.user._id,
      deviceId: deviceId,
      isActive: true
    });

    if (!deviceBinding) {
      return res.status(403).json({
        success: false,
        message: 'Device not registered or inactive'
      });
    }

    // Verify device fingerprint
    const currentDeviceInfo = {
      userAgent,
      platform: req.headers['x-platform'],
      screenResolution: req.headers['x-screen-resolution'],
      timezone: req.headers['x-timezone'],
      language: req.headers['x-language']
    };

    if (!deviceBinding.verifyFingerprint(currentDeviceInfo)) {
      return res.status(403).json({
        success: false,
        message: 'Device fingerprint mismatch'
      });
    }

    // Update device usage
    await deviceBinding.updateUsage();
    
    // Attach device binding to request
    req.deviceBinding = deviceBinding;
    
    next();
  } catch (error) {
    console.error('Device binding check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Device verification failed'
    });
  }
};

// Middleware to refresh token if it's about to expire
export const refreshTokenIfNeeded = async (req, res, next) => {
  try {
    if (!req.token) {
      return next();
    }

    const decoded = jwt.decode(req.token);
    const currentTime = Date.now() / 1000;
    const timeUntilExpiry = decoded.exp - currentTime;

    // If token expires in less than 1 hour, provide a new token in response headers
    if (timeUntilExpiry < 3600) { // 1 hour
      const newToken = jwt.sign(
        { 
          userId: req.user._id,
          role: req.user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.setHeader('X-New-Token', newToken);
    }

    next();
  } catch (error) {
    console.error('Token refresh error:', error);
    next(); // Continue even if refresh fails
  }
};

// Optional middleware for API rate limiting based on user role
export const rateLimitByRole = (req, res, next) => {
  // This is a placeholder for role-based rate limiting
  // You can implement different rate limits based on user roles
  
  const rateLimits = {
    student: 100, // requests per window
    subject_teacher: 200,
    class_teacher: 200,
    admin: 500
  };

  const userLimit = rateLimits[req.user?.role] || 100;
  
  // Add rate limit info to headers
  res.setHeader('X-Rate-Limit-Role', req.user?.role || 'anonymous');
  res.setHeader('X-Rate-Limit-Limit', userLimit);
  
  next();
};

// Error handling for auth middleware
export const handleAuthErrors = (error, req, res, next) => {
  console.error('Auth middleware error:', error);

  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (error.name === 'ForbiddenError') {
    return res.status(403).json({
      success: false,
      message: 'Access forbidden'
    });
  }

  return res.status(500).json({
    success: false,
    message: 'Authentication system error'
  });
};