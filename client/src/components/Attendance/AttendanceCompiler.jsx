"use client"

import { useState } from "react"
import axios from "axios"

const AttendanceCompiler = ({ classData }) => {
  const [compiledData, setCompiledData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const compileAttendance = async () => {
    if (!classData) {
      setMessage("No class data available")
      return
    }

    setLoading(true)
    try {
      const response = await axios.post("http://localhost:5000/api/attendance/compile", {
        classId: classData._id,
      })

      setCompiledData(response.data)
      setMessage("Attendance compiled successfully!")
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to compile attendance")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "good":
        return "bg-green-100 text-green-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "critical":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Compile Attendance Report</h3>
        <button onClick={compileAttendance} disabled={loading} className="btn-primary">
          {loading ? "Compiling..." : "Compile Attendance"}
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Attendance Compilation Information</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>• Compilation covers the last 15 days of attendance data</p>
              <p>• Students with 75-60% attendance will be highlighted in yellow</p>
              <p>• Students with below 60% attendance will be highlighted in red</p>
            </div>
          </div>
        </div>
      </div>

      {message && <div className="p-4 rounded-md bg-green-100 text-green-700 border border-green-200">{message}</div>}

      {compiledData && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Compilation Period</h4>
            <p className="text-sm text-gray-600">
              From: {new Date(compiledData.period.startDate).toLocaleDateString()} To:{" "}
              {new Date(compiledData.period.endDate).toLocaleDateString()}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Classes Attended
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Classes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {compiledData.compiledData.map((student, index) => (
                  <tr
                    key={index}
                    className={
                      student.status === "critical" ? "bg-red-50" : student.status === "warning" ? "bg-yellow-50" : ""
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.student.studentId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.attendedClasses}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.totalClasses}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.percentage}%</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(student.status)}`}
                      >
                        {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default AttendanceCompiler
