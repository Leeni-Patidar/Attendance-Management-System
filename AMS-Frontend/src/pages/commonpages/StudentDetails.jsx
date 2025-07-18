"use client"

import { useState, useEffect } from "react"

const StudentDetail = ({ studentId, onBack }) => {
  const [student, setStudent] = useState(null)
  const [subjects, setSubjects] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [editedStudent, setEditedStudent] = useState({})
  const [loading, setLoading] = useState(true)
  const [availableSubjects, setAvailableSubjects] = useState([])
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false)

  useEffect(() => {
    // Mock data fetch based on studentId
    setTimeout(() => {
      const mockStudent = {
        id: studentId || 1,
        name: "Alice Johnson",
        rollNumber: "CS21B001",
        email: "alice.johnson@college.edu",
        phone: "+1234567890",
        address: "123 Main St, City, State",
        parentName: "Robert Johnson",
        parentPhone: "+1234567891",
        dateOfBirth: "2002-05-15",
        bloodGroup: "O+",
        subjects: {
          CS301: { present: 45, absent: 5, percentage: 90, totalClasses: 50 },
          CS302: { present: 42, absent: 8, percentage: 84, totalClasses: 50 },
          CS303: { present: 38, absent: 12, percentage: 76, totalClasses: 50 },
          CS304: { present: 40, absent: 10, percentage: 80, totalClasses: 50 },
          CS305: { present: 35, absent: 15, percentage: 70, totalClasses: 50 },
          CS306: { present: 44, absent: 6, percentage: 88, totalClasses: 50 },
          CS307: { present: 41, absent: 9, percentage: 82, totalClasses: 50 },
          CS308: { present: 39, absent: 11, percentage: 78, totalClasses: 50 },
        },
        requests: [
          {
            id: 1,
            type: "Attendance Correction",
            subject: "CS301",
            reason: "Medical leave with certificate",
            description: "I was absent on 10th Jan due to fever. Medical certificate attached.",
            date: "2024-01-15",
            status: "pending",
          },
          {
            id: 2,
            type: "Personal Detail",
            subject: "Contact Information",
            reason: "Phone number update",
            description: "Need to update my contact number from old to new.",
            date: "2024-01-10",
            status: "approved",
          },
        ],
      }

      const mockSubjects = [
        { code: "CS301", name: "Data Structures & Algorithms" },
        { code: "CS302", name: "Database Management Systems" },
        { code: "CS303", name: "Computer Networks" },
        { code: "CS304", name: "Software Engineering" },
        { code: "CS305", name: "Operating Systems" },
        { code: "CS306", name: "Machine Learning" },
        { code: "CS307", name: "Web Development" },
        { code: "CS308", name: "Mobile App Development" },
      ]

      const mockAvailableSubjects = [
        { code: "CS309", name: "Artificial Intelligence", teacher: "Dr. Kumar" },
        { code: "CS310", name: "Blockchain Technology", teacher: "Prof. Singh" },
        { code: "CS311", name: "Cloud Computing", teacher: "Dr. Patel" },
        { code: "CS312", name: "Cybersecurity", teacher: "Prof. Sharma" },
      ]

      setStudent(mockStudent)
      setEditedStudent(mockStudent)
      setSubjects(mockSubjects)
      setAvailableSubjects(mockAvailableSubjects)
      setLoading(false)
    }, 500)
  }, [studentId])

  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return "bg-green-100 text-green-800"
    if (percentage >= 80) return "bg-green-50 text-green-700"
    if (percentage >= 70) return "bg-yellow-50 text-yellow-700"
    if (percentage >= 60) return "bg-yellow-100 text-yellow-800"
    if (percentage >= 50) return "bg-red-50 text-red-700"
    return "bg-red-100 text-red-800"
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleSave = () => {
    console.log("Saving student data:", editedStudent)
    setStudent(editedStudent)
    setIsEditing(false)
  }

  const handleInputChange = (field, value) => {
    setEditedStudent((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleRequestAction = (requestId, action) => {
    console.log(`${action} request ${requestId}`)
    // Update request status
    setStudent((prev) => ({
      ...prev,
      requests: prev.requests.map((req) => (req.id === requestId ? { ...req, status: action } : req)),
    }))
  }

  const handleAddSubject = (subjectCode) => {
    setStudent((prev) => ({
      ...prev,
      subjects: {
        ...prev.subjects,
        [subjectCode]: { present: 0, absent: 0, percentage: 0, totalClasses: 0 },
      },
    }))
    setShowAddSubjectModal(false)
  }

  const handleRemoveSubject = (subjectCode) => {
    setStudent((prev) => {
      const newSubjects = { ...prev.subjects }
      delete newSubjects[subjectCode]
      return { ...prev, subjects: newSubjects }
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading student Detail...</p>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Student Not Found</h2>
          <button onClick={onBack} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

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
              <h1 className="text-xl font-semibold text-gray-900">Student Detail</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Student Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">
                    {student.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">{student.name}</h2>
                <p className="text-gray-600">{student.rollNumber}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedStudent.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{student.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedStudent.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{student.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editedStudent.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{student.dateOfBirth}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedStudent.bloodGroup}
                      onChange={(e) => handleInputChange("bloodGroup", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{student.bloodGroup}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  {isEditing ? (
                    <textarea
                      value={editedStudent.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{student.address}</p>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Parent/Guardian Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedStudent.parentName}
                          onChange={(e) => handleInputChange("parentName", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{student.parentName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Phone</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editedStudent.parentPhone}
                          onChange={(e) => handleInputChange("parentPhone", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{student.parentPhone}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance and Requests */}
          <div className="lg:col-span-2 space-y-6">
            {/* Attendance Detail */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Detail</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subjects.map((subject) => {
                  const attendance = student.subjects[subject.code]
                  return (
                    <div key={subject.code} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{subject.code}</h4>
                          <p className="text-sm text-gray-600">{subject.name}</p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getAttendanceColor(attendance.percentage)}`}
                        >
                          {attendance.percentage}%
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm text-center">
                        <div>
                          <p className="text-gray-500">Total</p>
                          <p className="font-semibold">{attendance.totalClasses}</p>
                        </div>
                        <div>
                          <p className="text-green-600">Present</p>
                          <p className="font-semibold text-green-600">{attendance.present}</p>
                        </div>
                        <div>
                          <p className="text-red-600">Absent</p>
                          <p className="font-semibold text-red-600">{attendance.absent}</p>
                        </div>
                      </div>
                      {attendance.percentage < 75 && (
                        <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
                          ⚠️ Below 75% - Needs {Math.ceil((75 * attendance.totalClasses) / 100 - attendance.present)}{" "}
                          more classes
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Subject Management */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Subject Management</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(student.subjects).map((subjectCode) => {
                  const subject = subjects.find((s) => s.code === subjectCode)
                  const attendance = student.subjects[subjectCode]
                  return (
                    <div key={subjectCode} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{subjectCode}</h4>
                          <p className="text-sm text-gray-600">{subject?.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${getAttendanceColor(attendance.percentage)}`}
                          >
                            {attendance.percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>
                          Present: {attendance.present} | Absent: {attendance.absent}
                        </p>
                        <p>Total Classes: {attendance.totalClasses}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDetail
