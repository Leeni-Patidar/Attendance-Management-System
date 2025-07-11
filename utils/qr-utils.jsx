export const QR_CODE_TYPES = {
  ATTENDANCE: "ATTENDANCE",
  EXAM: "EXAM",
  LAB: "LAB",
}

export const SESSION_TYPES = {
  LECTURE: "lecture",
  LAB: "lab",
  TUTORIAL: "tutorial",
  EXAM: "exam",
  SEMINAR: "seminar",
}

export const validateQRCode = (qrData) => {
  try {
    const data = typeof qrData === "string" ? JSON.parse(qrData) : qrData

    const requiredFields = ["type", "classId", "teacherId", "timestamp", "validUntil"]
    const hasAllFields = requiredFields.every((field) => data.hasOwnProperty(field))

    if (!hasAllFields) {
      return { valid: false, error: "Missing required fields" }
    }

    const now = Date.now()
    if (data.validUntil < now) {
      return { valid: false, error: "QR code has expired" }
    }

    if (data.timestamp > now) {
      return { valid: false, error: "Invalid timestamp" }
    }

    return { valid: true, data }
  } catch (error) {
    return { valid: false, error: "Invalid QR code format" }
  }
}

export const formatQRCodeData = (qrCode) => {
  return {
    code: qrCode.code,
    subject: qrCode.subject,
    sessionType: qrCode.sessionType,
    validUntil: new Date(qrCode.validUntil).toLocaleString(),
    timeRemaining: Math.max(0, Math.floor((qrCode.validUntil - Date.now()) / 1000)),
  }
}

export const generateQRCodeFileName = (qrCode) => {
  const date = new Date().toISOString().split("T")[0]
  const subject = qrCode.subject.replace(/\s+/g, "-").toLowerCase()
  return `attendance-qr-${subject}-${date}-${qrCode.code}.png`
}
