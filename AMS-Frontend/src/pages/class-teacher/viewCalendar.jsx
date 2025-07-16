"use client"

import { useState } from "react"

const ViewCalendar = ({ onBack }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [showAddEventModal, setShowAddEventModal] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    type: "note",
    date: "",
    time: "09:00",
    priority: "medium",
  })
  const [events, setEvents] = useState([
    {
      id: 1,
      date: "2024-01-15",
      title: "Mid-term Exams Begin",
      type: "exam",
      time: "09:00 AM",
      description: "Mid-semester examinations for all subjects",
    },
    {
      id: 2,
      date: "2024-01-20",
      title: "Parent-Teacher Meeting",
      type: "meeting",
      time: "02:00 PM",
      description: "Quarterly parent-teacher conference",
    },
    {
      id: 3,
      date: "2024-01-25",
      title: "Project Submission Deadline",
      type: "assignment",
      time: "11:59 PM",
      description: "Final project submissions for CS301 and CS302",
    },
    {
      id: 4,
      date: "2024-01-26",
      title: "Republic Day Holiday",
      type: "holiday",
      time: "All Day",
      description: "National holiday - College closed",
    },
    {
      id: 5,
      date: "2024-01-30",
      title: "Faculty Meeting",
      type: "meeting",
      time: "10:00 AM",
      description: "Monthly faculty coordination meeting",
    },
    {
      id: 6,
      date: "2024-02-05",
      title: "Semester End Exams",
      type: "exam",
      time: "09:00 AM",
      description: "Final semester examinations begin",
    },
  ])

  const [view, setView] = useState("month") // month, week, day

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const getEventsForDate = (day) => {
    if (!day) return []
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return events.filter((event) => event.date === dateStr)
  }

  const getEventColor = (type) => {
    switch (type) {
      case "exam":
        return "bg-red-100 text-red-800 border-red-200"
      case "meeting":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "assignment":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "holiday":
        return "bg-green-100 text-green-800 border-green-200"
      case "note":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "task":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getEventIcon = (type) => {
    switch (type) {
      case "exam":
        return "📝"
      case "meeting":
        return "👥"
      case "assignment":
        return "📋"
      case "holiday":
        return "🎉"
      case "note":
        return "📝"
      case "task":
        return "✅"
      default:
        return "📅"
    }
  }

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const handleAddEvent = () => {
    const event = {
      id: Date.now(),
      ...newEvent,
      date: newEvent.date,
      time: newEvent.time,
    }
    setEvents((prev) => [...prev, event])
    setShowAddEventModal(false)
    setNewEvent({
      title: "",
      description: "",
      type: "note",
      date: "",
      time: "09:00",
      priority: "medium",
    })
  }

  const handleDateClick = (day) => {
    if (day) {
      const clickedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      setSelectedDate(clickedDate)
      setNewEvent((prev) => ({ ...prev, date: clickedDate }))
    }
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const upcomingEvents = events
    .filter((event) => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Academic Calendar</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={goToToday}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Today
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md">
              {/* Calendar Header */}
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex gap-2">
                  <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-gray-100 rounded-full">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-gray-100 rounded-full">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="p-6">
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {dayNames.map((day) => (
                    <div key={day} className="p-2 text-center font-medium text-gray-500 text-sm">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(currentDate).map((day, index) => {
                    const dayEvents = getEventsForDate(day)
                    const isToday =
                      day &&
                      currentDate.getFullYear() === new Date().getFullYear() &&
                      currentDate.getMonth() === new Date().getMonth() &&
                      day === new Date().getDate()

                    return (
                      <div
                        key={index}
                        onClick={() => handleDateClick(day)}
                        className={`min-h-[100px] p-2 border border-gray-200 cursor-pointer transition-colors ${
                          day ? "bg-white hover:bg-gray-50" : "bg-gray-50"
                        } ${isToday ? "bg-blue-50 border-blue-300" : ""}`}
                      >
                        {day && (
                          <>
                            <div className={`font-medium mb-1 ${isToday ? "text-blue-600" : "text-gray-900"}`}>
                              {day}
                            </div>
                            <div className="space-y-1">
                              {dayEvents.slice(0, 2).map((event) => (
                                <div
                                  key={event.id}
                                  className={`text-xs p-1 rounded border ${getEventColor(event.type)} truncate`}
                                  title={event.title}
                                >
                                  {getEventIcon(event.type)} {event.title}
                                </div>
                              ))}
                              {dayEvents.length > 2 && (
                                <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Upcoming Events */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="border-l-4 border-blue-400 bg-blue-50 p-3 rounded-r">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{getEventIcon(event.type)}</span>
                          <h4 className="font-medium text-gray-900 text-sm">{event.title}</h4>
                        </div>
                        <p className="text-xs text-gray-600 mb-1">{event.description}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{event.date}</span>
                          <span>•</span>
                          <span>{event.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Event Legend */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Types</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
                  <span className="text-sm text-gray-700">📝 Exams</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
                  <span className="text-sm text-gray-700">👥 Meetings</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
                  <span className="text-sm text-gray-700">📋 Assignments</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
                  <span className="text-sm text-gray-700">🎉 Holidays</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-purple-100 border border-purple-200 rounded"></div>
                  <span className="text-sm text-gray-700">📝 Notes</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-orange-100 border border-orange-200 rounded"></div>
                  <span className="text-sm text-gray-700">✅ Tasks</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setShowAddEventModal(true)}
                  className="w-full text-left px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                >
                  Add New Event
                </button>
                <button className="w-full text-left px-3 py-2 text-sm bg-green-50 text-green-700 rounded hover:bg-green-100">
                  Export Calendar
                </button>
                <button className="w-full text-left px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded hover:bg-purple-100">
                  Sync with Google Calendar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Add Event Modal */}
        {showAddEventModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add New Event</h3>
                <button onClick={() => setShowAddEventModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleAddEvent()
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                  <input
                    type="text"
                    required
                    value={newEvent.title}
                    onChange={(e) => setNewEvent((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter event title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent((prev) => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="note">📝 Note</option>
                    <option value="task">✅ Task</option>
                    <option value="exam">📝 Exam</option>
                    <option value="meeting">👥 Meeting</option>
                    <option value="assignment">📋 Assignment</option>
                    <option value="holiday">🎉 Holiday</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      required
                      value={newEvent.date}
                      onChange={(e) => setNewEvent((prev) => ({ ...prev, date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <input
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent((prev) => ({ ...prev, time: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={newEvent.priority}
                    onChange={(e) => setNewEvent((prev) => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent((prev) => ({ ...prev, description: e.target.value }))}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter event description"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddEventModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Add Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Selected Date Modal */}
        {selectedDate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Events for {selectedDate}</h3>
                <button onClick={() => setSelectedDate(null)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3">
                {events
                  .filter((event) => event.date === selectedDate)
                  .map((event) => (
                    <div key={event.id} className={`p-3 rounded border ${getEventColor(event.type)}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getEventIcon(event.type)}</span>
                        <h4 className="font-medium">{event.title}</h4>
                      </div>
                      <p className="text-sm mb-2">{event.description}</p>
                      <p className="text-xs opacity-75">Time: {event.time}</p>
                    </div>
                  ))}

                {events.filter((event) => event.date === selectedDate).length === 0 && (
                  <p className="text-gray-500 text-center py-4">No events scheduled for this date</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ViewCalendar
