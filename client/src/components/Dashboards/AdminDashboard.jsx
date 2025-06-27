"use client"

import { useState, useEffect } from "react"
import UserManagement from "../Admin/UserManagement"
import AttendanceAnalytics from "../Admin/AttendanceAnalytics"
import SystemOverview from "../Admin/SystemOverview"
import { MdAdminPanelSettings, MdDashboard, MdPeople, MdAnalytics } from "react-icons/md"

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview")
  const [systemStats, setSystemStats] = useState({})

  useEffect(() => {
    fetchSystemStats()
  }, [])

  const fetchSystemStats = async () => {
    // Fetch system statistics
    // Implementation here
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <MdAdminPanelSettings className="mr-3 text-primary-600" />
          Admin Dashboard
        </h1>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === "overview"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <MdDashboard className="mr-2" />
              System Overview
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === "users"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <MdPeople className="mr-2" />
              User Management
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === "analytics"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <MdAnalytics className="mr-2" />
              Analytics
            </button>
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === "overview" && <SystemOverview stats={systemStats} />}
          {activeTab === "users" && <UserManagement />}
          {activeTab === "analytics" && <AttendanceAnalytics />}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
