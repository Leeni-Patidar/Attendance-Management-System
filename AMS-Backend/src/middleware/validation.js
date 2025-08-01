const { body, param, query, validationResult } = require('express-validator');
const { formatResponse, isValidEmail, isValidPhone } = require('../utils/helpers');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(
            formatResponse(false, 'Validation failed', null, {
                details: errors.array()
            })
        );
    }
    next();
};

// User registration validation
const validateUserRegistration = [
    body('employee_id')
        .notEmpty()
        .withMessage('Employee ID is required')
        .isLength({ min: 3, max: 20 })
        .withMessage('Employee ID must be between 3 and 20 characters'),
    
    body('email')
        .isEmail()
        .withMessage('Valid email is required')
        .normalizeEmail(),
    
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    
    body('first_name')
        .trim()
        .notEmpty()
        .withMessage('First name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('First name must be between 2 and 100 characters'),
    
    body('last_name')
        .trim()
        .notEmpty()
        .withMessage('Last name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Last name must be between 2 and 100 characters'),
    
    body('role')
        .optional()
        .isIn(['employee', 'admin', 'hr', 'manager'])
        .withMessage('Role must be one of: employee, admin, hr, manager'),
    
    body('department')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Department name must not exceed 100 characters'),
    
    body('phone')
        .optional()
        .custom((value) => {
            if (value && !isValidPhone(value)) {
                throw new Error('Invalid phone number format');
            }
            return true;
        }),
    
    body('hire_date')
        .optional()
        .isISO8601()
        .withMessage('Hire date must be a valid date'),
    
    handleValidationErrors
];

// User login validation
const validateUserLogin = [
    body('email')
        .isEmail()
        .withMessage('Valid email is required')
        .normalizeEmail(),
    
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    
    handleValidationErrors
];

// User update validation
const validateUserUpdate = [
    body('email')
        .optional()
        .isEmail()
        .withMessage('Valid email is required')
        .normalizeEmail(),
    
    body('first_name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('First name must be between 2 and 100 characters'),
    
    body('last_name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Last name must be between 2 and 100 characters'),
    
    body('department')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Department name must not exceed 100 characters'),
    
    body('phone')
        .optional()
        .custom((value) => {
            if (value && !isValidPhone(value)) {
                throw new Error('Invalid phone number format');
            }
            return true;
        }),
    
    handleValidationErrors
];

// Attendance check-in validation
const validateCheckIn = [
    body('location')
        .optional()
        .isLength({ max: 255 })
        .withMessage('Location must not exceed 255 characters'),
    
    body('notes')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Notes must not exceed 500 characters'),
    
    handleValidationErrors
];

// Attendance check-out validation
const validateCheckOut = [
    body('notes')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Notes must not exceed 500 characters'),
    
    handleValidationErrors
];

// Leave request validation
const validateLeaveRequest = [
    body('leave_type_id')
        .isInt({ min: 1 })
        .withMessage('Valid leave type ID is required'),
    
    body('start_date')
        .isISO8601()
        .withMessage('Valid start date is required'),
    
    body('end_date')
        .isISO8601()
        .withMessage('Valid end date is required')
        .custom((value, { req }) => {
            if (new Date(value) < new Date(req.body.start_date)) {
                throw new Error('End date must be after start date');
            }
            return true;
        }),
    
    body('reason')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Reason must not exceed 500 characters'),
    
    handleValidationErrors
];

// Leave approval validation
const validateLeaveApproval = [
    body('status')
        .isIn(['approved', 'rejected'])
        .withMessage('Status must be either approved or rejected'),
    
    body('rejection_reason')
        .if(body('status').equals('rejected'))
        .notEmpty()
        .withMessage('Rejection reason is required when rejecting leave')
        .isLength({ max: 500 })
        .withMessage('Rejection reason must not exceed 500 characters'),
    
    handleValidationErrors
];

// Overtime request validation
const validateOvertimeRequest = [
    body('date')
        .isISO8601()
        .withMessage('Valid date is required'),
    
    body('start_time')
        .isISO8601()
        .withMessage('Valid start time is required'),
    
    body('end_time')
        .isISO8601()
        .withMessage('Valid end time is required')
        .custom((value, { req }) => {
            if (new Date(value) <= new Date(req.body.start_time)) {
                throw new Error('End time must be after start time');
            }
            return true;
        }),
    
    body('reason')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Reason must not exceed 500 characters'),
    
    handleValidationErrors
];

// Password change validation
const validatePasswordChange = [
    body('current_password')
        .notEmpty()
        .withMessage('Current password is required'),
    
    body('new_password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    
    body('confirm_password')
        .custom((value, { req }) => {
            if (value !== req.body.new_password) {
                throw new Error('Password confirmation does not match');
            }
            return true;
        }),
    
    handleValidationErrors
];

// Pagination validation
const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    
    handleValidationErrors
];

// Date range validation
const validateDateRange = [
    query('start_date')
        .optional()
        .isISO8601()
        .withMessage('Valid start date is required'),
    
    query('end_date')
        .optional()
        .isISO8601()
        .withMessage('Valid end date is required')
        .custom((value, { req }) => {
            if (req.query.start_date && new Date(value) < new Date(req.query.start_date)) {
                throw new Error('End date must be after start date');
            }
            return true;
        }),
    
    handleValidationErrors
];

// ID parameter validation
const validateId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Valid ID is required'),
    
    handleValidationErrors
];

module.exports = {
    validateUserRegistration,
    validateUserLogin,
    validateUserUpdate,
    validateCheckIn,
    validateCheckOut,
    validateLeaveRequest,
    validateLeaveApproval,
    validateOvertimeRequest,
    validatePasswordChange,
    validatePagination,
    validateDateRange,
    validateId,
    handleValidationErrors
};