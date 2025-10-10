const QRCode = require('qrcode');
const { QRSession, Subject, Class, User, Log } = require('../models');
const asyncHandler = fn => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next);
const crypto = require('crypto');

exports.generateQR = asyncHandler(async (req, res) => {
  const { subjectId, classId, validSeconds = 120 } = req.body;
  const teacherId = req.user.id;
  if (!subjectId) return res.status(400).json({ message: 'subjectId required' });
  const code = crypto.randomBytes(16).toString('hex');
  const validTill = new Date(Date.now() + validSeconds*1000);
  const qr = await QRSession.create({ subject: subjectId, class: classId, teacher: teacherId, code, validTill });
  const data = JSON.stringify({ qrId: qr._id, code });
  const qrDataUrl = await QRCode.toDataURL(data);
  await Log.create({ action: 'qr_generated', user: teacherId, meta: { qrId: qr._id } });
  res.json({ qr: qrDataUrl, qrId: qr._id, code, validTill });
});

exports.scanQR = asyncHandler(async (req, res) => {
  const { data } = req.body; // expecting JSON string with qrId and code
  const studentId = req.user.id;
  if (!data) return res.status(400).json({ message: 'qr data required' });
  let parsed;
  try { parsed = JSON.parse(data); } catch(e) { return res.status(400).json({ message: 'invalid qr data' }); }
  const qr = await QRSession.findById(parsed.qrId);
  if (!qr) return res.status(404).json({ message: 'QR session not found' });
  if (qr.code !== parsed.code) return res.status(400).json({ message: 'Invalid QR code' });
  if (qr.validTill < new Date()) return res.status(400).json({ message: 'QR expired' });
  // All good - create attendance
  const Attendance = require('../models').Attendance;
  const existing = await Attendance.findOne({ student: studentId, subject: qr.subject, date: { $gte: new Date(new Date().setHours(0,0,0,0)) } });
  if (existing) return res.status(400).json({ message: 'Already marked for today' });
  const att = await Attendance.create({ student: studentId, subject: qr.subject, class: qr.class, status: 'present', method: 'scan', markedBy: qr.teacher });
  await Log.create({ action: 'qr_scanned', user: studentId, meta: { qrId: qr._id, attendanceId: att._id } });
  res.json({ message: 'Attendance marked', attendance: att });
});