"use client"

import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { MdAnalytics, MdBarChart, MdPieChart, MdTrendingUp } from "react-icons/md"

const AttendanceAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    overallStats: {},
    classWiseData: [],
    subjectWiseData: [],
    monthlyTrends: [],
    attendanceDistribution: [],
  })
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("30") // days

  useEffect(() => {
    fetchAnalyticsData()
  }, [selectedPeriod])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      // Mock data - replace with actual API calls
      const mockData = {
        overallStats: {
          totalStudents: 450,
          totalClasses: 1250,
          averageAttendance: 78.5,
          totalSubjects: 12,
        },
        classWiseData: [
          { class: "Class 10A", attendance: 85.2, students: 35 },
          { class: "Class 10B", attendance: 78.9, students: 38 },
          { class: "Class 11A", attendance: 82.1, students: 32 },
          { class: "Class 11B", attendance: 76.5, students: 36 },
          { class: "Class 12A", attendance: 88.3, students: 30 },
          { class: "Class 12B", attendance: 81.7, students: 33 },
        ],
        subjectWiseData: [
          { subject: "Mathematics", attendance: 82.5, classes: 120 },
          { subject: "Physics", attendance: 79.3, classes: 100 },
          { subject: "Chemistry", attendance: 85.1, classes: 95 },
          { subject: "Biology", attendance: 88.2, classes: 90 },
          { subject: "English", attendance: 76.8, classes: 110 },
          { subject: "History", attendance: 74.5, classes: 85 },
        ],
        monthlyTrends: [
          { month: "Jan", attendance: 75.2 },
          { month: "Feb", attendance: 78.5 },
          { month: "Mar", attendance: 82.1 },
          { month: "Apr", attendance: 79.8 },
          { month: "May", attendance: 85.3 },
          { month: "Jun", attendance: 83.7 },
        ],
        attendanceDistribution: [
          { range: "90-100%", count: 125, color: "#22c55e" },
          { range: "80-89%", count: 180, color: "#3b82f6" },
          { range: "70-79%", count: 95, color: "#f59e0b" },
          { range: "60-69%", count: 35, color: "#ef4444" },
          { range: "Below 60%", count: 15, color: "#dc2626" },
        ],
      }

      setAnalyticsData(mockData)
    } catch (error) {
      console.error("Error fetching analytics data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <MdAnalytics className="mr-2 text-primary-600" />
          Attendance Analytics
        </h3>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="input-field w-auto"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 3 months</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* Overall Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">{analyticsData.overallStats.totalStudents}</div>
            <div className="text-sm text-gray-600">Total Students</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{analyticsData.overallStats.totalClasses}</div>
            <div className="text-sm text-gray-600">Total Classes</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{analyticsData.overallStats.averageAttendance}%</div>
            <div className="text-sm text-gray-600">Average Attendance</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{analyticsData.overallStats.totalSubjects}</div>
            <div className="text-sm text-gray-600">Total Subjects</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class-wise Attendance */}
        <div className="card">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <MdBarChart className="mr-2" />
            Class-wise Attendance
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.classWiseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="class" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="attendance" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Subject-wise Attendance */}
        <div className="card">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <MdBarChart className="mr-2" />
            Subject-wise Attendance
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.subjectWiseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="attendance" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trends */}
        <div className="card">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <MdTrendingUp className="mr-2" />
            Monthly Attendance Trends
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="attendance" stroke="#8b5cf6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Attendance Distribution */}
        <div className="card">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <MdPieChart className="mr-2" />
            Attendance Distribution
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.attendanceDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="count"
              >
                {analyticsData.attendanceDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {analyticsData.attendanceDistribution.map((item, index) => (
              <div key={index} className="flex items-center text-sm">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                <span>
                  {item.range}: {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AttendanceAnalytics
