const express = require("express")
const multer = require("multer")
const path = require("path")
const Attendance = require("../models/Attendance")
const AttendanceImage = require("../models/AttendanceImage")
const User = require("../models/User")
const { auth, authorize } = require("../middleware/auth")

const router = express.Router()

// Multer configuration for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Only image files are allowed"))
    }
  },
})

// Upload attendance image
router.post("/image-upload", auth, authorize("student"), upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" })
    }

    const { subjectId, classId } = req.body

    const attendanceImage = new AttendanceImage({
      filename: req.file.filename,
      originalName: req.file.originalname,
      student: req.user.id,
      subject: subjectId,
      class: classId,
      date: new Date(),
    })

    await attendanceImage.save()

    res.json({
      message: "Image uploaded successfully",
      imageId: attendanceImage._id,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

// Get student attendance
router.get("/student/:studentId", auth, async (req, res) => {
  try {
    const { studentId } = req.params

    // Check authorization
    if (req.user.role === "student" && req.user.id !== studentId) {
      return res.status(403).json({ message: "Access denied" })
    }

    const attendance = await Attendance.find({ student: studentId })
      .populate("subject", "name code")
      .populate("class", "name code")
      .sort({ date: -1 })

    res.json(attendance)
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

// Get class attendance
router.get("/class/:classId", auth, authorize("class_teacher", "admin"), async (req, res) => {
  try {
    const { classId } = req.params

    const attendance = await Attendance.find({ class: classId })
      .populate("student", "name studentId")
      .populate("subject", "name code")
      .sort({ date: -1 })

    res.json(attendance)
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

// Compile attendance
router.post("/compile", auth, authorize("class_teacher"), async (req, res) => {
  try {
    const { classId } = req.body
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - 15 * 24 * 60 * 60 * 1000) // 15 days ago

    const students = await User.find({ classId, role: "student" })
    const compiledData = []

    for (const student of students) {
      const totalClasses = await Attendance.countDocuments({
        class: classId,
        date: { $gte: startDate, $lte: endDate },
      })

      const attendedClasses = await Attendance.countDocuments({
        student: student._id,
        class: classId,
        status: "present",
        date: { $gte: startDate, $lte: endDate },
      })

      const percentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0

      compiledData.push({
        student: {
          id: student._id,
          name: student.name,
          studentId: student.studentId,
        },
        totalClasses,
        attendedClasses,
        percentage: Math.round(percentage * 100) / 100,
        status: percentage >= 75 ? "good" : percentage >= 60 ? "warning" : "critical",
      })
    }

    res.json({
      period: { startDate, endDate },
      compiledData,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
