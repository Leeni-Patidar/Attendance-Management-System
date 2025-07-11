import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { executeQuery } from "./database.js"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function hashPassword(password) {
  return await bcrypt.hash(password, 10)
}

export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword)
}

export function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "24h" },
  )
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export async function createSession(userId) {
  const sessionId = generateToken({ id: userId })
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  await executeQuery("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)", [sessionId, userId, expiresAt])

  return sessionId
}

export async function validateSession(sessionId) {
  const sessions = await executeQuery(
    "SELECT s.*, u.* FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.id = ? AND s.expires_at > NOW()",
    [sessionId],
  )

  return sessions[0] || null
}

export async function deleteSession(sessionId) {
  await executeQuery("DELETE FROM sessions WHERE id = ?", [sessionId])
}
