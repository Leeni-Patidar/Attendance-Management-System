"use client"

import { useState, useEffect } from "react"
import QRGenerator from "../QR/QRGenerator"
import AttendanceManagement from "../Attendance/AttendanceManagement"
import { MdSchool, MdQrCode, MdCheckCircle } from "react-icons/md"

const SubjectTeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState("qr")
  const [subjects, setSubjects] = useState([])

  useEffect(() => {
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    // Fetch teacher's subjects
    // Implementation here
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <MdSchool className="mr-3 text-primary-600" />
          Subject Teacher Dashboard
        </h1>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("qr")}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === "qr"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <MdQrCode className="mr-2" />
              Generate QR Code
            </button>
            <button
              onClick={() => setActiveTab("attendance")}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === "attendance"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <MdCheckCircle className="mr-2" />
              Manage Attendance
            </button>
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === "qr" && <QRGenerator subjects={subjects} />}
          {activeTab === "attendance" && <AttendanceManagement subjects={subjects} />}
        </div>
      </div>
    </div>
  )
}

export default SubjectTeacherDashboard
