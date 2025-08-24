const { User } = require('../models');
const { AppError, asyncHandler } = require('./errorHandler');
const { verifyToken } = require('../utils/jwt');

/**
 * Protect routes - Verify JWT token and set req.user
 */
const protect = asyncHandler(async (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;
  let token;
  
  if (authHeader && authHeader.startsWith('Bearer')) {
    token = authHeader.split(' ')[1];
  }
  
  // Check if token exists
  if (!token) {
    throw new AppError('Not authorized to access this route', 401);
  }
  
  try {
    // Verify token
    const decoded = verifyToken(token);
    
    // Get user from database
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    // Check if user is active
    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Please contact admin.', 403);
    }
    
    // Set user in request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new AppError('Invalid token', 401);
    } else if (error.name === 'TokenExpiredError') {
      throw new AppError('Token expired', 401);
    } else {
      throw error;
    }
  }
});

/**
 * Authorize roles - Check if user has required role
 * @param {...String} roles - Allowed roles
 * @returns {Function} Express middleware
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user has required role
    if (!roles.includes(req.user.role)) {
      throw new AppError(`Role ${req.user.role} is not authorized to access this route`, 403);
    }
    
    next();
  };
};

module.exports = {
  protect,
  authorize
};

