import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const TeacherDetail = () => {
  const navigate = useNavigate()

  const [teachers, setTeachers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    setTeachers([
      {
        id: 1,
        name: "Prof. Sharma",
        email: "sharma@univ.edu",
        subjects: {
          CS301: { subject: "DSA", class: "1st Year - A", taken: 45, missed: 5, percentage: 90 },
          CS302: { subject: "DBMS", class: "1st Year - B", taken: 40, missed: 10, percentage: 80 },
        },
      },
      {
        id: 2,
        name: "Dr. Neha Jain",
        email: "neha.jain@univ.edu",
        subjects: {
          CS303: { subject: "Computer Networks", class: "2nd Year - A", taken: 42, missed: 8, percentage: 84 },
          CS305: { subject: "Operating Systems", class: "2nd Year - C", taken: 48, missed: 2, percentage: 96 },
        },
      },
      {
        id: 3,
        name: "Mr. Rajeev",
        email: "rajeev@univ.edu",
        subjects: {
          CS304: { subject: "Software Engineering", class: "3rd Year - B", taken: 30, missed: 20, percentage: 60 },
        },
      },
    ])
  }, [])

  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return "bg-green-100 text-green-800"
    if (percentage >= 80) return "bg-green-50 text-green-700"
    if (percentage >= 70) return "bg-yellow-50 text-yellow-700"
    if (percentage >= 60) return "bg-yellow-100 text-yellow-800"
    if (percentage >= 50) return "bg-red-50 text-red-700"
    return "bg-red-100 text-red-800"
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="relative">
        <div className="overflow-x-auto max-h-[600px] overflow-y-scroll scrollbar-hide">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="sticky left-0 top-0 z-20 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  Teacher
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Subject Code</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Taken</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Missed</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance %</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teachers
                .filter((teacher) =>
                  teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((teacher) =>
                  Object.entries(teacher.subjects).map(([code, details], index) => (
                    <tr key={`${teacher.id}-${code}`} className="hover:bg-gray-50">
                      {index === 0 && (
                        <td
                          rowSpan={Object.keys(teacher.subjects).length}
                          className="sticky left-0 z-10 bg-white px-6 py-4 whitespace-nowrap border-r border-gray-200 align-top"
                        >
                          <div
                            className="cursor-pointer hover:text-blue-600"
                            onClick={() => navigate("/admin/teacher-detail")}
                          >
                            <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                            <div className="text-sm text-gray-500">{teacher.email}</div>
                          </div>
                        </td>
                      )}
                      <td className="px-3 py-4 text-center text-sm text-gray-900">{code}</td>
                      <td className="px-3 py-4 text-center text-sm text-gray-900">{details.subject}</td>
                      <td className="px-3 py-4 text-center text-sm text-gray-900">{details.class}</td>
                      <td className="px-3 py-4 text-center text-sm text-green-600">{details.taken}</td>
                      <td className="px-3 py-4 text-center text-sm text-red-600">{details.missed}</td>
                      <td className="px-3 py-4 text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAttendanceColor(details.percentage)}`}>
                          {details.percentage}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default TeacherDetail
