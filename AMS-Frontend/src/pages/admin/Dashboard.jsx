"use client"

import { useState } from "react"
import {
  Users,
  School,
  GraduationCap,
  Calendar,
  Download,
  UserPlus,
  BookOpen,
  Upload,
  Settings,
  Activity,
  ChevronRight,
  X,
  User,
  LogOut,
  Mail,
  Phone,
  FileText,
} from "lucide-react"

import { useAuth } from "../../contexts/AuthContext"
import { useNavigate } from "react-router-dom"

const AdminDashboard = () => {
   const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [selectedClass, setSelectedClass] = useState(null)
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [showAllClasses, setShowAllClasses] = useState(false)
  const [showAllTeachers, setShowAllTeachers] = useState(false)
  const [teacherFilter, setTeacherFilter] = useState("all")
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [showActivitiesModal, setShowActivitiesModal] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())

  // Sample data
  const stats = [
    { title: "Total Students", value: "1,234", icon: Users, color: "bg-blue-500" },
    { title: "Total Classes", value: "45", icon: School, color: "bg-green-500" },
    { title: "Total Teachers", value: "89", icon: GraduationCap, color: "bg-purple-500" },
    { title: "Calendar", value: "", icon: Calendar, color: "bg-orange-500" },
  ]

  const recentActivities = [
    { id: 1, action: "John Doe marked present", time: "5 minutes ago", icon: Activity },
    { id: 2, action: "New teacher assigned to Class 10A", time: "15 minutes ago", icon: UserPlus },
    { id: 3, action: "Attendance report generated", time: "30 minutes ago", icon: FileText },
    { id: 4, action: "Timetable updated for Math dept", time: "1 hour ago", icon: Calendar },
    { id: 5, action: "Student transferred to Class 9B", time: "2 hours ago", icon: Users },
  ]

  const classes = [
    { id: 1, name: "Class 10A", students: 35, teacher: "Ms. Johnson", attendance: 92 },
    { id: 2, name: "Class 10B", students: 33, teacher: "Mr. Smith", attendance: 88 },
    { id: 3, name: "Class 9A", students: 40, teacher: "Mrs. Brown", attendance: 95 },
    { id: 4, name: "Class 9B", students: 38, teacher: "Mr. Wilson", attendance: 90 },
    { id: 5, name: "Class 8A", students: 42, teacher: "Ms. Davis", attendance: 87 },
  ]

  const teachers = [
    {
      id: 1,
      name: "Ms. Johnson",
      subject: "Mathematics",
      type: "Class Teacher",
      classes: ["Class 10A"],
      email: "johnson@school.edu",
      phone: "+1 234 567 8901",
      photo: "/placeholder.svg?height=150&width=150",
    },
    {
      id: 2,
      name: "Mr. Smith",
      subject: "Physics",
      type: "Subject Teacher",
      classes: ["Class 10B", "Class 9A"],
      email: "smith@school.edu",
      phone: "+1 234 567 8902",
      photo: "/placeholder.svg?height=150&width=150",
    },
    {
      id: 3,
      name: "Mrs. Brown",
      subject: "English",
      type: "Class Teacher",
      classes: ["Class 9A"],
      email: "brown@school.edu",
      phone: "+1 234 567 8903",
      photo: "/placeholder.svg?height=150&width=150",
    },
    {
      id: 4,
      name: "Mr. Wilson",
      subject: "Chemistry",
      type: "Subject Teacher",
      classes: ["Class 9B", "Class 8A"],
      email: "wilson@school.edu",
      phone: "+1 234 567 8904",
      photo: "/placeholder.svg?height=150&width=150",
    },
  ]

  const students = [
    { id: 1, name: "Alice Johnson", rollNumber: "R001", attendance: 95, status: "Present" },
    { id: 2, name: "Bob Smith", rollNumber: "R002", attendance: 88, status: "Present" },
    { id: 3, name: "Charlie Brown", rollNumber: "R003", attendance: 92, status: "Absent" },
    { id: 4, name: "Diana Wilson", rollNumber: "R004", attendance: 97, status: "Present" },
    { id: 5, name: "Eve Davis", rollNumber: "R005", attendance: 85, status: "Present" },
  ]

  const quickActions = [
    { title: "Download Report", icon: Download, color: "bg-blue-500" },
    { title: "Assign Class Teacher", icon: UserPlus, color: "bg-green-500" },
    { title: "Assign Subject Teacher", icon: BookOpen, color: "bg-purple-500" },
    { title: "Upload Time Table", icon: Upload, color: "bg-orange-500" },
    { title: "Upload Subject Timetable", icon: Calendar, color: "bg-red-500" },
    { title: "Manage Arrangements", icon: Settings, color: "bg-gray-500" },
  ]

  const filteredTeachers = teachers.filter((teacher) => {
    if (teacherFilter === "all") return true
    return teacher.type === teacherFilter
  })

  // const renderMiniCalendar = () => {
  //   const today = new Date()
  //   const year = today.getFullYear()
  //   const month = today.getMonth()
  //   const firstDay = new Date(year, month, 1)
  //   const lastDay = new Date(year, month + 1, 0)
  //   const daysInMonth = lastDay.getDate()
  //   const startingDayOfWeek = firstDay.getDay()
  //   const days = []

  //   for (let i = 0; i < startingDayOfWeek; i++) {
  //     days.push(null)
  //   }

  //   for (let day = 1; day <= daysInMonth; day++) {
  //     days.push(day)
  //   }

  //   const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  //   return (
  //     <div className="w-full">
  //       <div className="text-center mb-2">
  //         <h3 className="text-sm font-semibold text-gray-700">
  //           {monthNames[month]} {year}
  //         </h3>
  //       </div>
  //       <div className="grid grid-cols-7 gap-1 text-xs">
  //         {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
  //           <div key={day} className="text-center font-medium text-gray-500 py-1">
  //             {day}
  //           </div>
  //         ))}
  //         {days.map((day, index) => (
  //           <div
  //             key={index}
  //             className={`text-center py-1 ${
  //               day === today.getDate() ? "bg-blue-500 text-white rounded-full" : "text-gray-700"
  //             } ${day ? "hover:bg-gray-100 cursor-pointer" : ""}`}
  //           >
  //             {day}
  //           </div>
  //         ))}
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <div>
      
    </div>
  )
}

export default Dashboard
