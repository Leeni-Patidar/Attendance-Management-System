"use client"

import { useState, useEffect } from "react"
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"
import { MdCalendarToday } from "react-icons/md"
import { FaCircle } from "react-icons/fa"

const AttendanceCalendar = () => {
  const [date, setDate] = useState(new Date())
  const [attendanceData, setAttendanceData] = useState({})
  const [holidays, setHolidays] = useState([])

  useEffect(() => {
    fetchAttendanceData()
    fetchHolidays()
  }, [])

  const fetchAttendanceData = async () => {
    // Mock data
    const mockData = {
      "Mon Jan 01 2024": "present",
      "Tue Jan 02 2024": "present",
      "Wed Jan 03 2024": "absent",
      "Thu Jan 04 2024": "present",
      "Fri Jan 05 2024": "present",
    }
    setAttendanceData(mockData)
  }

  const fetchHolidays = async () => {
    setHolidays([
      new Date(2024, 0, 1), // New Year
      new Date(2024, 0, 26), // Republic Day
      new Date(2024, 7, 15), // Independence Day
    ])
  }

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const dateString = date.toDateString()

      if (holidays.some((holiday) => holiday.toDateString() === dateString)) {
        return "holiday"
      }

      if (attendanceData[dateString]) {
        return attendanceData[dateString] === "present" ? "present" : "absent"
      }
    }
    return null
  }

  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const dateString = date.toDateString()

      if (holidays.some((holiday) => holiday.toDateString() === dateString)) {
        return <div className="holiday-dot"></div>
      }

      if (attendanceData[dateString]) {
        return <div className={`attendance-dot ${attendanceData[dateString]}`}></div>
      }
    }
    return null
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 flex items-center">
        <MdCalendarToday className="mr-2 text-primary-600" />
        Attendance Calendar
      </h3>

      <div className="bg-white p-4 rounded-lg border">
        <Calendar
          onChange={setDate}
          value={date}
          tileClassName={tileClassName}
          tileContent={tileContent}
          className="w-full"
        />
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center">
          <FaCircle className="text-green-500 mr-2" />
          <span>Present</span>
        </div>
        <div className="flex items-center">
          <FaCircle className="text-red-500 mr-2" />
          <span>Absent</span>
        </div>
        <div className="flex items-center">
          <FaCircle className="text-gray-400 mr-2" />
          <span>Holiday</span>
        </div>
      </div>

      <style jsx>{`
        .holiday {
          background-color: #f3f4f6 !important;
          color: #6b7280 !important;
        }
        .present {
          background-color: #dcfce7 !important;
        }
        .absent {
          background-color: #fecaca !important;
        }
        .attendance-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          margin: 0 auto;
        }
        .attendance-dot.present {
          background-color: #22c55e;
        }
        .attendance-dot.absent {
          background-color: #ef4444;
        }
        .holiday-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #6b7280;
          margin: 0 auto;
        }
      `}</style>
    </div>
  )
}

export default AttendanceCalendar
