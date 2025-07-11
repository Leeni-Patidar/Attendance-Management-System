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

    const { requestType, requestData } = await request.json()

    // Get student info
    const students = await executeQuery("SELECT * FROM students WHERE user_id = ?", [session.user_id])

    if (students.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    const student = students[0]

    // Create request
    await executeQuery("INSERT INTO student_requests (student_id, request_type, request_data) VALUES (?, ?, ?)", [
      student.id,
      requestType,
      JSON.stringify(requestData),
    ])

    return NextResponse.json({
      success: true,
      message: "Request submitted successfully",
    })
  } catch (error) {
    console.error("Create request error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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

    // Get student requests
    const requests = await executeQuery(
      "SELECT * FROM student_requests WHERE student_id = ? ORDER BY requested_at DESC",
      [student.id],
    )

    return NextResponse.json({ requests })
  } catch (error) {
    console.error("Get requests error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
