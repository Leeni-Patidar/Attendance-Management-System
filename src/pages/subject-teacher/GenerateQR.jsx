"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const GenerateQR = () => {
  const navigate = useNavigate()
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState("")
  const [topic, setTopic] = useState("")
  const [validityDuration, setValidityDuration] = useState(10)
  const [generatedQR, setGeneratedQR] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeQRs, setActiveQRs] = useState([])

  useEffect(() => {
    // Mock data for classes
    setClasses([
      {
        id: 1,
        className: "CS 3rd Year - Section A",
        subject: "Data Structures & Algorithms",
        subjectCode: "CS301",
        students: 45,
      },
      {
        id: 2,
        className: "CS 3rd Year - Section B",
        subject: "Data Structures & Algorithms",
        subjectCode: "CS301",
        students: 42,
      },
      {
        id: 3,
        className: "CS 2nd Year - Section A",
        subject: "Database Management Systems",
        subjectCode: "CS201",
        students: 48,
      },
    ])

    // Mock active QRs
    setActiveQRs([
      {
        id: 1,
        code: "QR_CS301_ACTIVE",
        class: "CS 3rd Year - Section A",
        validUntil: new Date(Date.now() + 5 * 60 * 1000),
        studentsScanned: 12,
        totalStudents: 45,
      },
    ])
  }, [])

  const handleGenerateQR = async (e) => {
    e.preventDefault()
    if (!selectedClass || !topic) {
      alert("Please select a class and enter a topic")
      return
    }

    setLoading(true)

    // Simulate QR generation
    setTimeout(() => {
      const classData = classes.find((c) => c.id === Number.parseInt(selectedClass))
      const newQR = {
        id: Date.now(),
        code: `QR_${classData.subjectCode}_${Date.now()}`,
        class: classData.className,
        subject: classData.subject,
        topic: topic,
        generatedAt: new Date(),
        validUntil: new Date(Date.now() + validityDuration * 60 * 1000),
        studentsScanned: 0,
        totalStudents: classData.students,
        qrImage: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=QR_${classData.subjectCode}_${Date.now()}`,
      }

      setGeneratedQR(newQR)
      setActiveQRs((prev) => [...prev, newQR])
      setLoading(false)

      // Reset form
      setSelectedClass("")
      setTopic("")
      setValidityDuration(10)
    }, 2000)
  }

  const handleCancelQR = (qrId) => {
    setActiveQRs((prev) => prev.filter((qr) => qr.id !== qrId))
    if (generatedQR && generatedQR.id === qrId) {
      setGeneratedQR(null)
    }
  }

  const getTimeRemaining = (validUntil) => {
    const now = new Date()
    const remaining = Math.max(0, Math.floor((validUntil - now) / (1000 * 60)))
    return remaining
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
                <h1 className="text-xl font-semibold text-gray-900">Generate QR Code</h1>
                <p className="text-sm text-gray-500">Create QR codes for attendance tracking</p>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Generation Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Generate New QR Code</h3>
            <form onSubmit={handleGenerateQR} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose a class...</option>
                  {classes.map((classData) => (
                    <option key={classData.id} value={classData.id}>
                      {classData.className} - {classData.subject} ({classData.students} students)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Topic/Lecture Title</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Binary Search Trees, SQL Joins, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Validity Duration (minutes)</label>
                <select
                  value={validityDuration}
                  onChange={(e) => setValidityDuration(Number.parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={5}>5 minutes</option>
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={20}>20 minutes</option>
                  <option value={30}>30 minutes</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating QR Code...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Generate QR Code
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Generated QR Display */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Generated QR Code</h3>
            {generatedQR ? (
              <div className="text-center">
                <div className="bg-gray-100 p-6 rounded-lg mb-4">
                  <img
                    src={generatedQR.qrImage || "/placeholder.svg?height=200&width=200"}
                    alt="Generated QR Code"
                    className="mx-auto mb-4"
                    width="200"
                    height="200"
                  />
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <strong>Code:</strong> {generatedQR.code}
                    </p>
                    <p>
                      <strong>Class:</strong> {generatedQR.class}
                    </p>
                    <p>
                      <strong>Topic:</strong> {generatedQR.topic}
                    </p>
                    <p>
                      <strong>Valid Until:</strong> {generatedQR.validUntil.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
                    Download QR
                  </button>
                  <button className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700">
                    Share QR
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <p className="text-gray-500">No QR code generated yet</p>
                <p className="text-sm text-gray-400">Fill the form and click generate to create a QR code</p>
              </div>
            )}
          </div>
        </div>

        {/* Active QR Codes */}
        {activeQRs.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Active QR Codes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeQRs.map((qr) => (
                <div key={qr.id} className="border rounded-lg p-4 bg-green-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{qr.code}</h4>
                      <p className="text-sm text-gray-600">{qr.class}</p>
                    </div>
                    <button onClick={() => handleCancelQR(qr.id)} className="text-red-600 hover:text-red-800">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-600">
                      Scanned: {qr.studentsScanned}/{qr.totalStudents}
                    </p>
                    <p className="text-green-600 font-medium">{getTimeRemaining(qr.validUntil)} minutes remaining</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GenerateQR
