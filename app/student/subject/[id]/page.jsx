"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, QrCode, Upload, CalendarIcon, CheckCircle, XCircle, Clock } from "lucide-react"

export default function SubjectDetailPage({ params }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedFile, setSelectedFile] = useState(null)
  const [subjectData, setSubjectData] = useState(null)
  const [attendanceCalendar, setAttendanceCalendar] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubjectData()
  }, [params.id])

  const fetchSubjectData = async () => {
    try {
      const response = await fetch(`/api/student/attendance/${params.id}`)
      const data = await response.json()

      if (response.ok) {
        setSubjectData(data.subject)
        setAttendanceCalendar(data.calendar)
      }
    } catch (error) {
      console.error("Error fetching subject data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDate = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  const getAttendanceStatus = (dateStr) => {
    return attendanceCalendar[dateStr] || null
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "present":
        return "bg-green-500 text-white"
      case "absent":
        return "bg-red-500 text-white"
      case "late":
        return "bg-yellow-500 text-white"
      case "holiday":
        return "bg-gray-400 text-white"
      default:
        return "bg-white text-gray-700 hover:bg-gray-50"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "present":
        return <CheckCircle className="w-3 h-3" />
      case "absent":
        return <XCircle className="w-3 h-3" />
      case "late":
        return <Clock className="w-3 h-3" />
      case "holiday":
        return <Clock className="w-3 h-3" />
      default:
        return null
    }
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleQRUpload = async () => {
    if (!selectedFile) return

    const formData = new FormData()
    formData.append("image", selectedFile)

    try {
      const response = await fetch("/api/student/qr-upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        alert("QR image uploaded successfully! Attendance will be marked if valid.")
        setSelectedFile(null)
      } else {
        alert(data.error || "Upload failed")
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("Upload failed")
    }
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    // Add day headers
    dayNames.forEach((day) => {
      days.push(
        <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
          {day}
        </div>,
      )
    })

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day)
      const status = getAttendanceStatus(dateStr)

      days.push(
        <div
          key={day}
          className={`p-2 text-center text-sm border rounded-lg cursor-pointer transition-colors ${getStatusColor(status)}`}
        >
          <div className="flex flex-col items-center gap-1">
            <span>{day}</span>
            {getStatusIcon(status)}
          </div>
        </div>,
      )
    }

    return days
  }

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
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
              <h1 className="text-xl font-semibold text-gray-900">{subjectData?.name}</h1>
              <p className="text-sm text-gray-500">{subjectData?.code}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - Course Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Course Name</p>
                  <p className="text-sm text-gray-900">{subjectData?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Course Code</p>
                  <p className="text-sm text-gray-900">{subjectData?.code}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Credits</p>
                  <p className="text-sm text-gray-900">{subjectData?.credits || 3}</p>
                </div>
              </CardContent>
            </Card>

            {/* QR Code Section */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Mark Attendance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full flex items-center gap-2">
                      <QrCode className="w-4 h-4" />
                      Scan QR Code
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Scan QR Code</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <QrCode className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                          <p className="text-sm text-gray-600">QR Scanner will appear here</p>
                          <p className="text-xs text-gray-500 mt-2">Camera access required</p>
                        </div>
                      </div>
                      <Button className="w-full">Start Camera</Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full flex items-center gap-2 bg-transparent">
                      <Upload className="w-4 h-4" />
                      Upload QR Image
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload QR Code Image</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="qr-upload">Select QR Code Image</Label>
                        <Input
                          id="qr-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="mt-2"
                        />
                      </div>
                      {selectedFile && (
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">File selected: {selectedFile.name}</p>
                          <p className="text-xs text-blue-600 mt-1">Image will be stored for 24 hours</p>
                        </div>
                      )}
                      <Button onClick={handleQRUpload} className="w-full" disabled={!selectedFile}>
                        Upload & Mark Attendance
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>

          {/* Center Section - Calendar */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    Attendance Calendar
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigateMonth(-1)}>
                      ←
                    </Button>
                    <span className="text-sm font-medium min-w-[120px] text-center">
                      {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => navigateMonth(1)}>
                      →
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 mb-6">{renderCalendar()}</div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 text-sm mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                    <span>Present</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded flex items-center justify-center">
                      <XCircle className="w-3 h-3 text-white" />
                    </div>
                    <span>Absent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded flex items-center justify-center">
                      <Clock className="w-3 h-3 text-white" />
                    </div>
                    <span>Late</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-400 rounded flex items-center justify-center">
                      <Clock className="w-3 h-3 text-white" />
                    </div>
                    <span>Holiday</span>
                  </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-green-800">Total Present Days</p>
                    <p className="text-2xl font-bold text-green-900">
                      {Object.values(attendanceCalendar).filter((status) => status === "present").length}
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-red-800">Total Absent Days</p>
                    <p className="text-2xl font-bold text-red-900">
                      {Object.values(attendanceCalendar).filter((status) => status === "absent").length}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">Total Classes</p>
                    <p className="text-2xl font-bold text-blue-900">{Object.values(attendanceCalendar).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
