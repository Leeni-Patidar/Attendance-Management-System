"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  BookOpen,
  User,
  Phone,
  Mail,
  GraduationCap,
  Calendar,
  BarChart3,
  ChevronDown,
  LogOut,
  Settings,
} from "lucide-react"

export default function StudentDashboard() {
  const [subjects, setSubjects] = useState([])
  const [studentInfo, setStudentInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStudentData()
  }, [])

  const fetchStudentData = async () => {
    try {
      const response = await fetch("/api/student/attendance")
      const data = await response.json()

      if (response.ok) {
        setSubjects(data.subjects)
      }

      // Get student profile (this would come from auth context in real app)
      setStudentInfo({
        name: "John Doe",
        rollNumber: "CS21B001",
        program: "B.Tech Computer Science",
        year: "3rd Year",
        semester: "6th Semester",
        branch: "Computer Science & Engineering",
        email: "john.doe@college.edu",
        phone: "+91 9876543210",
      })
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getAttendanceColor = (percentage) => {
    if (percentage < 60) return "bg-red-100 text-red-800 border-red-200"
    if (percentage < 75) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    return "bg-green-100 text-green-800 border-green-200"
  }

  const handleSubjectClick = (subject) => {
    window.location.href = `/student/subject/${subject.id}`
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      window.location.href = "/login"
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const handleEditProfile = () => {
    window.location.href = "/student/profile/edit"
  }

  const handleViewProfile = () => {
    window.location.href = "/student/profile"
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
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Student Portal</h1>
            </div>

            {/* Profile Section */}
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3 p-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" />
                      <AvatarFallback className="bg-blue-600 text-white">JD</AvatarFallback>
                    </Avatar>
                    <div className="text-left hidden sm:block">
                      <p className="text-sm font-medium text-gray-900">{studentInfo?.name}</p>
                      <p className="text-xs text-gray-500">{studentInfo?.rollNumber}</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Student Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-sm text-gray-900">{studentInfo?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Roll Number</p>
                  <p className="text-sm text-gray-900">{studentInfo?.rollNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Program</p>
                  <p className="text-sm text-gray-900">{studentInfo?.program}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Year/Semester</p>
                  <p className="text-sm text-gray-900">{studentInfo?.year}</p>
                  <p className="text-sm text-gray-900">{studentInfo?.semester}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Branch</p>
                  <p className="text-sm text-gray-900">{studentInfo?.branch}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <p className="text-sm text-gray-900">{studentInfo?.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <p className="text-sm text-gray-900">{studentInfo?.phone}</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => (window.location.href = "/student/requests")}
                  >
                    Submit Request
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => (window.location.href = "/student/qr-scan")}
                  >
                    Scan QR Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Subject Attendance</h2>
              <p className="text-gray-600">Click on any subject card to view detailed attendance</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subjects.map((subject) => (
                <Card
                  key={subject.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleSubjectClick(subject)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{subject.courseName}</CardTitle>
                        <p className="text-sm text-gray-500">{subject.courseCode}</p>
                      </div>
                      <Badge className={getAttendanceColor(subject.attendance || 0)}>{subject.attendance || 0}%</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Classes:</span>
                        <span className="font-medium">{subject.totalClasses || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Present:</span>
                        <span className="font-medium text-green-600">{subject.presentDays || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Absent:</span>
                        <span className="font-medium text-red-600">{subject.absentDays || 0}</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            (subject.attendance || 0) >= 75
                              ? "bg-green-500"
                              : (subject.attendance || 0) >= 60
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                          style={{ width: `${subject.attendance || 0}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                          <Calendar className="w-4 h-4" />
                          View Calendar
                        </Button>
                        <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                          <BarChart3 className="w-4 h-4" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
