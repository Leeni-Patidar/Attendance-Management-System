"use client"

import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Navigate } from "react-router-dom"

const LoginPage = () => {
  const { login, isAuthenticated, user } = useAuth()
  const [userType, setUserType] = useState("")
  const [credentials, setCredentials] = useState({ id: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  if (isAuthenticated) {
    let redirectUrl = "/login"
    if (user?.role === "student") redirectUrl = "/student/dashboard"
    else if (user?.role === "class_teacher") redirectUrl = "/class-teacher/dashboard"
    else if (user?.role === "subject_teacher") redirectUrl = "/subject-teacher/dashboard"
    else if (user?.role === "admin") redirectUrl = "/admin/dashboard"
    return <Navigate to={redirectUrl} replace />
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await login({
      id: credentials.id,
      password: credentials.password,
      userType: userType,
    })

    if (result.success) {
      window.location.href = result.redirectUrl
    } else {
      setError(result.error || "Login failed")
    }

    setLoading(false)
  }

  const fillDemoCredentials = (role) => {
    const demoCredentials = {
      student: { id: "student001", password: "demo123" },
      class_teacher: { id: "classteach01", password: "demo123" },
      subject_teacher: { id: "subjectteach01", password: "demo123" },
      admin: { id: "admin01", password: "demo123" },
    }

    setUserType(role)
    setCredentials(demoCredentials[role])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">College Attendance System</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

          <div>
            <label htmlFor="userType" className="block text-sm font-medium text-gray-700 mb-1">
              User Type
            </label>
            <select
              id="userType"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select your role</option>
              <option value="student">Student</option>
              <option value="class_teacher">Class Teacher</option>
              <option value="subject_teacher">Subject Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-1">
              ID
            </label>
            <input
              id="id"
              type="text"
              placeholder="Enter your ID"
              value={credentials.id}
              onChange={(e) => setCredentials({ ...credentials, id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={!userType || !credentials.id || !credentials.password || loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <div className="mt-6 space-y-2">
            <p className="text-center text-sm font-medium text-gray-700">Demo Credentials:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemoCredentials("student")}
                className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200"
              >
                Student Demo
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials("class_teacher")}
                className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200"
              >
                Class Teacher
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials("subject_teacher")}
                className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded hover:bg-purple-200"
              >
                Subject Teacher
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials("admin")}
                className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200"
              >
                Admin Demo
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
