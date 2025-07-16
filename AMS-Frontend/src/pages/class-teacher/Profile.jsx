"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"

const Profile = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [profile, setProfile] = useState({})
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock profile data
    setTimeout(() => {
      setProfile({
        personalInfo: {
          name: user?.name || "Dr. Michael Brown",
          email: user?.email || "michael.brown@university.edu",
          phone: "+91 9876543210",
          address: "123 University Street, Academic City, State 12345",
          dateOfBirth: "1985-06-15",
          gender: "Male",
        },
        professionalInfo: {
          employeeId: user?.teacherInfo?.employeeId || "EMP003",
          department: user?.teacherInfo?.department || "Computer Science",
          designation: "Assistant Professor",
          joiningDate: "2020-08-15",
          qualification: "Ph.D. in Computer Science",
          experience: "8 years",
          specialization: "Database Systems, Software Engineering",
        },
        classInfo: {
          assignedClass: "CS 3rd Year - Section A",
          totalStudents: 45,
          subjects: [
            "Data Structures & Algorithms",
            "Database Management Systems",
            "Software Engineering",
            "Computer Networks",
            "Operating Systems",
          ],
          academicYear: "2024-2025",
          semester: "6th Semester",
        },
        statistics: {
          totalClasses: 156,
          averageAttendance: 87.5,
          requestsHandled: 23,
          studentsWithLowAttendance: 5,
        },
      })
      setLoading(false)
    }, 1000)
  }, [user])

  const handleSave = () => {
    alert("Profile updated successfully!")
    setIsEditing(false)
  }

  const handleInputChange = (section, field, value) => {
    setProfile((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
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
                <h1 className="text-xl font-semibold text-gray-900">My Profile</h1>
                {/* <p className="text-sm text-gray-500">Manage your personal and professional information</p> */}
              </div>
            </div>
            {/* <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Edit Profile
                </button>
              )}
            </div> */}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">
                    {profile.personalInfo?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") || "MB"}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{profile.personalInfo?.name}</h3>
                <p className="text-sm text-gray-600">{profile.professionalInfo?.designation}</p>
                <p className="text-sm text-gray-500">{profile.professionalInfo?.department}</p>
              </div>
              <div className="mt-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Employee ID:</span>
                  <span className="text-sm font-medium text-gray-900">{profile.professionalInfo?.employeeId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Class:</span>
                  <span className="text-sm font-medium text-gray-900">{profile.classInfo?.assignedClass}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Students:</span>
                  <span className="text-sm font-medium text-gray-900">{profile.classInfo?.totalStudents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Experience:</span>
                  <span className="text-sm font-medium text-gray-900">{profile.professionalInfo?.experience}</span>
                </div>
              </div>
            </div>

            {/* Statistics */}
            {/* <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Classes</span>
                  <span className="text-lg font-bold text-blue-600">{profile.statistics?.totalClasses}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg. Attendance</span>
                  <span className="text-lg font-bold text-green-600">{profile.statistics?.averageAttendance}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Requests Handled</span>
                  <span className="text-lg font-bold text-purple-600">{profile.statistics?.requestsHandled}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Low Attendance</span>
                  <span className="text-lg font-bold text-red-600">
                    {profile.statistics?.studentsWithLowAttendance}
                  </span>
                </div>
              </div>
            </div> */}
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.personalInfo?.name || ""}
                      onChange={(e) => handleInputChange("personalInfo", "name", e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{profile.personalInfo?.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profile.personalInfo?.email || ""}
                      onChange={(e) => handleInputChange("personalInfo", "email", e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{profile.personalInfo?.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profile.personalInfo?.phone || ""}
                      onChange={(e) => handleInputChange("personalInfo", "phone", e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{profile.personalInfo?.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={profile.personalInfo?.dateOfBirth || ""}
                      onChange={(e) => handleInputChange("personalInfo", "dateOfBirth", e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">
                      {profile.personalInfo?.dateOfBirth
                        ? new Date(profile.personalInfo.dateOfBirth).toLocaleDateString()
                        : ""}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  {isEditing ? (
                    <textarea
                      value={profile.personalInfo?.address || ""}
                      onChange={(e) => handleInputChange("personalInfo", "address", e.target.value)}
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{profile.personalInfo?.address}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                  <p className="text-sm text-gray-900">{profile.professionalInfo?.employeeId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <p className="text-sm text-gray-900">{profile.professionalInfo?.department}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.professionalInfo?.designation || ""}
                      onChange={(e) => handleInputChange("professionalInfo", "designation", e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{profile.professionalInfo?.designation}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
                  <p className="text-sm text-gray-900">
                    {profile.professionalInfo?.joiningDate
                      ? new Date(profile.professionalInfo.joiningDate).toLocaleDateString()
                      : ""}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.professionalInfo?.qualification || ""}
                      onChange={(e) => handleInputChange("professionalInfo", "qualification", e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{profile.professionalInfo?.qualification}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.professionalInfo?.experience || ""}
                      onChange={(e) => handleInputChange("professionalInfo", "experience", e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{profile.professionalInfo?.experience}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                  {isEditing ? (
                    <textarea
                      value={profile.professionalInfo?.specialization || ""}
                      onChange={(e) => handleInputChange("professionalInfo", "specialization", e.target.value)}
                      rows={2}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{profile.professionalInfo?.specialization}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Class Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Class Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Class</label>
                  <p className="text-sm text-gray-900">{profile.classInfo?.assignedClass}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Students</label>
                  <p className="text-sm text-gray-900">{profile.classInfo?.totalStudents}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                  <p className="text-sm text-gray-900">{profile.classInfo?.academicYear}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Semester</label>
                  <p className="text-sm text-gray-900">{profile.classInfo?.semester}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subjects</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {profile.classInfo?.subjects?.map((subject, index) => (
                      <span
                        key={index}
                        className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
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
  )
}

export default Profile
