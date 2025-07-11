"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Clock, CheckCircle, XCircle } from "lucide-react"

export default function StudentRequestsPage() {
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
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/student/requests")
      const data = await response.json()

      if (response.ok) {
        setRequests(data.requests)
      }
    } catch (error) {
      console.error("Error fetching requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitRequest = async () => {
    try {
      const response = await fetch("/api/student/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestType: newRequest.type,
          requestData: {
            subject: newRequest.subject,
            reason: newRequest.reason,
            details: newRequest.details,
          },
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert("Request submitted successfully!")
        setShowNewRequest(false)
        setNewRequest({ type: "", subject: "", reason: "", details: "" })
        fetchRequests()
      } else {
        alert(data.error || "Failed to submit request")
      }
    } catch (error) {
      console.error("Submit request error:", error)
      alert("Failed to submit request")
    }
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
        return <Clock className="w-4 h-4" />
      case "approved":
        return <CheckCircle className="w-4 h-4" />
      case "rejected":
        return <XCircle className="w-4 h-4" />
      default:
        return null
    }
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
              <Button variant="ghost" onClick={() => window.history.back()} className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">My Requests</h1>
                <p className="text-sm text-gray-500">Submit and track your requests</p>
              </div>
            </div>

            <Dialog open={showNewRequest} onOpenChange={setShowNewRequest}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Request
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Submit New Request</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="requestType">Request Type</Label>
                    <Select
                      value={newRequest.type}
                      onValueChange={(value) => setNewRequest({ ...newRequest, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select request type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="subject_change">Subject Change</SelectItem>
                        <SelectItem value="personal_details">Personal Details Update</SelectItem>
                        <SelectItem value="attendance_correction">Attendance Correction</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject/Topic</Label>
                    <Input
                      id="subject"
                      value={newRequest.subject}
                      onChange={(e) => setNewRequest({ ...newRequest, subject: e.target.value })}
                      placeholder="Brief subject of your request"
                    />
                  </div>

                  <div>
                    <Label htmlFor="reason">Reason</Label>
                    <Input
                      id="reason"
                      value={newRequest.reason}
                      onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                      placeholder="Main reason for this request"
                    />
                  </div>

                  <div>
                    <Label htmlFor="details">Details</Label>
                    <Textarea
                      id="details"
                      value={newRequest.details}
                      onChange={(e) => setNewRequest({ ...newRequest, details: e.target.value })}
                      placeholder="Provide detailed information about your request"
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleSubmitRequest}
                      className="flex-1"
                      disabled={!newRequest.type || !newRequest.subject || !newRequest.reason}
                    >
                      Submit Request
                    </Button>
                    <Button variant="outline" onClick={() => setShowNewRequest(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Request History */}
        <Card>
          <CardHeader>
            <CardTitle>Request History</CardTitle>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No requests submitted yet</p>
                <Button onClick={() => setShowNewRequest(true)} className="mt-4">
                  Submit Your First Request
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-gray-900">{JSON.parse(request.request_data).subject}</h3>
                          <Badge className={getStatusColor(request.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(request.status)}
                              <span className="capitalize">{request.status}</span>
                            </div>
                          </Badge>
                        </div>

                        <p className="text-sm text-gray-600 mb-2">
                          Type: <span className="font-medium capitalize">{request.request_type.replace("_", " ")}</span>
                        </p>

                        <p className="text-sm text-gray-600 mb-2">Reason: {JSON.parse(request.request_data).reason}</p>

                        <p className="text-sm text-gray-600 mb-3">{JSON.parse(request.request_data).details}</p>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Submitted: {new Date(request.requested_at).toLocaleDateString()}</span>
                          {request.reviewed_at && (
                            <span>Reviewed: {new Date(request.reviewed_at).toLocaleDateString()}</span>
                          )}
                        </div>

                        {request.review_notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                            <p className="text-sm font-medium text-gray-900">Review Notes:</p>
                            <p className="text-sm text-gray-700">{request.review_notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Request Guidelines */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Request Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
