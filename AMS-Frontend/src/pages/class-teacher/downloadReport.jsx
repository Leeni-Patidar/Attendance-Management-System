"use client"

import { useState } from "react"

const DownloadReport = ({ onBack, students = [], subjects = [] }) => {
  const [reportConfig, setReportConfig] = useState({
    type: "attendance",
    format: "pdf",
    subject: "all",
    dateRange: "month",
    includeGraphs: true,
    includeStudentPhotos: false,
    customDateFrom: "",
    customDateTo: "",
  })

  const [loading, setLoading] = useState(false)
  const [previewData, setPreviewData] = useState(null)

  const reportTypes = [
    { value: "attendance", label: "Attendance Report", description: "Detailed attendance records for students" },
    {
      value: "student-details",
      label: "Student Details Report",
      description: "Complete student information and contact details",
    },
    { value: "parent-contact", label: "Parent Contact Report", description: "Parent and guardian contact information" },
    { value: "low-attendance", label: "Low Attendance Alert", description: "Students with attendance below 75%" },
  ]

  const dateRanges = [
    { value: "week", label: "Last Week" },
    { value: "month", label: "Last Month" },
    { value: "semester", label: "Current Semester" },
    { value: "year", label: "Academic Year" },
    { value: "custom", label: "Custom Date Range" },
  ]

  const formats = [
    { value: "pdf", label: "PDF", icon: "📄" },
    { value: "excel", label: "Excel", icon: "📊" },
    { value: "csv", label: "CSV", icon: "📋" },
  ]

  const handleConfigChange = (field, value) => {
    setReportConfig((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const generatePreview = () => {
    // Mock preview data generation
    const mockPreview = {
      totalStudents: students.length || 45,
      dateRange:
        reportConfig.dateRange === "custom"
          ? `${reportConfig.customDateFrom} to ${reportConfig.customDateTo}`
          : reportConfig.dateRange,
      subjects: reportConfig.subject === "all" ? subjects.length || 8 : 1,
      estimatedPages: Math.ceil((students.length || 45) / 10),
      fileSize: `${Math.ceil((students.length || 45) * 0.2)} MB`,
    }
    setPreviewData(mockPreview)
  }

  const handleDownload = async () => {
    setLoading(true)

    // Simulate report generation
    setTimeout(() => {
      console.log("Generating report with config:", reportConfig)

      // In a real app, this would trigger the actual download
      const fileName = `${reportConfig.type}-report-${new Date().toISOString().split("T")[0]}.${reportConfig.format}`
      console.log("Downloading:", fileName)

      setLoading(false)
      alert(`Report "${fileName}" has been generated and downloaded successfully!`)

      if (onBack) {
        onBack()
      }
    }, 2000)
  }

  // Generate preview when config changes
  useState(() => {
    generatePreview()
  }, [reportConfig, students, subjects])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Download Reports</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center">
          {/* Configuration Panel */}
          <div className="w-full max-w-2xl">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Report Configuration</h2>

              <div className="space-y-6">
                {/* Report Type */}
                <div>
                  {/* <label className="block text-sm font-medium text-gray-700 mb-3">Report Type</label> */}
                  <div className="space-y-3">
                    {reportTypes.map((type) => (
                      <label key={type.value} className="flex items-start">
                        <input
                          type="radio"
                          value={type.value}
                          checked={reportConfig.type === type.value}
                          onChange={(e) => handleConfigChange("type", e.target.value)}
                          className="mt-1 mr-3"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{type.label}</div>
                          <div className="text-sm text-gray-600">{type.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Subject Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <select
                    value={reportConfig.subject}
                    onChange={(e) => handleConfigChange("subject", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Subjects</option>
                    {subjects.map((subject) => (
                      <option key={subject.code} value={subject.code}>
                        {subject.code} - {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <select
                    value={reportConfig.dateRange}
                    onChange={(e) => handleConfigChange("dateRange", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {dateRanges.map((range) => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </select>

                  {reportConfig.dateRange === "custom" && (
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">From Date</label>
                        <input
                          type="date"
                          value={reportConfig.customDateFrom}
                          onChange={(e) => handleConfigChange("customDateFrom", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">To Date</label>
                        <input
                          type="date"
                          value={reportConfig.customDateTo}
                          onChange={(e) => handleConfigChange("customDateTo", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Format Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Export Format</label>
                  <div className="grid grid-cols-3 gap-3">
                    {formats.map((format) => (
                      <label
                        key={format.value}
                        className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                          reportConfig.format === format.value
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          value={format.value}
                          checked={reportConfig.format === format.value}
                          onChange={(e) => handleConfigChange("format", e.target.value)}
                          className="sr-only"
                        />
                        <div className="text-center">
                          <div className="text-2xl mb-1">{format.icon}</div>
                          <div className="text-sm font-medium">{format.label}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                    onClick={handleDownload}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Download Report
                      </>
                    )}
                  </button>

                  <button
                    onClick={onBack}
                    className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    // </div>
  )
}

export default DownloadReport
