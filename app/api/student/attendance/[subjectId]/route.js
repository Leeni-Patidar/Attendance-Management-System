import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"
import { validateSession } from "@/lib/auth"

export async function GET(request, { params }) {
  try {
    const sessionId = request.cookies.get("session")?.value
    const session = await validateSession(sessionId)

    if (!session || session.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { subjectId } = params

    // Get student info
    const students = await executeQuery("SELECT * FROM students WHERE user_id = ?", [session.user_id])

    if (students.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    const student = students[0]

    // Get subject details
    const subjects = await executeQuery("SELECT * FROM subjects WHERE id = ?", [subjectId])

    if (subjects.length === 0) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 })
    }

    // Get attendance calendar data
    const attendanceData = await executeQuery(
      `
      SELECT 
        DATE_FORMAT(a.date, '%Y-%m-%d') as date,
        a.status
      FROM attendance a
      JOIN class_subjects cs ON a.class_subject_id = cs.id
      WHERE a.student_id = ? AND cs.subject_id = ?
      ORDER BY a.date DESC
    `,
      [student.id, subjectId],
    )

    // Convert to calendar format
    const calendar = {}
    attendanceData.forEach((record) => {
      calendar[record.date] = record.status
    })

    // Get summary
    const summary = await executeQuery(
      `
      SELECT 
        COUNT(a.id) as totalClasses,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as presentDays,
        SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absentDays,
        ROUND(
          (SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) * 100.0) / 
          NULLIF(COUNT(a.id), 0), 2
        ) as attendance
      FROM attendance a
      JOIN class_subjects cs ON a.class_subject_id = cs.id
      WHERE a.student_id = ? AND cs.subject_id = ?
    `,
      [student.id, subjectId],
    )

    return NextResponse.json({
      subject: subjects[0],
      calendar,
      summary: summary[0],
    })
  } catch (error) {
    console.error("Get subject attendance error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
