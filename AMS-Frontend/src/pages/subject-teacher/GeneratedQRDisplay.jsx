"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"

export default function GeneratedQRDisplay() {
  const navigate = useNavigate()
  const location = useLocation()
  const qrData = location.state?.qrData

  const [timeRemaining, setTimeRemaining] = useState(0)

  useEffect(() => {
    if (!qrData) {
      // Redirect if no QR data is available (e.g., direct access)
      navigate("/subject-teacher/generate-qr")
      return
    }

    const calculateTimeRemaining = () => {
      const now = new Date()
      const validUntil = new Date(qrData.validUntil)
      const remaining = Math.max(0, Math.floor((validUntil.getTime() - now.getTime()) / 1000))
      setTimeRemaining(remaining)
    }

    calculateTimeRemaining() // Initial calculation
    const interval = setInterval(calculateTimeRemaining, 1000) // Update every second

    return () => clearInterval(interval) // Cleanup interval on component unmount
  }, [qrData, navigate])

  if (!qrData) {
    return null // Or a loading spinner, but redirect handles it
  }

  const generatedAtDate = new Date(qrData.generatedAt)
  const validUntilDate = new Date(qrData.validUntil)

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button onClick={() => navigate(-1)} className="mr-4 p-2 text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                <span className="sr-only">Go back</span>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Generated QR Code</h1>
                <p className="text-sm text-gray-500">Details of the recently generated QR code</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/subject-teacher/qr-history")}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              View QR History
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md">
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold">QR Code for Attendance</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="text-center">
              <img
                src={qrData.qrImage || "/placeholder.svg?height=200&width=200"}
                alt="Generated QR Code"
                className="mx-auto mb-4 rounded-lg border p-2"
                width="200"
                height="200"
              />
              <p className="text-lg font-semibold text-gray-900">{qrData.code}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="space-y-1">
                <p>
                  <span className="font-medium">Subject:</span> {qrData.subject}
                </p>
                <p>
                  <span className="font-medium">Class:</span> {qrData.class}
                </p>
                <p>
                  <span className="font-medium">Topic:</span> {qrData.topic}
                </p>
              </div>
              <div className="space-y-1">
                <p>
                  <span className="font-medium">Timestamp:</span> {generatedAtDate.toLocaleTimeString()}
                </p>
                <p>
                  <span className="font-medium">Date:</span> {generatedAtDate.toLocaleDateString()}
                </p>
                <p>
                  <span className="font-medium">Day:</span>{" "}
                  {generatedAtDate.toLocaleDateString("en-US", { weekday: "long" })}
                </p>
              </div>
            </div>

            <div className="text-center mt-6">
              <p className="text-xl font-bold text-green-600">Remaining Time: {formatTime(timeRemaining)}</p>
              <p className="text-sm text-gray-500">
                Valid until: {validUntilDate.toLocaleTimeString()} on {validUntilDate.toLocaleDateString()}
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
