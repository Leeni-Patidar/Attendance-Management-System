const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const cron = require("node-cron")
const fs = require("fs")
const path = require("path")
require("dotenv").config()

const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/users")
const classRoutes = require("./routes/classes")
const subjectRoutes = require("./routes/subjects")
const attendanceRoutes = require("./routes/attendance")
const qrRoutes = require("./routes/qr")

const app = express()

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Middleware
app.use(cors())
app.use(express.json())
app.use("/uploads", express.static("uploads"))

// Database connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:5000/attendance_system", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const db = mongoose.connection
db.on("error", console.error.bind(console, "MongoDB connection error:"))
db.once("open", () => {
  console.log("Connected to MongoDB")
})

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/classes", classRoutes)
app.use("/api/subjects", subjectRoutes)
app.use("/api/attendance", attendanceRoutes)
app.use("/api/qr", qrRoutes)

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" })
})

// Auto-delete images after 24 hours
cron.schedule("0 0 * * *", async () => {
  const AttendanceImage = require("./models/AttendanceImage")

  try {
    const expiredImages = await AttendanceImage.find({
      createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    })

    for (const image of expiredImages) {
      const filePath = path.join(__dirname, "uploads", image.filename)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
      await AttendanceImage.findByIdAndDelete(image._id)
    }

    console.log(`Deleted ${expiredImages.length} expired images`)
  } catch (error) {
    console.error("Error deleting expired images:", error)
  }
})

const PORT = process.env.PORT || 6001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
