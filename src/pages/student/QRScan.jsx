"use client"

import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const QRScan = () => {
  const navigate = useNavigate()
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

  const simulateQRScan = () => {
    // Simulate successful QR scan
    const mockResult = {
      success: true,
      message: "Attendance marked successfully!",
      subject: "Data Structures & Algorithms",
      timestamp: new Date(),
    }
    setScanResult(mockResult)
    stopScanning()
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleImageUpload = () => {
    if (!selectedFile) return

    // Simulate processing
    setTimeout(() => {
      setScanResult({
        success: true,
        message: "QR image processed successfully!",
        subject: "Database Management Systems",
        timestamp: new Date(),
      })
      setSelectedFile(null)
    }, 2000)
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
            <button onClick={() => navigate(-1)} className="mr-4 p-2 text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">QR Code Scanner</h1>
              <p className="text-sm text-gray-500">Scan or upload QR code to mark attendance</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Camera Scanner */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📷 Camera Scanner</h3>

            {!isScanning && !scanResult && (
              <div className="space-y-4">
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <svg
                      className="w-16 h-16 mx-auto text-gray-400 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <p className="text-sm text-gray-600">Camera preview will appear here</p>
                  </div>
                </div>
                <button
                  onClick={startScanning}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Start Camera
                </button>
              </div>
            )}

            {isScanning && (
              <div className="space-y-4">
                <div className="aspect-square bg-black rounded-lg relative overflow-hidden">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute inset-0 border-2 border-white border-dashed rounded-lg m-8"></div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={simulateQRScan}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                  >
                    Simulate Scan
                  </button>
                  <button
                    onClick={stopScanning}
                    className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
                  >
                    Stop
                  </button>
                </div>
                <p className="text-xs text-center text-gray-600">Position the QR code within the frame</p>
              </div>
            )}

            {scanResult && (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-lg border ${scanResult.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {scanResult.success ? (
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    <span className={`font-medium ${scanResult.success ? "text-green-800" : "text-red-800"}`}>
                      {scanResult.success ? "Success!" : "Failed!"}
                    </span>
                  </div>
                  <p className={`text-sm ${scanResult.success ? "text-green-700" : "text-red-700"}`}>
                    {scanResult.message}
                  </p>
                  {scanResult.subject && <p className="text-xs text-gray-600 mt-1">Subject: {scanResult.subject}</p>}
                  <p className="text-xs text-gray-500 mt-2">{scanResult.timestamp.toLocaleString()}</p>
                </div>
                <button
                  onClick={() => {
                    setScanResult(null)
                    startScanning()
                  }}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Scan Another
                </button>
              </div>
            )}
          </div>

          {/* Image Upload */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📁 Upload QR Image</h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="qr-upload" className="block text-sm font-medium text-gray-700 mb-2">
                  Select QR Code Image
                </label>
                <input
                  id="qr-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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

              <button
                onClick={handleImageUpload}
                disabled={!selectedFile}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Upload & Process
              </button>

              <div className="text-xs text-gray-500 space-y-1">
                <p>• Supported formats: JPG, PNG, GIF</p>
                <p>• Maximum file size: 5MB</p>
                <p>• Images are stored for 24 hours only</p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 How to Mark Attendance</h3>
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
        </div>
      </div>
    </div>
  )
}

export default QRScan
