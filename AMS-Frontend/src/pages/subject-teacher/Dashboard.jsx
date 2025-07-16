"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { useNavigate } from "react-router-dom"

const SubjectTeacherDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [classes, setClasses] = useState([])
  const [arrangementClasses, setArrangementClasses] = useState([])
  const [activeQRCodes, setActiveQRCodes] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [selectedClass, setSelectedClass] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAddArrangementForm, setShowAddArrangementForm] = useState(false)
  const [arrangementForm, setArrangementForm] = useState({
    subjectTeacherName: "",
    subject: "",
    className: "",
    arrangedFor: "",
    date: "",
  })

  useEffect(() => {
    // Mock data for subject teacher dashboard
    setTimeout(() => {
      setClasses([
        {
          id: 1,
          className: "CS 3rd Year - Section A",
          subject: "Data Structures & Algorithms",
          subjectCode: "CS301",
          students: 45,
          semester: "6th Semester",
          schedule: "Mon, Wed, Fri - 10:00 AM",
          averageAttendance: 85,
        },
        {
          id: 2,
          className: "CS 3rd Year - Section B",
          subject: "Data Structures & Algorithms",
          subjectCode: "CS301",
          students: 42,
          semester: "6th Semester",
          schedule: "Tue, Thu - 2:00 PM",
          averageAttendance: 78,
        },
        {
          id: 3,
          className: "CS 2nd Year - Section A",
          subject: "Database Management Systems",
          subjectCode: "CS201",
          students: 48,
          semester: "4th Semester",
          schedule: "Mon, Wed - 11:00 AM",
          averageAttendance: 92,
        },
      ])

      setArrangementClasses([
        {
          id: 1,
          subjectTeacherName: "Dr. Smith",
          subject: "Operating Systems",
          className: "CS 3rd Year - Section C",
          arrangedFor: "Prof. Johnson",
          date: "2024-03-20",
          students: 40,
        },
        {
          id: 2,
          subjectTeacherName: "Dr. Brown",
          subject: "Computer Networks",
          className: "CS 4th Year - Section A",
          arrangedFor: "Dr. Wilson",
          date: "2024-03-22",
          students: 35,
        },
      ])

      setActiveQRCodes([
        {
          id: 1,
          classId: 1,
          subject: "Data Structures & Algorithms",
          code: "QR_CS301_001",
          generatedAt: new Date(Date.now() - 5 * 60 * 1000),
          validUntil: new Date(Date.now() + 5 * 60 * 1000),
          studentsScanned: 38,
          totalStudents: 45,
        },
      ])

      setRecentActivity([
        {
          id: 1,
          type: "qr_generated",
          message: "QR code generated for CS301 - Section A",
          timestamp: "5 minutes ago",
          class: "CS 3rd Year - Section A",
        },
        {
          id: 2,
          type: "attendance_marked",
          message: "38 students marked attendance for Data Structures",
          timestamp: "10 minutes ago",
          class: "CS 3rd Year - Section A",
        },
        {
          id: 3,
          type: "arrangement_added",
          message: "New arrangement class added for Operating Systems",
          timestamp: "1 hour ago",
          class: "CS 3rd Year - Section C",
        },
      ])

      setSelectedClass(classes[0])
      setLoading(false)
    }, 1000)
  }, [])

  const generateQRCode = (classId) => {
    const classData = classes.find((c) => c.id === classId)
    const newQR = {
      id: Date.now(),
      classId: classId,
      subject: classData.subject,
      code: `QR_${classData.subjectCode}_${Date.now()}`,
      generatedAt: new Date(),
      validUntil: new Date(Date.now() + 10 * 60 * 1000),
      studentsScanned: 0,
      totalStudents: classData.students,
    }

    setActiveQRCodes((prev) => [...prev, newQR])

    // Add to recent activity
    setRecentActivity((prev) => [
      {
        id: Date.now(),
        type: "qr_generated",
        message: `QR code generated for ${classData.subject}`,
        timestamp: "Just now",
        class: classData.className,
      },
      ...prev,
    ])
  }

  const handleAddArrangement = (e) => {
    e.preventDefault()
    const newArrangement = {
      id: Date.now(),
      ...arrangementForm,
      students: Math.floor(Math.random() * 50) + 20, // Mock student count
    }

    setArrangementClasses((prev) => [...prev, newArrangement])
    setArrangementForm({
      subjectTeacherName: "",
      subject: "",
      className: "",
      arrangedFor: "",
      date: "",
    })
    setShowAddArrangementForm(false)

    // Add to recent activity
    setRecentActivity((prev) => [
      {
        id: Date.now(),
        type: "arrangement_added",
        message: `New arrangement class added for ${newArrangement.subject}`,
        timestamp: "Just now",
        class: newArrangement.className,
      },
      ...prev,
    ])
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
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Subject Teacher Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.teacherInfo?.employeeId}</p>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Right Column (Previously Left) - Activity and Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <button
                  onClick={() => navigate("/subject-teacher/RecentActivity")}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Action Links</h3>
              <div className="space-y-2">
                  <button
                  onClick={() => navigate("/subject-teacher/ViewSchedule")}
                  className="w-full text-left px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded hover:bg-purple-100"
                >
                  📅 View Schedule
                </button>
                <button
                  onClick={() => navigate("/subject-teacher/qr-history")}
                  className="w-full text-left px-3 py-2 text-sm bg-yellow-50 text-yellow-700 rounded hover:bg-yellow-100"
                >
                  📱 QR History
                </button>
                <button
                  onClick={() => navigate("/subject-teacher/profile")}
                  className="w-full text-left px-3 py-2 text-sm bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100"
                >
                  👤 Profile Settings
                </button>
                </div>
            </div>

            {/* Active QR Codes */}
            {activeQRCodes.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Active QR Codes</h3>
                <div className="space-y-3">
                  {activeQRCodes.map((qr) => (
                    <div key={qr.id} className="border rounded-lg p-3 bg-green-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{qr.code}</h4>
                          <p className="text-sm text-gray-600">{qr.subject}</p>
                        </div>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Active</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-600">
                          Scanned: {qr.studentsScanned}/{qr.totalStudents}
                        </p>
                        <p className="text-green-600 font-medium">
                          {Math.max(0, Math.floor((qr.validUntil - new Date()) / (1000 * 60)))} minutes remaining
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Left Column (Previously Right) - Classes and QR Generator */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Classes */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">My Classes</h3>
                <button
                  onClick={() => navigate("/subject-teacher/MyClasses")}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View All →
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classes.map((classData) => (
                  <div
                    key={classData.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/subject-teacher/class/${classData.id}`)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{classData.className}</h4>
                        <p className="text-sm text-gray-600">{classData.subject}</p>
                        <p className="text-xs text-gray-500">{classData.subjectCode}</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getAttendanceBadgeColor(classData.averageAttendance)}`}
                      >
                        {classData.averageAttendance}%
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>👥 {classData.students} students</p>
                      <p>📅 {classData.schedule}</p>
                    </div>
                    <button
                      onClick={() => navigate(`/subject-teacher/class/${classData.id}`)}
                      className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 text-sm"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Arrangement Classes */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Arrangement Classes</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate("/subject-teacher/arrangementClasses")}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View All →
                  </button>
                  <button
                    onClick={() => setShowAddArrangementForm(true)}
                    className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm"
                  >
                    Add Class
                  </button>
                </div>
              </div>

              {/* Add Class Form */}
              {showAddArrangementForm && (
                <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-medium text-gray-900 mb-3">Add Arrangement Class</h4>
                  <form onSubmit={handleAddArrangement} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject Teacher Name</label>
                        <input
                          type="text"
                          required
                          value={arrangementForm.subjectTeacherName}
                          onChange={(e) =>
                            setArrangementForm((prev) => ({ ...prev, subjectTeacherName: e.target.value }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                        <input
                          type="text"
                          required
                          value={arrangementForm.subject}
                          onChange={(e) => setArrangementForm((prev) => ({ ...prev, subject: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                        <input
                          type="text"
                          required
                          value={arrangementForm.className}
                          onChange={(e) => setArrangementForm((prev) => ({ ...prev, className: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Arranged For</label>
                        <input
                          type="text"
                          required
                          value={arrangementForm.arrangedFor}
                          onChange={(e) => setArrangementForm((prev) => ({ ...prev, arrangedFor: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                          type="date"
                          required
                          value={arrangementForm.date}
                          onChange={(e) => setArrangementForm((prev) => ({ ...prev, date: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                      >
                        Add Class
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddArrangementForm(false)}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Arrangement Classes List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {arrangementClasses.map((arrangement) => (
                  <div
                    key={arrangement.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{arrangement.className}</h4>
                        <p className="text-sm text-gray-600">{arrangement.subject}</p>
                        <p className="text-xs text-gray-500">
                          Teacher: {arrangement.subjectTeacherName} | Arranged for: {arrangement.arrangedFor}
                        </p>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        Scheduled
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>👥 {arrangement.students} students</p>
                      <p>📅 {arrangement.date}</p>
                    </div>
                   <button
                      onClick={() => navigate(`/subject-teacher/class/${classData.id}`)}
                      className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 text-sm"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubjectTeacherDashboard
