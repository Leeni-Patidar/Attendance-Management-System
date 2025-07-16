"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"

const ClassDetail = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [classData, setClassData] = useState({})
  const [students, setStudents] = useState([])
  const [attendanceHistory, setAttendanceHistory] = useState([])
  const [activeTab, setActiveTab] = useState("students")
  const [loading, setLoading] = useState(true)
  const [editingStudent, setEditingStudent] = useState(null)

  useEffect(() => {
    // Mock data for class detail
    setTimeout(() => {
      setClassData({
        id: Number.parseInt(id),
        className: "CS 3rd Year - Section A",
        subject: "Data Structures & Algorithms",
        subjectCode: "CS301",
        totalStudents: 45,
        semester: "6th Semester",
        schedule: "Mon, Wed, Fri - 10:00 AM",
        room: "Lab 301",
        averageAttendance: 87.2,
        totalClasses: 45,
        classesCompleted: 38,
      })

      setStudents([
        {
          id: 1,
          name: "Alice Johnson",
          rollNo: "CS21B001",
          present: 35,
          totalClasses: 38,
          percentage: 92.1,
          lastAttendance: "2024-03-16T10:30:00Z",
          status: "present",
        },
        {
          id: 2,
          name: "Bob Smith",
          rollNo: "CS21B002",
          present: 28,
          totalClasses: 38,
          percentage: 73.7,
          lastAttendance: "2024-03-15T10:30:00Z",
          status: "absent",
        },
        {
          id: 3,
          name: "Carol Davis",
          rollNo: "CS21B003",
          present: 36,
          totalClasses: 38,
          percentage: 94.7,
          lastAttendance: "2024-03-16T10:30:00Z",
          status: "present",
        },
        {
          id: 4,
          name: "David Wilson",
          rollNo: "CS21B004",
          present: 30,
          totalClasses: 38,
          percentage: 78.9,
          lastAttendance: "2024-03-16T10:30:00Z",
          status: "present",
        },
        {
          id: 5,
          name: "Eva Brown",
          rollNo: "CS21B005",
          present: 25,
          totalClasses: 38,
          percentage: 65.8,
          lastAttendance: "2024-03-14T10:30:00Z",
          status: "absent",
        },
      ])

      setAttendanceHistory([
        {
          id: 1,
          date: "2024-03-16",
          topic: "Binary Search Trees",
          totalStudents: 45,
          presentStudents: 42,
          percentage: 93.3,
          qrGenerated: true,
          duration: "50 minutes",
        },
        {
          id: 2,
          date: "2024-03-15",
          topic: "AVL Trees",
          totalStudents: 45,
          presentStudents: 38,
          percentage: 84.4,
          qrGenerated: true,
          duration: "50 minutes",
        },
      ])

      setLoading(false)
    }, 1000)
  }, [id])

  const generateQRCode = () => {
    alert("QR Code generated for attendance!")
  }

  const markManualAttendance = () => {
    alert("Manual attendance marking opened!")
  }

  const handleEditAttendance = (student) => {
    setEditingStudent(student)
  }

  const saveAttendanceEdit = (studentId, newPresent) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId
          ? {
              ...student,
              present: newPresent,
              percentage: Math.round((newPresent / student.totalClasses) * 100),
            }
          : student,
      ),
    )
    setEditingStudent(null)
  }

  const getAttendanceColor = (percentage) => {
    if (percentage >= 85) return "text-green-600"
    if (percentage >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getAttendanceBadgeColor = (percentage) => {
    if (percentage >= 85) return "bg-green-100 text-green-800"
    if (percentage >= 70) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const getStatusColor = (status) => {
    return status === "present" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button onClick={() => navigate(-1)} className="mr-4 p-2 text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{classData.className}</h1>
                <p className="text-sm text-gray-500">
                  {classData.subject} ({classData.subjectCode})
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={generateQRCode}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
              >
                📱 Generate QR
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Class Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Students</dt>
                  <dd className="text-lg font-medium text-gray-900">{classData.totalStudents}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg. Attendance</dt>
                  <dd className={`text-lg font-medium ${getAttendanceColor(classData.averageAttendance)}`}>
                    {classData.averageAttendance}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Classes Completed</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {classData.classesCompleted}/{classData.totalClasses}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Schedule</dt>
                  <dd className="text-sm font-medium text-gray-900">{classData.schedule}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              {[
                { id: "students", name: "Students", icon: "👥" },
                { id: "attendance", name: "Attendance History", icon: "📅" },
                { id: "analytics", name: "Analytics", icon: "📊" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "students" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Student List</h3>
                  <div className="flex gap-2">
                    <button className="text-sm text-blue-600 hover:text-blue-800">Export List</button>
                    <button className="text-sm text-green-600 hover:text-green-800">Send Message</button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Roll No
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Present (days)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Percentage (%)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Edit Attendance
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{student.rollNo}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingStudent?.id === student.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="0"
                                  max={student.totalClasses}
                                  defaultValue={student.present}
                                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                                  onBlur={(e) => saveAttendanceEdit(student.id, Number.parseInt(e.target.value))}
                                  onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                      saveAttendanceEdit(student.id, Number.parseInt(e.target.value))
                                    }
                                  }}
                                  autoFocus
                                />
                                <span className="text-sm text-gray-500">/{student.totalClasses}</span>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-900">
                                {student.present}/{student.totalClasses}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAttendanceBadgeColor(student.percentage)}`}
                            >
                              {student.percentage}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleEditAttendance(student)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "attendance" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Attendance History</h3>
                  <button className="text-sm text-blue-600 hover:text-blue-800">Download Report</button>
                </div>
                <div className="space-y-4">
                  {attendanceHistory.map((record) => (
                    <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{record.topic}</h4>
                          <p className="text-sm text-gray-500">
                            {new Date(record.date).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                          <p className="text-xs text-gray-400">Duration: {record.duration}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAttendanceBadgeColor(record.percentage)}`}
                            >
                              {record.percentage}%
                            </span>
                            {record.qrGenerated && (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                QR Used
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {record.presentStudents}/{record.totalStudents} present
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "analytics" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Analytics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Attendance Trends</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>This Week:</span>
                        <span className="font-medium text-green-600">89.2%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Last Week:</span>
                        <span className="font-medium text-yellow-600">85.7%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>This Month:</span>
                        <span className="font-medium text-green-600">87.2%</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Student Performance</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Excellent (&gt;90%):</span>
                        <span className="font-medium text-green-600">
                          {students.filter((s) => s.percentage > 90).length} students
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Good (75-90%):</span>
                        <span className="font-medium text-yellow-600">
                          {students.filter((s) => s.percentage >= 75 && s.percentage <= 90).length} students
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Needs Attention (&lt;75%):</span>
                        <span className="font-medium text-red-600">
                          {students.filter((s) => s.percentage < 75).length} students
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClassDetail
