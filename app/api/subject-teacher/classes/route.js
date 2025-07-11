import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"
import { validateSession } from "@/lib/auth"

export async function GET(request) {
  try {
    const sessionId = request.cookies.get("session")?.value
    const session = await validateSession(sessionId)

    if (!session || session.role !== "subject_teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get teacher info
    const teachers = await executeQuery("SELECT * FROM teachers WHERE user_id = ?", [session.user_id])

    if (teachers.length === 0) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 })
    }

    const teacher = teachers[0]

    // Get classes taught by this teacher
    const classes = await executeQuery(
      `
      SELECT 
        cs.id as class_subject_id,
        c.id as class_id,
        c.name as className,
        c.year,
        c.semester,
        c.section,
        s.name as subject,
        s.code as subjectCode,
        COUNT(DISTINCT ss.student_id) as students
      FROM class_subjects cs
      JOIN classes c ON cs.class_id = c.id
      JOIN subjects s ON cs.subject_id = s.id
      LEFT JOIN student_subjects ss ON cs.id = ss.class_subject_id
      WHERE cs.subject_teacher_id = ?
      GROUP BY cs.id, c.id, c.name, c.year, c.semester, c.section, s.name, s.code
    `,
      [teacher.id],
    )

    return NextResponse.json({ classes })
  } catch (error) {
    console.error("Get classes error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
