"use client"

import { useState } from "react"

const TeacherTimeTable = () => {
  const teachers = ["Prof. Sharma", "Dr. Neha Jain", "Mr. Rajeev", "Ms. Ananya"]
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const timeSlots = ["09:00", "10:00", "11:00", "12:00", "01:00", "02:00", "03:00"]

  const [selectedTeacher, setSelectedTeacher] = useState("")
  const [timetable, setTimetable] = useState({
    "Prof. Sharma": {
      Monday: {
        "09:00": { subject: "Maths", class: "CS 1st Year - A", room: "101" },
        "10:00": { subject: "Physics", class: "CS 1st Year - A", room: "101" },
      },
    },
    "Dr. Neha Jain": {
      Wednesday: {
        "09:00": { subject: "DBMS", class: "CS 2nd Year - B", room: "201" },
        "10:00": { subject: "DBMS", class: "CS 2nd Year - B", room: "201" },
      },
    },
  })

  const [modalOpen, setModalOpen] = useState(false)
  const [editingSlot, setEditingSlot] = useState({ day: "", time: "" })
  const [formData, setFormData] = useState({ subject: "", class: "", room: "" })

  const openModal = (day, time) => {
    const entry = timetable[selectedTeacher]?.[day]?.[time] || { subject: "", class: "", room: "" }
    setEditingSlot({ day, time })
    setFormData(entry)
    setModalOpen(true)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const saveChanges = () => {
    const { day, time } = editingSlot
    const updated = {
      ...timetable,
      [selectedTeacher]: {
        ...timetable[selectedTeacher],
        [day]: {
          ...timetable[selectedTeacher]?.[day],
          [time]: formData,
        },
      },
    }
    setTimetable(updated)
    setModalOpen(false)
  }

  const currentTable = timetable[selectedTeacher] || {}

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-5xl mx-auto bg-white p-6 shadow-md rounded-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Teacher Time Table</h1>

        {/* Teacher Dropdown */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">Select Teacher</label>
          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            className="mt-1 w-full border rounded px-4 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select Teacher --</option>
            {teachers.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Time Table */}
        {selectedTeacher ? (
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed border border-gray-300 text-sm">
              <thead className="bg-blue-100">
                <tr>
                  <th className="border px-4 py-2 w-32 text-left">Day / Time</th>
                  {timeSlots.map((slot) => (
                    <th key={slot} className="border px-4 py-2 text-center">{slot}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map((day) => (
                  <tr key={day}>
                    <td className="border px-4 py-2 font-semibold bg-gray-50">{day}</td>
                    {timeSlots.map((time) => {
                      const cell = currentTable?.[day]?.[time]
                      return (
                        <td
                          key={time}
                          onClick={() => openModal(day, time)}
                          className="border px-2 py-2 text-center cursor-pointer hover:bg-blue-50"
                        >
                          {cell ? (
                            <>
                              <div className="font-medium">{cell.subject}</div>
                              <div className="text-xs text-gray-600">{cell.class}</div>
                              <div className="text-xs text-gray-500">Room: {cell.room}</div>
                            </>
                          ) : (
                            <span className="text-gray-400 text-xs">+ Add</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 mt-4">Please select a teacher to view/edit the timetable.</p>
        )}
      </div>

      {/* Modal for editing */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Edit Slot – {editingSlot.day} at {editingSlot.time}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="mt-1 w-full border px-3 py-2 rounded bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Class (Year - Section)</label>
                <input
                  type="text"
                  name="class"
                  value={formData.class}
                  onChange={handleChange}
                  className="mt-1 w-full border px-3 py-2 rounded bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Room No.</label>
                <input
                  type="text"
                  name="room"
                  value={formData.room}
                  onChange={handleChange}
                  className="mt-1 w-full border px-3 py-2 rounded bg-gray-50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={saveChanges}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeacherTimeTable
