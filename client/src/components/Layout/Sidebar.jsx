"use client"

import { useAuth } from "../../contexts/AuthContext"
import {
  MdDashboard,
  MdPeople,
  MdSchool,
  MdBook,
  MdCheckCircle,
  MdAnalytics,
  MdQrCodeScanner,
  MdQrCode,
  MdCalendarToday,
  MdAssignment,
} from "react-icons/md"

const Sidebar = () => {
  const { user } = useAuth()

  const getMenuItems = () => {
    switch (user?.role) {
      case "admin":
        return [
          { name: "Dashboard", href: "#", icon: MdDashboard },
          { name: "Users", href: "#", icon: MdPeople },
          { name: "Classes", href: "#", icon: MdSchool },
          { name: "Subjects", href: "#", icon: MdBook },
          { name: "Attendance", href: "#", icon: MdCheckCircle },
          { name: "Analytics", href: "#", icon: MdAnalytics },
        ]
      case "class_teacher":
        return [
          { name: "Dashboard", href: "#", icon: MdDashboard },
          { name: "My Class", href: "#", icon: MdSchool },
          { name: "Attendance", href: "#", icon: MdCheckCircle },
          { name: "Compile Report", href: "#", icon: MdAssignment },
        ]
      case "subject_teacher":
        return [
          { name: "Dashboard", href: "#", icon: MdDashboard },
          { name: "My Subjects", href: "#", icon: MdBook },
          { name: "Generate QR", href: "#", icon: MdQrCode },
          { name: "Attendance", href: "#", icon: MdCheckCircle },
        ]
      case "student":
        return [
          { name: "Dashboard", href: "#", icon: MdDashboard },
          { name: "Scan QR", href: "#", icon: MdQrCodeScanner },
          { name: "My Attendance", href: "#", icon: MdCheckCircle },
          { name: "Calendar", href: "#", icon: MdCalendarToday },
        ]
      default:
        return []
    }
  }

  return (
    <div className="w-64 bg-white shadow-sm h-screen">
      <div className="p-4">
        <nav className="space-y-2">
          {getMenuItems().map((item) => {
            const IconComponent = item.icon
            return (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900"
              >
                <IconComponent className="mr-3 text-lg" />
                {item.name}
              </a>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

export default Sidebar
