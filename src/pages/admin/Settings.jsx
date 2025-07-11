"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const Settings = () => {
  const navigate = useNavigate()
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("general")

  useEffect(() => {
    // Mock settings data
    setTimeout(() => {
      setSettings({
        general: {
          systemName: "University Attendance Management System",
          academicYear: "2024-2025",
          semester: "Spring 2024",
          timezone: "Asia/Kolkata",
          dateFormat: "DD/MM/YYYY",
          language: "English",
        },
        attendance: {
          qrCodeValidityMinutes: 10,
          attendanceThreshold: 75,
          lateMarkingMinutes: 15,
          autoMarkAbsent: true,
          allowManualAttendance: false,
          requireLocationVerification: true,
        },
        notifications: {
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
          lowAttendanceAlerts: true,
          dailyReports: true,
          weeklyReports: true,
        },
        security: {
          sessionTimeout: 30,
          passwordMinLength: 8,
          requireSpecialChars: true,
          twoFactorAuth: false,
          loginAttempts: 3,
          accountLockoutMinutes: 15,
        },
        backup: {
          autoBackup: true,
          backupFrequency: "daily",
          retentionDays: 30,
          backupLocation: "cloud",
          lastBackup: "2024-03-16T02:00:00Z",
        },
      })
      setLoading(false)
    }, 1000)
  }, [])

  const handleSettingChange = (category, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }))
  }

  const saveSettings = () => {
    alert("Settings saved successfully!")
  }

  const resetSettings = () => {
    if (window.confirm("Are you sure you want to reset all settings to default?")) {
      alert("Settings reset to default values!")
    }
  }

  const performBackup = () => {
    alert("Manual backup initiated...")
  }

  const testNotifications = () => {
    alert("Test notification sent!")
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
                <h1 className="text-xl font-semibold text-gray-900">System Settings</h1>
                <p className="text-sm text-gray-500">Configure system preferences and options</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={resetSettings} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
                Reset to Default
              </button>
              <button onClick={saveSettings} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-4">
              <nav className="space-y-2">
                {[
                  { id: "general", name: "General", icon: "⚙️" },
                  { id: "attendance", name: "Attendance", icon: "📅" },
                  { id: "notifications", name: "Notifications", icon: "🔔" },
                  { id: "security", name: "Security", icon: "🔒" },
                  { id: "backup", name: "Backup", icon: "💾" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
                      activeTab === tab.id ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <span>{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === "general" && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">General Settings</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">System Name</label>
                      <input
                        type="text"
                        value={settings.general?.systemName || ""}
                        onChange={(e) => handleSettingChange("general", "systemName", e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
                      <input
                        type="text"
                        value={settings.general?.academicYear || ""}
                        onChange={(e) => handleSettingChange("general", "academicYear", e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Semester</label>
                      <select
                        value={settings.general?.semester || ""}
                        onChange={(e) => handleSettingChange("general", "semester", e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Spring 2024">Spring 2024</option>
                        <option value="Fall 2024">Fall 2024</option>
                        <option value="Summer 2024">Summer 2024</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                      <select
                        value={settings.general?.timezone || ""}
                        onChange={(e) => handleSettingChange("general", "timezone", e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                        <option value="America/New_York">America/New_York (EST)</option>
                        <option value="Europe/London">Europe/London (GMT)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                      <select
                        value={settings.general?.dateFormat || ""}
                        onChange={(e) => handleSettingChange("general", "dateFormat", e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                      <select
                        value={settings.general?.language || ""}
                        onChange={(e) => handleSettingChange("general", "language", e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="English">English</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Spanish">Spanish</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "attendance" && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Attendance Settings</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">QR Code Validity (minutes)</label>
                      <input
                        type="number"
                        value={settings.attendance?.qrCodeValidityMinutes || ""}
                        onChange={(e) =>
                          handleSettingChange("attendance", "qrCodeValidityMinutes", Number.parseInt(e.target.value))
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Attendance Threshold (%)</label>
                      <input
                        type="number"
                        value={settings.attendance?.attendanceThreshold || ""}
                        onChange={(e) =>
                          handleSettingChange("attendance", "attendanceThreshold", Number.parseInt(e.target.value))
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Late Marking Window (minutes)
                      </label>
                      <input
                        type="number"
                        value={settings.attendance?.lateMarkingMinutes || ""}
                        onChange={(e) =>
                          handleSettingChange("attendance", "lateMarkingMinutes", Number.parseInt(e.target.value))
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.attendance?.autoMarkAbsent || false}
                        onChange={(e) => handleSettingChange("attendance", "autoMarkAbsent", e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">Auto-mark absent after QR code expires</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.attendance?.allowManualAttendance || false}
                        onChange={(e) => handleSettingChange("attendance", "allowManualAttendance", e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">Allow manual attendance marking</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.attendance?.requireLocationVerification || false}
                        onChange={(e) =>
                          handleSettingChange("attendance", "requireLocationVerification", e.target.checked)
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">Require location verification</label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Settings</h3>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-sm font-medium text-gray-900">Email Notifications</label>
                        <p className="text-sm text-gray-500">Send notifications via email</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications?.emailNotifications || false}
                        onChange={(e) => handleSettingChange("notifications", "emailNotifications", e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-sm font-medium text-gray-900">SMS Notifications</label>
                        <p className="text-sm text-gray-500">Send notifications via SMS</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications?.smsNotifications || false}
                        onChange={(e) => handleSettingChange("notifications", "smsNotifications", e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-sm font-medium text-gray-900">Push Notifications</label>
                        <p className="text-sm text-gray-500">Send push notifications to mobile devices</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications?.pushNotifications || false}
                        onChange={(e) => handleSettingChange("notifications", "pushNotifications", e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-sm font-medium text-gray-900">Low Attendance Alerts</label>
                        <p className="text-sm text-gray-500">Alert when student attendance falls below threshold</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications?.lowAttendanceAlerts || false}
                        onChange={(e) => handleSettingChange("notifications", "lowAttendanceAlerts", e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-sm font-medium text-gray-900">Daily Reports</label>
                        <p className="text-sm text-gray-500">Send daily attendance reports</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications?.dailyReports || false}
                        onChange={(e) => handleSettingChange("notifications", "dailyReports", e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-sm font-medium text-gray-900">Weekly Reports</label>
                        <p className="text-sm text-gray-500">Send weekly attendance summaries</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications?.weeklyReports || false}
                        onChange={(e) => handleSettingChange("notifications", "weeklyReports", e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <button
                      onClick={testNotifications}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Test Notifications
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                      <input
                        type="number"
                        value={settings.security?.sessionTimeout || ""}
                        onChange={(e) =>
                          handleSettingChange("security", "sessionTimeout", Number.parseInt(e.target.value))
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Password Minimum Length</label>
                      <input
                        type="number"
                        value={settings.security?.passwordMinLength || ""}
                        onChange={(e) =>
                          handleSettingChange("security", "passwordMinLength", Number.parseInt(e.target.value))
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                      <input
                        type="number"
                        value={settings.security?.loginAttempts || ""}
                        onChange={(e) =>
                          handleSettingChange("security", "loginAttempts", Number.parseInt(e.target.value))
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account Lockout (minutes)</label>
                      <input
                        type="number"
                        value={settings.security?.accountLockoutMinutes || ""}
                        onChange={(e) =>
                          handleSettingChange("security", "accountLockoutMinutes", Number.parseInt(e.target.value))
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.security?.requireSpecialChars || false}
                        onChange={(e) => handleSettingChange("security", "requireSpecialChars", e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Require special characters in passwords
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.security?.twoFactorAuth || false}
                        onChange={(e) => handleSettingChange("security", "twoFactorAuth", e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">Enable two-factor authentication</label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "backup" && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Backup Settings</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
                      <select
                        value={settings.backup?.backupFrequency || ""}
                        onChange={(e) => handleSettingChange("backup", "backupFrequency", e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Retention Period (days)</label>
                      <input
                        type="number"
                        value={settings.backup?.retentionDays || ""}
                        onChange={(e) =>
                          handleSettingChange("backup", "retentionDays", Number.parseInt(e.target.value))
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Backup Location</label>
                      <select
                        value={settings.backup?.backupLocation || ""}
                        onChange={(e) => handleSettingChange("backup", "backupLocation", e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="cloud">Cloud Storage</option>
                        <option value="local">Local Storage</option>
                        <option value="both">Both</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.backup?.autoBackup || false}
                      onChange={(e) => handleSettingChange("backup", "autoBackup", e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">Enable automatic backups</label>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Last Backup</p>
                        <p className="text-sm text-gray-500">
                          {settings.backup?.lastBackup
                            ? new Date(settings.backup.lastBackup).toLocaleString()
                            : "Never"}
                        </p>
                      </div>
                      <button
                        onClick={performBackup}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                      >
                        Backup Now
                      </button>
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

export default Settings
