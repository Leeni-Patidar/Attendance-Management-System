"use client"

import { useState } from "react"

const ClassTimeTable = () => {
  const years = ["1st Year", "2nd Year", "3rd Year", "Final Year"]
  const sections = ["A", "B", "C"]
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const timeSlots = ["09:00", "10:00", "11:00", "12:00", "01:00", "02:00", "03:00"]

  const [year, setYear] = useState("")
  const [section, setSection] = useState("")
  const [timetable, setTimetable] = useState({})
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState({ day: "", time: "" })

  const [formData, setFormData] = useState({
    subject: "",
    teacher: "",
    room: "",
  })

  const getKey = () => (year && section ? `${year}-${section}` : null)

  const currentKey = getKey()
  const currentTable = timetable[currentKey] || {}

  const openModal = (day, time) => {
    const data = currentTable[day]?.[time] || { subject: "", teacher: "", room: "" }
    setFormData(data)
    setSelectedSlot({ day, time })
    setModalOpen(true)
  }

  const handleModalChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const saveSlot = () => {
    const { day, time } = selectedSlot
    const updatedTable = {
      ...timetable,
      [currentKey]: {
        ...currentTable,
        [day]: {
          ...currentTable[day],
          [time]: { ...formData },
        },
      },
    }
    setTimetable(updatedTable)
    setModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-5xl mx-auto bg-white p-6 shadow-md rounded-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Class Time Table</h1>

        {/* Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Year</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="mt-1 w-full border rounded px-4 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Year --</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Section</label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="mt-1 w-full border rounded px-4 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Section --</option>
              {sections.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Timetable Table */}
        {year && section ? (
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
                      const slotData = currentTable[day]?.[time]
                      return (
                        <td
                          key={time}
                          onClick={() => openModal(day, time)}
                          className="border px-2 py-2 text-center cursor-pointer hover:bg-blue-50"
                        >
                          {slotData ? (
                            <>
                              <div className="font-medium">{slotData.subject}</div>
                              <div className="text-xs text-gray-600">{slotData.teacher}</div>
                              <div className="text-xs text-gray-500">Room: {slotData.room}</div>
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
          <p className="text-gray-500 mt-4">Please select both year and section to view/edit the timetable.</p>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Edit Slot: {selectedSlot.day} at {selectedSlot.time}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleModalChange}
                  className="mt-1 w-full border px-3 py-2 rounded bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Teacher</label>
                <input
                  type="text"
                  name="teacher"
                  value={formData.teacher}
                  onChange={handleModalChange}
                  className="mt-1 w-full border px-3 py-2 rounded bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Room No.</label>
                <input
                  type="text"
                  name="room"
                  value={formData.room}
                  onChange={handleModalChange}
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
                onClick={saveSlot}
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

export default ClassTimeTable
