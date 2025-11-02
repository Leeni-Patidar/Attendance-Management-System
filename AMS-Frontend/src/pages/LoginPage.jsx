"use client"

import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Navigate } from "react-router-dom"
import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGraduationCap } from "@fortawesome/free-solid-svg-icons"

const LoginPage = () => {
  const { login, isAuthenticated, user } = useAuth()
  const [userType, setUserType] = useState("student")
  const [credentials, setCredentials] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  if (isAuthenticated) {
    let redirectUrl = "/"
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

    // pass userType as 'role' to the auth endpoint through AuthContext.login
    const result = await login({
      email: credentials.email,
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



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <FontAwesomeIcon
      icon={faGraduationCap}
      className="w-6 h-6 text-white"
    />
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
              <option value="student">Student</option>
              <option value="class_teacher">Class Teacher</option>
              <option value="subject_teacher">Subject Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div> 

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
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
            disabled={!userType || !credentials.email || !credentials.password || loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
          
        </form>
      </div>
    </div>
  )
}

export default LoginPage
