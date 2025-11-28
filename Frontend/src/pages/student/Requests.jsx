"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const Requests = () => {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [showNewRequest, setShowNewRequest] = useState(false)
  const [newRequest, setNewRequest] = useState({
    type: "",
    subject: "",
    reason: "",
    details: "",
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data for requests
    setTimeout(() => {
      setRequests([
        {
          id: 1,
          type: "attendance_correction",
          subject: "Database Systems Attendance",
          reason: "Medical leave with certificate",
          details: "I was absent on 15th March due to fever. I have medical certificate as proof.",
          status: "pending",
          submittedAt: "2024-03-16T10:30:00Z",
          reviewedAt: null,
          reviewNotes: null,
        },
        {
          id: 2,
          type: "subject_change",
          subject: "Elective Subject Change",
          reason: "Want to change from AI to ML",
          details:
            "I would like to change my elective from Artificial Intelligence to Machine Learning as it aligns better with my career goals.",
          status: "approved",
          submittedAt: "2024-03-10T14:20:00Z",
          reviewedAt: "2024-03-12T09:15:00Z",
          reviewNotes: "Request approved. Please contact the academic office for enrollment.",
        },
        {
          id: 3,
          type: "personal_details",
          subject: "Phone Number Update",
          reason: "Changed phone number",
          details: "My phone number has changed from +91 9876543210 to +91 9876543211. Please update in records.",
          status: "rejected",
          submittedAt: "2024-03-05T16:45:00Z",
          reviewedAt: "2024-03-07T11:30:00Z",
          reviewNotes: "Please provide proper documentation for phone number change.",
        },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const handleSubmitRequest = () => {
    const request = {
      id: Date.now(),
      type: newRequest.type,
      subject: newRequest.subject,
      reason: newRequest.reason,
      details: newRequest.details,
      status: "pending",
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewNotes: null,
    }

    setRequests([request, ...requests])
    setShowNewRequest(false)
    setNewRequest({ type: "", subject: "", reason: "", details: "" })
    alert("Request submitted successfully!")
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return "⏳"
      case "approved":
        return "✅"
      case "rejected":
        return "❌"
      default:
        return "📋"
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
                <h1 className="text-xl font-semibold text-gray-900">My Requests</h1>
                <p className="text-sm text-gray-500">Submit and track your requests</p>
              </div>
            </div>

            <button
              onClick={() => setShowNewRequest(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              New Request
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* New Request Modal */}
        {showNewRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit New Request</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Request Type</label>
                  <select
                    value={newRequest.type}
                    onChange={(e) => setNewRequest({ ...newRequest, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select request type</option>
                    <option value="subject_change">Subject Change</option>
                    <option value="personal_details">Personal Details Update</option>
                    <option value="attendance_correction">Attendance Correction</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject/Topic</label>
                  <input
                    type="text"
                    value={newRequest.subject}
                    onChange={(e) => setNewRequest({ ...newRequest, subject: e.target.value })}
                    placeholder="Brief subject of your request"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <input
                    type="text"
                    value={newRequest.reason}
                    onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                    placeholder="Main reason for this request"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                  <textarea
                    value={newRequest.details}
                    onChange={(e) => setNewRequest({ ...newRequest, details: e.target.value })}
                    placeholder="Provide detailed information about your request"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSubmitRequest}
                    disabled={!newRequest.type || !newRequest.subject || !newRequest.reason}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Request
                  </button>
                  <button
                    onClick={() => setShowNewRequest(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Request History */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Request History</h3>
          </div>
          <div className="p-6">
            {requests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No requests submitted yet</p>
                <button
                  onClick={() => setShowNewRequest(true)}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Submit Your First Request
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-gray-900">{request.subject}</h4>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}
                          >
                            {getStatusIcon(request.status)}{" "}
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-2">
                          Type: <span className="font-medium capitalize">{request.type.replace("_", " ")}</span>
                        </p>

                        <p className="text-sm text-gray-600 mb-2">Reason: {request.reason}</p>

                        <p className="text-sm text-gray-600 mb-3">{request.details}</p>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Submitted: {formatDate(request.submittedAt)}</span>
                          {request.reviewedAt && <span>Reviewed: {formatDate(request.reviewedAt)}</span>}
                        </div>

                        {request.reviewNotes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                            <p className="text-sm font-medium text-gray-900">Review Notes:</p>
                            <p className="text-sm text-gray-700">{request.reviewNotes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Request Guidelines */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Request Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Subject Change</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Valid academic reasons required</li>
                <li>• Subject availability dependent</li>
                <li>• May affect graduation timeline</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Personal Details</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Supporting documents may be required</li>
                <li>• Changes reflect in official records</li>
                <li>• Processing time: 3-5 working days</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Attendance Correction</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Valid proof of attendance required</li>
                <li>• Medical certificates for sick leave</li>
                <li>• Submit within 7 days of occurrence</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Requests
