import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"
import { validateSession } from "@/lib/auth"

export async function GET(request) {
  try {
    const sessionId = request.cookies.get("session")?.value
    const session = await validateSession(sessionId)

    if (!session || session.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get student info
    const students = await executeQuery("SELECT * FROM students WHERE user_id = ?", [session.user_id])

    if (students.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    const student = students[0]

    // Get student's subjects with attendance
    const subjects = await executeQuery(
      `
      SELECT 
        s.id,
        s.name as courseName,
        s.code as courseCode,
        COUNT(a.id) as totalClasses,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as presentDays,
        SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absentDays,
        ROUND(
          (SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) * 100.0) / 
          NULLIF(COUNT(a.id), 0), 2
        ) as attendance
      FROM student_subjects ss
      JOIN class_subjects cs ON ss.class_subject_id = cs.id
      JOIN subjects s ON cs.subject_id = s.id
      LEFT JOIN attendance a ON ss.student_id = a.student_id AND cs.id = a.class_subject_id
      WHERE ss.student_id = ?
      GROUP BY s.id, s.name, s.code
    `,
      [student.id],
    )

    return NextResponse.json({ subjects })
  } catch (error) {
    console.error("Get attendance error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
