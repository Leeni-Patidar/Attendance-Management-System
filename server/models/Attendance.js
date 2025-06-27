const mongoose = require("mongoose")

const attendanceSchema = new mongoose.Schema(
  {
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
    status: {
      type: String,
      enum: ["present", "absent", "late"],
      default: "present",
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    method: {
      type: String,
      enum: ["qr_scan", "manual", "image_upload"],
      required: true,
    },
    qrCodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QRCode",
    },
    imageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AttendanceImage",
    },
  },
  {
    timestamps: true,
  },
)

attendanceSchema.index({ student: 1, subject: 1, date: 1 }, { unique: true })

module.exports = mongoose.model("Attendance", attendanceSchema)
