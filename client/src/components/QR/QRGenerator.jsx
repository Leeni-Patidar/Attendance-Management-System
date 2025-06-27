"use client"

import { useState } from "react"
import axios from "axios"
import { MdQrCode, MdGeneratingTokens, MdAccessTime, MdWarning } from "react-icons/md"

const QRGenerator = ({ subjects }) => {
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedClass, setSelectedClass] = useState("")
  const [qrCode, setQrCode] = useState("")
  const [expiresAt, setExpiresAt] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const generateQR = async () => {
    if (!selectedSubject || !selectedClass) {
      setMessage("Please select both subject and class")
      return
    }

    setLoading(true)
    try {
      const response = await axios.post("http://localhost:5000/api/qr/generate", {
        subjectId: selectedSubject,
        classId: selectedClass,
      })

      setQrCode(response.data.qrCode)
      setExpiresAt(new Date(response.data.expiresAt))
      setMessage("QR Code generated successfully!")
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to generate QR code")
    } finally {
      setLoading(false)
    }
  }

  const formatTimeRemaining = () => {
    if (!expiresAt) return ""

    const now = new Date()
    const timeLeft = expiresAt - now

    if (timeLeft <= 0) {
      return "Expired"
    }

    const minutes = Math.floor(timeLeft / 60000)
    const seconds = Math.floor((timeLeft % 60000) / 1000)

    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 flex items-center">
        <MdQrCode className="mr-2 text-primary-600" />
        Generate QR Code for Attendance
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="input-field">
            <option value="">Select Subject</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.name} ({subject.code})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="input-field">
            <option value="">Select Class</option>
            {/* Add class options dynamically based on selected subject */}
          </select>
        </div>
      </div>

      <div className="text-center">
        <button onClick={generateQR} disabled={loading} className="btn-primary">
          <MdGeneratingTokens className="mr-2" />
          {loading ? "Generating..." : "Generate QR Code"}
        </button>
      </div>

      {message && <div className="p-4 rounded-md bg-blue-100 text-blue-700 border border-blue-200">{message}</div>}

      {qrCode && (
        <div className="text-center space-y-4">
          <div className="inline-block p-4 bg-white rounded-lg shadow-md">
            <img src={qrCode || "/placeholder.svg"} alt="QR Code" className="w-64 h-64" />
          </div>

          {expiresAt && (
            <div className="text-sm text-gray-600 flex items-center justify-center">
              <MdAccessTime className="mr-2" />
              <p>
                Expires in: <span className="font-mono font-bold">{formatTimeRemaining()}</span>
              </p>
            </div>
          )}

          <div className="text-xs text-gray-500 max-w-md mx-auto flex items-center justify-center">
            <MdWarning className="mr-2" />
            <p>This QR code cannot be saved or reused. It will expire automatically after 10 minutes.</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default QRGenerator
