const express = require("express")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const { auth } = require("../middleware/auth")

const router = express.Router()

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email }).populate("classId subjects")
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || "fallback_secret", {
      expiresIn: "7d",
    })

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        classId: user.classId,
        subjects: user.subjects,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

// Get current user
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password").populate("classId subjects")
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
