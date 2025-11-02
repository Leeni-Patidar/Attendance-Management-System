"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"

const StudentProfile = () => {
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // fetch current student's profile from backend
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('/api/students/me', {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })
        if (!res.ok) {
          console.error('Failed to load profile', res.status)
          setLoading(false)
          return
        }
        const data = await res.json()
        // Map backend fields to profileData expected by UI
        setProfileData({
          name: data.name || user?.name || '',
          rollNumber: data.rollNo || data.studentID || '',
          email: data.email || '',
          phone: data.phoneNumber || '',
          program: data.program || '',
          year: data.year ? String(data.year) : '',
          semester: data.sem ? String(data.sem) : '',
          branch: data.branch || '',
          class: data.class || '',
          address: data.address || '',
          dateOfBirth: data.dob ? new Date(data.dob).toISOString().slice(0, 10) : '',
          bloodGroup: data.bloodGroup || '',
          fatherName: data.fatherName || '',
          motherName: data.motherName || '',
          guardianPhone: data.guardianPhoneNumber || '',
          admissionDate: data.admissionDate || '',
          studentId: data.studentID || data._id || '',
        })
      } catch (err) {
        console.error('Error fetching profile:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user])


  const [showPasswordChange, setShowPasswordChange] = useState(false)
const [currentPassword, setCurrentPassword] = useState("")
const [newPassword, setNewPassword] = useState("")
const [confirmNewPassword, setConfirmNewPassword] = useState("")
const [passwordChangeMessage, setPasswordChangeMessage] = useState("")

const handleChangePassword = (e) => {
  e.preventDefault()

  // Dummy password change logic
  if (!currentPassword || !newPassword || !confirmNewPassword) {
    setPasswordChangeMessage("Please fill out all fields.")
    return
  }

  if (newPassword !== confirmNewPassword) {
    setPasswordChangeMessage("New passwords do not match.")
    return
  }

  // Simulate API success
  setTimeout(() => {
    setPasswordChangeMessage("Password changed successfully!")
    setCurrentPassword("")
    setNewPassword("")
    setConfirmNewPassword("")
    setShowPasswordChange(false)
  }, 1000)
}


  const handleSave = () => {
    // Update user context
    updateUser({
      ...user,
      name: profileData.name,
      studentInfo: {
        ...user.studentInfo,
        program: profileData.program,
        year: profileData.year,
        semester: profileData.semester,
        branch: profileData.branch,
        class: profileData.class,
      },
    })

    setIsEditing(false)
    alert("Profile updated successfully!")
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
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button onClick={() => navigate(-1)} className="mr-4 p-2 text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Student Profile</h1>
                <p className="text-sm text-gray-500">View your profile information</p>
              </div>
            </div>
           </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Picture and Basic Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="w-32 h-32 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-4xl font-bold text-white">
                  {profileData.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{profileData.name}</h3>
              <p className="text-gray-600">{profileData.rollNumber}</p>
              <p className="text-sm text-gray-500 mt-2">{profileData.program}</p>

              {isEditing && <button className="mt-4 text-sm text-blue-600 hover:text-blue-800">Change Photo</button>}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h4 className="font-semibold text-gray-900 mb-4">Quick Stats</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Student ID</span>
                  <span className="text-sm font-medium">{profileData.studentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Admission Date</span>
                  <span className="text-sm font-medium">
                    {new Date(profileData.admissionDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Blood Group</span>
                  <span className="text-sm font-medium">{profileData.bloodGroup}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Details */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{profileData.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                    <p className="text-sm text-gray-900">{profileData.rollNumber}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{profileData.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{profileData.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{new Date(profileData.dateOfBirth).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>

                {/* Academic Details */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                    <p className="text-sm text-gray-900">{profileData.program}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <p className="text-sm text-gray-900">{profileData.year}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                    <p className="text-sm text-gray-900">{profileData.semester}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                    <p className="text-sm text-gray-900">{profileData.branch}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                    <p className="text-sm text-gray-900">{profileData.class}</p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                {isEditing ? (
                  <textarea
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{profileData.address}</p>
                )}
              </div>

              {/* Family Information */}
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Family Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.fatherName}
                        onChange={(e) => setProfileData({ ...profileData, fatherName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{profileData.fatherName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.motherName}
                        onChange={(e) => setProfileData({ ...profileData, motherName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{profileData.motherName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Phone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={profileData.guardianPhone}
                        onChange={(e) => setProfileData({ ...profileData, guardianPhone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{profileData.guardianPhone}</p>
                    )}
                  </div>
                </div>
              </div>

 {/* Account Settings */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Change Password</h4>
                    <p className="text-sm text-gray-600">Update your account password</p>
                  </div>
                  <button
                    onClick={() => setShowPasswordChange(!showPasswordChange)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {showPasswordChange ? "Cancel" : "Change"}
                  </button>
                </div>
                {showPasswordChange && (
                  <div className="p-4 bg-white border border-gray-200 rounded-lg mt-4 space-y-4">
                    <h5 className="font-semibold text-gray-900">Update Password</h5>
                    <form onSubmit={handleChangePassword} className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input
                          type="password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      {passwordChangeMessage && (
                        <p
                          className={`text-sm ${passwordChangeMessage.includes("successfully") ? "text-green-600" : "text-red-600"}`}
                        >
                          {passwordChangeMessage}
                        </p>
                      )}
                      <button
                        type="submit"
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                      >
                        Set New Password
                      </button>
                    </form>
                  </div>
                )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentProfile
