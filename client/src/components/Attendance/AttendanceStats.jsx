"use client"

import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import {
  MdBarChart,
  MdPieChart,
  MdTableChart,
  MdCalendarToday,
  MdCheckCircle,
  MdPercent,
  MdWarning,
  MdError,
} from "react-icons/md"

const AttendanceStats = ({ data }) => {
  const [stats, setStats] = useState({
    totalClasses: 0,
    attendedClasses: 0,
    percentage: 0,
    subjectWiseData: [],
  })

  useEffect(() => {
    calculateStats()
  }, [data])

  const calculateStats = () => {
    // Mock data for demonstration
    const mockStats = {
      totalClasses: 120,
      attendedClasses: 95,
      percentage: 79.2,
      subjectWiseData: [
        { subject: "Mathematics", percentage: 85.2, attended: 23, total: 27 },
        { subject: "Physics", percentage: 78.9, attended: 19, total: 24 },
        { subject: "Chemistry", percentage: 82.1, attended: 21, total: 26 },
        { subject: "Biology", percentage: 76.5, attended: 18, total: 23 },
        { subject: "English", percentage: 88.3, attended: 14, total: 20 },
      ],
    }
    setStats(mockStats)
  }

  const getAttendanceStatus = (percentage) => {
    if (percentage >= 75)
      return { status: "Good", color: "text-green-600", bgColor: "bg-green-100", icon: MdCheckCircle }
    if (percentage >= 60)
      return { status: "Warning", color: "text-yellow-600", bgColor: "bg-yellow-100", icon: MdWarning }
    return { status: "Critical", color: "text-red-600", bgColor: "bg-red-100", icon: MdError }
  }

  const pieData = [
    { name: "Present", value: stats.attendedClasses, color: "#22c55e" },
    { name: "Absent", value: stats.totalClasses - stats.attendedClasses, color: "#ef4444" },
  ]

  const attendanceStatus = getAttendanceStatus(stats.percentage)
  const StatusIcon = attendanceStatus.icon

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 flex items-center">
        <MdBarChart className="mr-2 text-primary-600" />
        Attendance Statistics
      </h3>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="text-center">
            <MdCalendarToday className="text-3xl text-primary-600 mb-2 mx-auto" />
            <div className="text-3xl font-bold text-primary-600">{stats.totalClasses}</div>
            <div className="text-sm text-gray-600">Total Classes</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <MdCheckCircle className="text-3xl text-green-600 mb-2 mx-auto" />
            <div className="text-3xl font-bold text-green-600">{stats.attendedClasses}</div>
            <div className="text-sm text-gray-600">Classes Attended</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <MdPercent className="text-3xl text-primary-600 mb-2 mx-auto" />
            <div className="text-3xl font-bold text-primary-600">{stats.percentage}%</div>
            <div className="text-sm text-gray-600">Attendance Percentage</div>
          </div>
        </div>
      </div>

      {/* Attendance Status Alert */}
      <div className={`p-4 rounded-lg ${attendanceStatus.bgColor} flex items-center`}>
        <StatusIcon className={`text-lg ${attendanceStatus.color} mr-3`} />
        <div>
          <div className={`text-lg font-semibold ${attendanceStatus.color}`}>Status: {attendanceStatus.status}</div>
          {stats.percentage < 75 && (
            <div className="mt-2 text-sm text-gray-700">
              {stats.percentage < 60
                ? "Critical: Your attendance is below 60%. Immediate action required!"
                : "Warning: Your attendance is below 75%. Please improve your attendance."}
            </div>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="card">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <MdPieChart className="mr-2" />
            Overall Attendance
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={5} dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="card">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <MdBarChart className="mr-2" />
            Subject-wise Attendance
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.subjectWiseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="percentage" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Subject-wise Details */}
      <div className="card">
        <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <MdTableChart className="mr-2" />
          Subject-wise Breakdown
        </h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Classes Attended
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Classes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.subjectWiseData.map((subject, index) => {
                const subjectStatus = getAttendanceStatus(subject.percentage)
                return (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{subject.subject}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subject.attended}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subject.total}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {Math.round(subject.percentage * 100) / 100}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${subjectStatus.bgColor} ${subjectStatus.color}`}
                      >
                        {subjectStatus.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AttendanceStats
