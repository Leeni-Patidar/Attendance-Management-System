"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const RecentActivity = () => {
  const navigate = useNavigate()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    // Mock data for recent activities
    setTimeout(() => {
      setActivities([
        {
          id: 1,
          type: "qr_generated",
          title: "QR Code Generated",
          description: "QR code generated for CS301 - Section A",
          timestamp: "2024-03-16T10:30:00Z",
          class: "CS 3rd Year - Section A",
          subject: "Data Structures & Algorithms",
          details: "QR Code: QR_CS301_001, Valid for 10 minutes",
          icon: "📱",
          color: "bg-blue-100 text-blue-800",
        },
        {
          id: 2,
          type: "attendance_marked",
          title: "Attendance Recorded",
          description: "38 out of 45 students marked attendance",
          timestamp: "2024-03-16T10:35:00Z",
          class: "CS 3rd Year - Section A",
          subject: "Data Structures & Algorithms",
          details: "Attendance Rate: 84.4%",
          icon: "✅",
          color: "bg-green-100 text-green-800",
        },
        {
          id: 3,
          type: "arrangement_added",
          title: "Arrangement Class Added",
          description: "New arrangement class scheduled",
          timestamp: "2024-03-16T09:15:00Z",
          class: "CS 3rd Year - Section C",
          subject: "Operating Systems",
          details: "Arranged for Prof. Johnson on 2024-03-20",
          icon: "📅",
          color: "bg-purple-100 text-purple-800",
        },
        {
          id: 4,
          type: "student_message",
          title: "Student Message",
          description: "Message sent to low attendance students",
          timestamp: "2024-03-16T08:45:00Z",
          class: "CS 3rd Year - Section B",
          subject: "Data Structures & Algorithms",
          details: "5 students notified about attendance",
          icon: "💬",
          color: "bg-yellow-100 text-yellow-800",
        },
        {
          id: 5,
          type: "report_generated",
          title: "Report Generated",
          description: "Monthly attendance report created",
          timestamp: "2024-03-15T16:20:00Z",
          class: "All Classes",
          subject: "All Subjects",
          details: "March 2024 Attendance Summary",
          icon: "📊",
          color: "bg-indigo-100 text-indigo-800",
        },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const filteredActivities = activities.filter((activity) => {
    if (filter === "all") return true
    return activity.type === filter
  })

  const getTimeAgo = (timestamp) => {
    const now = new Date()
    const activityTime = new Date(timestamp)
    const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60))

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`
    }
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
                <h1 className="text-xl font-semibold text-gray-900">Recent Activity</h1>
                <p className="text-sm text-gray-500">Track all your recent actions and updates</p>
              </div>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Export Activity Log
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              {[
                { id: "all", name: "All Activities", count: activities.length },
                {
                  id: "qr_generated",
                  name: "QR Codes",
                  count: activities.filter((a) => a.type === "qr_generated").length,
                },
                {
                  id: "attendance_marked",
                  name: "Attendance",
                  count: activities.filter((a) => a.type === "attendance_marked").length,
                },
                {
                  id: "arrangement_added",
                  name: "Arrangements",
                  count: activities.filter((a) => a.type === "arrangement_added").length,
                },
                {
                  id: "report_generated",
                  name: "Reports",
                  count: activities.filter((a) => a.type === "report_generated").length,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    filter === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.name}
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">{tab.count}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Activity Timeline</h3>
          <div className="space-y-6">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                    {activity.icon}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${activity.color}`}>
                        {activity.type.replace("_", " ").toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">{getTimeAgo(activity.timestamp)}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Class:</span> {activity.class} |
                      <span className="font-medium"> Subject:</span> {activity.subject}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{activity.details}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecentActivity
