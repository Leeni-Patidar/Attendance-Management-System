import express from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  generateDeviceQR,
  registerDevice
} from '../controllers/authController.js';
import {
  authenticateToken,
  requireStudent,
  refreshTokenIfNeeded
} from '../middleware/auth.js';
import {
  validateUserRegistration,
  validateUserLogin,
  validatePasswordChange,
  validateDeviceBinding,
  sanitizeInput
} from '../middleware/validation.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - loginId
 *         - email
 *         - password
 *         - name
 *         - role
 *       properties:
 *         loginId:
 *           type: string
 *           description: Unique login identifier
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         password:
 *           type: string
 *           minLength: 6
 *           description: User's password
 *         name:
 *           type: string
 *           description: User's full name
 *         role:
 *           type: string
 *           enum: [student, subject_teacher, class_teacher, admin]
 *           description: User's role in the system
 *         phoneNumber:
 *           type: string
 *           description: User's phone number
 *         studentInfo:
 *           type: object
 *           properties:
 *             rollNumber:
 *               type: string
 *               description: Student's roll number
 *             class:
 *               type: string
 *               description: Student's class
 *             year:
 *               type: string
 *               enum: [1st Year, 2nd Year, 3rd Year, 4th Year, 5th Year]
 *             semester:
 *               type: string
 *               enum: [1st Semester, 2nd Semester, 3rd Semester, 4th Semester, 5th Semester, 6th Semester, 7th Semester, 8th Semester, 9th Semester, 10th Semester]
 *             program:
 *               type: string
 *               enum: [B.Tech, M.Tech, BCA, MCA, BSc, MSc, BA, MA, Other]
 *         teacherInfo:
 *           type: object
 *           properties:
 *             employeeId:
 *               type: string
 *               description: Teacher's employee ID
 *             department:
 *               type: string
 *               description: Teacher's department
 *             designation:
 *               type: string
 *               enum: [Professor, Associate Professor, Assistant Professor, Lecturer, Other]
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/User'
 *             accessToken:
 *               type: string
 *             refreshToken:
 *               type: string
 *             redirectUrl:
 *               type: string
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *           examples:
 *             student:
 *               summary: Student registration
 *               value:
 *                 loginId: "student001"
 *                 email: "john.doe@college.edu"
 *                 password: "SecurePass123"
 *                 name: "John Doe"
 *                 role: "student"
 *                 phoneNumber: "+1234567890"
 *                 studentInfo:
 *                   rollNumber: "CS21B001"
 *                   class: "CS 3rd Year - Section A"
 *                   year: "3rd Year"
 *                   semester: "6th Semester"
 *                   program: "B.Tech"
 *             teacher:
 *               summary: Teacher registration
 *               value:
 *                 loginId: "teacher001"
 *                 email: "sarah.johnson@college.edu"
 *                 password: "SecurePass123"
 *                 name: "Dr. Sarah Johnson"
 *                 role: "subject_teacher"
 *                 phoneNumber: "+1234567890"
 *                 teacherInfo:
 *                   employeeId: "EMP001"
 *                   department: "Computer Science"
 *                   designation: "Assistant Professor"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error or user already exists
 *       500:
 *         description: Internal server error
 */
router.post('/register', 
  sanitizeInput,
  validateUserRegistration,
  register
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - password
 *               - userType
 *             properties:
 *               id:
 *                 type: string
 *                 description: Login ID
 *               password:
 *                 type: string
 *                 description: Password
 *               userType:
 *                 type: string
 *                 enum: [student, subject_teacher, class_teacher, admin]
 *                 description: User role
 *           examples:
 *             student:
 *               summary: Student login
 *               value:
 *                 id: "student001"
 *                 password: "demo123"
 *                 userType: "student"
 *             teacher:
 *               summary: Teacher login
 *               value:
 *                 id: "teacher001"
 *                 password: "demo123"
 *                 userType: "subject_teacher"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials or account locked
 *       500:
 *         description: Internal server error
 */
router.post('/login',
  sanitizeInput,
  validateUserLogin,
  login
);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Valid refresh token
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid or expired refresh token
 *       500:
 *         description: Internal server error
 */
router.post('/refresh',
  sanitizeInput,
  refreshToken
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/logout',
  authenticateToken,
  logout
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/me',
  authenticateToken,
  refreshTokenIfNeeded,
  getMe
);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   pincode:
 *                     type: string
 *                   country:
 *                     type: string
 *               studentInfo:
 *                 type: object
 *                 properties:
 *                   guardianName:
 *                     type: string
 *                   guardianPhone:
 *                     type: string
 *                   guardianEmail:
 *                     type: string
 *               teacherInfo:
 *                 type: object
 *                 properties:
 *                   qualification:
 *                     type: array
 *                     items:
 *                       type: string
 *                   experience:
 *                     type: number
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.put('/profile',
  authenticateToken,
  sanitizeInput,
  updateProfile
);

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: Change user password
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Current password
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 description: New password
 *               confirmPassword:
 *                 type: string
 *                 description: Confirm new password
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Validation error or incorrect current password
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.put('/change-password',
  authenticateToken,
  sanitizeInput,
  validatePasswordChange,
  changePassword
);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *     responses:
 *       200:
 *         description: Password reset email sent (if email exists)
 *       500:
 *         description: Internal server error
 */
router.post('/forgot-password',
  sanitizeInput,
  forgotPassword
);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: Password reset token
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 description: New password
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired token
 *       500:
 *         description: Internal server error
 */
router.post('/reset-password',
  sanitizeInput,
  resetPassword
);

/**
 * @swagger
 * /api/auth/generate-device-qr:
 *   post:
 *     summary: Generate device registration QR code (Students only)
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceInfo
 *             properties:
 *               deviceInfo:
 *                 type: object
 *                 required:
 *                   - userAgent
 *                 properties:
 *                   userAgent:
 *                     type: string
 *                     description: Device user agent
 *                   platform:
 *                     type: string
 *                     description: Device platform
 *                   screenResolution:
 *                     type: string
 *                     description: Screen resolution
 *                   timezone:
 *                     type: string
 *                     description: Device timezone
 *                   language:
 *                     type: string
 *                     description: Device language
 *     responses:
 *       200:
 *         description: Device registration QR generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     qrToken:
 *                       type: string
 *                     qrString:
 *                       type: string
 *                     qrCodeImage:
 *                       type: string
 *                       description: Base64 encoded QR code image
 *       403:
 *         description: Access denied (not a student)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/generate-device-qr',
  authenticateToken,
  requireStudent,
  sanitizeInput,
  validateDeviceBinding,
  generateDeviceQR
);

/**
 * @swagger
 * /api/auth/register-device:
 *   post:
 *     summary: Register device using QR code
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - qrData
 *               - deviceInfo
 *             properties:
 *               qrData:
 *                 type: string
 *                 description: QR code data to verify
 *               deviceInfo:
 *                 type: object
 *                 required:
 *                   - userAgent
 *                 properties:
 *                   userAgent:
 *                     type: string
 *                     description: Device user agent
 *                   platform:
 *                     type: string
 *                     description: Device platform
 *                   screenResolution:
 *                     type: string
 *                     description: Screen resolution
 *                   timezone:
 *                     type: string
 *                     description: Device timezone
 *                   language:
 *                     type: string
 *                     description: Device language
 *     responses:
 *       200:
 *         description: Device registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     deviceBinding:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         deviceId:
 *                           type: string
 *                         isPrimary:
 *                           type: boolean
 *                         isVerified:
 *                           type: boolean
 *       400:
 *         description: Invalid QR code
 *       404:
 *         description: Student not found
 *       500:
 *         description: Internal server error
 */
router.post('/register-device',
  sanitizeInput,
  validateDeviceBinding,
  registerDevice
);

export default router;