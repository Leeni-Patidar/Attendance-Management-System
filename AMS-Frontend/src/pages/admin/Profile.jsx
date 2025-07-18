"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const AdminProfile = () => {
  const navigate = useNavigate()
  const [profileData, setProfileData] = useState({})
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [passwordChangeMessage, setPasswordChangeMessage] = useState("")

  useEffect(() => {
    setTimeout(() => {
      const data = {
        name: "Admin User",
        email: "admin@university.edu",
        employeeId: "ADM001",
        department: "Administration",
        phone: "+1 (555) 000-0000",
        address: "Admin Block, University Campus",
        joinDate: "January 2020",
        experience: "5 years",
        role: "Administrator",
        responsibilities: "User Management, Dashboard Overview, System Configuration",
      }
      setProfileData(data)
      setEditForm(data)
      setLoading(false)
    }, 1000)
  }, [])

  const handleEdit = () => setIsEditing(true)
  const handleSave = () => {
    setProfileData(editForm)
    setIsEditing(false)
    alert("Profile updated successfully!")
  }
  const handleCancel = () => {
    setEditForm(profileData)
    setIsEditing(false)
  }
  const handleInputChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }))
  }
  const handleChangePassword = (e) => {
    e.preventDefault()
    setPasswordChangeMessage("")

    if (newPassword !== confirmNewPassword) {
      setPasswordChangeMessage("New password and confirmation do not match.")
      return
    }
    if (newPassword.length < 6) {
      setPasswordChangeMessage("New password must be at least 6 characters long.")
      return
    }
    setTimeout(() => {
      setPasswordChangeMessage("Password updated successfully!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmNewPassword("")
      setShowPasswordChange(false)
    }, 1000)
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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button onClick={() => navigate(-1)} className="mr-4 p-2 text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Admin Profile</h1>
                <p className="text-sm text-gray-500">Manage administrator information and settings</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{profileData.name}</h2>
              <p className="text-gray-600 mt-1">{profileData.role}</p>
              <p className="text-sm text-gray-500 mt-1">Employee ID: {profileData.employeeId}</p>

              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="text-sm text-gray-600">{profileData.experience} Experience</div>
                <div className="text-sm text-gray-600">Joined {profileData.joinDate}</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  {isEditing ? (
                    <input type="email" value={editForm.email} onChange={(e) => handleInputChange("email", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  ) : (
                    <p className="text-gray-900">{profileData.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  {isEditing ? (
                    <input type="tel" value={editForm.phone} onChange={(e) => handleInputChange("phone", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  ) : (
                    <p className="text-gray-900">{profileData.phone}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  {isEditing ? (
                    <textarea value={editForm.address} onChange={(e) => handleInputChange("address", e.target.value)} rows="2" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  ) : (
                    <p className="text-gray-900">{profileData.address}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Administrative Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  {isEditing ? (
                    <input type="text" value={editForm.department} onChange={(e) => handleInputChange("department", e.target.value)} className="mt-1 w-full border border-gray-300 rounded px-3 py-2" />
                  ) : (
                    <p className="text-gray-900">{profileData.department}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Responsibilities</label>
                  {isEditing ? (
                    <textarea value={editForm.responsibilities} onChange={(e) => handleInputChange("responsibilities", e.target.value)} className="mt-1 w-full border border-gray-300 rounded px-3 py-2" />
                  ) : (
                    <p className="text-gray-900">{profileData.responsibilities}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Change Password</h4>
                    <p className="text-sm text-gray-600">Update your account password</p>
                  </div>
                  <button onClick={() => setShowPasswordChange(!showPasswordChange)} className="text-blue-600 hover:text-blue-800 font-medium">
                    {showPasswordChange ? "Cancel" : "Change"}
                  </button>
                </div>
                {showPasswordChange && (
                  <div className="p-4 bg-white border border-gray-200 rounded-lg mt-4 space-y-4">
                    <h5 className="font-semibold text-gray-900">Update Password</h5>
                    <form onSubmit={handleChangePassword} className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
                      </div>
                      {passwordChangeMessage && <p className={`text-sm ${passwordChangeMessage.includes("successfully") ? "text-green-600" : "text-red-600"}`}>{passwordChangeMessage}</p>}
                      <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Set New Password</button>
                    </form>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminProfile
