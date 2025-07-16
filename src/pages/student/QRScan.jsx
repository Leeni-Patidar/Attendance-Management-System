"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Camera, FileText, Scan, Upload, CheckCircle, XCircle } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Card } from "@/components/ui/card"

export default function Index() {
  const [activeMode, setActiveMode] = useState("none") // "none" | "qr" | "image"
  const [isScanningQR, setIsScanningQR] = useState(false)
  const [qrScanResult, setQrScanResult] = useState(null)
  const qrVideoRef = useRef(null)
  const qrCanvasRef = useRef(null)
  const qrStreamRef = useRef(null)

  const [isCapturingImage, setIsCapturingImage] = useState(false)
  const [capturedGeneralImage, setCapturedGeneralImage] = useState(null)
  const [isUploadingGeneralImage, setIsUploadingGeneralImage] = useState(false)
  const [uploadCompleteGeneralImage, setUploadCompleteGeneralImage] = useState(false)
  const generalImageVideoRef = useRef(null)
  const generalImageCanvasRef = useRef(null)
  const generalImageStreamRef = useRef(null)

  const startCameraStream = useCallback(async (videoRef, streamRef, setIsScanning) => {
    try {
      setIsScanning(true)
      const constraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      setIsScanning(false)
      alert("Camera access denied or not available.")
    }
  }, [])

  const stopCameraStream = useCallback((streamRef, setIsScanning) => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
  }, [])

  const captureFrameToBlob = useCallback((videoRef, canvasRef, quality = 0.8) => {
    if (!videoRef.current || !canvasRef.current) return null
    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")
    if (!context) return null
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob)
        },
        "image/jpeg",
        quality,
      )
    })
  }, [])

  const startQRScan = useCallback(() => {
    if (activeMode !== "none") return alert("Please stop current operation first.")
    setActiveMode("qr")
    startCameraStream(qrVideoRef, qrStreamRef, setIsScanningQR)
  }, [activeMode, startCameraStream])

  const stopQRScan = useCallback(() => {
    stopCameraStream(qrStreamRef, setIsScanningQR)
    setActiveMode("none")
  }, [stopCameraStream])

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
      stopQRScan()
    },
    [stopQRScan],
  )

  const captureQRImageAndScan = useCallback(async () => {
    const blob = await captureFrameToBlob(qrVideoRef, qrCanvasRef)
    if (blob) {
      simulateQRScanResult(blob)
    }
  }, [captureFrameToBlob, simulateQRScanResult])

  const resetQRScanner = useCallback(() => {
    setQrScanResult(null)
    stopQRScan()
  }, [stopQRScan])

  const startGeneralImageCapture = useCallback(() => {
    if (activeMode !== "none") return alert("Please stop current operation first.")
    setActiveMode("image")
    startCameraStream(generalImageVideoRef, generalImageStreamRef, setIsCapturingImage)
  }, [activeMode, startCameraStream])

  const stopGeneralImageCapture = useCallback(() => {
    stopCameraStream(generalImageStreamRef, setIsCapturingImage)
    setActiveMode("none")
  }, [stopCameraStream])

  const uploadGeneralImage = async (blob) => {
    setIsUploadingGeneralImage(true)
    setCapturedGeneralImage(URL.createObjectURL(blob))
    try {
      const formData = new FormData()
      formData.append("file", blob, "captured-image.jpeg")
      // This is a placeholder for an actual API upload.
      // In a real application, you would send this formData to your backend.
      // For demonstration, we'll simulate a delay.
      await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate network request
      // const response = await fetch("/api/upload", {
      //   method: "POST",
      //   body: formData,
      // })
      // if (!response.ok) throw new Error("Upload failed")
      setUploadCompleteGeneralImage(true)
      console.log("Uploaded to DB successfully!")
    } catch (error) {
      console.error("Upload error:", error)
      alert("Failed to upload image. Try again.")
    } finally {
      setIsUploadingGeneralImage(false)
    }
  }

  const captureGeneralImage = useCallback(async () => {
    const blob = await captureFrameToBlob(generalImageVideoRef, generalImageCanvasRef)
    if (blob) {
      stopGeneralImageCapture()
      uploadGeneralImage(blob)
    }
  }, [captureFrameToBlob, stopGeneralImageCapture])

  const resetGeneralImageCapture = useCallback(() => {
    setCapturedGeneralImage(null)
    setUploadCompleteGeneralImage(false)
    setIsUploadingGeneralImage(false)
    stopGeneralImageCapture()
  }, [stopGeneralImageCapture])

  useEffect(() => {
    return () => {
      stopCameraStream(qrStreamRef, setIsScanningQR)
      stopCameraStream(generalImageStreamRef, setIsCapturingImage)
    }
  }, [stopCameraStream])

  const handleDownloadImage = useCallback(() => {
    if (capturedGeneralImage) {
      const link = document.createElement("a")
      link.href = capturedGeneralImage
      link.download = `docu-scan-pro-${Date.now()}.jpeg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }, [capturedGeneralImage])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 dark:bg-gray-900">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-50">DocuScan Pro</h1>

      {/* Mode Selection Buttons */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={startQRScan}
          disabled={activeMode !== "none" && activeMode !== "qr"}
          className={`${activeMode === "qr" ? "bg-blue-600 text-white hover:bg-blue-700" : ""} px-4 py-2 rounded-md text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <Scan className="mr-2 h-5 w-5" /> QR Scan
        </button>
        <button
          onClick={startGeneralImageCapture}
          disabled={activeMode !== "none" && activeMode !== "image"}
          className={`${activeMode === "image" ? "bg-blue-600 text-white hover:bg-blue-700" : ""} px-4 py-2 rounded-md text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <Camera className="mr-2 h-5 w-5" /> General Image Capture
        </button>
      </div>

      {/* QR Scan Mode UI */}
      {activeMode === "qr" && (
        <div className="w-full max-w-md p-6 shadow-lg rounded-lg bg-white dark:bg-gray-800">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-50">QR Code Scanner</h2>
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
                <Scan className="mr-2 h-5 w-5" /> Scan QR Code
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
                className={`text-lg font-medium mb-2 ${qrScanResult.success ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
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
                    src={qrScanResult.capturedImage || "/placeholder.svg"}
                    alt="Captured QR code"
                    className="max-w-full h-auto rounded-md mx-auto border border-gray-200 dark:border-gray-700"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Image of scanned QR code</p>
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
            <p className="text-center text-gray-600 dark:text-gray-400">Click "QR Scan" to start scanning.</p>
          )}
        </div>
      )}

      {/* General Image Capture Mode UI */}
      {activeMode === "image" && (
        <div className="w-full max-w-md p-6 shadow-lg rounded-lg bg-white dark:bg-gray-800">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-50">General Image Capture</h2>
          {isCapturingImage && !capturedGeneralImage && (
            <>
              <div className="relative w-full aspect-video bg-black rounded-md overflow-hidden mb-4">
                <video ref={generalImageVideoRef} className="w-full h-full object-cover" playsInline muted />
                <canvas ref={generalImageCanvasRef} className="hidden" />
              </div>
              <button
                onClick={captureGeneralImage}
                className="w-full px-4 py-2 rounded-md text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                <Camera className="mr-2 h-5 w-5" /> Capture Image
              </button>
            </>
          )}

          {capturedGeneralImage && (
            <div className="text-center">
              <img
                src={capturedGeneralImage || "/placeholder.svg"}
                alt="Captured image"
                className="max-w-full h-auto rounded-md mx-auto mb-4 border border-gray-200 dark:border-gray-700"
              />
              <div className="flex gap-2 justify-center mb-4">
                <button
                  onClick={() => uploadGeneralImage(new Blob())}
                  disabled={isUploadingGeneralImage || uploadCompleteGeneralImage}
                  className="px-4 py-2 rounded-md text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploadingGeneralImage ? (
                    "Uploading..."
                  ) : uploadCompleteGeneralImage ? (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5" /> Uploaded!
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-5 w-5" /> Upload Image
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownloadImage}
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  <FileText className="mr-2 h-5 w-5" /> Download Image
                </button>
              </div>
              <button
                onClick={resetGeneralImageCapture}
                className="w-full px-4 py-2 rounded-md text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Capture Another Image
              </button>
            </div>
          )}

          {!isCapturingImage && !capturedGeneralImage && (
            <p className="text-center text-gray-600 dark:text-gray-400">Click "General Image Capture" to start.</p>
          )}
        </div>
      )}
    </div>
  )
}
