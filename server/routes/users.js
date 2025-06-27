const express = require("express")
const User = require("../models/User")
const { auth, authorize } = require("../middleware/auth")

const router = express.Router()

// Get all users (Admin only)
router.get("/", auth, authorize("admin"), async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .populate("classId", "name code")
      .populate("subjects", "name code")
      .sort({ createdAt: -1 })

    res.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get user by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params

    // Check authorization - users can only access their own data unless admin
    if (req.user.role !== "admin" && req.user.id !== id) {
      return res.status(403).json({ message: "Access denied" })
    }

    const user = await User.findById(id)
      .select("-password")
      .populate("classId", "name code")
      .populate("subjects", "name code")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create new user (Admin only)
router.post("/", auth, authorize("admin"), async (req, res) => {
  try {
    const { name, email, password, role, studentId, classId, subjects } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" })
    }

    // Create user data object
    const userData = {
      name,
      email,
      password,
      role,
    }

    // Add optional fields based on role
    if (role === "student" && studentId) {
      userData.studentId = studentId
    }
    if (classId) {
      userData.classId = classId
    }
    if (subjects && subjects.length > 0) {
      userData.subjects = subjects
    }

    const user = new User(userData)
    await user.save()

    // Return user without password
    const userResponse = await User.findById(user._id)
      .select("-password")
      .populate("classId", "name code")
      .populate("subjects", "name code")

    res.status(201).json({
      message: "User created successfully",
      user: userResponse,
    })
  } catch (error) {
    console.error("Error creating user:", error)
    if (error.code === 11000) {
      return res.status(400).json({ message: "User with this email or student ID already exists" })
    }
    res.status(500).json({ message: "Server error" })
  }
})

// Update user (Admin or own profile)
router.put("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params
    const { name, email, role, studentId, classId, subjects, isActive } = req.body

    // Check authorization
    if (req.user.role !== "admin" && req.user.id !== id) {
      return res.status(403).json({ message: "Access denied" })
    }

    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Update fields
    if (name) user.name = name
    if (email) user.email = email

    // Only admin can change role and active status
    if (req.user.role === "admin") {
      if (role) user.role = role
      if (typeof isActive === "boolean") user.isActive = isActive
    }

    if (studentId) user.studentId = studentId
    if (classId) user.classId = classId
    if (subjects) user.subjects = subjects

    await user.save()

    // Return updated user without password
    const updatedUser = await User.findById(id)
      .select("-password")
      .populate("classId", "name code")
      .populate("subjects", "name code")

    res.json({
      message: "User updated successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Error updating user:", error)
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email or student ID already exists" })
    }
    res.status(500).json({ message: "Server error" })
  }
})

// Delete user (Admin only)
router.delete("/:id", auth, authorize("admin"), async (req, res) => {
  try {
    const { id } = req.params

    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    await User.findByIdAndDelete(id)

    res.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
