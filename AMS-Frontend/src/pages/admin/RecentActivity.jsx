"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const AdminRecentActivity = () => {
  const navigate = useNavigate()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    setTimeout(() => {
      setActivities([
        {
          id: 1,
          type: "teacher_update",
          title: "Teacher Profile Updated",
          description: "Updated contact and department info for Prof. Sharma",
          timestamp: "2024-07-18T12:30:00Z",
          target: "Prof. R. Sharma",
          details: "Email and Department changed to IT",
          icon: "👨‍🏫",
          color: "bg-blue-100 text-blue-800",
        },
        {
          id: 2,
          type: "timetable_update",
          title: "Timetable Modified",
          description: "Slot for CS401 replaced with elective",
          timestamp: "2024-07-18T09:45:00Z",
          target: "CS Final Year",
          details: "Monday 10AM slot now set to 'Machine Learning'",
          icon: "🗓️",
          color: "bg-green-100 text-green-800",
        },
        {
          id: 3,
          type: "report_generated",
          title: "Report Generated",
          description: "Weekly update sent to principal",
          timestamp: "2024-07-17T16:00:00Z",
          target: "Principal Office",
          details: "Includes performance, teacher leaves, timetable changes",
          icon: "📊",
          color: "bg-indigo-100 text-indigo-800",
        },
        {
          id: 4,
          type: "teacher_added",
          title: "New Teacher Added",
          description: "Added Prof. Neha Jain to Physics Dept.",
          timestamp: "2024-07-17T10:15:00Z",
          target: "Physics Department",
          details: "Subjects: Optics, Quantum Physics",
          icon: "➕",
          color: "bg-purple-100 text-purple-800",
        },
      ])
      setLoading(false)
    }, 800)
  }, [])

  const filteredActivities = activities.filter((a) => filter === "all" || a.type === filter)

  const getTimeAgo = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const minutes = Math.floor((now - time) / (1000 * 60))
    if (minutes < 60) return `${minutes} min ago`
    if (minutes < 1440) return `${Math.floor(minutes / 60)} hr ago`
    return `${Math.floor(minutes / 1440)} days ago`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading recent activities...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 text-gray-500 hover:text-gray-700">
              ← Back
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Admin Recent Activity</h1>
              <p className="text-sm text-gray-500">Overview of teacher and timetable updates</p>
            </div>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Export Log</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded shadow mb-6">
          <nav className="flex border-b text-sm font-medium">
            {[
              { id: "all", name: "All", count: activities.length },
              { id: "teacher_update", name: "Teacher Updates", count: activities.filter(a => a.type === "teacher_update").length },
              { id: "timetable_update", name: "Timetable", count: activities.filter(a => a.type === "timetable_update").length },
              { id: "report_generated", name: "Reports", count: activities.filter(a => a.type === "report_generated").length },
              { id: "teacher_added", name: "New Teachers", count: activities.filter(a => a.type === "teacher_added").length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-5 py-3 border-b-2 ${
                  filter === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.name}
                <span className="ml-2 bg-gray-100 text-xs rounded-full px-2 py-0.5">{tab.count}</span>
              </button>
            ))}
          </nav>
        </div>

        <section className="bg-white rounded shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Activity Log</h2>
          <div className="space-y-6">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-xl">
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      <span className={`px-2 py-1 rounded-full font-medium ${activity.color}`}>
                        {activity.type.replace("_", " ").toUpperCase()}
                      </span>
                      <div>{getTimeAgo(activity.timestamp)}</div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-700">
                    <strong>Target:</strong> {activity.target}
                    <br />
                    <strong>Details:</strong> {activity.details}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default AdminRecentActivity
