"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { useNavigate } from "react-router-dom"

const ClassTeacherDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [classData, setClassData] = useState({})
  const [students, setStudents] = useState([])
  const [subjects, setSubjects] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    // Mock data for class teacher dashboard
    setTimeout(() => {
      setClassData({
        className: "CS 3rd Year - Section A",
        totalStudents: 45,
        year: "3rd Year",
        semester: "6th Semester",
        branch: "Computer Science & Engineering",
      })

      setSubjects([
        { code: "CS301", name: "Data Structures & Algorithms", teacher: "Prof. Smith" },
        { code: "CS302", name: "Database Management Systems", teacher: "Dr. Johnson" },
        { code: "CS303", name: "Computer Networks", teacher: "Prof. Wilson" },
        { code: "CS304", name: "Software Engineering", teacher: "Dr. Brown" },
        { code: "CS305", name: "Operating Systems", teacher: "Prof. Davis" },
      ])

      setStudents([
        {
          id: 1,
          name: "Alice Johnson",
          rollNumber: "CS21B001",
          subjects: {
            CS301: { present: 45, absent: 5, percentage: 90 },
            CS302: { present: 42, absent: 8, percentage: 84 },
            CS303: { present: 38, absent: 12, percentage: 76 },
            CS304: { present: 40, absent: 10, percentage: 80 },
            CS305: { present: 35, absent: 15, percentage: 70 },
          },
        },
        {
          id: 2,
          name: "Bob Smith",
          rollNumber: "CS21B002",
          subjects: {
            CS301: { present: 30, absent: 20, percentage: 60 },
            CS302: { present: 28, absent: 22, percentage: 56 },
            CS303: { present: 35, absent: 15, percentage: 70 },
            CS304: { present: 32, absent: 18, percentage: 64 },
            CS305: { present: 25, absent: 25, percentage: 50 },
            //  CS305: { present: 25, absent: 25, percentage: 50 },
            //   CS305: { present: 25, absent: 25, percentage: 50 },
          },
        },
        {
          id: 3,
          name: "Carol Davis",
          rollNumber: "CS21B003",
          subjects: {
            CS301: { present: 48, absent: 2, percentage: 96 },
            CS302: { present: 45, absent: 5, percentage: 90 },
            CS303: { present: 44, absent: 6, percentage: 88 },
            CS304: { present: 46, absent: 4, percentage: 92 },
            CS305: { present: 43, absent: 7, percentage: 86 },
          },
        },
        {
          id: 4,
          name: "Carol Davis",
          rollNumber: "CS21B003",
          subjects: {
            CS301: { present: 48, absent: 2, percentage: 96 },
            CS302: { present: 45, absent: 5, percentage: 90 },
            CS303: { present: 44, absent: 6, percentage: 88 },
            CS304: { present: 46, absent: 4, percentage: 92 },
            CS305: { present: 43, absent: 7, percentage: 86 },
          },
        },
        {
          id: 5,
          name: "Carol Davis",
          rollNumber: "CS21B003",
          subjects: {
            CS301: { present: 48, absent: 2, percentage: 96 },
            CS302: { present: 45, absent: 5, percentage: 90 },
            CS303: { present: 44, absent: 6, percentage: 88 },
            CS304: { present: 46, absent: 4, percentage: 92 },
            CS305: { present: 43, absent: 7, percentage: 86 },
          },
        },
        {
          id: 5,
          name: "Carol Davis",
          rollNumber: "CS21B003",
          subjects: {
            CS301: { present: 48, absent: 2, percentage: 96 },
            CS302: { present: 45, absent: 5, percentage: 90 },
            CS303: { present: 44, absent: 6, percentage: 88 },
            CS304: { present: 46, absent: 4, percentage: 92 },
            CS305: { present: 43, absent: 7, percentage: 86 },
          },
          },
          {
          id: 5,
          name: "Carol Davis",
          rollNumber: "CS21B003",
          subjects: {
            CS301: { present: 48, absent: 2, percentage: 96 },
            CS302: { present: 45, absent: 5, percentage: 90 },
            CS303: { present: 44, absent: 6, percentage: 88 },
            CS304: { present: 46, absent: 4, percentage: 92 },
            CS305: { present: 43, absent: 7, percentage: 86 },
          },
          },
          {
          id: 6,
          name: "Carol Davis",
          rollNumber: "CS21B003",
          subjects: {
            CS301: { present: 48, absent: 2, percentage: 96 },
            CS302: { present: 45, absent: 5, percentage: 90 },
            CS303: { present: 44, absent: 6, percentage: 88 },
            CS304: { present: 46, absent: 4, percentage: 92 },
            CS305: { present: 43, absent: 7, percentage: 86 },
          },
          },
          {
          id: 8,
          name: "Carol Davis",
          rollNumber: "CS21B003",
          subjects: {
            CS301: { present: 48, absent: 2, percentage: 96 },
            CS302: { present: 45, absent: 5, percentage: 90 },
            CS303: { present: 44, absent: 6, percentage: 88 },
            CS304: { present: 46, absent: 4, percentage: 92 },
            CS305: { present: 43, absent: 7, percentage: 86 },
          },
          
        },
        
      ])

      setPendingRequests([
        {
          id: 1,
          studentName: "John Doe",
          rollNumber: "CS21B004",
          type: "Attendance Correction",
          subject: "Database Systems",
          reason: "Medical leave with certificate",
          submittedAt: "2 hours ago",
        },
        {
          id: 2,
          studentName: "Jane Smith",
          rollNumber: "CS21B005",
          type: "Subject Change",
          subject: "Elective Course",
          reason: "Want to change from AI to ML",
          submittedAt: "1 day ago",
        },
        {
          id: 3,
          studentName: "Mike Wilson",
          rollNumber: "CS21B006",
          type: "Personal Details",
          subject: "Contact Information",
          reason: "Phone number update required",
          submittedAt: "2 days ago",
        },
      ])

      setLoading(false)
    }, 1000)
  }, [])

  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return "bg-green-100 text-green-800"
    if (percentage >= 80) return "bg-green-50 text-green-700"
    if (percentage >= 70) return "bg-yellow-50 text-yellow-700"
    if (percentage >= 60) return "bg-yellow-100 text-yellow-800"
    if (percentage >= 50) return "bg-red-50 text-red-700"
    return "bg-red-100 text-red-800"
  }

  const getPercentageColor = (percentage) => {
    if (percentage >= 75) return "text-green-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const calculateClassStats = () => {
    const totalStudents = students.length
    const goodAttendance = students.filter((student) =>
      Object.values(student.subjects).some((subject) => subject.percentage >= 75),
    ).length
    const averageAttendance = students.filter((student) =>
      Object.values(student.subjects).some((subject) => subject.percentage >= 60 && subject.percentage < 75),
    ).length
    const lowAttendance = students.filter((student) =>
      Object.values(student.subjects).some((subject) => subject.percentage < 60),
    ).length

    return { totalStudents, goodAttendance, averageAttendance, lowAttendance }
  }

  const stats = calculateClassStats()

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
         <header className=" fixed top-0 left-0  w-full z-50 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Class Teacher Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block" onClick={() => navigate("/class-teacher/profile")}>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Class Info Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{classData.className}</h2>
              <p className="text-gray-600 mt-1">
                {classData.branch} • {classData.year} • {classData.semester}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-600">{classData.totalStudents}</p>
              <p className="text-sm text-gray-500">Total Students</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stats and Actions */}
          <div className="lg:col-span-1 space-y-6">


            {/* Pending Requests */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Pending Requests</h3>
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {pendingRequests.length}
                </span>
              </div>
              <div className="space-y-3">
                {pendingRequests.slice(0, 3).map((request) => (
                  <div key={request.id} className="border-l-4 border-yellow-400 bg-yellow-50 p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{request.studentName}</p>
                        <p className="text-xs text-gray-600">{request.rollNumber}</p>
                        <p className="text-xs text-yellow-800 mt-1">{request.type}</p>
                      </div>
                      <span className="text-xs text-gray-500">{request.submittedAt}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 " onClick={() => navigate("/class-teacher/requests")}>
                View All Requests
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100" onClick={() => navigate("/class-teacher/addStudent")}>
                  Add New Student
                </button>
                <button className="w-full text-left px-3 py-2 text-sm bg-green-50 text-green-700 rounded hover:bg-green-100" onClick={() => navigate("/class-teacher/downloadReports")}>
                  Download Report
                </button>
                <button className="w-full text-left px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded hover:bg-purple-100"  onClick={() => navigate("/class-teacher/TimeTable")}>
                 TimeTable
                </button>
                <button className="w-full text-left px-3 py-2 text-sm bg-yellow-50 text-yellow-700 rounded hover:bg-yellow-100" onClick={() => navigate("/class-teacher/viewCalendar")}>
                  View Calendar
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Student List */}
                  <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Student Attendance Overview</h3>
                {/* Search Input with Icon */}
                <div className="relative w-64">
                  <input
                    type="text"
                    placeholder="Search by Roll No. or Name"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <svg
                    className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
              </div>
               <div className="relative">
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto overflow-y-scroll scrollbar-hide">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="sticky left-0 top-0 z-20 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                          Student
                        </th>
                        {subjects.map((subject) => (
                          <th
                            key={subject.code}
                            className="sticky top-0 bg-gray-50 px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]"
                          >
                            <div>{subject.code}</div>
                            <div className="text-xs font-normal text-gray-400 mt-1 truncate">{subject.name}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                     <tbody className="bg-white divide-y divide-gray-200">
            {students
              .filter(student =>
                student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="sticky left-0 z-10 bg-white px-6 py-4 whitespace-nowrap border-r border-gray-200">
                    <div
                      className="cursor-pointer hover:text-blue-600"
                      onClick={() => navigate("/class-teacher/students-detail")}
                    >
                      <div className="text-sm font-medium text-gray-900 hover:text-blue-600">
                        {student.name}
                      </div>
                      <div className="text-sm text-gray-500">{student.rollNumber}</div>
                    </div>
                  </td>
                  {subjects.map((subject) => {
                    const attendance = student.subjects[subject.code]
                    return (
                              <td key={subject.code} className="px-3 py-4 whitespace-nowrap text-center">
                                <div className="space-y-1">
                                  <div className="flex justify-center gap-2 text-xs">
                                    <span className="text-green-600">{attendance.present}</span>
                                    <span className="text-red-600">{attendance.absent}</span>
                                  </div>
                                  <span
                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAttendanceColor(attendance.percentage)}`}
                                  >
                                    {attendance.percentage}%
                                  </span>
                                </div>
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
        </div>
       </div>
    
  )
}

export default ClassTeacherDashboard
