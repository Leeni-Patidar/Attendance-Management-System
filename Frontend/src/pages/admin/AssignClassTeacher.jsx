"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"

const AssignClassTeacher = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    teacher: "",
    year: "",
    section: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.teacher || !formData.year || !formData.section) {
      alert("Please fill all required fields")
      return
    }

    console.log("Class Teacher Assigned:", formData)
    alert(`Class teacher assigned: ${formData.teacher} to ${formData.year} - Section ${formData.section}`)
    // Reset
    setFormData({ teacher: "", year: "", section: "" })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Assign Class Teacher</h1>
            <p className="text-sm text-gray-500">Assign a teacher to a class and section</p>
          </div>
          <button onClick={() => navigate(-1)} className="text-sm text-blue-600 hover:underline">
            ← Back
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Teacher Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Teacher</label>
            <select
              name="teacher"
              value={formData.teacher}
              onChange={handleChange}
              className="w-full border rounded px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Teacher --</option>
              <option value="Prof. R. Sharma">Prof. R. Sharma</option>
              <option value="Dr. Neha Jain">Dr. Neha Jain</option>
              <option value="Mr. Ankit Verma">Mr. Ankit Verma</option>
              <option value="Mrs. Kavita Mehta">Mrs. Kavita Mehta</option>
            </select>
          </div>

          {/* Year Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Year</label>
            <select
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="w-full border rounded px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Year --</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="Final Year">Final Year</option>
            </select>
          </div>

          {/* Section Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Section</label>
            <select
              name="section"
              value={formData.section}
              onChange={handleChange}
              className="w-full border rounded px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Section --</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
              <option value="D">Section D</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded shadow"
            >
              Assign Class Teacher
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AssignClassTeacher
