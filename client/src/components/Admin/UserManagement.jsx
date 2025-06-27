"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { MdPeople, MdAdd, MdEdit, MdDelete, MdSave, MdCancel } from "react-icons/md"

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "student",
    studentId: "",
    password: "",
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      // Mock data - replace with actual API call
      const mockUsers = [
        { _id: "1", name: "John Doe", email: "john@example.com", role: "student", studentId: "ST001", isActive: true },
        { _id: "2", name: "Jane Smith", email: "jane@example.com", role: "class_teacher", isActive: true },
        { _id: "3", name: "Prof. Wilson", email: "wilson@example.com", role: "subject_teacher", isActive: true },
        { _id: "4", name: "Admin User", email: "admin@example.com", role: "admin", isActive: true },
      ]
      setUsers(mockUsers)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingUser) {
        await axios.put(`http://localhost:5000/api/users/${editingUser._id}`, formData)
      } else {
        await axios.post("http://localhost:5000/api/users", formData)
      }
      fetchUsers()
      resetForm()
    } catch (error) {
      console.error("Error saving user:", error)
    }
  }

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`http://localhost:5000/api/users/${userId}`)
        fetchUsers()
      } catch (error) {
        console.error("Error deleting user:", error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "student",
      studentId: "",
      password: "",
    })
    setEditingUser(null)
    setShowAddModal(false)
  }

  const startEdit = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId || "",
      password: "",
    })
    setEditingUser(user)
    setShowAddModal(true)
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800"
      case "class_teacher":
        return "bg-blue-100 text-blue-800"
      case "subject_teacher":
        return "bg-green-100 text-green-800"
      case "student":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <MdPeople className="mr-2 text-primary-600" />
          User Management
        </h3>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          <MdAdd className="mr-2" />
          Add New User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}
                    >
                      {user.role.replace("_", " ").toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.studentId || "N/A"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => startEdit(user)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                      <MdEdit className="inline mr-1" />
                      Edit
                    </button>
                    <button onClick={() => handleDelete(user._id)} className="text-red-600 hover:text-red-900">
                      <MdDelete className="inline mr-1" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{editingUser ? "Edit User" : "Add New User"}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    required
                    className="input-field"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    className="input-field"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="student">Student</option>
                    <option value="subject_teacher">Subject Teacher</option>
                    <option value="class_teacher">Class Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {formData.role === "student" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Student ID</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.studentId}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Password {editingUser && "(leave blank to keep current)"}
                  </label>
                  <input
                    type="password"
                    className="input-field"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingUser}
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={resetForm} className="btn-secondary">
                    <MdCancel className="mr-2" />
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    <MdSave className="mr-2" />
                    {editingUser ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagement
