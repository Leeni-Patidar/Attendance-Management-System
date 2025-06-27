"use client"

import { useState, useEffect } from "react"
import QRScanner from "../QR/QRScanner"
import AttendanceCalendar from "../Attendance/AttendanceCalendar"
import AttendanceStats from "../Attendance/AttendanceStats"
import CameraCapture from "../Camera/CameraCapture"
import { MdPerson, MdQrCodeScanner, MdCamera, MdCalendarToday, MdBarChart } from "react-icons/md"

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState("scan")
  const [attendanceData, setAttendanceData] = useState([])

  useEffect(() => {
    fetchAttendanceData()
  }, [])

  const fetchAttendanceData = async () => {
    // Fetch student attendance data
    // Implementation here
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <MdPerson className="mr-3 text-primary-600" />
          Student Dashboard
        </h1>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("scan")}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === "scan"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <MdQrCodeScanner className="mr-2" />
              Scan QR Code
            </button>
            <button
              onClick={() => setActiveTab("camera")}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === "camera"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <MdCamera className="mr-2" />
              Camera Capture
            </button>
            <button
              onClick={() => setActiveTab("calendar")}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === "calendar"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <MdCalendarToday className="mr-2" />
              Calendar
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === "stats"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <MdBarChart className="mr-2" />
              My Attendance
            </button>
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === "scan" && <QRScanner />}
          {activeTab === "camera" && <CameraCapture />}
          {activeTab === "calendar" && <AttendanceCalendar />}
          {activeTab === "stats" && <AttendanceStats data={attendanceData} />}
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard
