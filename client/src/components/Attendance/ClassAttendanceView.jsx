"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const ClassAttendanceView = ({ classData }) => {
  const [attendanceData, setAttendanceData] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    averageAttendance: 0,
  })

  useEffect(() => {
    if (classData) {
      fetchAttendanceData()
    }
  }, [classData, selectedDate, selectedSubject])

  const fetchAttendanceData = async () => {
    setLoading(true)
    try {
      // Mock data - replace with actual API call
      const mockAttendanceData = [
        {
          id: 1,
          student: { name: "John Doe", studentId: "ST001" },
          subjects: {
            Mathematics: "present",
            Physics: "present",
            Chemistry: "absent",
            Biology: "present",
            English: "present",
          },
          totalPresent: 4,
          totalClasses: 5,
          percentage: 80,
        },
        {
          id: 2,
          student: { name: "Jane Smith", studentId: "ST002" },
          subjects: {
            Mathematics: "present",
            Physics: "absent",
            Chemistry: "present",
            Biology: "present",
            English: "present",
          },
          totalPresent: 4,
          totalClasses: 5,
          percentage: 80,
        },
        {
          id: 3,
          student: { name: "Mike Johnson", studentId: "ST003" },
          subjects: {
            Mathematics: "absent",
            Physics: "present",
            Chemistry: "present",
            Biology: "absent",
            English: "present",
          },
          totalPresent: 3,
          totalClasses: 5,
          percentage: 60,
        },
        {
          id: 4,
          student: { name: "Sarah Wilson", studentId: "ST004" },
          subjects: {
            Mathematics: "present",
            Physics: "present",
            Chemistry: "present",
            Biology: "present",
            English: "present",
          },
          totalPresent: 5,
          totalClasses: 5,
          percentage: 100,
        },
      ]

      setAttendanceData(mockAttendanceData)

      // Calculate stats
      const totalStudents = mockAttendanceData.length
      const presentToday = mockAttendanceData.filter((student) =>
        selectedSubject === "all"
          ? student.totalPresent > student.totalClasses / 2
          : student.subjects[selectedSubject] === "present",
      ).length
      const absentToday = totalStudents - presentToday
      const averageAttendance = mockAttendanceData.reduce((sum, student) => sum + student.percentage, 0) / totalStudents

      setStats({
        totalStudents,
        presentToday,
        absentToday,
        averageAttendance: Math.round(averageAttendance * 100) / 100,
      })
    } catch (error) {
      console.error("Error fetching attendance data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getAttendanceStatus = (percentage) => {
    if (percentage >= 80) return { status: "Good", color: "text-green-600", bgColor: "bg-green-100" }
    if (percentage >= 60) return { status: "Average", color: "text-yellow-600", bgColor: "bg-yellow-100" }
    return { status: "Poor", color: "text-red-600", bgColor: "bg-red-100" }
  }

  const getSubjectStatusColor = (status) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800"
      case "absent":
        return "bg-red-100 text-red-800"
      case "late":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "English"]

  const chartData = attendanceData.map((student) => ({
    name: student.student.name,
    percentage: student.percentage,
  }))

  if (!classData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No class data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-medium text-gray-900">Class Attendance Overview</h3>
        <div className="mt-3 sm:mt-0 flex space-x-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input-field w-auto"
          />
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="input-field w-auto"
          >
            <option value="all">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">{stats.totalStudents}</div>
            <div className="text-sm text-gray-600">Total Students</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{stats.presentToday}</div>
            <div className="text-sm text-gray-600">Present Today</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">{stats.absentToday}</div>
            <div className="text-sm text-gray-600">Absent Today</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.averageAttendance}%</div>
            <div className="text-sm text-gray-600">Average Attendance</div>
          </div>
        </div>
      </div>

      {/* Attendance Chart */}
      <div className="card">
        <h4 className="text-md font-medium text-gray-900 mb-4">Student Attendance Percentage</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="percentage" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Attendance Table */}
      <div className="card">
        <h4 className="text-md font-medium text-gray-900 mb-4">Detailed Attendance</h4>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student ID
                  </th>
                  {selectedSubject === "all" ? (
                    subjects.map((subject) => (
                      <th
                        key={subject}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {subject}
                      </th>
                    ))
                  ) : (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {selectedSubject}
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Overall %
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceData.map((student) => {
                  const attendanceStatus = getAttendanceStatus(student.percentage)
                  return (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.student.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.student.studentId}</td>
                      {selectedSubject === "all" ? (
                        subjects.map((subject) => (
                          <td key={subject} className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSubjectStatusColor(student.subjects[subject])}`}
                            >
                              {student.subjects[subject]}
                            </span>
                          </td>
                        ))
                      ) : (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSubjectStatusColor(student.subjects[selectedSubject])}`}
                          >
                            {student.subjects[selectedSubject]}
                          </span>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.percentage}%</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${attendanceStatus.bgColor} ${attendanceStatus.color}`}
                        >
                          {attendanceStatus.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ClassAttendanceView
