"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"

const SubjectDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [subject, setSubject] = useState(null)
  const [attendanceData, setAttendanceData] = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data for subject detail
    setTimeout(() => {
      setSubject({
        id: id,
        name: "Data Structures & Algorithms",
        code: "CS301",
        credits: 4,
        teacher: "Prof. Smith",
        totalClasses: 50,
        presentDays: 45,
        absentDays: 5,
        attendance: 90,
      })

      // Generate mock attendance data for calendar
      const mockData = []
      for (let i = 0; i < 30; i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        if (Math.random() > 0.3) {
          // 70% chance of having class
          mockData.push({
            date: date.toISOString().split("T")[0],
            status: Math.random() > 0.1 ? "present" : "absent", // 90% present rate
          })
        }
      }
      setAttendanceData(mockData)
      setLoading(false)
    }, 1000)
  }, [id])

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    // Convert JS Sunday-first (0..6, Sun..Sat) to Monday-first (0..6, Mon..Sun)
    const raw = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    return (raw + 6) % 7
  }

  const formatDate = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  const getAttendanceStatus = (dateStr) => {
    const record = attendanceData.find((d) => d.date === dateStr)
    return record ? record.status : null
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "present":
        return "bg-green-500 text-white"
      case "absent":
        return "bg-red-500 text-white"
      default:
        return "bg-white text-gray-700 hover:bg-gray-50"
    }
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []
    const dayNames = [ "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" , "Sun"]

    // Add day headers
    dayNames.forEach((day) => {
      days.push(
        <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
          {day}
        </div>,
      )
    })

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day)
      const status = getAttendanceStatus(dateStr)

      days.push(
        <div
          key={day}
          className={`p-2 text-center text-sm border rounded-lg cursor-pointer transition-colors ${getStatusColor(status)}`}
        >
          {day}
        </div>,
      )
    }

    return days
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
          <div className="flex items-center h-16">
            <button onClick={() => navigate(-1)} className="mr-4 p-2 text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{subject?.name}</h1>
              <p className="text-sm text-gray-500">
                {subject?.code} • {subject?.teacher}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Subject Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Subject Name</p>
                  <p className="text-sm text-gray-900">{subject?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Subject Code</p>
                  <p className="text-sm text-gray-900">{subject?.code}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Credits</p>
                  <p className="text-sm text-gray-900">{subject?.credits}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Teacher</p>
                  <p className="text-sm text-gray-900">{subject?.teacher}</p>
                </div>
              </div>
            </div>

            {/* Attendance Summary */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Classes</span>
                  <span className="font-medium">{subject?.totalClasses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Present</span>
                  <span className="font-medium text-green-600">{subject?.presentDays}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Absent</span>
                  <span className="font-medium text-red-600">{subject?.absentDays}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Percentage</span>
                  <span className="font-bold text-blue-600">{subject?.attendance}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar */}
           <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Attendance Calendar</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-lg font-medium min-w-[150px] text-center">
                    {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </span>
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-6">{renderCalendar()}</div>

              {/* Legend */}
              <div className="flex justify-center gap-6 text-sm mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>Present</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span>Absent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <span>No Class</span>
                </div>
              </div>

 {/* Row with Scan QR Code Card */}
              <div className="flex justify-center">
                <div
                  className="bg-blue-50 border border-blue-200 rounded-lg shadow-md p-6 flex flex-col items-center cursor-pointer hover:bg-blue-100 transition"
                  onClick={() => navigate("/student/qr-scan")}
                  style={{ minWidth: 220 }}
                >
                  <img
                    src="Attendance-Management-System/public/qr code.png"
                    alt="Scan QR"
                    className="w-16 h-16 mb-3"
                  />
                  <span className="text-lg font-semibold text-blue-700 mb-1">Scan QR Code</span>
                  <span className="text-sm text-blue-500">Mark your attendance</span>
                </div>
              </div>
            </div>
          </div>

            </div>
          </div>
        </div>
    //   </div>
    // </div>
  )
}

export default SubjectDetail
