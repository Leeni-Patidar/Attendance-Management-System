import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"
import { validateSession } from "@/lib/auth"

export async function POST(request) {
  try {
    const sessionId = request.cookies.get("session")?.value
    const session = await validateSession(sessionId)

    if (!session || session.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { qrData } = await request.json()

    // Parse QR data
    let qrInfo
    try {
      qrInfo = JSON.parse(qrData)
    } catch (error) {
      return NextResponse.json({ error: "Invalid QR code format" }, { status: 400 })
    }

    // Validate QR code
    const qrCodes = await executeQuery(
      "SELECT * FROM qr_codes WHERE code = ? AND is_active = TRUE AND valid_until > NOW()",
      [qrInfo.code],
    )

    if (qrCodes.length === 0) {
      return NextResponse.json({ error: "QR code is invalid or expired" }, { status: 400 })
    }

    const qrCode = qrCodes[0]

    // Get student info
    const students = await executeQuery("SELECT * FROM students WHERE user_id = ?", [session.user_id])

    if (students.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    const student = students[0]

    // Check if student is enrolled in this subject
    const enrollments = await executeQuery(
      "SELECT * FROM student_subjects WHERE student_id = ? AND class_subject_id = ?",
      [student.id, qrCode.class_subject_id],
    )

    if (enrollments.length === 0) {
      return NextResponse.json({ error: "You are not enrolled in this subject" }, { status: 400 })
    }

    // Check if attendance already marked for today
    const today = new Date().toISOString().split("T")[0]
    const existingAttendance = await executeQuery(
      "SELECT * FROM attendance WHERE student_id = ? AND class_subject_id = ? AND date = ?",
      [student.id, qrCode.class_subject_id, today],
    )

    if (existingAttendance.length > 0) {
      return NextResponse.json({ error: "Attendance already marked for today" }, { status: 400 })
    }

    // Mark attendance
    await executeQuery(
      "INSERT INTO attendance (student_id, class_subject_id, date, status, qr_code_id) VALUES (?, ?, ?, ?, ?)",
      [student.id, qrCode.class_subject_id, today, "present", qrCode.id],
    )

    return NextResponse.json({
      success: true,
      message: "Attendance marked successfully",
    })
  } catch (error) {
    console.error("QR scan error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
