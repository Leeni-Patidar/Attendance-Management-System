import express from 'express';
import { 
  scanQR, 
  getAttendanceHistory, 
  submitMissedClassReason,
  getDashboard,
  getAttendanceSummary
} from '../controllers/studentController.js';
import { 
  authenticateToken, 
  requireStudent, 
  checkDeviceBinding 
} from '../middleware/auth.js';
import { 
  validateQRScan, 
  validateMissedClass,
  validatePagination,
  validateDateRange,
  handleValidationErrors 
} from '../middleware/validation.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     QRScanRequest:
 *       type: object
 *       required:
 *         - qrData
 *       properties:
 *         qrData:
 *           type: string
 *           description: Encrypted QR code data
 *         deviceInfo:
 *           type: object
 *           properties:
 *             userAgent:
 *               type: string
 *             platform:
 *               type: string
 *         location:
 *           type: object
 *           properties:
 *             latitude:
 *               type: number
 *             longitude:
 *               type: number
 *         capturedImage:
 *           type: string
 *           description: Base64 encoded image (optional)
 *     
 *     AttendanceRecord:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         student:
 *           type: string
 *         session:
 *           $ref: '#/components/schemas/Session'
 *         status:
 *           type: string
 *           enum: [present, absent, late]
 *         method:
 *           type: string
 *           enum: [qr_scan, manual, missed]
 *         markedAt:
 *           type: string
 *           format: date-time
 *         markingDelay:
 *           type: number
 *           description: Delay in milliseconds from session start
 *     
 *     MissedClassRequest:
 *       type: object
 *       required:
 *         - sessionId
 *         - reason
 *       properties:
 *         sessionId:
 *           type: string
 *         reason:
 *           type: string
 *           minLength: 10
 *         supportingDocument:
 *           type: string
 *           description: URL to supporting document
 */

/**
 * @swagger
 * /api/students/scan-qr:
 *   post:
 *     summary: Scan QR code for attendance
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-Device-ID
 *         required: true
 *         schema:
 *           type: string
 *         description: Registered device ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QRScanRequest'
 *     responses:
 *       201:
 *         description: Attendance marked successfully
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
 *                     attendance:
 *                       $ref: '#/components/schemas/AttendanceRecord'
 *                     session:
 *                       type: object
 *                     markingDelay:
 *                       type: number
 *       400:
 *         description: Invalid QR code or validation error
 *       403:
 *         description: Device not registered
 *       409:
 *         description: Attendance already marked
 */
router.post('/scan-qr', 
  authenticateToken, 
  requireStudent, 
  checkDeviceBinding,
  validateQRScan,
  handleValidationErrors,
  scanQR
);

/**
 * @swagger
 * /api/students/attendance:
 *   get:
 *     summary: Get student's attendance history
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: subject
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [present, absent, late]
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: className
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attendance history retrieved successfully
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
 *                     attendanceRecords:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AttendanceRecord'
 *                     pagination:
 *                       type: object
 *                     stats:
 *                       type: object
 */
router.get('/attendance',
  authenticateToken,
  requireStudent,
  validatePagination,
  validateDateRange,
  handleValidationErrors,
  getAttendanceHistory
);

/**
 * @swagger
 * /api/students/missed-class:
 *   post:
 *     summary: Submit reason for missed class
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MissedClassRequest'
 *     responses:
 *       201:
 *         description: Missed class reason submitted successfully
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
 *                     attendance:
 *                       $ref: '#/components/schemas/AttendanceRecord'
 *                     submission:
 *                       type: object
 *       400:
 *         description: Validation error or active session
 *       404:
 *         description: Session not found
 */
router.post('/missed-class',
  authenticateToken,
  requireStudent,
  validateMissedClass,
  handleValidationErrors,
  submitMissedClassReason
);

/**
 * @swagger
 * /api/students/dashboard:
 *   get:
 *     summary: Get student dashboard data
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days to look back
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
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
 *                     student:
 *                       type: object
 *                     recentAttendance:
 *                       type: array
 *                     attendanceStats:
 *                       type: object
 *                     activeSessions:
 *                       type: array
 *                     deviceInfo:
 *                       type: object
 *                     timeframe:
 *                       type: number
 */
router.get('/dashboard',
  authenticateToken,
  requireStudent,
  getDashboard
);

/**
 * @swagger
 * /api/students/attendance/summary:
 *   get:
 *     summary: Get attendance summary by subject
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: academicYear
 *         schema:
 *           type: string
 *       - in: query
 *         name: semester
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attendance summary retrieved successfully
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
 *                     summary:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: Subject name
 *                           totalClasses:
 *                             type: number
 *                           present:
 *                             type: number
 *                           absent:
 *                             type: number
 *                           late:
 *                             type: number
 *                           attendancePercentage:
 *                             type: number
 *                     filters:
 *                       type: object
 */
router.get('/attendance/summary',
  authenticateToken,
  requireStudent,
  getAttendanceSummary
);

export default router;