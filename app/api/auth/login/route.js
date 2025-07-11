import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"
import { verifyPassword, createSession } from "@/lib/auth"

export async function POST(request) {
  try {
    const { email, password, userType } = await request.json()

    // Get user from database
    const users = await executeQuery("SELECT * FROM users WHERE email = ? AND role = ? AND is_active = TRUE", [
      email,
      userType,
    ])

    if (users.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const user = users[0]

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create session
    const sessionId = await createSession(user.id)

    // Get additional user data based on role
    const userData = { ...user }
    delete userData.password

    if (user.role === "student") {
      const students = await executeQuery(
        `SELECT s.*, c.name as class_name 
         FROM students s 
         LEFT JOIN classes c ON s.class_id = c.id 
         WHERE s.user_id = ?`,
        [user.id],
      )
      userData.studentInfo = students[0]
    } else if (user.role === "class_teacher" || user.role === "subject_teacher") {
      const teachers = await executeQuery("SELECT * FROM teachers WHERE user_id = ?", [user.id])
      userData.teacherInfo = teachers[0]
    }

    const response = NextResponse.json({
      success: true,
      user: userData,
      redirectUrl: `/${user.role.replace("_", "-")}/login`,
    })

    // Set session cookie
    response.cookies.set("session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
