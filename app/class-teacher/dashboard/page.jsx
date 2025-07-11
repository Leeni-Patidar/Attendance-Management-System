"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Bell, Download, UserPlus, ChevronDown, LogOut, User, Settings, MoreHorizontal } from "lucide-react"

export default function ClassTeacherDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [newStudent, setNewStudent] = useState({
    name: "",
    rollNumber: "",
    email: "",
    phone: "",
  })

  const teacherInfo = {
    name: "Dr. Sarah Johnson",
    employeeId: "EMP001",
    department: "Computer Science",
    email: "sarah.johnson@college.edu",
    phone: "+91 9876543210",
  }

  const subjects = [
    { code: "Data Structures", teacher: "Dr. Smith" },
    { code: "Algorithms", teacher: "Prof. Wilson" },
    { code: "Database Management", teacher: "Dr. Brown" },
    { code: "Web Development", teacher: "Ms. Davis" },
    { code: "Software Engineering", teacher: "Dr. Johnson" },
  ]

  const students = [
    {
      id: 1,
      name: "Alice Johnson",
      rollNumber: "CS2021001",
      subjects: {
        "Data Structures": { present: 45, absent: 5, percentage: 90 },
        Algorithms: { present: 42, absent: 8, percentage: 84 },
        "Database Management": { present: 38, absent: 12, percentage: 76 },
        "Web Development": { present: 40, absent: 10, percentage: 80 },
        "Software Engineering": { present: 35, absent: 15, percentage: 70 },
      },
    },
    {
      id: 2,
      name: "Bob Smith",
      rollNumber: "CS2021002",
      subjects: {
        "Data Structures": { present: 30, absent: 20, percentage: 60 },
        Algorithms: { present: 28, absent: 22, percentage: 56 },
        "Database Management": { present: 35, absent: 15, percentage: 70 },
        "Web Development": { present: 32, absent: 18, percentage: 64 },
        "Software Engineering": { present: 25, absent: 25, percentage: 50 },
      },
    },
    {
      id: 3,
      name: "Carol Davis",
      rollNumber: "CS2021003",
      subjects: {
        "Data Structures": { present: 48, absent: 2, percentage: 96 },
        Algorithms: { present: 45, absent: 5, percentage: 90 },
        "Database Management": { present: 44, absent: 6, percentage: 88 },
        "Web Development": { present: 46, absent: 4, percentage: 92 },
        "Software Engineering": { present: 43, absent: 7, percentage: 86 },
      },
    },
    {
      id: 4,
      name: "David Wilson",
      rollNumber: "CS2021004",
      subjects: {
        "Data Structures": { present: 20, absent: 30, percentage: 40 },
        Algorithms: { present: 25, absent: 25, percentage: 50 },
        "Database Management": { present: 30, absent: 20, percentage: 60 },
        "Web Development": { present: 22, absent: 28, percentage: 44 },
        "Software Engineering": { present: 18, absent: 32, percentage: 36 },
      },
    },
    {
      id: 5,
      name: "Emma Brown",
      rollNumber: "CS2021005",
      subjects: {
        "Data Structures": { present: 42, absent: 8, percentage: 84 },
        Algorithms: { present: 40, absent: 10, percentage: 80 },
        "Database Management": { present: 37, absent: 13, percentage: 74 },
        "Web Development": { present: 39, absent: 11, percentage: 78 },
        "Software Engineering": { present: 36, absent: 14, percentage: 72 },
      },
    },
    {
      id: 6,
      name: "Frank Miller",
      rollNumber: "CS2021006",
      subjects: {
        "Data Structures": { present: 33, absent: 17, percentage: 66 },
        Algorithms: { present: 31, absent: 19, percentage: 62 },
        "Database Management": { present: 29, absent: 21, percentage: 58 },
        "Web Development": { present: 34, absent: 16, percentage: 68 },
        "Software Engineering": { present: 27, absent: 23, percentage: 54 },
      },
    },
  ]

  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return "bg-green-100"
    if (percentage >= 80) return "bg-green-50"
    if (percentage >= 70) return "bg-yellow-50"
    if (percentage >= 60) return "bg-yellow-100"
    if (percentage >= 50) return "bg-red-50"
    return "bg-red-100"
  }

  const getPercentageColor = (percentage) => {
    if (percentage >= 75) return "text-green-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddStudent = () => {
    console.log("Adding student:", newStudent)
    setShowAddStudent(false)
    setNewStudent({ name: "", rollNumber: "", email: "", phone: "" })
  }

  const handleDownloadReport = () => {
    console.log("Downloading attendance report...")
  }

  const handleLogout = () => {
    window.location.href = "/login"
  }

  const handleEditProfile = () => {
    setShowProfile(true)
  }

  const handleViewProfile = () => {
    console.log("Viewing profile details...")
  }

  // Calculate statistics
  const totalStudents = filteredStudents.length
  const goodAttendance = filteredStudents.filter((student) =>
    Object.values(student.subjects).some((subject) => subject.percentage >= 75),
  ).length
  const averageAttendance = filteredStudents.filter((student) =>
    Object.values(student.subjects).some((subject) => subject.percentage >= 60 && subject.percentage < 75),
  ).length
  const lowAttendance = filteredStudents.filter((student) =>
    Object.values(student.subjects).some((subject) => subject.percentage < 60),
  ).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-gray-900">Class Teacher Dashboard</h1>
            </div>

            {/* Top Right Section */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadReport}
                className="flex items-center gap-2 bg-transparent"
              >
                <Download className="w-4 h-4" />
                Download Report
              </Button>

              <Button variant="outline" size="sm" className="relative bg-transparent">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                  2
                </span>
              </Button>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3 p-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" />
                      <AvatarFallback className="bg-blue-600 text-white">SJ</AvatarFallback>
                    </Avatar>
                    <div className="text-left hidden sm:block">
                      <p className="text-sm font-medium text-gray-900">{teacherInfo.name}</p>
                      <p className="text-xs text-gray-500">{teacherInfo.department}</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={handleViewProfile} className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleEditProfile} className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Edit Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-red-600">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Attendance Management</h2>
          <p className="text-gray-600 mt-2">
            Manage student attendance, subjects, and track performance metrics for your assigned classes.
          </p>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">Student Attendance Management</CardTitle>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleDownloadReport}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
                <Dialog open={showAddStudent} onOpenChange={setShowAddStudent}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                      <UserPlus className="w-4 h-4" />
                      Add Student
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Student</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Student Name</Label>
                        <Input
                          id="name"
                          value={newStudent.name}
                          onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                          placeholder="Enter student name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="rollNumber">Roll Number</Label>
                        <Input
                          id="rollNumber"
                          value={newStudent.rollNumber}
                          onChange={(e) => setNewStudent({ ...newStudent, rollNumber: e.target.value })}
                          placeholder="Enter roll number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newStudent.email}
                          onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                          placeholder="Enter email address"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={newStudent.phone}
                          onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleAddStudent} className="flex-1">
                          Add Student
                        </Button>
                        <Button variant="outline" onClick={() => setShowAddStudent(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Attendance Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium text-gray-700 w-48">
                      <div>Student Name</div>
                      <div className="text-sm font-normal text-gray-500 mt-1">Roll Number</div>
                    </th>
                    {subjects.map((subject) => (
                      <th key={subject.code} className="text-center p-4 font-medium text-gray-700 min-w-32">
                        <div>{subject.code}</div>
                        <div className="text-sm font-normal text-gray-500 mt-1">{subject.teacher}</div>
                        <div className="flex justify-center gap-4 mt-2 text-xs">
                          <span>P</span>
                          <span>A</span>
                          <span>%</span>
                        </div>
                      </th>
                    ))}
                    <th className="text-center p-4 font-medium text-gray-700 w-20">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.rollNumber}</div>
                      </td>
                      {subjects.map((subject) => {
                        const attendance = student.subjects[subject.code]
                        return (
                          <td
                            key={subject.code}
                            className={`p-4 text-center ${getAttendanceColor(attendance.percentage)}`}
                          >
                            <div className="flex justify-center gap-4 text-sm">
                              <span className="text-green-600 font-medium">{attendance.present}</span>
                              <span className="text-red-600 font-medium">{attendance.absent}</span>
                              <span className={`font-medium ${getPercentageColor(attendance.percentage)}`}>
                                {attendance.percentage}%
                              </span>
                            </div>
                          </td>
                        )
                      })}
                      <td className="p-4 text-center">
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Statistics */}
            <div className="flex justify-center gap-16 mt-8 pt-8 border-t">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{totalStudents}</div>
                <div className="text-sm text-gray-600 mt-1">Total Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{goodAttendance}</div>
                <div className="text-sm text-gray-600 mt-1">Good Attendance</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">{averageAttendance}</div>
                <div className="text-sm text-gray-600 mt-1">Average Attendance</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{lowAttendance}</div>
                <div className="text-sm text-gray-600 mt-1">Low Attendance</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Edit Dialog */}
        <Dialog open={showProfile} onOpenChange={setShowProfile}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="teacherName">Name</Label>
                <Input id="teacherName" defaultValue={teacherInfo.name} />
              </div>
              <div>
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input id="employeeId" defaultValue={teacherInfo.employeeId} disabled />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Input id="department" defaultValue={teacherInfo.department} />
              </div>
              <div>
                <Label htmlFor="teacherEmail">Email</Label>
                <Input id="teacherEmail" type="email" defaultValue={teacherInfo.email} />
              </div>
              <div>
                <Label htmlFor="teacherPhone">Phone</Label>
                <Input id="teacherPhone" defaultValue={teacherInfo.phone} />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1">Save Changes</Button>
                <Button variant="outline" onClick={() => setShowProfile(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
