import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"
import { validateSession } from "@/lib/auth"

export async function POST(request) {
  try {
    const sessionId = request.cookies.get("session")?.value
    const session = await validateSession(sessionId)

    if (!session || session.role !== "subject_teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { classSubjectId, sessionType, duration } = await request.json()

    // Get teacher info
    const teachers = await executeQuery("SELECT * FROM teachers WHERE user_id = ?", [session.user_id])

    if (teachers.length === 0) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 })
    }

    const teacher = teachers[0]

    // Verify teacher teaches this subject
    const classSubjects = await executeQuery("SELECT * FROM class_subjects WHERE id = ? AND subject_teacher_id = ?", [
      classSubjectId,
      teacher.id,
    ])

    if (classSubjects.length === 0) {
      return NextResponse.json({ error: "Unauthorized for this subject" }, { status: 403 })
    }

    // Generate QR code
    const code = `ATT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const validUntil = new Date(Date.now() + (duration || 10) * 60 * 1000)

    const qrData = {
      type: "ATTENDANCE",
      classSubjectId,
      teacherId: teacher.id,
      timestamp: Date.now(),
      validUntil: validUntil.getTime(),
      sessionType: sessionType || "lecture",
      code,
    }

    await executeQuery(
      "INSERT INTO qr_codes (code, teacher_id, class_subject_id, session_type, valid_until, qr_data) VALUES (?, ?, ?, ?, ?, ?)",
      [code, teacher.id, classSubjectId, sessionType || "lecture", validUntil, JSON.stringify(qrData)],
    )

    return NextResponse.json({
      success: true,
      qrCode: {
        code,
        data: JSON.stringify(qrData),
        validUntil,
        sessionType: sessionType || "lecture",
      },
    })
  } catch (error) {
    console.error("Generate QR error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
