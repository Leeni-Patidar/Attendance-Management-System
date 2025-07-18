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

// ✅ Mock users using loginId (ID-based login)
const mockUsers = [
  {
    id: 1,
    loginId: "student001",
    email: "student@college.edu",
    password: "demo123",
    role: "student",
    name: "John Doe",
    studentInfo: {
      rollNumber: "CS21B001",
      class: "CS 3rd Year - Section A",
      year: "3rd Year",
      semester: "6th Semester",
      branch: "Computer Science & Engineering",
      program: "B.Tech Computer Science",
    },
  },
  {
    id: 2,
    loginId: "classteach01",
    email: "class.teacher@college.edu",
    password: "demo123",
    role: "class_teacher",
    name: "Dr. Sarah Johnson",
    teacherInfo: {
      employeeId: "EMP001",
      department: "Computer Science",
    },
  },
  {
    id: 3,
    loginId: "subjectteach01",
    email: "subject.teacher@college.edu",
    password: "demo123",
    role: "subject_teacher",
    name: "Prof. Michael Chen",
    teacherInfo: {
      employeeId: "EMP002",
      department: "Computer Science",
    },
  },
  {
    id: 4,
    loginId: "admin01",
    email: "admin@college.edu",
    password: "demo123",
    role: "admin",
    name: "Admin",
  },
]

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const userData = localStorage.getItem("userData")
      if (userData) {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate delay

      const { id, password, userType } = credentials

      // ✅ Find user by loginId and role
      const mockUser = mockUsers.find(
        (u) => u.loginId === id && u.role === userType
      )

      if (!mockUser || mockUser.password !== password) {
        return { success: false, error: "Invalid credentials" }
      }

      const { password: _, ...userWithoutPassword } = mockUser

      setUser(userWithoutPassword)
      setIsAuthenticated(true)
      localStorage.setItem("userData", JSON.stringify(userWithoutPassword))

      const redirectUrls = {
        student: "/student/dashboard",
        class_teacher: "/class-teacher/dashboard",
        subject_teacher: "/subject-teacher/dashboard",
        admin: "/admin/dashboard",
      }

      return {
        success: true,
        redirectUrl: redirectUrls[userType] || "/dashboard",
        user: userWithoutPassword,
      }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "Network error occurred" }
    }
  }

  const logout = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setUser(null)
      setIsAuthenticated(false)
      localStorage.removeItem("userData")
      window.location.href = "/"
    }
  }

  const updateUser = (userData) => {
    setUser(userData)
    localStorage.setItem("userData", JSON.stringify(userData))
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
