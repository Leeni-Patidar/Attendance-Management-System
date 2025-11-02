"use client"

import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Helper: decode JWT payload (safe)
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (err) {
    return null
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        const decoded = parseJwt(token)
        if (decoded) {
          const role = decoded?.user?.role || decoded?.role
          const id = decoded?.user?.id || decoded?.id
          const email = decoded?.user?.email || decoded?.email || null
          setUser({ id, role, email })
          setIsAuthenticated(true)
        } else {
          localStorage.removeItem('token')
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async ({ email, password, userType }) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"
      // Map frontend userType to backend role strings
      const mapRole = (t) => {
        if (!t) return null
        const s = String(t).toLowerCase()
        if (s === 'student') return 'Student'
        if (s === 'admin') return 'Admin'
        if (s.includes('teacher')) return 'Teacher'
        return null
      }

      const roleToSend = mapRole(userType)

      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: roleToSend }),
      })

      if (!res.ok) {
        const text = await res.text().catch(() => "")
        const err = text ? JSON.parse(text) : { message: "Invalid credentials" }
        return { success: false, error: err.message || "Invalid credentials" }
      }

      const data = await res.json()
      const token = data.token
      if (!token) return { success: false, error: "Invalid token from server" }

      localStorage.setItem("token", token)

  const decoded = parseJwt(token)
  const decodedRole = decoded?.user?.role || decoded?.role || null
  const id = decoded?.user?.id || decoded?.id || null
  const emailFromToken = decoded?.user?.email || email || null

  const userObj = { id, role: decodedRole, email: emailFromToken }
      setUser(userObj)
      setIsAuthenticated(true)

      const redirectUrls = {
        student: "/student/dashboard",
        class_teacher: "/class-teacher/dashboard",
        subject_teacher: "/subject-teacher/dashboard",
        admin: "/admin/dashboard",
        Student: "/student/dashboard",
        Teacher: "/subject-teacher/dashboard",
        Admin: "/admin/dashboard",
      }

      return {
        success: true,
        redirectUrl: redirectUrls[role] || "/dashboard",
        user: userObj,
      }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "Network error occurred" }
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
    setIsAuthenticated(false)
    window.location.href = "/"
  }

  const updateUser = (userData) => setUser(userData)

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, loading, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}
