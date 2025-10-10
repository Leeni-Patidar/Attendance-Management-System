const { User } = require('../models');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { generateToken, generateRefreshToken } = require('../utils/jwt');
const { createOTP, verifyOTP } = require('../utils/otp');
const { sendOTPEmail } = require('../utils/email');
const { logger } = require('../utils/logger');

/**
 * Register a new user
 * @route POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    loginId,
    rollNumber,
    employeeId,
    department,
    year,
    semester,
    branch,
    program,
    classId
  } = req.body;
  
  // Check if email already exists
  const emailExists = await User.findOne({ where: { email } });
  if (emailExists) {
    throw new AppError('Email already exists', 400);
  }
  
  // Check if loginId already exists
  const loginIdExists = await User.findOne({ where: { loginId } });
  if (loginIdExists) {
    throw new AppError('Login ID already exists', 400);
  }
  
  // Check if rollNumber already exists (for students)
  if (role === 'student' && rollNumber) {
    const rollNumberExists = await User.findOne({ where: { rollNumber } });
    if (rollNumberExists) {
      throw new AppError('Roll number already exists', 400);
    }
  }
  
  // Check if employeeId already exists (for teachers)
  if (['teacher', 'class_teacher', 'subject_teacher'].includes(role) && employeeId) {
    const employeeIdExists = await User.findOne({ where: { employeeId } });
    if (employeeIdExists) {
      throw new AppError('Employee ID already exists', 400);
    }
  }
  
  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'student',
    loginId,
    rollNumber,
    employeeId,
    department,
    year,
    semester,
    branch,
    program,
    classId
  });
  
  // Generate and send OTP for email verification
  try {
    const otp = await createOTP({
      email,
      purpose: 'email_verification',
      userId: user.id
    });
    
    await sendOTPEmail({
      to: email,
      name,
      otp,
      purpose: 'email_verification'
    });
  } catch (error) {
    logger.error('Error sending verification email:', error);
    // Continue registration process even if email fails
  }
  
  // Return user data (without password)
  res.status(201).json({
    success: true,
    message: 'User registered successfully. Please verify your email.',
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      loginId: user.loginId,
      isEmailVerified: user.isEmailVerified
    }
  });
});

/**
 * Verify email with OTP
 * @route POST /api/auth/verify-email
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  
  // Validate input
  if (!email || !otp) {
    throw new AppError('Email and OTP are required', 400);
  }
  
  // Find user
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  // Verify OTP
  const isValid = await verifyOTP({
    email,
    otp,
    purpose: 'email_verification'
  });
  
  if (!isValid) {
    throw new AppError('Invalid or expired OTP', 400);
  }
  
  // Update user
  user.isEmailVerified = true;
  await user.save();
  
  // Generate tokens
  const token = generateToken({ id: user.id });
  const refreshToken = generateRefreshToken({ id: user.id });
  
  // Return user data and tokens
  res.status(200).json({
    success: true,
    message: 'Email verified successfully',
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        loginId: user.loginId,
        isEmailVerified: user.isEmailVerified
      },
      token,
      refreshToken
    }
  });
});

/**
 * Login user
 * @route POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { loginId, password, userType } = req.body;
  
  // Validate input
  if (!loginId || !password) {
    throw new AppError('Login ID and password are required', 400);
  }
  
  // Find user
  const whereClause = { loginId };
  if (userType) {
    whereClause.role = userType;
  }
  
  const user = await User.findOne({ where: whereClause });
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }
  
  // Check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }
  
  // Check if user is active
  if (!user.isActive) {
    throw new AppError('Your account has been deactivated. Please contact admin.', 403);
  }
  
  // Check if email is verified (except for admin)
  if (!user.isEmailVerified && user.role !== 'admin') {
    // Generate and send OTP for email verification
    try {
      const otp = await createOTP({
        email: user.email,
        purpose: 'email_verification',
        userId: user.id
      });
      
      await sendOTPEmail({
        to: user.email,
        name: user.name,
        otp,
        purpose: 'email_verification'
      });
    } catch (error) {
      logger.error('Error sending verification email:', error);
    }
    
    throw new AppError('Please verify your email first. A new verification code has been sent to your email.', 403);
  }
  
  // Update last login
  user.lastLogin = new Date();
  await user.save();
  
  // Generate tokens
  const token = generateToken({ id: user.id });
  const refreshToken = generateRefreshToken({ id: user.id });
  
  // Determine redirect URL based on role
  let redirectUrl = '/dashboard';
  switch (user.role) {
    case 'student':
      redirectUrl = '/student/dashboard';
      break;
    case 'teacher':
    case 'subject_teacher':
      redirectUrl = '/teacher/dashboard';
      break;
    case 'class_teacher':
      redirectUrl = '/class-teacher/dashboard';
      break;
    case 'admin':
      redirectUrl = '/admin/dashboard';
      break;
  }
  
  // Return user data and tokens
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        loginId: user.loginId,
        isEmailVerified: user.isEmailVerified
      },
      token,
      refreshToken,
      redirectUrl
    }
  });
});

/**
 * Refresh token
 * @route POST /api/auth/refresh-token
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: requestToken } = req.body;
  
  // Validate input
  if (!requestToken) {
    throw new AppError('Refresh token is required', 400);
  }
  
  try {
    // Verify refresh token
    const decoded = jwt.verify(requestToken, process.env.JWT_REFRESH_SECRET);
    
    // Find user
    const user = await User.findByPk(decoded.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    // Check if user is active
    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Please contact admin.', 403);
    }
    
    // Generate new tokens
    const token = generateToken({ id: user.id });
    const refreshToken = generateRefreshToken({ id: user.id });
    
    // Return new tokens
    res.status(200).json({
      success: true,
      data: {
        token,
        refreshToken
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new AppError('Invalid refresh token', 401);
    } else if (error.name === 'TokenExpiredError') {
      throw new AppError('Refresh token expired', 401);
    } else {
      throw error;
    }
  }
});

/**
 * Forgot password
 * @route POST /api/auth/forgot-password
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  // Validate input
  if (!email) {
    throw new AppError('Email is required', 400);
  }
  
  // Find user
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  // Generate and send OTP for password reset
  try {
    const otp = await createOTP({
      email,
      purpose: 'password_reset',
      userId: user.id
    });
    
    await sendOTPEmail({
      to: email,
      name: user.name,
      otp,
      purpose: 'password_reset'
    });
  } catch (error) {
    logger.error('Error sending password reset email:', error);
    throw new AppError('Error sending password reset email', 500);
  }
  
  // Return success
  res.status(200).json({
    success: true,
    message: 'Password reset OTP sent to your email'
  });
});

/**
 * Reset password
 * @route POST /api/auth/reset-password
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  
  // Validate input
  if (!email || !otp || !newPassword) {
    throw new AppError('Email, OTP, and new password are required', 400);
  }
  
  // Find user
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  // Verify OTP
  const isValid = await verifyOTP({
    email,
    otp,
    purpose: 'password_reset'
  });
  
  if (!isValid) {
    throw new AppError('Invalid or expired OTP', 400);
  }
  
  // Update password
  user.password = newPassword;
  await user.save();
  
  // Return success
  res.status(200).json({
    success: true,
    message: 'Password reset successful'
  });
});

/**
 * Get current user
 * @route GET /api/auth/me
 */
const getMe = asyncHandler(async (req, res) => {
  // User is already set in req.user by auth middleware
  const user = req.user;
  
  // Return user data
  res.status(200).json({
    success: true,
    data: user
  });
});

/**
 * Logout user
 * @route POST /api/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  // Nothing to do on server side for JWT logout
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = {
  register,
  verifyEmail,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
  getMe,
  logout
};

