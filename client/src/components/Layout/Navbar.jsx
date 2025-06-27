"use client"

import { useAuth } from "../../contexts/AuthContext"
import { MdDashboard, MdLogout } from "react-icons/md"

const Navbar = () => {
  const { user, logout } = useAuth()

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <MdDashboard className="text-2xl text-primary-600 mr-3" />
            <h1 className="text-xl font-semibold text-gray-900">Attendance Management System</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">Welcome, {user?.name}</span>
            <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
              {user?.role?.replace("_", " ").toUpperCase()}
            </span>
            <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-700 flex items-center">
              <MdLogout className="mr-1" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
