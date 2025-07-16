"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const ViewSchedule = () => {
  const navigate = useNavigate()
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data for schedule
    setTimeout(() => {
      setSchedule([
        {
          id: 1,
          day: "Monday",
          classes: [
            { time: "9:00 AM - 10:00 AM", subject: "Data Structures", class: "CS 3rd Year - A", room: "Lab 301" },
            { time: "11:00 AM - 12:00 PM", subject: "Database Systems", class: "CS 2nd Year - A", room: "Room 205" },
          ],
        },
        {
          id: 2,
          day: "Tuesday",
          classes: [
            { time: "2:00 PM - 3:00 PM", subject: "Data Structures", class: "CS 3rd Year - B", room: "Lab 302" },
            { time: "3:00 PM - 4:00 PM", subject: "Software Engineering", class: "CS 4th Year - A", room: "Room 301" },
          ],
        },
        {
          id: 3,
          day: "Wednesday",
          classes: [
            { time: "10:00 AM - 11:00 AM", subject: "Data Structures", class: "CS 3rd Year - A", room: "Lab 301" },
            { time: "11:00 AM - 12:00 PM", subject: "Database Systems", class: "CS 2nd Year - A", room: "Room 205" },
          ],
        },
        {
          id: 4,
          day: "Thursday",
          classes: [
            { time: "9:00 AM - 10:00 AM", subject: "Software Engineering", class: "CS 4th Year - A", room: "Room 301" },
            { time: "2:00 PM - 3:00 PM", subject: "Data Structures", class: "CS 3rd Year - B", room: "Lab 302" },
          ],
        },
        {
          id: 5,
          day: "Friday",
          classes: [
            { time: "10:00 AM - 11:00 AM", subject: "Data Structures", class: "CS 3rd Year - A", room: "Lab 301" },
          ],
        },
      ])
      setLoading(false)
    }, 1000)
  }, [])

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
                <h1 className="text-xl font-semibold text-gray-900">View Schedule</h1>
                <p className="text-sm text-gray-500">Your weekly class schedule</p>
              </div>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Export Schedule</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Weekly Schedule</h3>
          <div className="space-y-6">
            {schedule.map((day) => (
              <div key={day.id} className="border-l-4 border-blue-500 pl-4">
                <h4 className="text-lg font-medium text-gray-900 mb-3">{day.day}</h4>
                <div className="space-y-3">
                  {day.classes.map((classItem, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{classItem.subject}</p>
                          <p className="text-sm text-gray-600">{classItem.class}</p>
                          <p className="text-sm text-gray-500">{classItem.room}</p>
                        </div>
                        <span className="text-sm font-medium text-blue-600">{classItem.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewSchedule
