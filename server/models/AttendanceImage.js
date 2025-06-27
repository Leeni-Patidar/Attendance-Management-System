const mongoose = require("mongoose")

const attendanceImageSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    processed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

// Auto-delete after 24 hours
attendanceImageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 })

module.exports = mongoose.model("AttendanceImage", attendanceImageSchema)
