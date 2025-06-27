"use client"

import { useState, useEffect } from "react"

const AttendanceManagement = ({ subjects }) => {
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [students, setStudents] = useState([])
  const [attendanceRecords, setAttendanceRecords] = useState({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (selectedSubject && selectedClass) {
      fetchStudents()
      fetchAttendanceRecords()
    }
  }, [selectedSubject, selectedClass, selectedDate])

  const fetchStudents = async () => {
    setLoading(true)
    try {
      // Mock data - replace with actual API call
      const mockStudents = [
        { _id: "1", name: "John Doe", studentId: "ST001", email: "john@example.com" },
        { _id: "2", name: "Jane Smith", studentId: "ST002", email: "jane@example.com" },
        { _id: "3", name: "Mike Johnson", studentId: "ST003", email: "mike@example.com" },
        { _id: "4", name: "Sarah Wilson", studentId: "ST004", email: "sarah@example.com" },
        { _id: "5", name: "David Brown", studentId: "ST005", email: "david@example.com" },
        { _id: "6", name: "Lisa Davis", studentId: "ST006", email: "lisa@example.com" },
      ]
      setStudents(mockStudents)
    } catch (error) {
      console.error("Error fetching students:", error)
      setMessage("Error fetching students")
    } finally {
      setLoading(false)
    }
  }

  const fetchAttendanceRecords = async () => {
    try {
      // Mock data - replace with actual API call
      const mockAttendance = {
        1: "present",
        2: "present",
        3: "absent",
        4: "present",
        5: "late",
        6: "absent",
      }
      setAttendanceRecords(mockAttendance)
    } catch (error) {
      console.error("Error fetching attendance records:", error)
    }
  }

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: status,
    }))
  }

  const markAllPresent = () => {
    const allPresent = {}
    students.forEach((student) => {
      allPresent[student._id] = "present"
    })
    setAttendanceRecords(allPresent)
  }

  const markAllAbsent = () => {
    const allAbsent = {}
    students.forEach((student) => {
      allAbsent[student._id] = "absent"
    })
    setAttendanceRecords(allAbsent)
  }

  const saveAttendance = async () => {
    if (!selectedSubject || !selectedClass) {
      setMessage("Please select subject and class")
      return
    }

    setSaving(true)
    try {
      // Mock API call - replace with actual implementation
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setMessage("Attendance saved successfully!")
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      console.error("Error saving attendance:", error)
      setMessage("Error saving attendance")
    } finally {
      setSaving(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800 border-green-200"
      case "absent":
        return "bg-red-100 text-red-800 border-red-200"
      case "late":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getAttendanceStats = () => {
    const total = students.length
    const present = Object.values(attendanceRecords).filter((status) => status === "present").length
    const absent = Object.values(attendanceRecords).filter((status) => status === "absent").length
    const late = Object.values(attendanceRecords).filter((status) => status === "late").length

    return { total, present, absent, late }
  }

  const stats = getAttendanceStats()

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Attendance Management</h3>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="input-field">
            <option value="">Select Subject</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.name} ({subject.code})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="input-field">
            <option value="">Select Class</option>
            <option value="class1">Class 10A</option>
            <option value="class2">Class 10B</option>
            <option value="class3">Class 11A</option>
            <option value="class4">Class 11B</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input-field"
          />
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-md ${
            message.includes("Error")
              ? "bg-red-100 text-red-700 border border-red-200"
              : "bg-green-100 text-green-700 border border-green-200"
          }`}
        >
          {message}
        </div>
      )}

      {selectedSubject && selectedClass && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Students</div>
              </div>
            </div>
            <div className="card">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                <div className="text-sm text-gray-600">Present</div>
              </div>
            </div>
            <div className="card">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                <div className="text-sm text-gray-600">Absent</div>
              </div>
            </div>
            <div className="card">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
                <div className="text-sm text-gray-600">Late</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            <button onClick={markAllPresent} className="btn-secondary">
              Mark All Present
            </button>
            <button onClick={markAllAbsent} className="btn-secondary">
              Mark All Absent
            </button>
            <button onClick={saveAttendance} disabled={saving} className="btn-primary">
              {saving ? "Saving..." : "Save Attendance"}
            </button>
          </div>

          {/* Students List */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="card">
              <h4 className="text-md font-medium text-gray-900 mb-4">Student Attendance</h4>
              <div className="space-y-3">
                {students.map((student) => (
                  <div
                    key={student._id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-medium">
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.studentId}</div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {["present", "absent", "late"].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleAttendanceChange(student._id, status)}
                          className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                            attendanceRecords[student._id] === status
                              ? getStatusColor(status)
                              : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AttendanceManagement
