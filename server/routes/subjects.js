const express = require("express")
const Subject = require("../models/Subject")
const { auth, authorize } = require("../middleware/auth")

const router = express.Router()

// Get all subjects
router.get("/", auth, async (req, res) => {
  try {
    const subjects = await Subject.find()
      .populate("teacher", "name email")
      .populate("classes", "name code")
      .sort({ name: 1 })

    res.json(subjects)
  } catch (error) {
    console.error("Error fetching subjects:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get subject by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params

    const subject = await Subject.findById(id).populate("teacher", "name email").populate("classes", "name code")

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" })
    }

    res.json(subject)
  } catch (error) {
    console.error("Error fetching subject:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create new subject (Admin only)
router.post("/", auth, authorize("admin"), async (req, res) => {
  try {
    const { name, code, teacher, classes } = req.body

    // Check if subject code already exists
    const existingSubject = await Subject.findOne({ code })
    if (existingSubject) {
      return res.status(400).json({ message: "Subject with this code already exists" })
    }

    const newSubject = new Subject({
      name,
      code,
      teacher,
      classes: classes || [],
    })

    await newSubject.save()

    const populatedSubject = await Subject.findById(newSubject._id)
      .populate("teacher", "name email")
      .populate("classes", "name code")

    res.status(201).json({
      message: "Subject created successfully",
      subject: populatedSubject,
    })
  } catch (error) {
    console.error("Error creating subject:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update subject
router.put("/:id", auth, authorize("admin"), async (req, res) => {
  try {
    const { id } = req.params
    const { name, code, teacher, classes, totalClasses } = req.body

    const subject = await Subject.findById(id)
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" })
    }

    // Update fields
    if (name) subject.name = name
    if (code) subject.code = code
    if (teacher) subject.teacher = teacher
    if (classes) subject.classes = classes
    if (totalClasses !== undefined) subject.totalClasses = totalClasses

    await subject.save()

    const updatedSubject = await Subject.findById(id).populate("teacher", "name email").populate("classes", "name code")

    res.json({
      message: "Subject updated successfully",
      subject: updatedSubject,
    })
  } catch (error) {
    console.error("Error updating subject:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete subject (Admin only)
router.delete("/:id", auth, authorize("admin"), async (req, res) => {
  try {
    const { id } = req.params

    const subject = await Subject.findById(id)
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" })
    }

    await Subject.findByIdAndDelete(id)

    res.json({ message: "Subject deleted successfully" })
  } catch (error) {
    console.error("Error deleting subject:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get subjects by teacher
router.get("/teacher/:teacherId", auth, async (req, res) => {
  try {
    const { teacherId } = req.params

    const subjects = await Subject.find({ teacher: teacherId }).populate("classes", "name code").sort({ name: 1 })

    res.json(subjects)
  } catch (error) {
    console.error("Error fetching subjects by teacher:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
