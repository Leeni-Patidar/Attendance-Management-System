const express = require("express")
const QRCode = require("qrcode")
const { v4: uuidv4 } = require("uuid")
const QRCodeModel = require("../models/QRCode")
const Attendance = require("../models/Attendance")
const { auth, authorize } = require("../middleware/auth")

const router = express.Router()

// Generate QR Code
router.post("/generate", auth, authorize("subject_teacher"), async (req, res) => {
  try {
    const { subjectId, classId } = req.body

    const code = uuidv4()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    const qrCodeDoc = new QRCodeModel({
      code,
      subject: subjectId,
      class: classId,
      teacher: req.user.id,
      expiresAt,
    })

    await qrCodeDoc.save()

    const qrCodeData = JSON.stringify({
      code,
      subjectId,
      classId,
      timestamp: Date.now(),
    })

    const qrCodeImage = await QRCode.toDataURL(qrCodeData)

    res.json({
      qrCode: qrCodeImage,
      code,
      expiresAt,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

// Scan QR Code
router.post("/scan", auth, authorize("student"), async (req, res) => {
  try {
    const { qrData } = req.body

    let parsedData
    try {
      parsedData = JSON.parse(qrData)
    } catch {
      return res.status(400).json({ message: "Invalid QR code format" })
    }

    const { code, subjectId, classId } = parsedData

    const qrCodeDoc = await QRCodeModel.findOne({
      code,
      subject: subjectId,
      class: classId,
      isActive: true,
      expiresAt: { $gt: new Date() },
    })

    if (!qrCodeDoc) {
      return res.status(400).json({ message: "QR code is invalid or expired" })
    }

    // Check if student already scanned
    const alreadyScanned = qrCodeDoc.scannedBy.some((scan) => scan.student.toString() === req.user.id)

    if (alreadyScanned) {
      return res.status(400).json({ message: "Attendance already marked" })
    }

    // Mark attendance
    const attendance = new Attendance({
      student: req.user.id,
      subject: subjectId,
      class: classId,
      date: new Date().toDateString(),
      status: "present",
      markedBy: req.user.id,
      method: "qr_scan",
      qrCodeId: qrCodeDoc._id,
    })

    await attendance.save()

    // Add to scanned list
    qrCodeDoc.scannedBy.push({
      student: req.user.id,
      scannedAt: new Date(),
    })
    await qrCodeDoc.save()

    res.json({ message: "Attendance marked successfully" })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Attendance already marked for today" })
    }
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
