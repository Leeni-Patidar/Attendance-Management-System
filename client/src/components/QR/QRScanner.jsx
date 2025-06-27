"use client"

import { useState, useRef, useEffect } from "react"
import jsQR from "jsqr"
import axios from "axios"
import { MdQrCodeScanner, MdPlayArrow, MdStop, MdCheckCircle, MdWarning } from "react-icons/md"

const QRScanner = () => {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [scanning, setScanning] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("")

  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setScanning(true)
        scanQRCode()
      }
    } catch (error) {
      setMessage("Camera access denied or not available")
      setMessageType("error")
    }
  }

  const stopScanning = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setScanning(false)
  }

  const scanQRCode = () => {
    if (!scanning || !videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.height = video.videoHeight
      canvas.width = video.videoWidth
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height)

      if (code) {
        handleQRCodeDetected(code.data)
        return
      }
    }

    if (scanning) {
      requestAnimationFrame(scanQRCode)
    }
  }

  const handleQRCodeDetected = async (qrData) => {
    stopScanning()

    try {
      const response = await axios.post("http://localhost:5000/api/qr/scan", {
        qrData,
      })

      setMessage(response.data.message)
      setMessageType("success")
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to mark attendance")
      setMessageType("error")
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center justify-center">
          <MdQrCodeScanner className="mr-2 text-primary-600" />
          QR Code Scanner
        </h3>

        {!scanning ? (
          <button onClick={startScanning} className="btn-primary">
            <MdPlayArrow className="mr-2" />
            Start Scanning
          </button>
        ) : (
          <button
            onClick={stopScanning}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg"
          >
            <MdStop className="mr-2" />
            Stop Scanning
          </button>
        )}
      </div>

      {message && (
        <div
          className={`p-4 rounded-md flex items-center ${
            messageType === "success"
              ? "bg-green-100 text-green-700 border border-green-200"
              : "bg-red-100 text-red-700 border border-red-200"
          }`}
        >
          {messageType === "success" ? <MdCheckCircle className="mr-2" /> : <MdWarning className="mr-2" />}
          {message}
        </div>
      )}

      <div className="flex justify-center">
        <div className="relative">
          <video
            ref={videoRef}
            className={`max-w-full h-64 bg-black rounded-lg ${scanning ? "block" : "hidden"}`}
            playsInline
          />
          <canvas ref={canvasRef} className="hidden" />
          {scanning && (
            <div className="absolute inset-0 border-2 border-primary-500 rounded-lg pointer-events-none">
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-primary-500"></div>
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-primary-500"></div>
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-primary-500"></div>
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-primary-500"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default QRScanner
