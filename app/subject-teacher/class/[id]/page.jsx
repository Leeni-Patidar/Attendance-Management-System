"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ArrowLeft, UserPlus, UserMinus, Edit, Search, CheckCircle, XCircle, QrCode } from "lucide-react"

export default function ClassDetailPage({ params }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [editingAttendance, setEditingAttendance] = useState({})
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [students, setStudents] = useState([])
  const [classData, setClassData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newStudent, setNewStudent] = useState({
    name: "",
    rollNumber: "",
    email: "",
  })

  useEffect(() => {
    fetchStudents()
  }, [params.id])

  const fetchStudents = async () => {
    try {
      const response = await fetch(`/api/subject-teacher/students/${params.id}`)
      const data = await response.json()

      if (response.ok) {
        setStudents(data.students)
        // Set class data from first student or API
        setClassData({
          id: params.id,
          className: "CS 3rd Year - Section A",
          subject: "Data Structures & Algorithms",
          subjectCode: "CS301",
          semester: "6th Semester",
        })
      }
    } catch (error) {
      console.error("Error fetching students:", error)
    } finally {
      setLoading(false)
    }
  }

  const getAttendanceRowColor = (percentage) => {
    if (percentage < 60) return "bg-red-50 border-red-200"
    if (percentage < 75) return "bg-yellow-50 border-yellow-200"
    return "bg-white"
  }

  const getAttendanceBadgeColor = (percentage) => {
    if (percentage < 60) return "bg-red-100 text-red-800"
    if (percentage < 75) return "bg-yellow-100 text-yellow-800"
    return "bg-green-100 text-green-800"
  }

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.roll_number.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAttendanceEdit = (studentId, field, value) => {
    setEditingAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }))
  }

  const saveAttendanceChanges = async (studentId) => {
    try {
      const response = await fetch(`/api/subject-teacher/attendance/${studentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          classSubjectId: params.id,
          attendance: editingAttendance[studentId],
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert("Attendance updated successfully!")
        setEditingAttendance((prev) => {
          const updated = { ...prev }
          delete updated[studentId]
          return updated
        })
        fetchStudents() // Refresh data
      } else {
        alert(data.error || "Failed to update attendance")
      }
    } catch (error) {
      console.error("Save attendance error:", error)
      alert("Failed to update attendance")
    }
  }

  const handleAddBacklogStudent = async () => {
    try {
      const response = await fetch("/api/subject-teacher/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          classSubjectId: params.id,
          student: newStudent,
          isBacklog: true,
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert("Backlog student added successfully!")
        setShowAddStudent(false)
        setNewStudent({ name: "", rollNumber: "", email: "" })
        fetchStudents()
      } else {
        alert(data.error || "Failed to add student")
      }
    } catch (error) {
      console.error("Add student error:", error)
      alert("Failed to add student")
    }
  }

  const handleRemoveStudent = async (studentId) => {
    if (!confirm("Are you sure you want to remove this student?")) return

    try {
      const response = await fetch(`/api/subject-teacher/students/${studentId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        alert("Student removed successfully!")
        fetchStudents()
      } else {
        alert(data.error || "Failed to remove student")
      }
    } catch (error) {
      console.error("Remove student error:", error)
      alert("Failed to remove student")
    }
  }

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
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" onClick={() => window.history.back()} className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{classData?.className}</h1>
              <p className="text-sm text-gray-500">
                {classData?.subject} ({classData?.subjectCode})
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Student Attendance Management</h2>
            <p className="text-gray-600">Manage attendance and backlog students for this class</p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <QrCode className="w-4 h-4" />
              Generate QR
            </Button>

            <Dialog open={showAddStudent} onOpenChange={setShowAddStudent}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Add Backlog Student
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Backlog Student</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Student Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter student name"
                      value={newStudent.name}
                      onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rollNumber">Roll Number</Label>
                    <Input
                      id="rollNumber"
                      placeholder="Enter roll number"
                      value={newStudent.rollNumber}
                      onChange={(e) => setNewStudent({ ...newStudent, rollNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      value={newStudent.email}
                      onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddBacklogStudent}
                      className="flex-1"
                      disabled={!newStudent.name || !newStudent.rollNumber || !newStudent.email}
                    >
                      Add Student
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddStudent(false)}>
                      Cancel
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">Login credentials will be sent via email</p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search students by name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Students List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Students List ({filteredStudents.length})</span>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-100 rounded"></div>
                  <span className="text-gray-600">Low Attendance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-100 rounded"></div>
                  <span className="text-gray-600">Warning</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-100 rounded"></div>
                  <span className="text-gray-600">Good</span>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className={`p-4 rounded-lg border transition-colors ${getAttendanceRowColor(student.percentage || 0)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg?height=40&width=40" />
                        <AvatarFallback>
                          {student.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">{student.name}</h3>
                          {student.is_backlog && (
                            <Badge variant="outline" className="text-xs">
                              Backlog
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{student.roll_number}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Attendance Edit Section */}
                      <div className="flex items-center gap-4">
                        {editingAttendance[student.id] ? (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <Input
                                type="number"
                                value={editingAttendance[student.id]?.present || student.presentDays || 0}
                                onChange={(e) =>
                                  handleAttendanceEdit(student.id, "present", Number.parseInt(e.target.value))
                                }
                                className="w-16 h-8 text-sm"
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <XCircle className="w-4 h-4 text-red-600" />
                              <Input
                                type="number"
                                value={editingAttendance[student.id]?.absent || student.absentDays || 0}
                                onChange={(e) =>
                                  handleAttendanceEdit(student.id, "absent", Number.parseInt(e.target.value))
                                }
                                className="w-16 h-8 text-sm"
                              />
                            </div>
                            <Button size="sm" onClick={() => saveAttendanceChanges(student.id)}>
                              Save
                            </Button>
                          </div>
                        ) : (
                          <div className="text-right">
                            <div className="flex items-center gap-4 text-sm mb-1">
                              <span className="text-green-600 flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" />
                                {student.presentDays || 0}
                              </span>
                              <span className="text-red-600 flex items-center gap-1">
                                <XCircle className="w-4 h-4" />
                                {student.absentDays || 0}
                              </span>
                              <Badge className={getAttendanceBadgeColor(student.percentage || 0)}>
                                {student.percentage || 0}%
                              </Badge>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setEditingAttendance((prev) => ({
                              ...prev,
                              [student.id]: {
                                present: student.presentDays || 0,
                                absent: student.absentDays || 0,
                              },
                            }))
                          }
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveStudent(student.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <UserMinus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{filteredStudents.length}</p>
                <p className="text-sm text-gray-600">Total Students</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {filteredStudents.filter((s) => (s.percentage || 0) >= 75).length}
                </p>
                <p className="text-sm text-gray-600">Good Attendance</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {filteredStudents.filter((s) => (s.percentage || 0) >= 60 && (s.percentage || 0) < 75).length}
                </p>
                <p className="text-sm text-gray-600">Warning</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {filteredStudents.filter((s) => (s.percentage || 0) < 60).length}
                </p>
                <p className="text-sm text-gray-600">Low Attendance</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
