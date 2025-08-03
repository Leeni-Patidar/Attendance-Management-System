"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"

const GenerateQR = () => {
  const navigate = useNavigate()
  const { apiService } = useAuth()
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState("")
  const [topic, setTopic] = useState("")
  const [validityDuration, setValidityDuration] = useState(5)
  const [loading, setLoading] = useState(false)
  const [generatedQR, setGeneratedQR] = useState(null)
  const [activeQRs, setActiveQRs] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    // Load faculty sessions and subjects
    loadFacultyData()
  }, [])

  const loadFacultyData = async () => {
    try {
      // Get recent sessions to understand subjects and classes taught
      const result = await apiService.getFacultySessions({ limit: 50 })
      
      if (result.success) {
        // Extract unique class-subject combinations
        const uniqueClasses = []
        const seenCombinations = new Set()
        
        result.data.sessions.forEach(session => {
          const combination = `${session.className}-${session.subject}`
          if (!seenCombinations.has(combination)) {
            seenCombinations.add(combination)
            uniqueClasses.push({
              id: uniqueClasses.length + 1,
              className: session.className,
              subject: session.subject,
              subjectCode: session.subject.split(' ').map(word => word.charAt(0)).join('').toUpperCase(),
              students: 45, // Default for now - could be calculated from attendance data
            })
          }
        })

        // Add default classes if none exist
        if (uniqueClasses.length === 0) {
          uniqueClasses.push(
            {
              id: 1,
              className: "CS 3rd Year - Section A",
              subject: "Data Structures & Algorithms",
              subjectCode: "CS301",
              students: 45,
            },
            {
              id: 2,
              className: "CS 2nd Year - Section A", 
              subject: "Database Management Systems",
              subjectCode: "CS201",
              students: 48,
            }
          )
        }

        setClasses(uniqueClasses)

        // Get active sessions for current faculty
        const activeSessions = result.data.sessions.filter(session => 
          session.status === 'active' && new Date(session.endTime) > new Date()
        )

        setActiveQRs(activeSessions.map(session => ({
          id: session._id,
          code: session.qrToken,
          class: session.className,
          subject: session.subject,
          topic: session.topic,
          validUntil: new Date(session.endTime),
          studentsScanned: session.attendanceStats?.present || 0,
          totalStudents: session.attendanceStats?.total || 0,
          qrImage: session.qrCodeImage,
        })))
      }
    } catch (error) {
      console.error("Error loading faculty data:", error)
      // Use default data on error
      setClasses([
        {
          id: 1,
          className: "CS 3rd Year - Section A",
          subject: "Data Structures & Algorithms", 
          subjectCode: "CS301",
          students: 45,
        }
      ])
    }
  }

  const handleGenerateQR = async (e) => {
    e.preventDefault()
    if (!selectedClass || !topic) {
      alert("Please select a class and enter a topic")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const classData = classes.find((c) => c.id === Number.parseInt(selectedClass))
      
      // Call backend API to generate QR
      const result = await apiService.generateQR({
        subject: classData.subject,
        className: classData.className,
        topic: topic,
        validityDuration: validityDuration
      })

      if (result.success) {
        const qrData = {
          id: result.data.session._id,
          code: result.data.qrCode.token,
          class: result.data.session.className,
          subject: result.data.session.subject,
          topic: result.data.session.topic,
          generatedAt: new Date(result.data.session.startTime),
          validUntil: new Date(result.data.session.endTime),
          studentsScanned: 0,
          totalStudents: classData.students,
          qrImage: result.data.qrCode.image,
          scanUrl: result.data.scanUrl,
        }

        setLoading(false)
        navigate("/subject-teacher/GenerateQRDisplay", { state: { qrData } })

        // Reset form
        setSelectedClass("")
        setTopic("")
        setValidityDuration(5)

        // Refresh active QRs
        loadFacultyData()
      } else {
        setError(result.error || "Failed to generate QR code")
        setLoading(false)
      }
    } catch (error) {
      console.error("QR generation error:", error)
      setError("An error occurred while generating QR code. Please try again.")
      setLoading(false)
    }
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
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

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-2xl">
          <div className="grid grid-cols-1 gap-8">
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default GenerateQR
