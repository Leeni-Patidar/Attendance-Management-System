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
import { QRGenerator } from "@/components/qr-generator"
import {
  BookOpen,
  Bell,
  Users,
  Clock,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  ChevronDown,
  LogOut,
  User,
  Settings,
  History,
} from "lucide-react"

export default function SubjectTeacherDashboard() {
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState(null)
  const [activeQRCodes, setActiveQRCodes] = useState([])
  const [qrHistory, setQrHistory] = useState([])
  const [loading, setLoading] = useState(true)

  const teacherInfo = {
    name: "Prof. Michael Chen",
    employeeId: "EMP002",
    department: "Computer Science & Engineering",
    email: "michael.chen@college.edu",
    phone: "+91 9876543211",
  }

  useEffect(() => {
    fetchClasses()
    fetchQRHistory()
  }, [])

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/subject-teacher/classes")
      const data = await response.json()

      if (response.ok) {
        setClasses(data.classes)
        if (data.classes.length > 0) {
          setSelectedClass(data.classes[0])
        }
      }
    } catch (error) {
      console.error("Error fetching classes:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchQRHistory = async () => {
    try {
      const response = await fetch("/api/subject-teacher/qr-history")
      const data = await response.json()

      if (response.ok) {
        setQrHistory(data.history)
      }
    } catch (error) {
      console.error("Error fetching QR history:", error)
    }
  }

  const handleClassClick = (classData) => {
    window.location.href = `/subject-teacher/class/${classData.class_subject_id}`
  }

  const handleQRGenerated = (qrData) => {
    setActiveQRCodes((prev) => [...prev, qrData])
    fetchQRHistory() // Refresh history
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
    window.location.href = "/subject-teacher/profile/edit"
  }

  const handleViewProfile = () => {
    window.location.href = "/subject-teacher/profile"
  }

  const handleViewQRHistory = () => {
    window.location.href = "/subject-teacher/qr-history"
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
              <BookOpen className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Subject Teacher Portal</h1>
            </div>

            {/* Top Right Section */}
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="relative bg-transparent">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3 p-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" />
                      <AvatarFallback className="bg-blue-600 text-white">MC</AvatarFallback>
                    </Avatar>
                    <div className="text-left hidden sm:block">
                      <p className="text-sm font-medium text-gray-900">{teacherInfo.name}</p>
                      <p className="text-xs text-gray-500">{teacherInfo.employeeId}</p>
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
                  <DropdownMenuItem onClick={handleViewQRHistory} className="flex items-center gap-2">
                    <History className="w-4 h-4" />
                    QR History
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
          {/* Profile Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Teacher Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-sm text-gray-900">{teacherInfo.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Employee ID</p>
                  <p className="text-sm text-gray-900">{teacherInfo.employeeId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Department</p>
                  <p className="text-sm text-gray-900">{teacherInfo.department}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <p className="text-sm text-gray-900">{teacherInfo.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <p className="text-sm text-gray-900">{teacherInfo.phone}</p>
                </div>
              </CardContent>
            </Card>

            {/* QR Code Generation */}
            <div className="mt-6">
              <QRGenerator classData={selectedClass} onQRGenerated={handleQRGenerated} />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Classes</h2>
              <p className="text-gray-600">Select a class to manage attendance and students</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {classes.map((classData) => (
                <Card
                  key={classData.class_subject_id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleClassClick(classData)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{classData.className}</CardTitle>
                        <p className="text-sm text-gray-500">{classData.semester}</p>
                      </div>
                      <Badge variant="secondary">{classData.students} Students</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{classData.subject}</p>
                        <p className="text-sm text-gray-500">{classData.subjectCode}</p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>{classData.students} Students</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>Active</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedClass(classData)
                          }}
                        >
                          Generate QR
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                          View Students
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Active QR Codes */}
            {activeQRCodes.length > 0 && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Active QR Codes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeQRCodes.slice(-3).map((qr) => (
                      <div key={qr.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{qr.subject}</p>
                          <p className="text-sm text-gray-500">
                            {qr.code} • Generated at {qr.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Active
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent QR History */}
            {qrHistory.length > 0 && (
              <Card className="mt-8">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent QR Generation History</CardTitle>
                    <Button variant="outline" size="sm" onClick={handleViewQRHistory}>
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {qrHistory.slice(0, 5).map((qr) => (
                      <div key={qr.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{qr.subject}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(qr.generated_at).toLocaleDateString()} • {qr.session_type}
                          </p>
                        </div>
                        <Badge variant={qr.is_active ? "default" : "secondary"}>
                          {qr.is_active ? "Active" : "Expired"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="flex items-center gap-2 h-auto p-4 bg-transparent">
                    <BookOpen className="w-5 h-5" />
                    <div className="text-left">
                      <p className="font-medium">View Reports</p>
                      <p className="text-xs text-gray-500">Attendance analytics</p>
                    </div>
                  </Button>

                  <Button variant="outline" className="flex items-center gap-2 h-auto p-4 bg-transparent">
                    <Users className="w-5 h-5" />
                    <div className="text-left">
                      <p className="font-medium">Manage Students</p>
                      <p className="text-xs text-gray-500">Add/Remove students</p>
                    </div>
                  </Button>

                  <Button variant="outline" className="flex items-center gap-2 h-auto p-4 bg-transparent">
                    <Clock className="w-5 h-5" />
                    <div className="text-left">
                      <p className="font-medium">Schedule Classes</p>
                      <p className="text-xs text-gray-500">Manage timetable</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
