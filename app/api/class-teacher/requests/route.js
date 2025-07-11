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

    // Get pending requests from students in assigned class
    const requests = await executeQuery(
      `
      SELECT 
        sr.*,
        u.name as student_name,
        st.roll_number
      FROM student_requests sr
      JOIN students st ON sr.student_id = st.id
      JOIN users u ON st.user_id = u.id
      WHERE st.class_id = ? AND sr.status = 'pending'
      ORDER BY sr.requested_at DESC
    `,
      [assignedClass.id],
    )

    return NextResponse.json({ requests })
  } catch (error) {
    console.error("Get requests error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const sessionId = request.cookies.get("session")?.value
    const session = await validateSession(sessionId)

    if (!session || session.role !== "class_teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { requestId, status, reviewNotes } = await request.json()

    // Get teacher info
    const teachers = await executeQuery("SELECT * FROM teachers WHERE user_id = ?", [session.user_id])

    if (teachers.length === 0) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 })
    }

    const teacher = teachers[0]

    // Update request
    await executeQuery(
      "UPDATE student_requests SET status = ?, reviewed_by_teacher_id = ?, reviewed_at = NOW(), review_notes = ? WHERE id = ?",
      [status, teacher.id, reviewNotes, requestId],
    )

    return NextResponse.json({
      success: true,
      message: "Request updated successfully",
    })
  } catch (error) {
    console.error("Update request error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
