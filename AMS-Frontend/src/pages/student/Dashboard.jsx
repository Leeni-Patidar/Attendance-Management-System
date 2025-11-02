"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { useNavigate } from "react-router-dom"

const StudentDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // fetch student's subjects/profile from backend
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('/api/students/me', {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })
        if (!res.ok) {
          console.error('Failed to load student data', res.status)
          setLoading(false)
          return
        }
        const data = await res.json()

        // Attempt to normalize subjects. Backend `student.subjects` may be array or object.
        let subjectsFromData = []
        if (Array.isArray(data.subjects)) {
          subjectsFromData = data.subjects
        } else if (data.subjects && typeof data.subjects === 'object') {
          // convert object entries to array
          subjectsFromData = Object.keys(data.subjects).map((k) => ({ id: k, ...data.subjects[k] }))
        }

        // Map to expected UI fields; attendance data may not be present per-subject
        const mapped = subjectsFromData.map((s, idx) => ({
          id: s.id || s._id || idx,
          courseName: s.name || s.courseName || s.title || `Subject ${idx + 1}`,
          courseCode: s.code || s.courseCode || s.courseId || `S${idx + 1}`,
          totalClasses: s.totalClasses || 0,
          presentDays: s.presentDays || 0,
          absentDays: s.absentDays || 0,
          attendance: s.attendance || 0,
        }))

        setSubjects(mapped)
      } catch (err) {
        console.error('Error loading dashboard:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  const getAttendanceColor = (percentage) => {
    if (percentage >= 75) return "bg-green-100 text-green-800 border-green-200"
    if (percentage >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    return "bg-red-100 text-red-800 border-red-200"
  }

  const getProgressColor = (percentage) => {
    if (percentage >= 75) return "bg-green-500"
    if (percentage >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm border-b ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 gap-2">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
              </svg>
              <h1 className="text-xl font-semibold text-gray-900">Student Portal</h1>
            </div>
            <div className="flex items-center gap-4">
              <div
                className="text-right hidden sm:block cursor-pointer"
                onClick={() => navigate("/student/profile")}
              >
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.studentInfo?.rollNumber}</p>
              </div>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Layout */}
      <div className="pt-30 md:pt-16  ">
        {/* Sidebar */}
        <aside
          className="
            
            md:w-66
            md:fixed
            md:top-20
            md:left-1
            md:pt-4
            bg-gray-50
            md:h-[calc(100vh-4rem)]
            overflow-y-auto
            px-4
            pb-6
            pt-20
          "
        >
          <div className="bg-white rounded-lg shadow-md p-6 mt-4 md:mt-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Profile</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="text-sm text-gray-900">{user?.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Roll Number</p>
                <p className="text-sm text-gray-900">{user?.studentInfo?.rollNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-sm text-gray-900">{user?.studentInfo?.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Semester</p>
                <p className="text-sm text-gray-900">{user?.studentInfo?.semester}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Year</p>
                <p className="text-sm text-gray-900">{user?.studentInfo?.year}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Program</p>
                <p className="text-sm text-gray-900">{user?.studentInfo?.program}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Branch</p>
                <p className="text-sm text-gray-900">{user?.studentInfo?.branch}</p>
              </div>
            </div>
          </div>
          <div
            className="bg-white rounded-lg shadow-md mt-3 p-6 cursor-pointer"
            onClick={() => navigate("/student/requests")}
          >
            Request
          </div>
          <div
            className="bg-white rounded-lg shadow-md mt-3 p-6 cursor-pointer"
            onClick={() => navigate("/student/timeTable")}
          >
            Time Table
          </div>
        </aside>

        {/* Main Content */}
        <main
          className="
            w-66
           mt-4
      md:mt-0
      px-4
      pb-8
      pt-10
      pl-5
      md:ml-[292px] 
          "
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/student/subject/${subject.id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{subject.courseName}</h3>
                    <p className="text-sm text-gray-500">{subject.courseCode}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${getAttendanceColor(
                      subject.attendance
                    )}`}
                  >
                    {subject.attendance}%
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Classes:</span>
                    <span className="font-medium">{subject.totalClasses}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Present:</span>
                    <span className="font-medium text-green-600">{subject.presentDays}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Absent:</span>
                    <span className="font-medium text-red-600">{subject.absentDays}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full ${getProgressColor(subject.attendance)}`}
                    style={{ width: `${subject.attendance}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

export default StudentDashboard
