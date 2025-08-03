import { body, param, query, validationResult } from 'express-validator';
import { Types } from 'mongoose';

// Middleware to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Common validation rules
export const mongoIdValidation = (field = 'id') => [
  param(field).custom((value) => {
    if (!Types.ObjectId.isValid(value)) {
      throw new Error('Invalid ID format');
    }
    return true;
  })
];

// User registration validation
export const validateUserRegistration = [
  body('loginId')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Login ID must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9._-]+$/)
    .withMessage('Login ID can only contain alphanumeric characters, dots, underscores, and hyphens'),
    
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
    
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s.'-]+$/)
    .withMessage('Name can only contain letters, spaces, dots, apostrophes, and hyphens'),
    
  body('role')
    .isIn(['student', 'subject_teacher', 'class_teacher', 'admin'])
    .withMessage('Role must be student, subject_teacher, class_teacher, or admin'),
    
  body('phoneNumber')
    .optional()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Invalid phone number format'),
    
  // Student-specific validations
  body('studentInfo.rollNumber')
    .if(body('role').equals('student'))
    .notEmpty()
    .withMessage('Roll number is required for students')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Roll number must be alphanumeric'),
    
  body('studentInfo.class')
    .if(body('role').equals('student'))
    .notEmpty()
    .withMessage('Class is required for students'),
    
  body('studentInfo.year')
    .if(body('role').equals('student'))
    .isIn(['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'])
    .withMessage('Invalid year'),
    
  body('studentInfo.semester')
    .if(body('role').equals('student'))
    .isIn(['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', 
           '5th Semester', '6th Semester', '7th Semester', '8th Semester',
           '9th Semester', '10th Semester'])
    .withMessage('Invalid semester'),
    
  body('studentInfo.program')
    .if(body('role').equals('student'))
    .isIn(['B.Tech', 'M.Tech', 'BCA', 'MCA', 'BSc', 'MSc', 'BA', 'MA', 'Other'])
    .withMessage('Invalid program'),
    
  // Teacher-specific validations
  body('teacherInfo.employeeId')
    .if(body('role').isIn(['subject_teacher', 'class_teacher']))
    .notEmpty()
    .withMessage('Employee ID is required for teachers')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Employee ID must be alphanumeric'),
    
  body('teacherInfo.department')
    .if(body('role').isIn(['subject_teacher', 'class_teacher']))
    .notEmpty()
    .withMessage('Department is required for teachers'),
    
  body('teacherInfo.designation')
    .if(body('role').isIn(['subject_teacher', 'class_teacher']))
    .optional()
    .isIn(['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Other'])
    .withMessage('Invalid designation'),
    
  handleValidationErrors
];

// User login validation
export const validateUserLogin = [
  body('id')
    .trim()
    .notEmpty()
    .withMessage('Login ID is required'),
    
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
    
  body('userType')
    .isIn(['student', 'subject_teacher', 'class_teacher', 'admin'])
    .withMessage('Valid user type is required'),
    
  handleValidationErrors
];

// Session creation validation
export const validateSessionCreation = [
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ max: 100 })
    .withMessage('Subject name cannot exceed 100 characters'),
    
  body('subjectCode')
    .trim()
    .notEmpty()
    .withMessage('Subject code is required')
    .matches(/^[A-Z0-9]{3,10}$/)
    .withMessage('Subject code must be 3-10 alphanumeric characters'),
    
  body('className')
    .trim()
    .notEmpty()
    .withMessage('Class name is required'),
    
  body('topic')
    .trim()
    .notEmpty()
    .withMessage('Topic is required')
    .isLength({ max: 200 })
    .withMessage('Topic cannot exceed 200 characters'),
    
  body('validityDuration')
    .isInt({ min: 1, max: 60 })
    .withMessage('Validity duration must be between 1 and 60 minutes'),
    
  body('sessionType')
    .optional()
    .isIn(['lecture', 'practical', 'tutorial', 'seminar', 'exam'])
    .withMessage('Invalid session type'),
    
  body('totalStudents')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Total students must be a positive number'),
    
  body('location.room')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Room name cannot exceed 50 characters'),
    
  body('location.building')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Building name cannot exceed 50 characters'),
    
  handleValidationErrors
];

// QR scan validation
export const validateQRScan = [
  body('qrData')
    .notEmpty()
    .withMessage('QR data is required'),
    
  body('deviceInfo.userAgent')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('User agent cannot exceed 500 characters'),
    
  body('deviceInfo.platform')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Platform cannot exceed 50 characters'),
    
  body('location.latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
    
  body('location.longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
    
  body('scanImage')
    .optional()
    .isBase64()
    .withMessage('Scan image must be valid base64'),
    
  handleValidationErrors
];

// Attendance override validation
export const validateAttendanceOverride = [
  body('studentId')
    .custom((value) => {
      if (!Types.ObjectId.isValid(value)) {
        throw new Error('Invalid student ID');
      }
      return true;
    }),
    
  body('newStatus')
    .isIn(['present', 'absent', 'late', 'excused'])
    .withMessage('Invalid attendance status'),
    
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Reason is required')
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters'),
    
  body('context')
    .optional()
    .isIn(['late_arrival', 'early_departure', 'technical_issue', 'medical_emergency', 'family_emergency', 'official_duty', 'other'])
    .withMessage('Invalid context'),
    
  handleValidationErrors
];

// Subject creation validation
export const validateSubjectCreation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Subject name is required')
    .isLength({ max: 100 })
    .withMessage('Subject name cannot exceed 100 characters'),
    
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Subject code is required')
    .matches(/^[A-Z0-9]{3,10}$/)
    .withMessage('Subject code must be 3-10 alphanumeric characters'),
    
  body('credits')
    .isInt({ min: 1, max: 10 })
    .withMessage('Credits must be between 1 and 10'),
    
  body('type')
    .isIn(['theory', 'practical', 'project', 'seminar', 'elective'])
    .withMessage('Invalid subject type'),
    
  body('category')
    .optional()
    .isIn(['core', 'elective', 'optional', 'mandatory'])
    .withMessage('Invalid subject category'),
    
  body('department')
    .trim()
    .notEmpty()
    .withMessage('Department is required'),
    
  body('program')
    .isIn(['B.Tech', 'M.Tech', 'BCA', 'MCA', 'BSc', 'MSc', 'BA', 'MA', 'Other'])
    .withMessage('Invalid program'),
    
  body('year')
    .isIn(['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'])
    .withMessage('Invalid year'),
    
  body('semester')
    .isIn(['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', 
           '5th Semester', '6th Semester', '7th Semester', '8th Semester',
           '9th Semester', '10th Semester'])
    .withMessage('Invalid semester'),
    
  body('academicYear')
    .matches(/^\d{4}-\d{4}$/)
    .withMessage('Academic year must be in format YYYY-YYYY'),
    
  handleValidationErrors
];

// Schedule validation
export const validateSchedule = [
  body('day')
    .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
    .withMessage('Invalid day'),
    
  body('startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
    
  body('endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format')
    .custom((value, { req }) => {
      if (value <= req.body.startTime) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
    
  body('room')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Room name cannot exceed 50 characters'),
    
  body('building')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Building name cannot exceed 50 characters'),
    
  body('type')
    .optional()
    .isIn(['lecture', 'practical', 'tutorial', 'seminar'])
    .withMessage('Invalid schedule type'),
    
  body('className')
    .trim()
    .notEmpty()
    .withMessage('Class name is required'),
    
  handleValidationErrors
];

// Device binding validation
export const validateDeviceBinding = [
  body('deviceInfo.userAgent')
    .notEmpty()
    .withMessage('User agent is required'),
    
  body('deviceInfo.platform')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Platform cannot exceed 50 characters'),
    
  body('deviceInfo.screenResolution')
    .optional()
    .matches(/^\d+x\d+$/)
    .withMessage('Screen resolution must be in format WIDTHxHEIGHT'),
    
  body('deviceInfo.timezone')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Timezone cannot exceed 50 characters'),
    
  body('canvasFingerprint')
    .optional()
    .isLength({ min: 10 })
    .withMessage('Canvas fingerprint too short'),
    
  body('webglFingerprint')
    .optional()
    .isLength({ min: 10 })
    .withMessage('WebGL fingerprint too short'),
    
  handleValidationErrors
];

// Query parameter validation
export const validateDateRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO date'),
    
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO date')
    .custom((value, { req }) => {
      if (req.query.startDate && value < req.query.startDate) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
    
  handleValidationErrors
];

export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
    
  query('sortBy')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Sort field must be between 1 and 50 characters'),
    
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc', '1', '-1'])
    .withMessage('Sort order must be asc, desc, 1, or -1'),
    
  handleValidationErrors
];

// File upload validation
export const validateFileUpload = [
  body('fileType')
    .optional()
    .isIn(['image', 'document', 'pdf'])
    .withMessage('Invalid file type'),
    
  body('fileName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('File name must be between 1 and 255 characters'),
    
  handleValidationErrors
];

// Custom validation for password change
export const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
    
  body('newPassword')
    .isLength({ min: 6, max: 128 })
    .withMessage('New password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
    
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    }),
    
  handleValidationErrors
];

// Batch operation validation
export const validateBatchOperation = [
  body('operations')
    .isArray({ min: 1, max: 100 })
    .withMessage('Operations must be an array with 1-100 items'),
    
  body('operations.*.type')
    .isIn(['create', 'update', 'delete'])
    .withMessage('Operation type must be create, update, or delete'),
    
  body('operations.*.id')
    .if(body('operations.*.type').isIn(['update', 'delete']))
    .custom((value) => {
      if (!Types.ObjectId.isValid(value)) {
        throw new Error('Invalid operation ID');
      }
      return true;
    }),
    
  handleValidationErrors
];

// Sanitization middleware
export const sanitizeInput = (req, res, next) => {
  // Remove any potentially harmful characters
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/javascript:/gi, '')
              .replace(/on\w+=/gi, '');
  };

  const sanitizeObject = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = sanitizeString(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);

  next();
};