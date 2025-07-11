"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const Calendar = () => {
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [attendanceData, setAttendanceData] = useState({})
  const [selectedDate, setSelectedDate] = useState(null)
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data for calendar
    setTimeout(() => {
      setSubjects([
        { id: 1, name: "Data Structures", code: "CS301", color: "bg-blue-500" },
        { id: 2, name: "Database Systems", code: "CS302", color: "bg-green-500" },
        { id: 3, name: "Computer Networks", code: "CS303", color: "bg-purple-500" },
        { id: 4, name: "Software Engineering", code: "CS304", color: "bg-yellow-500" },
      ])

      // Generate mock attendance data
      const mockData = {}
      for (let i = 0; i < 60; i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split("T")[0]

        if (Math.random() > 0.3) {
          // 70% chance of having classes
          mockData[dateStr] = subjects
            .map((subject) => ({
              ...subject,
              status: Math.random() > 0.15 ? "present" : "absent", // 85% attendance rate
              time: `${Math.floor(Math.random() * 4) + 9}:00 AM`,
            }))
            .filter(() => Math.random() > 0.5) // Random subjects per day
        }
      }
      setAttendanceData(mockData)
      setLoading(false)
    }, 1000)
  }, [])

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDate = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  const getDayAttendance = (dateStr) => {
    return attendanceData[dateStr] || []
  }

  const getDayStatus = (dateStr) => {
    const dayData = getDayAttendance(dateStr)
    if (dayData.length === 0) return "no-class"

    const presentCount = dayData.filter((d) => d.status === "present").length
    const totalCount = dayData.length

    if (presentCount === totalCount) return "all-present"
    if (presentCount === 0) return "all-absent"
    return "partial"
  }

  const getDayColor = (status) => {
    switch (status) {
      case "all-present":
        return "bg-green-500 text-white"
      case "all-absent":
        return "bg-red-500 text-white"
      case "partial":
        return "bg-yellow-500 text-white"
      default:
        return "bg-white text-gray-700 hover:bg-gray-50"
    }
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    // Add day headers
    dayNames.forEach((day) => {
      days.push(
        <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
          {day}
        </div>,
      )
    })

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-3"></div>)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day)
      const status = getDayStatus(dateStr)
      const isToday = dateStr === new Date().toISOString().split("T")[0]
      const isSelected = selectedDate === dateStr

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(dateStr)}
          className={`p-3 text-center text-sm border rounded-lg cursor-pointer transition-colors relative ${getDayColor(status)} ${
            isToday ? "ring-2 ring-blue-500" : ""
          } ${isSelected ? "ring-2 ring-purple-500" : ""}`}
        >
          <div className="font-medium">{day}</div>
          {getDayAttendance(dateStr).length > 0 && (
            <div className="text-xs mt-1">
              {getDayAttendance(dateStr).length} class{getDayAttendance(dateStr).length > 1 ? "es" : ""}
            </div>
          )}
          {isToday && <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>}
        </div>,
      )
    }

    return days
  }

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
    setSelectedDate(null)
  }

  const getMonthStats = () => {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

    let totalClasses = 0
    let presentClasses = 0

    for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0]
      const dayData = getDayAttendance(dateStr)
      totalClasses += dayData.length
      presentClasses += dayData.filter((c) => c.status === "present").length
    }

    return {
      totalClasses,
      presentClasses,
      percentage: totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0,
    }
  }

  const monthStats = getMonthStats()

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
          <div className="flex items-center h-16">
            <button onClick={() => navigate(-1)} className="mr-4 p-2 text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Attendance Calendar</h1>
              <p className="text-sm text-gray-500">View your attendance across all subjects</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => navigateMonth(-1)} className="p-2 text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Today
                  </button>
                  <button onClick={() => navigateMonth(1)} className="p-2 text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 mb-6">{renderCalendar()}</div>

              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>All Present</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span>Partial Attendance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span>All Absent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <span>No Classes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Month Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Monthly Summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Classes</span>
                  <span className="font-medium">{monthStats.totalClasses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Present</span>
                  <span className="font-medium text-green-600">{monthStats.presentClasses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Absent</span>
                  <span className="font-medium text-red-600">
                    {monthStats.totalClasses - monthStats.presentClasses}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Percentage</span>
                  <span className="font-bold text-blue-600">{monthStats.percentage}%</span>
                </div>
              </div>
            </div>

            {/* Selected Date Details */}
            {selectedDate && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="font-semibold text-gray-900 mb-4">
                  {new Date(selectedDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h4>
                <div className="space-y-3">
                  {getDayAttendance(selectedDate).length === 0 ? (
                    <p className="text-sm text-gray-500">No classes scheduled</p>
                  ) : (
                    getDayAttendance(selectedDate).map((classData, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{classData.name}</p>
                          <p className="text-xs text-gray-500">
                            {classData.code} • {classData.time}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            classData.status === "present" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {classData.status === "present" ? "✓ Present" : "✗ Absent"}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Subjects Legend */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Subjects</h4>
              <div className="space-y-2">
                {subjects.map((subject) => (
                  <div key={subject.id} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${subject.color}`}></div>
                    <div>
                      <p className="text-sm font-medium">{subject.name}</p>
                      <p className="text-xs text-gray-500">{subject.code}</p>
                    </div>
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

export default Calendar
