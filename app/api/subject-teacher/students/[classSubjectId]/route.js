import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"
import { validateSession } from "@/lib/auth"

export async function GET(request, { params }) {
  try {
    const sessionId = request.cookies.get("session")?.value
    const session = await validateSession(sessionId)

    if (!session || session.role !== "subject_teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { classSubjectId } = params

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

    // Get students with attendance
    const students = await executeQuery(
      `
      SELECT 
        s.id,
        u.name,
        st.roll_number,
        ss.is_backlog,
        COUNT(a.id) as totalClasses,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as presentDays,
        SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absentDays,
        ROUND(
          (SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) * 100.0) / 
          NULLIF(COUNT(a.id), 0), 2
        ) as percentage
      FROM student_subjects ss
      JOIN students st ON ss.student_id = st.id
      JOIN users u ON st.user_id = u.id
      LEFT JOIN attendance a ON ss.student_id = a.student_id AND ss.class_subject_id = a.class_subject_id
      WHERE ss.class_subject_id = ?
      GROUP BY s.id, u.name, st.roll_number, ss.is_backlog
      ORDER BY st.roll_number
    `,
      [classSubjectId],
    )

    return NextResponse.json({ students })
  } catch (error) {
    console.error("Get students error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
