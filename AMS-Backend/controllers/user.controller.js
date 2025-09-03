const { User, Class } = require('../models');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/profile');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `profile-${req.user.id}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files are allowed', 400), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter
});

/**
 * Get all users
 * @route GET /api/users
 */
const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, role, search } = req.query;
  
  // Build where clause
  const whereClause = {};
  
  // Filter by role
  if (role) {
    whereClause.role = role;
  }
  
  // Search by name, email, or loginId
  if (search) {
    whereClause[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
      { loginId: { [Op.like]: `%${search}%` } }
    ];
  }
  
  // Calculate pagination
  const offset = (page - 1) * limit;
  
  // Find users
  const { count, rows: users } = await User.findAndCountAll({
    where: whereClause,
    attributes: { exclude: ['password'] },
    include: [
      { model: Class, as: 'studentClass' }
    ],
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
  
  // Return users
  res.status(200).json({
    success: true,
    count,
    totalPages: Math.ceil(count / limit),
    currentPage: parseInt(page),
    data: users
  });
});

/**
 * Get user by ID
 * @route GET /api/users/:id
 */
const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Find user
  const user = await User.findByPk(id, {
    attributes: { exclude: ['password'] },
    include: [
      { model: Class, as: 'studentClass' }
    ]
  });
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  // Return user
  res.status(200).json({
    success: true,
    data: user
  });
});

/**
 * Create user
 * @route POST /api/users
 */
const createUser = asyncHandler(async (req, res) => {
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
    classId,
    isEmailVerified = true,
    isActive = true
  } = req.body;
  
  // Check if user is authorized to create users
  if (req.user.role !== 'admin' && req.user.role !== 'class_teacher') {
    throw new AppError('You are not authorized to create users', 403);
  }
  
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
    role,
    loginId,
    rollNumber,
    employeeId,
    department,
    year,
    semester,
    branch,
    program,
    classId,
    isEmailVerified,
    isActive
  });
  
  // Return user data (without password)
  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      loginId: user.loginId,
      rollNumber: user.rollNumber,
      employeeId: user.employeeId,
      department: user.department,
      year: user.year,
      semester: user.semester,
      branch: user.branch,
      program: user.program,
      classId: user.classId,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
      createdAt: user.createdAt
    }
  });
});

/**
 * Update user
 * @route PUT /api/users/:id
 */
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    email,
    role,
    loginId,
    rollNumber,
    employeeId,
    department,
    year,
    semester,
    branch,
    program,
    classId,
    isEmailVerified,
    isActive
  } = req.body;
  
  // Check if user is authorized to update users
  if (req.user.role !== 'admin' && req.user.role !== 'class_teacher' && req.user.id !== parseInt(id)) {
    throw new AppError('You are not authorized to update this user', 403);
  }
  
  // Find user
  const user = await User.findByPk(id);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  // Check if email is being changed and already exists
  if (email && email !== user.email) {
    const emailExists = await User.findOne({ where: { email } });
    if (emailExists) {
      throw new AppError('Email already exists', 400);
    }
  }
  
  // Check if loginId is being changed and already exists
  if (loginId && loginId !== user.loginId) {
    const loginIdExists = await User.findOne({ where: { loginId } });
    if (loginIdExists) {
      throw new AppError('Login ID already exists', 400);
    }
  }
  
  // Check if rollNumber is being changed and already exists
  if (rollNumber && rollNumber !== user.rollNumber) {
    const rollNumberExists = await User.findOne({ where: { rollNumber } });
    if (rollNumberExists) {
      throw new AppError('Roll number already exists', 400);
    }
  }
  
  // Check if employeeId is being changed and already exists
  if (employeeId && employeeId !== user.employeeId) {
    const employeeIdExists = await User.findOne({ where: { employeeId } });
    if (employeeIdExists) {
      throw new AppError('Employee ID already exists', 400);
    }
  }
  
  // Update user
  user.name = name || user.name;
  user.email = email || user.email;
  
  // Only admin can change role
  if (req.user.role === 'admin') {
    user.role = role || user.role;
    user.isEmailVerified = isEmailVerified !== undefined ? isEmailVerified : user.isEmailVerified;
    user.isActive = isActive !== undefined ? isActive : user.isActive;
  }
  
  // Only admin or class teacher can change class
  if (req.user.role === 'admin' || req.user.role === 'class_teacher') {
    user.loginId = loginId || user.loginId;
    user.rollNumber = rollNumber || user.rollNumber;
    user.employeeId = employeeId || user.employeeId;
    user.classId = classId || user.classId;
  }
  
  // These fields can be updated by the user themselves
  user.department = department || user.department;
  user.year = year || user.year;
  user.semester = semester || user.semester;
  user.branch = branch || user.branch;
  user.program = program || user.program;
  
  await user.save();
  
  // Return updated user
  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      loginId: user.loginId,
      rollNumber: user.rollNumber,
      employeeId: user.employeeId,
      department: user.department,
      year: user.year,
      semester: user.semester,
      branch: user.branch,
      program: user.program,
      classId: user.classId,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
      updatedAt: user.updatedAt
    }
  });
});

/**
 * Delete user
 * @route DELETE /api/users/:id
 */
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if user is authorized to delete users
  if (req.user.role !== 'admin') {
    throw new AppError('You are not authorized to delete users', 403);
  }
  
  // Find user
  const user = await User.findByPk(id);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  // Delete user
  await user.destroy();
  
  // Return success
  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
});

/**
 * Change user password
 * @route PUT /api/users/:id/change-password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;
  
  // Check if user is authorized to change password
  if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
    throw new AppError('You are not authorized to change this user\'s password', 403);
  }
  
  // Find user
  const user = await User.findByPk(id);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  // If not admin, verify current password
  if (req.user.role !== 'admin') {
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 401);
    }
  }
  
  // Update password
  user.password = newPassword;
  await user.save();
  
  // Return success
  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

/**
 * Update user profile
 * @route PUT /api/users/profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, department, year, semester, branch, program } = req.body;
  
  // Find user
  const user = await User.findByPk(req.user.id);
  
  // Update user
  user.name = name || user.name;
  user.department = department || user.department;
  user.year = year || user.year;
  user.semester = semester || user.semester;
  user.branch = branch || user.branch;
  user.program = program || user.program;
  
  await user.save();
  
  // Return updated user
  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      year: user.year,
      semester: user.semester,
      branch: user.branch,
      program: user.program,
      updatedAt: user.updatedAt
    }
  });
});

/**
 * Upload profile image
 * @route POST /api/users/profile/image
 */
const uploadProfileImage = asyncHandler(async (req, res) => {
  // Multer middleware for file upload
  const uploadMiddleware = upload.single('image');
  
  uploadMiddleware(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File size should be less than 5MB'
          });
        }
      }
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }
    
    try {
      // Find user
      const user = await User.findByPk(req.user.id);
      
      // Delete old profile image if exists
      if (user.profileImage) {
        const oldImagePath = path.join(__dirname, '..', user.profileImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      // Update user profile image
      const profileImage = `/uploads/profile/${req.file.filename}`;
      user.profileImage = profileImage;
      await user.save();
      
      // Return success
      res.status(200).json({
        success: true,
        message: 'Profile image uploaded successfully',
        data: {
          profileImage,
          profileImageUrl: `${req.protocol}://${req.get('host')}${profileImage}`
        }
      });
    } catch (error) {
      logger.error('Error uploading profile image:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading profile image'
      });
    }
  });
});

/**
 * Assign class teacher
 * @route PUT /api/users/:id/assign-class-teacher
 */
const assignClassTeacher = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { classId } = req.body;
  
  // Check if user is authorized to assign class teacher
  if (req.user.role !== 'admin') {
    throw new AppError('You are not authorized to assign class teacher', 403);
  }
  
  // Find user
  const user = await User.findByPk(id);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  // Check if user is a teacher
  if (!['teacher', 'subject_teacher'].includes(user.role)) {
    throw new AppError('Only teachers can be assigned as class teacher', 400);
  }
  
  // Find class
  const classRecord = await Class.findByPk(classId);
  
  if (!classRecord) {
    throw new AppError('Class not found', 404);
  }
  
  // Check if class already has a class teacher
  if (classRecord.classTeacherId && classRecord.classTeacherId !== user.id) {
    // Find current class teacher
    const currentClassTeacher = await User.findByPk(classRecord.classTeacherId);
    
    if (currentClassTeacher) {
      // Update current class teacher role
      currentClassTeacher.role = 'teacher';
      await currentClassTeacher.save();
    }
  }
  
  // Update class
  classRecord.classTeacherId = user.id;
  await classRecord.save();
  
  // Update user role
  user.role = 'class_teacher';
  await user.save();
  
  // Return success
  res.status(200).json({
    success: true,
    message: 'Class teacher assigned successfully',
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      class: {
        id: classRecord.id,
        name: classRecord.name,
        year: classRecord.year,
        semester: classRecord.semester
      }
    }
  });
});

/**
 * Get students by class
 * @route GET /api/users/students/class/:classId
 */
const getStudentsByClass = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  
  // Find class
  const classRecord = await Class.findByPk(classId);
  
  if (!classRecord) {
    throw new AppError('Class not found', 404);
  }
  
  // Check if user is authorized to view students
  if (req.user.role === 'student' && req.user.classId !== parseInt(classId)) {
    throw new AppError('You are not authorized to view students from this class', 403);
  }
  
  // Find students
  const students = await User.findAll({
    where: {
      role: 'student',
      classId
    },
    attributes: { exclude: ['password'] },
    order: [['rollNumber', 'ASC']]
  });
  
  // Return students
  res.status(200).json({
    success: true,
    count: students.length,
    data: students
  });
});

/**
 * Get all teachers
 * @route GET /api/users/teachers
 */
const getTeachers = asyncHandler(async (req, res) => {
  // Find teachers
  const teachers = await User.findAll({
    where: {
      role: {
        [Op.in]: ['teacher', 'subject_teacher', 'class_teacher']
      }
    },
    attributes: { exclude: ['password'] },
    order: [['name', 'ASC']]
  });
  
  // Return teachers
  res.status(200).json({
    success: true,
    count: teachers.length,
    data: teachers
  });
});

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  updateProfile,
  uploadProfileImage,
  assignClassTeacher,
  getStudentsByClass,
  getTeachers
};

