const express = require("express")
const Class = require("../models/Class")
const User = require("../models/User")
const { auth, authorize } = require("../middleware/auth")

const router = express.Router()

// Get all classes
router.get("/", auth, async (req, res) => {
  try {
    const classes = await Class.find()
      .populate("classTeacher", "name email")
      .populate("students", "name studentId email")
      .populate("subjects", "name code")
      .sort({ name: 1 })

    res.json(classes)
  } catch (error) {
    console.error("Error fetching classes:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get class by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params

    const classData = await Class.findById(id)
      .populate("classTeacher", "name email")
      .populate("students", "name studentId email")
      .populate("subjects", "name code")

    if (!classData) {
      return res.status(404).json({ message: "Class not found" })
    }

    res.json(classData)
  } catch (error) {
    console.error("Error fetching class:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create new class (Admin only)
router.post("/", auth, authorize("admin"), async (req, res) => {
  try {
    const { name, code, classTeacher, academicYear } = req.body

    // Check if class code already exists
    const existingClass = await Class.findOne({ code })
    if (existingClass) {
      return res.status(400).json({ message: "Class with this code already exists" })
    }

    const newClass = new Class({
      name,
      code,
      classTeacher,
      academicYear,
    })

    await newClass.save()

    const populatedClass = await Class.findById(newClass._id).populate("classTeacher", "name email")

    res.status(201).json({
      message: "Class created successfully",
      class: populatedClass,
    })
  } catch (error) {
    console.error("Error creating class:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update class
router.put("/:id", auth, authorize("admin"), async (req, res) => {
  try {
    const { id } = req.params
    const { name, code, classTeacher, academicYear } = req.body

    const classData = await Class.findById(id)
    if (!classData) {
      return res.status(404).json({ message: "Class not found" })
    }

    // Update fields
    if (name) classData.name = name
    if (code) classData.code = code
    if (classTeacher) classData.classTeacher = classTeacher
    if (academicYear) classData.academicYear = academicYear

    await classData.save()

    const updatedClass = await Class.findById(id)
      .populate("classTeacher", "name email")
      .populate("students", "name studentId email")
      .populate("subjects", "name code")

    res.json({
      message: "Class updated successfully",
      class: updatedClass,
    })
  } catch (error) {
    console.error("Error updating class:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete class (Admin only)
router.delete("/:id", auth, authorize("admin"), async (req, res) => {
  try {
    const { id } = req.params

    const classData = await Class.findById(id)
    if (!classData) {
      return res.status(404).json({ message: "Class not found" })
    }

    await Class.findByIdAndDelete(id)

    res.json({ message: "Class deleted successfully" })
  } catch (error) {
    console.error("Error deleting class:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Add student to class
router.post("/:id/students", auth, authorize("admin"), async (req, res) => {
  try {
    const { id } = req.params
    const { studentId } = req.body

    const classData = await Class.findById(id)
    if (!classData) {
      return res.status(404).json({ message: "Class not found" })
    }

    const student = await User.findById(studentId)
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" })
    }

    // Check if student is already in the class
    if (classData.students.includes(studentId)) {
      return res.status(400).json({ message: "Student is already in this class" })
    }

    classData.students.push(studentId)
    await classData.save()

    // Update student's classId
    student.classId = id
    await student.save()

    res.json({ message: "Student added to class successfully" })
  } catch (error) {
    console.error("Error adding student to class:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Remove student from class
router.delete("/:id/students/:studentId", auth, authorize("admin"), async (req, res) => {
  try {
    const { id, studentId } = req.params

    const classData = await Class.findById(id)
    if (!classData) {
      return res.status(404).json({ message: "Class not found" })
    }

    classData.students = classData.students.filter((student) => student.toString() !== studentId)
    await classData.save()

    // Remove classId from student
    await User.findByIdAndUpdate(studentId, { $unset: { classId: 1 } })

    res.json({ message: "Student removed from class successfully" })
  } catch (error) {
    console.error("Error removing student from class:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
