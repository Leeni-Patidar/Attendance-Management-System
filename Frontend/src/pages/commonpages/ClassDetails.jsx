import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ClassDetails = () => {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Mock subject and student data from dashboard
    setSubjects([
      { code: "CS301", name: "Data Structures & Algorithms" },
      { code: "CS302", name: "Database Management Systems" },
      { code: "CS303", name: "Computer Networks" },
      { code: "CS304", name: "Software Engineering" },
      { code: "CS305", name: "Operating Systems" },
    ]);

    setStudents([
      {
        id: 1,
        name: "Alice Johnson",
        rollNumber: "CS21B001",
        subjects: {
          CS301: { present: 45, absent: 5, percentage: 90 },
          CS302: { present: 42, absent: 8, percentage: 84 },
          CS303: { present: 38, absent: 12, percentage: 76 },
          CS304: { present: 40, absent: 10, percentage: 80 },
          CS305: { present: 35, absent: 15, percentage: 70 },
        },
      },
      {
        id: 2,
        name: "Bob Smith",
        rollNumber: "CS21B002",
        subjects: {
          CS301: { present: 30, absent: 20, percentage: 60 },
          CS302: { present: 28, absent: 22, percentage: 56 },
          CS303: { present: 35, absent: 15, percentage: 70 },
          CS304: { present: 32, absent: 18, percentage: 64 },
          CS305: { present: 25, absent: 25, percentage: 50 },
        },
      },
      {
        id: 3,
        name: "Carol Davis",
        rollNumber: "CS21B003",
        subjects: {
          CS301: { present: 48, absent: 2, percentage: 96 },
          CS302: { present: 45, absent: 5, percentage: 90 },
          CS303: { present: 44, absent: 6, percentage: 88 },
          CS304: { present: 46, absent: 4, percentage: 92 },
          CS305: { present: 43, absent: 7, percentage: 86 },
        },
      },
    ]);
  }, []);

  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return "bg-green-100 text-green-800";
    if (percentage >= 80) return "bg-green-50 text-green-700";
    if (percentage >= 70) return "bg-yellow-50 text-yellow-700";
    if (percentage >= 60) return "bg-yellow-100 text-yellow-800";
    if (percentage >= 50) return "bg-red-50 text-red-700";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by Roll No. or Name"
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
                  Student
                </th>
                {subjects.map((subject) => (
                  <th
                    key={subject.code}
                    className="sticky top-0 bg-gray-50 px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]"
                  >
                    <div>{subject.code}</div>
                    <div className="text-xs font-normal text-gray-400 mt-1 truncate">{subject.name}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students
                .filter(
                  (student) =>
                    student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    student.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="sticky left-0 z-10 bg-white px-6 py-4 whitespace-nowrap border-r border-gray-200">
                      <div
                        className="cursor-pointer hover:text-blue-600"
                        onClick={() => navigate("/class-teacher/students-detail")}
                      >
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.rollNumber}</div>
                      </div>
                    </td>
                    {subjects.map((subject) => {
                      const attendance = student.subjects[subject.code];
                      return (
                        <td key={subject.code} className="px-3 py-4 whitespace-nowrap text-center">
                          <div className="space-y-1">
                            <div className="flex justify-center gap-2 text-xs">
                              <span className="text-green-600">{attendance.present}</span>
                              <span className="text-red-600">{attendance.absent}</span>
                            </div>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAttendanceColor(
                                attendance.percentage
                              )}`}
                            >
                              {attendance.percentage}%
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClassDetails;
