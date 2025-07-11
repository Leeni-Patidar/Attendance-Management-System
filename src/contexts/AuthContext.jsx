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

// Mock users for testing
const mockUsers = {
  "student@college.edu": {
    id: 1,
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
  "class.teacher@college.edu": {
    id: 2,
    email: "class.teacher@college.edu",
    password: "demo123",
    role: "class_teacher",
    name: "Dr. Sarah Johnson",
    teacherInfo: {
      employeeId: "EMP001",
      department: "Computer Science",
    },
  },
  "subject.teacher@college.edu": {
    id: 3,
    email: "subject.teacher@college.edu",
    password: "demo123",
    role: "subject_teacher",
    name: "Prof. Michael Chen",
    teacherInfo: {
      employeeId: "EMP002",
      department: "Computer Science",
    },
  },
  "admin@college.edu": {
    id: 4,
    email: "admin@college.edu",
    password: "demo123",
    role: "admin",
    name: "System Admin",
  },
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if user is logged in on app start
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
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const { email, password, userType } = credentials
      const mockUser = mockUsers[email]

      if (!mockUser || mockUser.password !== password || mockUser.role !== userType) {
        return { success: false, error: "Invalid credentials" }
      }

      // Remove password from user data
      const { password: _, ...userWithoutPassword } = mockUser

      setUser(userWithoutPassword)
      setIsAuthenticated(true)
      localStorage.setItem("userData", JSON.stringify(userWithoutPassword))

      // Determine redirect URL based on role
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setUser(null)
      setIsAuthenticated(false)
      localStorage.removeItem("userData")
      window.location.href = "/login"
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
