"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { QrCode, Clock, Download, Share2, RefreshCw, Settings } from "lucide-react"
import QRCode from "qrcode"
import { saveAs } from "file-saver"

export function QRGenerator({ classData, onQRGenerated }) {
  const [qrCode, setQrCode] = useState(null)
  const [qrTimer, setQrTimer] = useState(0)
  const [qrSettings, setQrSettings] = useState({
    duration: 10, // minutes
    subject: classData?.subject || "",
    classId: classData?.id || "",
    date: new Date().toISOString().split("T")[0],
    sessionType: "lecture",
  })
  const [showSettings, setShowSettings] = useState(false)
  const canvasRef = useRef(null)

  // Generate QR code data
  const generateQRData = () => {
    const qrData = {
      type: "ATTENDANCE",
      classId: qrSettings.classId,
      subject: qrSettings.subject,
      teacherId: "EMP002", // This would come from auth context
      timestamp: Date.now(),
      validUntil: Date.now() + qrSettings.duration * 60 * 1000,
      sessionType: qrSettings.sessionType,
      date: qrSettings.date,
      code: `ATT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }
    return JSON.stringify(qrData)
  }

  // Simple QR code generation using canvas (basic implementation)
  const generateQRImage = async (data) => {
    try {
      const qrDataURL = await QRCode.toDataURL(data, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "M",
      })
      return qrDataURL
    } catch (error) {
      console.error("Error generating QR code:", error)
      return null
    }
  }

  const generateQRCode = async () => {
    const qrData = generateQRData()
    const qrImageData = await generateQRImage(qrData)

    if (!qrImageData) {
      alert("Failed to generate QR code")
      return
    }

    const newQRCode = {
      id: Date.now(),
      data: qrData,
      image: qrImageData,
      code: `QR_${Date.now()}`,
      timestamp: new Date(),
      validUntil: new Date(Date.now() + qrSettings.duration * 60 * 1000),
      subject: qrSettings.subject,
      classId: qrSettings.classId,
      sessionType: qrSettings.sessionType,
    }

    setQrCode(newQRCode)
    setQrTimer(qrSettings.duration * 60)
    onQRGenerated?.(newQRCode)
  }

  // Timer countdown
  useEffect(() => {
    let interval = null
    if (qrTimer > 0) {
      interval = setInterval(() => {
        setQrTimer((prev) => prev - 1)
      }, 1000)
    } else if (qrTimer === 0 && qrCode) {
      setQrCode(null)
    }
    return () => clearInterval(interval)
  }, [qrTimer, qrCode])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const downloadQRCode = () => {
    if (!qrCode) return

    // Convert data URL to blob and download
    fetch(qrCode.image)
      .then((res) => res.blob())
      .then((blob) => {
        saveAs(blob, `attendance-qr-${qrCode.code}.png`)
      })
      .catch((error) => {
        console.error("Download failed:", error)
        // Fallback method
        const link = document.createElement("a")
        link.download = `attendance-qr-${qrCode.code}.png`
        link.href = qrCode.image
        link.click()
      })
  }

  const shareQRCode = async () => {
    if (!qrCode) return

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Attendance QR Code",
          text: `QR Code for ${qrCode.subject} - ${qrCode.sessionType}`,
          url: window.location.href,
        })
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(qrCode.data)
        alert("QR code data copied to clipboard!")
      }
    } catch (error) {
      console.error("Error sharing:", error)
    }
  }

  const getTimerColor = () => {
    const percentage = (qrTimer / (qrSettings.duration * 60)) * 100
    if (percentage > 50) return "text-green-600"
    if (percentage > 20) return "text-yellow-600"
    return "text-red-600"
  }

  const getProgressColor = () => {
    const percentage = (qrTimer / (qrSettings.duration * 60)) * 100
    if (percentage > 50) return "bg-green-500"
    if (percentage > 20) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            QR Code Generator
          </CardTitle>
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>QR Code Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="duration">Valid Duration (minutes)</Label>
                  <Select
                    value={qrSettings.duration.toString()}
                    onValueChange={(value) => setQrSettings({ ...qrSettings, duration: Number.parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sessionType">Session Type</Label>
                  <Select
                    value={qrSettings.sessionType}
                    onValueChange={(value) => setQrSettings({ ...qrSettings, sessionType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lecture">Lecture</SelectItem>
                      <SelectItem value="lab">Lab Session</SelectItem>
                      <SelectItem value="tutorial">Tutorial</SelectItem>
                      <SelectItem value="exam">Exam</SelectItem>
                      <SelectItem value="seminar">Seminar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={qrSettings.date}
                    onChange={(e) => setQrSettings({ ...qrSettings, date: e.target.value })}
                  />
                </div>
                <Button onClick={() => setShowSettings(false)} className="w-full">
                  Save Settings
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!qrCode ? (
          <div className="space-y-4">
            <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
              <QrCode className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">Generate QR code for attendance</p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>Subject: {qrSettings.subject}</p>
                <p>Duration: {qrSettings.duration} minutes</p>
                <p>Session: {qrSettings.sessionType}</p>
              </div>
            </div>
            <Button onClick={generateQRCode} className="w-full" size="lg">
              <QrCode className="w-4 h-4 mr-2" />
              Generate QR Code
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* QR Code Display */}
            <div className="text-center">
              <div className="inline-block p-4 bg-white rounded-lg border-2 border-gray-200 shadow-sm">
                <img src={qrCode.image || "/placeholder.svg"} alt="Attendance QR Code" className="w-48 h-48 mx-auto" />
              </div>
            </div>

            {/* QR Code Info */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Code ID:</span>
                <Badge variant="secondary">{qrCode.code}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Subject:</span>
                <span className="text-sm font-medium">{qrCode.subject}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Session:</span>
                <span className="text-sm font-medium capitalize">{qrCode.sessionType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Generated:</span>
                <span className="text-sm font-medium">{qrCode.timestamp.toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Valid Until:</span>
                <span className="text-sm font-medium">{qrCode.validUntil.toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Time Left:</span>
                <span className={`text-sm font-bold ${getTimerColor()}`}>
                  <Clock className="w-4 h-4 inline mr-1" />
                  {formatTime(qrTimer)}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Time Remaining</span>
                <span>{Math.round((qrTimer / (qrSettings.duration * 60)) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-1000 ${getProgressColor()}`}
                  style={{ width: `${(qrTimer / (qrSettings.duration * 60)) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={downloadQRCode} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button onClick={shareQRCode} variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>

            <Button onClick={generateQRCode} variant="outline" className="w-full bg-transparent">
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate New QR
            </Button>
          </div>
        )}

        {/* Hidden canvas for QR generation */}
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </CardContent>
    </Card>
  )
}
