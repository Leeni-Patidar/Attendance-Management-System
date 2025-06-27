"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
// import {
//   MdDashboard,
//   MdPeople,
//   MdAccessTime,
//   MdStorage,
//   MdActivity,
//   MdSettings,
//   MdBackup,
//   MdAssessment,
// } from "react-icons/md"
import * as MdIcons from "react-icons/md";


const SystemOverview = ({ stats }) => {
  const [systemHealth, setSystemHealth] = useState({
    status: "healthy",
    uptime: "99.9%",
    lastBackup: "2024-01-15 02:00:00",
    activeUsers: 342,
    storageUsed: "2.3 GB",
    storageTotal: "10 GB",
  })

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, action: "User login", user: "John Doe", timestamp: "2 minutes ago", type: "info" },
    { id: 2, action: "QR Code generated", user: "Prof. Smith", timestamp: "5 minutes ago", type: "success" },
    { id: 3, action: "Attendance marked", user: "Jane Wilson", timestamp: "8 minutes ago", type: "success" },
    { id: 4, action: "Failed login attempt", user: "Unknown", timestamp: "12 minutes ago", type: "warning" },
    { id: 5, action: "New user registered", user: "Admin", timestamp: "15 minutes ago", type: "info" },
  ])

  const [performanceData, setPerformanceData] = useState([
    { time: "00:00", users: 45, requests: 120 },
    { time: "04:00", users: 23, requests: 80 },
    { time: "08:00", users: 156, requests: 340 },
    { time: "12:00", users: 234, requests: 520 },
    { time: "16:00", users: 189, requests: 410 },
    { time: "20:00", users: 98, requests: 230 },
  ])

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setSystemHealth((prev) => ({
        ...prev,
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 10) - 5,
      }))
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const getActivityIcon = (type) => {
    switch (type) {
      case "success":
        return "✅"
      case "warning":
        return "⚠️"
      case "error":
        return "❌"
      default:
        return "ℹ️"
    }
  }

  const getActivityColor = (type) => {
    switch (type) {
      case "success":
        return "text-green-600"
      case "warning":
        return "text-yellow-600"
      case "error":
        return "text-red-600"
      default:
        return "text-blue-600"
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 flex items-center">
        <MdDashboard className="mr-2 text-primary-600" />
        System Overview
      </h3>

      {/* System Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <MdActivity className="text-green-600 text-sm" />
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">System Status</div>
              <div className="text-sm text-green-600 capitalize">{systemHealth.status}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <MdPeople className="text-blue-600 text-sm" />
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">Active Users</div>
              <div className="text-sm text-blue-600">{systemHealth.activeUsers}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <MdAccessTime className="text-purple-600 text-sm" />
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">Uptime</div>
              <div className="text-sm text-purple-600">{systemHealth.uptime}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <MdStorage className="text-orange-600 text-sm" />
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">Storage</div>
              <div className="text-sm text-orange-600">
                {systemHealth.storageUsed} / {systemHealth.storageTotal}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="card">
        <h4 className="text-md font-medium text-gray-900 mb-4">System Performance (Last 24 Hours)</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} name="Active Users" />
            <Line type="monotone" dataKey="requests" stroke="#10b981" strokeWidth={2} name="API Requests" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="card">
          <h4 className="text-md font-medium text-gray-900 mb-4">Recent Activity</h4>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <span className="text-lg">{getActivityIcon(activity.type)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500">
                    by <span className={getActivityColor(activity.type)}>{activity.user}</span>
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <p className="text-xs text-gray-400">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <button className="text-sm text-primary-600 hover:text-primary-500">View all activity →</button>
          </div>
        </div>

        {/* System Information */}
        <div className="card">
          <h4 className="text-md font-medium text-gray-900 mb-4">System Information</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Server Version</span>
              <span className="text-sm font-medium text-gray-900">v2.1.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Database Version</span>
              <span className="text-sm font-medium text-gray-900">MongoDB 6.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Last Backup</span>
              <span className="text-sm font-medium text-gray-900">{systemHealth.lastBackup}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Environment</span>
              <span className="text-sm font-medium text-gray-900">Production</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Memory Usage</span>
              <span className="text-sm font-medium text-gray-900">1.2 GB / 4 GB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">CPU Usage</span>
              <span className="text-sm font-medium text-gray-900">23%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h4 className="text-md font-medium text-gray-900 mb-4">Quick Actions</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
            <MdBackup className="text-2xl mb-2 mx-auto" />
            <div className="text-sm font-medium text-gray-900">Backup Database</div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
            <MdAssessment className="text-2xl mb-2 mx-auto" />
            <div className="text-sm font-medium text-gray-900">Generate Report</div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
            <MdSettings className="text-2xl mb-2 mx-auto" />
            <div className="text-sm font-medium text-gray-900">System Settings</div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
            <MdActivity className="text-2xl mb-2 mx-auto" />
            <div className="text-sm font-medium text-gray-900">View Logs</div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default SystemOverview
