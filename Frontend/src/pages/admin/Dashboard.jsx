"use client"

import { useState } from "react"
import {
  Users,
  School,
  GraduationCap,
  CalendarDays,
  Download,
  UserPlus,
  BookOpen,
  Upload,
  Settings,
  Activity,
  User,
  FileText,
} from "lucide-react"

import { useAuth } from "../../contexts/AuthContext"
import { useNavigate } from "react-router-dom"

const AdminDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [selectedClass, setSelectedClass] = useState(null)
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [showAllClasses, setShowAllClasses] = useState(false)
  const [showAllTeachers, setShowAllTeachers] = useState(false)
  const [teacherFilter, setTeacherFilter] = useState("all")

  const stats = [
    { title: "Total Students", value: "1,234", icon: Users, color: "bg-blue-500" },
    { title: "Total Classes", value: "45", icon: School, color: "bg-green-500" },
    { title: "Total Teachers", value: "89", icon: GraduationCap, color: "bg-purple-500" },
    { title: "Calendar", value: "", icon: CalendarDays, color: "bg-orange-500" },
  ]

  const recentActivities = [
    { id: 1, action: "John Doe marked present", time: "5 minutes ago", icon: Activity },
    { id: 2, action: "New teacher assigned to Class 10A", time: "15 minutes ago", icon: UserPlus },
    { id: 3, action: "Attendance report generated", time: "30 minutes ago", icon: FileText },
    { id: 4, action: "Timetable updated for Math dept", time: "1 hour ago", icon: CalendarDays },
    { id: 5, action: "Student transferred to Class 9B", time: "2 hours ago", icon: Users },
  ]

  const classes = [
    { id: 1, name: "Class 10A", students: 35, teacher: "Ms. Johnson", attendance: 92 },
    { id: 2, name: "Class 10B", students: 33, teacher: "Mr. Smith", attendance: 88 },
    { id: 3, name: "Class 9A", students: 40, teacher: "Mrs. Brown", attendance: 95 },
    { id: 4, name: "Class 9B", students: 38, teacher: "Mr. Wilson", attendance: 90 },
    { id: 5, name: "Class 8A", students: 42, teacher: "Ms. Davis", attendance: 87 },
  ]

  const teachers = [
    {
      id: 1,
      name: "Ms. Johnson",
      subject: "Mathematics",
      type: "Class Teacher",
      classes: ["Class 10A"],
      email: "johnson@school.edu",
      phone: "+1 234 567 8901",
      photo: "/placeholder.svg?height=150&width=150",
    },
    {
      id: 2,
      name: "Mr. Smith",
      subject: "Physics",
      type: "Subject Teacher",
      classes: ["Class 10B", "Class 9A"],
      email: "smith@school.edu",
      phone: "+1 234 567 8902",
      photo: "/placeholder.svg?height=150&width=150",
    },
    {
      id: 3,
      name: "Mrs. Brown",
      subject: "English",
      type: "Class Teacher",
      classes: ["Class 9A"],
      email: "brown@school.edu",
      phone: "+1 234 567 8903",
      photo: "/placeholder.svg?height=150&width=150",
    },
    {
      id: 4,
      name: "Mr. Wilson",
      subject: "Chemistry",
      type: "Subject Teacher",
      classes: ["Class 9B", "Class 8A"],
      email: "wilson@school.edu",
      phone: "+1 234 567 8904",
      photo: "/placeholder.svg?height=150&width=150",
    },
  ]

  const filteredTeachers = teachers.filter((teacher) => {
    if (teacherFilter === "all") return true
    return teacher.type === teacherFilter
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                {/* <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg> */}
                <BookOpen size={18} color="white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.adminInfo?.employeeId}</p>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6 w-80">
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <button
                  onClick={() => navigate("/admin/RecentActivity")}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
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
                  <div className="flex items-center space-x-2">
                    <Download size={20} /> <span>Download Report</span>
                  </div>
                </button>
                <button
                  onClick={() => navigate("/subject-teacher/qr-history")}
                  className="w-full text-left px-3 py-2 text-sm bg-yellow-50 text-yellow-700 rounded hover:bg-yellow-100"
                >
                  <div className="flex items-center space-x-2">
                    <User size={20} /> <span>Assign Class Teacher</span>
                  </div>
                </button>
                <button
                  onClick={() => navigate("/subject-teacher/profile")}
                  className="w-full text-left px-3 py-2 text-sm bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100"
                >
                  <div className="flex items-center space-x-2">
                    <User size={20} /> <span>Assign Subject Teacher</span>
                  </div>
                </button>
                <button
                  onClick={() => navigate("/subject-teacher/profile")}
                  className="w-full text-left px-3 py-2 text-sm bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100"
                >
                  <div className="flex items-center space-x-2">
                    <CalendarDays size={20} /> <span>Upload Time Table For All Classes</span>
                  </div>
                </button>
                <button
                  onClick={() => navigate("/subject-teacher/profile")}
                  className="w-full text-left px-3 py-2 text-sm bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100"
                >
                  <div className="flex items-center space-x-2">
                    <CalendarDays size={20} /> <span>Upload Time Table For Subject Teachers</span>
                  </div>
                </button>
                <button
                  onClick={() => navigate("/subject-teacher/profile")}
                  className="w-full text-left px-3 py-2 text-sm bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100"
                >
                  <div className="flex items-center space-x-2">
                    <Settings size={20} /> <span>Manage Teacher Arrangements</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Main Dashboard */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      {stat.value && <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>}
                    </div>
                    <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Classes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Classes</h3>
                <button
                  onClick={() => setShowAllClasses(!showAllClasses)}
                  className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                >
                  {showAllClasses ? "Show Less" : "See More"}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(showAllClasses ? classes : classes.slice(0, 3)).map((classItem) => (
                  <div
                    key={classItem.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{classItem.name}</h4>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          classItem.attendance >= 90
                            ? "bg-green-100 text-green-800"
                            : classItem.attendance >= 80
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {classItem.attendance}%
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>{classItem.students} students</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <GraduationCap className="w-4 h-4" />
                        <span>{classItem.teacher}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedClass(classItem)}
                      className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Teachers */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Teachers</h3>
                <div className="flex items-center space-x-4">
                  <select
                    value={teacherFilter}
                    onChange={(e) => setTeacherFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Teachers</option>
                    <option value="Class Teacher">Class Teachers</option>
                    <option value="Subject Teacher">Subject Teachers</option>
                  </select>
                  <button
                    onClick={() => setShowAllTeachers(!showAllTeachers)}
                    className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                  >
                    {showAllTeachers ? "Show Less" : "See More"}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(showAllTeachers ? filteredTeachers : filteredTeachers.slice(0, 3)).map((teacher) => (
                  <div
                    key={teacher.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <img
                        src={teacher.photo || "/placeholder.svg"}
                        alt={teacher.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900">{teacher.name}</h4>
                        <p className="text-sm text-gray-600">{teacher.subject}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4" />
                        <span>{teacher.type}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <School className="w-4 h-4" />
                        <span>{teacher.classes.length} classes</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedTeacher(teacher)}
                      className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
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

export default AdminDashboard
