import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"
import { validateSession } from "@/lib/auth"

export async function GET(request) {
  try {
    const sessionId = request.cookies.get("session")?.value
    const session = await validateSession(sessionId)

    if (!session || session.role !== "class_teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get teacher info
    const teachers = await executeQuery("SELECT * FROM teachers WHERE user_id = ?", [session.user_id])

    if (teachers.length === 0) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 })
    }

    const teacher = teachers[0]

    // Get assigned class
    const classes = await executeQuery("SELECT * FROM classes WHERE class_teacher_id = ?", [teacher.id])

    if (classes.length === 0) {
      return NextResponse.json({ error: "No class assigned" }, { status: 404 })
    }

    const assignedClass = classes[0]

    // Get students with attendance across all subjects
    const students = await executeQuery(
      `
      SELECT 
        st.id,
        u.name,
        st.roll_number,
        GROUP_CONCAT(
          CONCAT(s.name, ':', 
            COALESCE(SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END), 0), '/',
            COALESCE(SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END), 0), '/',
            COALESCE(ROUND((SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) * 100.0) / 
              NULLIF(COUNT(a.id), 0), 2), 0)
          ) SEPARATOR '|'
        ) as subjects_attendance
      FROM students st
      JOIN users u ON st.user_id = u.id
      LEFT JOIN student_subjects ss ON st.id = ss.student_id
      LEFT JOIN class_subjects cs ON ss.class_subject_id = cs.id
      LEFT JOIN subjects s ON cs.subject_id = s.id
      LEFT JOIN attendance a ON ss.student_id = a.student_id AND cs.id = a.class_subject_id
      WHERE st.class_id = ?
      GROUP BY st.id, u.name, st.roll_number
      ORDER BY st.roll_number
    `,
      [assignedClass.id],
    )

    // Get subjects for the class
    const subjects = await executeQuery(
      `
      SELECT s.name, s.code, u.name as teacher_name
      FROM class_subjects cs
      JOIN subjects s ON cs.subject_id = s.id
      JOIN teachers t ON cs.subject_teacher_id = t.id
      JOIN users u ON t.user_id = u.id
      WHERE cs.class_id = ?
    `,
      [assignedClass.id],
    )

    return NextResponse.json({
      students: students.map((student) => {
        const subjectsData = {}
        if (student.subjects_attendance) {
          student.subjects_attendance.split("|").forEach((subjectData) => {
            const [name, present, absent, percentage] = subjectData.split(":")
            subjectsData[name] = {
              present: Number.parseInt(present) || 0,
              absent: Number.parseInt(absent) || 0,
              percentage: Number.parseFloat(percentage) || 0,
            }
          })
        }
        return {
          ...student,
          subjects: subjectsData,
        }
      }),
      subjects,
      class: assignedClass,
    })
  } catch (error) {
    console.error("Get students error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
