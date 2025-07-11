"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, CheckCircle } from "lucide-react"

export function QRScanner({ onScanSuccess, onScanError }) {
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

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
      onScanError?.("Camera access denied")
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
      text: `ATTENDANCE_${Date.now()}`,
      timestamp: new Date(),
    }
    setScanResult(mockResult)
    onScanSuccess?.(mockResult)
    stopScanning()
  }

  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          QR Code Scanner
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
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Scan Successful!</span>
              </div>
              <p className="text-sm text-green-700">Attendance marked at {scanResult.timestamp.toLocaleTimeString()}</p>
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
  )
}
