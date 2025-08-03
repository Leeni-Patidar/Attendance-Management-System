import express from 'express';
import { 
  generateQR, 
  getSessions, 
  getSessionAttendance,
  manualOverride,
  exportAttendanceCSV,
  updateSession,
  getDashboard
} from '../controllers/facultyController.js';
import { 
  authenticateToken, 
  requireFaculty 
} from '../middleware/auth.js';
import { 
  validateSessionCreation, 
  validateAttendanceOverride,
  validatePagination,
  validateDateRange,
  handleValidationErrors 
} from '../middleware/validation.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     SessionRequest:
 *       type: object
 *       required:
 *         - subject
 *         - className
 *         - topic
 *       properties:
 *         subject:
 *           type: string
 *           description: Subject/course name
 *         className:
 *           type: string
 *           description: Class name or section
 *         topic:
 *           type: string
 *           description: Topic of the class
 *         validityDuration:
 *           type: integer
 *           default: 5
 *           description: QR validity duration in minutes
 *     
 *     Session:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         faculty:
 *           type: string
 *         subject:
 *           type: string
 *         className:
 *           type: string
 *         topic:
 *           type: string
 *         startTime:
 *           type: string
 *           format: date-time
 *         endTime:
 *           type: string
 *           format: date-time
 *         validityDuration:
 *           type: number
 *         status:
 *           type: string
 *           enum: [active, completed, cancelled]
 *         qrToken:
 *           type: string
 *         qrCodeImage:
 *           type: string
 *           description: Base64 QR code image
 *     
 *     AttendanceOverrideRequest:
 *       type: object
 *       required:
 *         - sessionId
 *         - studentId
 *         - newStatus
 *         - reason
 *       properties:
 *         sessionId:
 *           type: string
 *         studentId:
 *           type: string
 *         newStatus:
 *           type: string
 *           enum: [present, absent, late]
 *         reason:
 *           type: string
 *           minLength: 10
 *         evidence:
 *           type: string
 *           description: Supporting evidence or document URL
 */

/**
 * @swagger
 * /api/faculty/generate-qr:
 *   post:
 *     summary: Generate QR code for attendance session
 *     tags: [Faculty]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SessionRequest'
 *     responses:
 *       201:
 *         description: QR code generated successfully
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
 *                     session:
 *                       $ref: '#/components/schemas/Session'
 *                     qrCode:
 *                       type: object
 *                       properties:
 *                         token:
 *                           type: string
 *                         image:
 *                           type: string
 *                         validUntil:
 *                           type: string
 *                           format: date-time
 *                     scanUrl:
 *                       type: string
 *       400:
 *         description: Validation error
 */
router.post('/generate-qr',
  authenticateToken,
  requireFaculty,
  validateSessionCreation,
  handleValidationErrors,
  generateQR
);

/**
 * @swagger
 * /api/faculty/sessions:
 *   get:
 *     summary: Get faculty's sessions
 *     tags: [Faculty]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, cancelled]
 *       - in: query
 *         name: subject
 *         schema:
 *           type: string
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
 *     responses:
 *       200:
 *         description: Sessions retrieved successfully
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
 *                     sessions:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/Session'
 *                           - type: object
 *                             properties:
 *                               attendanceStats:
 *                                 type: object
 *                     pagination:
 *                       type: object
 */
router.get('/sessions',
  authenticateToken,
  requireFaculty,
  validatePagination,
  validateDateRange,
  handleValidationErrors,
  getSessions
);

/**
 * @swagger
 * /api/faculty/sessions/{sessionId}/attendance:
 *   get:
 *     summary: Get real-time attendance for a session
 *     tags: [Faculty]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session attendance retrieved successfully
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
 *                     session:
 *                       $ref: '#/components/schemas/Session'
 *                     attendanceRecords:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AttendanceRecord'
 *                     attendanceStats:
 *                       type: object
 *                     absentStudents:
 *                       type: array
 *       404:
 *         description: Session not found or unauthorized
 */
router.get('/sessions/:sessionId/attendance',
  authenticateToken,
  requireFaculty,
  getSessionAttendance
);

/**
 * @swagger
 * /api/faculty/manual-override:
 *   post:
 *     summary: Manual attendance override
 *     tags: [Faculty]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AttendanceOverrideRequest'
 *     responses:
 *       201:
 *         description: Attendance override completed successfully
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
 *                     overrideLog:
 *                       type: object
 *                     limits:
 *                       type: object
 *       404:
 *         description: Session not found or unauthorized
 *       429:
 *         description: Override limit reached
 */
router.post('/manual-override',
  authenticateToken,
  requireFaculty,
  validateAttendanceOverride,
  handleValidationErrors,
  manualOverride
);

/**
 * @swagger
 * /api/faculty/export-csv/{sessionId}:
 *   get:
 *     summary: Export attendance as CSV
 *     tags: [Faculty]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: CSV file download
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Session not found or unauthorized
 */
router.get('/export-csv/:sessionId',
  authenticateToken,
  requireFaculty,
  exportAttendanceCSV
);

/**
 * @swagger
 * /api/faculty/sessions/{sessionId}:
 *   put:
 *     summary: Update session details
 *     tags: [Faculty]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               topic:
 *                 type: string
 *               validityDuration:
 *                 type: integer
 *                 description: Duration in minutes (only for active sessions)
 *               status:
 *                 type: string
 *                 enum: [active, completed, cancelled]
 *     responses:
 *       200:
 *         description: Session updated successfully
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
 *                     session:
 *                       $ref: '#/components/schemas/Session'
 *       404:
 *         description: Session not found or unauthorized
 */
router.put('/sessions/:sessionId',
  authenticateToken,
  requireFaculty,
  updateSession
);

/**
 * @swagger
 * /api/faculty/dashboard:
 *   get:
 *     summary: Get faculty dashboard data
 *     tags: [Faculty]
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
 *                     faculty:
 *                       type: object
 *                     recentSessions:
 *                       type: array
 *                     sessionStats:
 *                       type: object
 *                     recentOverrides:
 *                       type: array
 *                     subjects:
 *                       type: array
 *                     timeframe:
 *                       type: number
 */
router.get('/dashboard',
  authenticateToken,
  requireFaculty,
  getDashboard
);

export default router;