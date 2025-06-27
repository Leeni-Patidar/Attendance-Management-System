"use client"

import { useState, useEffect } from "react"
import AttendanceCompiler from "../Attendance/AttendanceCompiler"
import ClassAttendanceView from "../Attendance/ClassAttendanceView"
import { MdClass, MdDashboard, MdAssignment } from "react-icons/md"

const ClassTeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview")
  const [classData, setClassData] = useState(null)

  useEffect(() => {
    fetchClassData()
  }, [])

  const fetchClassData = async () => {
    // Fetch class teacher's class data
    // Implementation here
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <MdClass className="mr-3 text-primary-600" />
          Class Teacher Dashboard
        </h1>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === "overview"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <MdDashboard className="mr-2" />
              Class Overview
            </button>
            <button
              onClick={() => setActiveTab("compile")}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === "compile"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <MdAssignment className="mr-2" />
              Compile Attendance
            </button>
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === "overview" && <ClassAttendanceView classData={classData} />}
          {activeTab === "compile" && <AttendanceCompiler classData={classData} />}
        </div>
      </div>
    </div>
  )
}

export default ClassTeacherDashboard
