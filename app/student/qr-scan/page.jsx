"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Camera, CheckCircle, XCircle, Upload } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function QRScanPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const videoRef = useRef(null)

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsScanning(true)
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      alert("Camera access denied")
    }
  }

  const stopScanning = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks()
      tracks.forEach((track) => track.stop())
    }
    setIsScanning(false)
  }

  const simulateQRScan = async () => {
    // Simulate QR scan with mock data
    const mockQRData = JSON.stringify({
      type: "ATTENDANCE",
      classSubjectId: 1,
      teacherId: 2,
      timestamp: Date.now(),
      validUntil: Date.now() + 10 * 60 * 1000,
      sessionType: "lecture",
      code: `ATT_${Date.now()}_mock`,
    })

    try {
      const response = await fetch("/api/student/qr-scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ qrData: mockQRData }),
      })

      const data = await response.json()

      if (data.success) {
        setScanResult({
          success: true,
          message: data.message,
          timestamp: new Date(),
        })
      } else {
        setScanResult({
          success: false,
          message: data.error,
          timestamp: new Date(),
        })
      }
    } catch (error) {
      setScanResult({
        success: false,
        message: "Network error occurred",
        timestamp: new Date(),
      })
    }

    stopScanning()
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleImageUpload = async () => {
    if (!selectedFile) return

    const formData = new FormData()
    formData.append("image", selectedFile)

    try {
      const response = await fetch("/api/student/qr-upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setScanResult({
          success: true,
          message: "QR image uploaded successfully! Processing...",
          timestamp: new Date(),
        })
      } else {
        setScanResult({
          success: false,
          message: data.error || "Upload failed",
          timestamp: new Date(),
        })
      }

      setSelectedFile(null)
    } catch (error) {
      setScanResult({
        success: false,
        message: "Upload failed",
        timestamp: new Date(),
      })
    }
  }

  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" onClick={() => window.history.back()} className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">QR Code Scanner</h1>
              <p className="text-sm text-gray-500">Scan or upload QR code to mark attendance</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* QR Scanner */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Camera Scanner
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isScanning && !scanResult && (
                <div className="space-y-4">
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <p className="text-sm text-gray-600">Camera preview will appear here</p>
                    </div>
                  </div>
                  <Button onClick={startScanning} className="w-full">
                    Start Camera
                  </Button>
                </div>
              )}

              {isScanning && (
                <div className="space-y-4">
                  <div className="aspect-square bg-black rounded-lg relative overflow-hidden">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <div className="absolute inset-0 border-2 border-white border-dashed rounded-lg m-8"></div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={simulateQRScan} className="flex-1">
                      Simulate Scan
                    </Button>
                    <Button onClick={stopScanning} variant="outline" className="flex-1 bg-transparent">
                      Stop
                    </Button>
                  </div>
                  <p className="text-xs text-center text-gray-600">Position the QR code within the frame</p>
                </div>
              )}

              {scanResult && (
                <div className="space-y-4">
                  <div
                    className={`p-4 rounded-lg border ${
                      scanResult.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {scanResult.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className={`font-medium ${scanResult.success ? "text-green-800" : "text-red-800"}`}>
                        {scanResult.success ? "Success!" : "Failed!"}
                      </span>
                    </div>
                    <p className={`text-sm ${scanResult.success ? "text-green-700" : "text-red-700"}`}>
                      {scanResult.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">{scanResult.timestamp.toLocaleString()}</p>
                  </div>
                  <Button
                    onClick={() => {
                      setScanResult(null)
                      startScanning()
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Scan Another
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload QR Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="qr-upload">Select QR Code Image</Label>
                <Input id="qr-upload" type="file" accept="image/*" onChange={handleFileUpload} className="mt-2" />
              </div>

              {selectedFile && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800 font-medium">File selected:</p>
                    <p className="text-sm text-blue-700">{selectedFile.name}</p>
                    <p className="text-xs text-blue-600 mt-1">Size: {(selectedFile.size / 1024).toFixed(1)} KB</p>
                  </div>

                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    <img
                      src={URL.createObjectURL(selectedFile) || "/placeholder.svg"}
                      alt="Selected QR"
                      className="max-w-full max-h-full object-contain rounded"
                    />
                  </div>
                </div>
              )}

              <Button onClick={handleImageUpload} className="w-full" disabled={!selectedFile}>
                Upload & Process
              </Button>

              <div className="text-xs text-gray-500 space-y-1">
                <p>• Supported formats: JPG, PNG, GIF</p>
                <p>• Maximum file size: 5MB</p>
                <p>• Images are stored for 24 hours only</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How to Mark Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Using Camera Scanner:</h4>
                <ol className="text-sm text-gray-600 space-y-1">
                  <li>1. Click "Start Camera" to activate scanner</li>
                  <li>2. Point camera at the QR code displayed by teacher</li>
                  <li>3. Ensure QR code is within the frame</li>
                  <li>4. Wait for automatic detection and processing</li>
                </ol>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Using Image Upload:</h4>
                <ol className="text-sm text-gray-600 space-y-1">
                  <li>1. Take a clear photo of the QR code</li>
                  <li>2. Click "Select QR Code Image" to choose file</li>
                  <li>3. Preview the selected image</li>
                  <li>4. Click "Upload & Process" to mark attendance</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
