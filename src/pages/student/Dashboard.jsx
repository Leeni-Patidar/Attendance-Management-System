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
    // Mock data for student subjects
    setTimeout(() => {
      setSubjects([
        {
          id: 1,
          courseName: "Data Structures & Algorithms",
          courseCode: "CS301",
          totalClasses: 50,
          presentDays: 45,
          absentDays: 5,
          attendance: 90,
        },
        {
          id: 2,
          courseName: "Database Management Systems",
          courseCode: "CS302",
          totalClasses: 45,
          presentDays: 38,
          absentDays: 7,
          attendance: 84,
        },
        {
          id: 3,
          courseName: "Computer Networks",
          courseCode: "CS303",
          totalClasses: 40,
          presentDays: 28,
          absentDays: 12,
          attendance: 70,
        },
        {
          id: 4,
          courseName: "Software Engineering",
          courseCode: "CS304",
          totalClasses: 35,
          presentDays: 20,
          absentDays: 15,
          attendance: 57,
        },
        {
          id: 5,
          courseName: "Software Engineering",
          courseCode: "CS304",
          totalClasses: 35,
          presentDays: 20,
          absentDays: 15,
          attendance: 57,
        },
        {
          id: 6,
          courseName: "Software Engineering",
          courseCode: "CS304",
          totalClasses: 35,
          presentDays: 20,
          absentDays: 15,
          attendance: 57,
        },
        {
          id: 7,
          courseName: "Database Management Systems",
          courseCode: "CS302",
          totalClasses: 45,
          presentDays: 38,
          absentDays: 7,
          attendance: 84,
        },
        {
          id: 8,
          courseName: "Database Management Systems",
          courseCode: "CS302",
          totalClasses: 45,
          presentDays: 38,
          absentDays: 7,
          attendance: 84,
        },
        {
          id: 9,
          courseName: "Database Management Systems",
          courseCode: "CS302",
          totalClasses: 45,
          presentDays: 38,
          absentDays: 7,
          attendance: 84,
        },
      ])
      setLoading(false)
    }, 1000)
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
    <div className="min-h-screen bg-gray-50  pb-8 ">
      <header className="  fixed top-0 left-0 w-full z-50 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
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

     <div className="flex">
  {/* Sidebar */}
  <div className="w-66 fixed  left-8 top-16 bottom-0 bg-gray-50 overflow-y-auto">
    <div className="bg-white rounded-lg shadow-md p-7  mt-4">
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
            <div className="bg-white rounded-lg shadow-md mt-3 p-6 cursor-pointer"
        onClick={() => navigate("/student/requests")}>
              Request
            </div>
             <div className="bg-white rounded-lg shadow-md mt-3 p-6 cursor-pointer"
        onClick={() => navigate("/student/timeTable")}>
              Time Table
            </div>

            {/* <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100">
                  Scan QR Code
                </button>
                <button className="w-full text-left px-3 py-2 text-sm bg-green-50 text-green-700 rounded hover:bg-green-100">
                  Submit Request
                </button>
                <button className="w-full text-left px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded hover:bg-purple-100">
                  View Calendar
                </button>
              </div>
            </div> */}
          </div>

          {/* Main Content */}
      <div className="flex-1 ml-[276px] pt-20 pl-16 pr-16 h-screen overflow-y-auto">

            {/* <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Subject Attendance</h2>
              <p className="text-gray-600">Click on any subject card to view detailed attendance</p>
            </div> */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 cursor-pointer"
        onClick={() => navigate("/student/subject/:id")}>
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{subject.courseName}</h3>
                      <p className="text-sm text-gray-500">{subject.courseCode}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${getAttendanceColor(subject.attendance)}`}
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

                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(subject.attendance)}`}
                      style={{ width: `${subject.attendance}%` }}
                    ></div>
                  </div>

                  {/* <div className="flex gap-2">
                    <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 text-sm">
                      View Details
                    </button>
                    <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 text-sm">
                      Calendar
                    </button>
                  </div> */}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    // </div>
  )
}

export default StudentDashboard
