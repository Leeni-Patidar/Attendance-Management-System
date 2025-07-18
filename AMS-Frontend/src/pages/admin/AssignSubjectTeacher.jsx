"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"

const AssignSubjectTeacher = () => {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    year: "",
    section: "",
    subject: "",
    teacher: "",
  })

  const years = ["1st Year", "2nd Year", "3rd Year", "Final Year"]
  const sections = ["A", "B", "C"]
  const subjects = ["Data Structures", "Operating Systems", "DBMS", "Mathematics", "AI"]
  const teachers = ["Prof. Sharma", "Dr. Neha Jain", "Mr. Rajeev", "Ms. Ananya"]

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const fullClass = `CS ${form.year} - ${form.section}`
    console.log("Assigned:", { ...form, class: fullClass })
    alert(`Subject "${form.subject}" assigned to ${form.teacher} for ${fullClass}`)
    setForm({ year: "", section: "", subject: "", teacher: "" })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 text-gray-500 hover:text-gray-700">
              ← Back
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Assign Subject Teacher</h1>
              <p className="text-sm text-gray-500">Assign a teacher to a subject and class</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto mt-10 px-4">
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Select Year</label>
              <select
                name="year"
                value={form.year}
                onChange={handleChange}
                required
                className="mt-1 w-full px-4 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select Year --</option>
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Select Section</label>
              <select
                name="section"
                value={form.section}
                onChange={handleChange}
                required
                className="mt-1 w-full px-4 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select Section --</option>
                {sections.map((sec) => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Select Subject</label>
            <select
              name="subject"
              value={form.subject}
              onChange={handleChange}
              required
              className="mt-1 w-full px-4 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Subject --</option>
              {subjects.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Select Teacher</label>
            <select
              name="teacher"
              value={form.teacher}
              onChange={handleChange}
              required
              className="mt-1 w-full px-4 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Teacher --</option>
              {teachers.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Assign Teacher
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

export default AssignSubjectTeacher
