"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Scan, CheckCircle, XCircle } from "lucide-react"

export default function Index() {
  const [isScanningQR, setIsScanningQR] = useState(false)
  const [qrScanResult, setQrScanResult] = useState(null)
  const qrVideoRef = useRef(null)
  const qrCanvasRef = useRef(null)
  const qrStreamRef = useRef(null)

  // Start camera stream
  const startCameraStream = useCallback(async () => {
    try {
      setIsScanningQR(true)
      const constraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      qrStreamRef.current = stream
      if (qrVideoRef.current) {
        qrVideoRef.current.srcObject = stream
        qrVideoRef.current.play()
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      setIsScanningQR(false)
      alert("Camera access denied or not available.")
    }
  }, [])

  // Stop camera stream
  const stopCameraStream = useCallback(() => {
    if (qrStreamRef.current) {
      qrStreamRef.current.getTracks().forEach((track) => track.stop())
      qrStreamRef.current = null
    }
    setIsScanningQR(false)
  }, [])

  // Capture frame to blob
  const captureFrameToBlob = useCallback(() => {
    if (!qrVideoRef.current || !qrCanvasRef.current) return null
    const video = qrVideoRef.current
    const canvas = qrCanvasRef.current
    const context = canvas.getContext("2d")
    if (!context) return null
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.8)
    })
  }, [])

  // Simulate scan result (mock)
  const simulateQRScanResult = useCallback(
    (imageBlob) => {
      const mockSuccess = Math.random() > 0.3
      const imageUrl = URL.createObjectURL(imageBlob)
      if (mockSuccess) {
        setQrScanResult({
          success: true,
          message: "Attendance marked successfully!",
          subject: "Data Structures & Algorithms",
          timestamp: new Date(),
          capturedImage: imageUrl,
        })
      } else {
        setQrScanResult({
          success: false,
          message: "QR code not recognized or attendance failed.",
          timestamp: new Date(),
          capturedImage: imageUrl,
        })
      }
      stopCameraStream()
    },
    [stopCameraStream],
  )

  // Capture and simulate scan
  const captureQRImageAndScan = useCallback(async () => {
    const blob = await captureFrameToBlob()
    if (blob) simulateQRScanResult(blob)
  }, [captureFrameToBlob, simulateQRScanResult])

  // Reset scanner
  const resetQRScanner = useCallback(() => {
    setQrScanResult(null)
    stopCameraStream()
  }, [stopCameraStream])

  // Cleanup
  useEffect(() => {
    return () => stopCameraStream()
  }, [stopCameraStream])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 dark:bg-gray-900">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-50">QR Attendance Scanner</h1>

      {/* QR Scanner Controls */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={isScanningQR ? stopCameraStream : startCameraStream}
          className={`px-4 py-2 rounded-md text-white ${
            isScanningQR ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-700"
          } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
        >
          <Scan className="mr-2 h-5 w-5 inline-block" />
          {isScanningQR ? "Stop Scanning" : "Start QR Scan"}
        </button>
      </div>

      {/* QR Scan View */}
      <div className="w-full max-w-md p-6 shadow-lg rounded-lg bg-white dark:bg-gray-800">
        {isScanningQR && !qrScanResult && (
          <>
            <div className="relative w-full aspect-video bg-black rounded-md overflow-hidden mb-4">
              <video ref={qrVideoRef} className="w-full h-full object-cover" playsInline muted />
              <canvas ref={qrCanvasRef} className="hidden" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3/4 h-3/4 border-4 border-blue-500 animate-pulse" />
              </div>
            </div>
            <button
              onClick={captureQRImageAndScan}
              className="w-full px-4 py-2 rounded-md text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              <Scan className="mr-2 h-5 w-5 inline-block" /> Scan QR Code
            </button>
          </>
        )}

        {qrScanResult && (
          <div className="text-center">
            {qrScanResult.success ? (
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            ) : (
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            )}
            <p
              className={`text-lg font-medium mb-2 ${
                qrScanResult.success ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              }`}
            >
              {qrScanResult.message}
            </p>
            {qrScanResult.subject && (
              <p className="text-gray-700 dark:text-gray-300 mb-1">
                Subject: <span className="font-semibold">{qrScanResult.subject}</span>
              </p>
            )}
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Timestamp: {qrScanResult.timestamp.toLocaleString()}
            </p>
            {qrScanResult.capturedImage && (
              <div className="mb-4">
                <img
                  src={qrScanResult.capturedImage}
                  alt="Captured QR"
                  className="max-w-full h-auto rounded-md mx-auto border border-gray-200 dark:border-gray-700"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Scanned QR Snapshot</p>
              </div>
            )}
            <button
              onClick={resetQRScanner}
              className="w-full px-4 py-2 rounded-md text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Scan Another QR
            </button>
          </div>
        )}

        {!isScanningQR && !qrScanResult && (
          <p className="text-center text-gray-600 dark:text-gray-400">Click “Start QR Scan” to begin scanning.</p>
        )}
      </div>
    </div>
  )
}
