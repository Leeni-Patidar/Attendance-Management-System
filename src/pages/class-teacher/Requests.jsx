"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const Requests = () => {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [filter, setFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data for student requests
    setTimeout(() => {
      setRequests([
        {
          id: 1,
          studentName: "John Doe",
          rollNumber: "CS21B004",
          type: "attendance_correction",
          subject: "Database Systems",
          reason: "Medical leave with certificate",
          details:
            "I was absent on 15th March due to fever. I have medical certificate as proof. Please find attached the medical certificate from City Hospital.",
          status: "pending",
          submittedAt: "2024-03-16T10:30:00Z",
          documents: ["medical_certificate.pdf"],
        },
        {
          id: 2,
          studentName: "Jane Smith",
          rollNumber: "CS21B005",
          type: "subject_change",
          subject: "Elective Course Change",
          reason: "Want to change from AI to ML",
          details:
            "I would like to change my elective from Artificial Intelligence to Machine Learning as it aligns better with my career goals and internship requirements.",
          status: "pending",
          submittedAt: "2024-03-15T14:20:00Z",
          documents: [],
        },
        {
          id: 3,
          studentName: "Mike Wilson",
          rollNumber: "CS21B006",
          type: "personal_details",
          subject: "Contact Information Update",
          reason: "Phone number change",
          details: "My phone number has changed from +91 9876543210 to +91 9876543211. Please update in all records.",
          status: "approved",
          submittedAt: "2024-03-10T16:45:00Z",
          reviewedAt: "2024-03-12T09:15:00Z",
          reviewNotes: "Request approved. Contact details updated in system.",
          documents: [],
        },
        {
          id: 4,
          studentName: "Sarah Brown",
          rollNumber: "CS21B007",
          type: "attendance_correction",
          subject: "Software Engineering",
          reason: "Family emergency",
          details:
            "I had to leave urgently due to family emergency on 10th March. I have supporting documents from family.",
          status: "rejected",
          submittedAt: "2024-03-08T11:20:00Z",
          reviewedAt: "2024-03-09T15:30:00Z",
          reviewNotes: "Insufficient documentation provided. Please submit proper emergency proof.",
          documents: [],
        },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const handleRequestAction = (requestId, action, notes = "") => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === requestId
          ? {
              ...req,
              status: action,
              reviewedAt: new Date().toISOString(),
              reviewNotes: notes,
            }
          : req,
      ),
    )
    alert(`Request ${action} successfully!`)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case "attendance_correction":
        return "📅"
      case "subject_change":
        return "📚"
      case "personal_details":
        return "👤"
      default:
        return "📋"
    }
  }

  const filteredRequests = requests.filter((req) => filter === "all" || req.status === filter)

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
          <div className="flex items-center h-16">
            <button onClick={() => navigate(-1)} className="mr-4 p-2 text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Student Requests</h1>
              <p className="text-sm text-gray-500">Review and manage student requests</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Filter Requests</h3>
            <div className="flex gap-2">
              {["all", "pending", "approved", "rejected"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    filter === status ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  {status !== "all" && (
                    <span className="ml-2 bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
                      {requests.filter((r) => r.status === status).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-6">
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500">No requests found for the selected filter.</p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">{getTypeIcon(request.type)}</div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{request.subject}</h4>
                      <p className="text-sm text-gray-600">
                        {request.studentName} • {request.rollNumber}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Submitted:{" "}
                        {new Date(request.submittedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(request.status)}`}
                  >
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Type:</p>
                    <p className="text-sm text-gray-900 capitalize">{request.type.replace("_", " ")}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700">Reason:</p>
                    <p className="text-sm text-gray-900">{request.reason}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700">Details:</p>
                    <p className="text-sm text-gray-900">{request.details}</p>
                  </div>

                  {request.documents.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Documents:</p>
                      <div className="flex gap-2 mt-1">
                        {request.documents.map((doc, index) => (
                          <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            📎 {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {request.reviewNotes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                      <p className="text-sm font-medium text-gray-900">Review Notes:</p>
                      <p className="text-sm text-gray-700 mt-1">{request.reviewNotes}</p>
                      {request.reviewedAt && (
                        <p className="text-xs text-gray-500 mt-2">
                          Reviewed:{" "}
                          {new Date(request.reviewedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {request.status === "pending" && (
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => {
                        const notes = prompt("Enter review notes (optional):")
                        handleRequestAction(request.id, "approved", notes || "Request approved.")
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => {
                        const notes = prompt("Enter reason for rejection:")
                        if (notes) {
                          handleRequestAction(request.id, "rejected", notes)
                        }
                      }}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center gap-2"
                    >
                      ✗ Reject
                    </button>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2">
                      💬 Contact Student
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Requests
