import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import DeviceBinding from '../models/DeviceBinding.js';
import qrGenerator from '../utils/qrGenerator.js';

// Generate JWT tokens
const generateTokens = (userId, role) => {
  const accessToken = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const refreshToken = jwt.sign(
    { userId, role, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );

  return { accessToken, refreshToken };
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const {
      loginId,
      email,
      password,
      name,
      role,
      phoneNumber,
      address,
      studentInfo,
      teacherInfo
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { loginId: loginId.toLowerCase() },
        { email: email.toLowerCase() }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this login ID or email already exists'
      });
    }

    // Check for duplicate roll number (students)
    if (role === 'student' && studentInfo?.rollNumber) {
      const existingStudent = await User.findOne({
        'studentInfo.rollNumber': studentInfo.rollNumber.toUpperCase()
      });
      
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: 'Student with this roll number already exists'
        });
      }
    }

    // Check for duplicate employee ID (teachers)
    if ((role === 'subject_teacher' || role === 'class_teacher') && teacherInfo?.employeeId) {
      const existingTeacher = await User.findOne({
        'teacherInfo.employeeId': teacherInfo.employeeId.toUpperCase()
      });
      
      if (existingTeacher) {
        return res.status(400).json({
          success: false,
          message: 'Teacher with this employee ID already exists'
        });
      }
    }

    // Create user object
    const userData = {
      loginId: loginId.toLowerCase(),
      email: email.toLowerCase(),
      password,
      name,
      role,
      phoneNumber,
      address
    };

    // Add role-specific information
    if (role === 'student') {
      userData.studentInfo = {
        ...studentInfo,
        rollNumber: studentInfo.rollNumber.toUpperCase()
      };
    } else if (role === 'subject_teacher' || role === 'class_teacher') {
      userData.teacherInfo = {
        ...teacherInfo,
        employeeId: teacherInfo.employeeId.toUpperCase()
      };
    }

    // Create user
    const user = new User(userData);
    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    // Remove password from response
    const userResponse = user.toJSON();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { id, password, userType } = req.body;
    const clientIP = req.ip;
    const userAgent = req.get('User-Agent');

    // Find and authenticate user
    const user = await User.findByCredentials(id, password, userType);

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // For students, check device binding if enabled
    let deviceBinding = null;
    if (user.role === 'student' && process.env.ENABLE_DEVICE_BINDING === 'true') {
      const deviceId = req.headers['x-device-id'];
      
      if (deviceId) {
        deviceBinding = await DeviceBinding.findOne({
          student: user._id,
          deviceId: deviceId,
          isActive: true
        });

        if (!deviceBinding) {
          // Create new device binding if not exists
          const deviceInfo = {
            userAgent,
            platform: req.headers['x-platform'] || 'unknown',
            screenResolution: req.headers['x-screen-resolution'] || '',
            timezone: req.headers['x-timezone'] || '',
            language: req.headers['x-language'] || 'en'
          };

          deviceBinding = new DeviceBinding({
            student: user._id,
            deviceId: deviceId,
            deviceInfo: deviceInfo,
            registeredFrom: {
              ipAddress: clientIP,
              location: {
                // You can integrate with IP geolocation service here
                country: 'Unknown',
                region: 'Unknown',
                city: 'Unknown'
              }
            },
            isPrimary: true // First device is primary
          });

          await deviceBinding.save();
        } else {
          // Update usage for existing device
          await deviceBinding.updateUsage();
        }
      }
    }

    // Prepare response
    const userResponse = user.toJSON();
    const redirectUrls = {
      student: '/student/dashboard',
      class_teacher: '/class-teacher/dashboard',
      subject_teacher: '/subject-teacher/dashboard',
      admin: '/admin/dashboard'
    };

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        accessToken,
        refreshToken,
        redirectUrl: redirectUrls[user.role] || '/dashboard',
        deviceBinding: deviceBinding ? {
          id: deviceBinding._id,
          isPrimary: deviceBinding.isPrimary,
          isVerified: deviceBinding.isVerified
        } : null
      }
    });
  } catch (error) {
    console.error('Login error:', error);

    if (error.message.includes('Invalid login credentials')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid login credentials'
      });
    }

    if (error.message.includes('Account is temporarily locked')) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed login attempts'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );

    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Get user
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user._id,
      user.role
    );

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        refreshToken: newRefreshToken,
        user: user.toJSON()
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during token refresh'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    // In a real implementation, you might want to blacklist the token
    // or implement a token revocation mechanism
    
    // For now, we'll just send a success response
    // The client should remove the tokens from storage
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('teacherInfo.subjects', 'name code')
      .populate('studentInfo.enrolledSubjects', 'name code');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: user.toJSON()
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const updateData = { ...req.body };

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.password;
    delete updateData.role;
    delete updateData.loginId;
    delete updateData.email;
    delete updateData.isActive;

    // Handle role-specific updates
    if (req.user.role === 'student' && updateData.studentInfo) {
      // Students can't change their roll number
      delete updateData.studentInfo.rollNumber;
    }

    if ((req.user.role === 'subject_teacher' || req.user.role === 'class_teacher') && 
        updateData.teacherInfo) {
      // Teachers can't change their employee ID
      delete updateData.teacherInfo.employeeId;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.toJSON()
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Get user with password
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Forgot password - generate reset token
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id, type: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Save reset token to user (you might want to hash this)
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // TODO: Send email with reset link
    // await sendPasswordResetEmail(user.email, resetToken);

    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent',
      // In development, return the token for testing
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Reset password with token
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Verify reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'password_reset') {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token'
      });
    }

    const user = await User.findOne({
      _id: decoded.userId,
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update password and clear reset token
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.loginAttempts = 0; // Reset login attempts
    user.lockUntil = undefined;
    
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);

    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Generate device registration QR
// @route   POST /api/auth/generate-device-qr
// @access  Private (Students only)
export const generateDeviceQR = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Device registration is only available for students'
      });
    }

    const { deviceInfo } = req.body;
    
    const qrData = await qrGenerator.generateDeviceRegistrationQR(
      req.user._id,
      deviceInfo
    );

    res.json({
      success: true,
      message: 'Device registration QR generated',
      data: qrData
    });
  } catch (error) {
    console.error('Generate device QR error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate device registration QR'
    });
  }
};

// @desc    Verify and register device
// @route   POST /api/auth/register-device
// @access  Public
export const registerDevice = async (req, res) => {
  try {
    const { qrData, deviceInfo } = req.body;
    
    // Verify QR code
    const verification = await qrGenerator.verifyDeviceRegistrationQR(qrData);
    
    if (!verification.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid device registration QR code'
      });
    }

    const { studentId } = verification;
    
    // Check if student exists
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Create device binding
    const deviceId = req.headers['x-device-id'] || `device_${Date.now()}`;
    
    const deviceBinding = new DeviceBinding({
      student: studentId,
      deviceId: deviceId,
      deviceInfo: deviceInfo,
      registeredFrom: {
        ipAddress: req.ip,
        location: {
          country: 'Unknown',
          region: 'Unknown', 
          city: 'Unknown'
        }
      },
      isVerified: true,
      isPrimary: true
    });

    await deviceBinding.save();

    res.json({
      success: true,
      message: 'Device registered successfully',
      data: {
        deviceBinding: {
          id: deviceBinding._id,
          deviceId: deviceBinding.deviceId,
          isPrimary: deviceBinding.isPrimary,
          isVerified: deviceBinding.isVerified
        }
      }
    });
  } catch (error) {
    console.error('Register device error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register device'
    });
  }
};