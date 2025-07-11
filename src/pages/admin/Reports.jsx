"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const Reports = () => {
  const navigate = useNavigate()
  const [reportType, setReportType] = useState("attendance")
  const [dateRange, setDateRange] = useState("week")
  const [selectedClass, setSelectedClass] = useState("all")
  const [reportData, setReportData] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data for reports
    setTimeout(() => {
      setReportData({
        attendance: {
          overall: 85.5,
          byClass: [
            { class: "CS 3rd Year - Section A", percentage: 87.2, students: 45 },
            { class: "CS 3rd Year - Section B", percentage: 82.1, students: 42 },
            { class: "CS 2nd Year - Section A", percentage: 91.5, students: 48 },
            { class: "CS 2nd Year - Section B", percentage: 79.8, students: 44 },
          ],
          bySubject: [
            { subject: "Data Structures", code: "CS301", percentage: 89.2 },
            { subject: "Database Systems", code: "CS302", percentage: 85.7 },
            { subject: "Computer Networks", code: "CS303", percentage: 82.4 },
            { subject: "Software Engineering", code: "CS304", percentage: 87.9 },
          ],
          lowAttendance: [
            { name: "John Doe", rollNumber: "CS21B001", percentage: 45.2, class: "CS 3rd Year - A" },
            { name: "Jane Smith", rollNumber: "CS21B002", percentage: 52.8, class: "CS 3rd Year - A" },
            { name: "Mike Wilson", rollNumber: "CS20B015", percentage: 48.9, class: "CS 2nd Year - B" },
          ],
        },
        users: {
          total: 1387,
          students: 1250,
          teachers: 85,
          admins: 12,
          active: 1298,
          inactive: 89,
          newThisMonth: 45,
        },
        system: {
          qrCodesGenerated: 1245,
          attendanceMarked: 15678,
          requestsSubmitted: 234,
          requestsApproved: 189,
          requestsPending: 45,
          systemUptime: 99.8,
        },
      })
      setLoading(false)
    }, 1000)
  }, [reportType, dateRange, selectedClass])

  const generateReport = () => {
    alert(`Generating ${reportType} report for ${dateRange} period...`)
  }

  const exportReport = (format) => {
    alert(`Exporting report as ${format.toUpperCase()}...`)
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
                <h1 className="text-xl font-semibold text-gray-900">System Reports</h1>
                <p className="text-sm text-gray-500">Generate and view system reports</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => exportReport("pdf")}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center gap-2"
              >
                📄 Export PDF
              </button>
              <button
                onClick={() => exportReport("excel")}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
              >
                📊 Export Excel
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Report Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="attendance">Attendance Report</option>
                <option value="users">User Report</option>
                <option value="system">System Report</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="semester">This Semester</option>
                <option value="year">This Year</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Classes</option>
                <option value="cs3a">CS 3rd Year - Section A</option>
                <option value="cs3b">CS 3rd Year - Section B</option>
                <option value="cs2a">CS 2nd Year - Section A</option>
                <option value="cs2b">CS 2nd Year - Section B</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={generateReport}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Generate Report
              </button>
            </div>
          </div>
        </div>

        {/* Report Content */}
        {reportType === "attendance" && (
          <div className="space-y-6">
            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
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
                      <dt className="text-sm font-medium text-gray-500 truncate">Overall Attendance</dt>
                      <dd className={`text-lg font-medium ${getAttendanceColor(reportData.attendance.overall)}`}>
                        {reportData.attendance.overall}%
                      </dd>
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
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Classes</dt>
                      <dd className="text-lg font-medium text-gray-900">{reportData.attendance.byClass.length}</dd>
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
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Subjects</dt>
                      <dd className="text-lg font-medium text-gray-900">{reportData.attendance.bySubject.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Low Attendance</dt>
                      <dd className="text-lg font-medium text-red-600">{reportData.attendance.lowAttendance.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Class-wise Attendance */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Class-wise Attendance</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Class
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Students
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Attendance %
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.attendance.byClass.map((classData, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {classData.class}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{classData.students}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={getAttendanceColor(classData.percentage)}>{classData.percentage}%</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAttendanceBadgeColor(classData.percentage)}`}
                          >
                            {classData.percentage >= 85
                              ? "Excellent"
                              : classData.percentage >= 70
                                ? "Good"
                                : "Needs Improvement"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Low Attendance Students */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Students with Low Attendance (&lt;60%)</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Roll Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Class
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Attendance %
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.attendance.lowAttendance.map((student, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.rollNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.class}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                          {student.percentage}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {reportType === "users" && (
          <div className="space-y-6">
            {/* User Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Students:</span>
                    <span className="text-sm font-medium text-gray-900">{reportData.users.students}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Teachers:</span>
                    <span className="text-sm font-medium text-gray-900">{reportData.users.teachers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Admins:</span>
                    <span className="text-sm font-medium text-gray-900">{reportData.users.admins}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-900">Total:</span>
                      <span className="text-sm font-bold text-blue-600">{reportData.users.total}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">User Status</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Active:</span>
                    <span className="text-sm font-medium text-green-600">{reportData.users.active}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Inactive:</span>
                    <span className="text-sm font-medium text-red-600">{reportData.users.inactive}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">New This Month:</span>
                      <span className="text-sm font-medium text-blue-600">{reportData.users.newThisMonth}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Activity Rate</h4>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {Math.round((reportData.users.active / reportData.users.total) * 100)}%
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Users are active</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {reportType === "system" && (
          <div className="space-y-6">
            {/* System Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">QR Code Usage</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Generated:</span>
                    <span className="text-sm font-medium text-gray-900">{reportData.system.qrCodesGenerated}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Attendance Marked:</span>
                    <span className="text-sm font-medium text-gray-900">{reportData.system.attendanceMarked}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Student Requests</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Submitted:</span>
                    <span className="text-sm font-medium text-gray-900">{reportData.system.requestsSubmitted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Approved:</span>
                    <span className="text-sm font-medium text-green-600">{reportData.system.requestsApproved}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Pending:</span>
                    <span className="text-sm font-medium text-yellow-600">{reportData.system.requestsPending}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">System Health</h4>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{reportData.system.systemUptime}%</div>
                  <p className="text-sm text-gray-600 mt-2">System Uptime</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Reports
