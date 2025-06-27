"use client"

import { useState, useRef } from "react"
import axios from "axios"
import {
  MdCamera,
  MdCameraAlt,
  MdStop,
  MdCloudUpload,
  MdRefresh,
  MdBook,
  MdSchool,
  MdCheckCircle,
  MdWarning,
} from "react-icons/md"

const CameraCapture = () => {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [capturing, setCapturing] = useState(false)
  const [capturedImage, setCapturedImage] = useState(null)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedClass, setSelectedClass] = useState("")

  const startCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setCapturing(true)
      }
    } catch(error) {
      setMessage("Camera access denied or not available")
      setMessageType("error")
    }
  }

  const stopCapture = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setCapturing(false)
  }

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob(
      (blob) => {
        setCapturedImage(blob)
        stopCapture()
      },
      "image/jpeg",
      0.8,
    )
  }

  const uploadImage = async () => {
    if (!capturedImage || !selectedSubject || !selectedClass) {
      setMessage("Please select subject and class, and capture an image")
      setMessageType("error")
      return
    }

    const formData = new FormData()
    formData.append("image", capturedImage, "attendance.jpg")
    formData.append("subjectId", selectedSubject)
    formData.append("classId", selectedClass)

    try {
      const response = await axios.post("http://localhost:5000/api/attendance/image-upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      setMessage(response.data.message)
      setMessageType("success")
      setCapturedImage(null)
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to upload image")
      setMessageType("error")
    }
  }

  const retakeImage = () => {
    setCapturedImage(null)
    setMessage("")
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center justify-center">
          <MdCamera className="mr-2 text-primary-600" />
          Camera Capture
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MdBook className="inline mr-1" />
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="input-field"
            >
              <option value="">Select Subject</option>
              <option value="math">Mathematics</option>
              <option value="physics">Physics</option>
              <option value="chemistry">Chemistry</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MdSchool className="inline mr-1" />
              Class
            </label>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="input-field">
              <option value="">Select Class</option>
              <option value="10a">Class 10A</option>
              <option value="10b">Class 10B</option>
              <option value="11a">Class 11A</option>
            </select>
          </div>
        </div>

        {!capturing && !capturedImage && (
          <button onClick={startCapture} className="btn-primary">
            <MdCamera className="mr-2" />
            Start Camera
          </button>
        )}

        {capturing && (
          <div className="space-y-2">
            <button onClick={captureImage} className="btn-primary mr-2">
              <MdCameraAlt className="mr-2" />
              Capture Image
            </button>
            <button
              onClick={stopCapture}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg"
            >
              <MdStop className="mr-2" />
              Stop Camera
            </button>
          </div>
        )}

        {capturedImage && (
          <div className="space-y-2">
            <button onClick={uploadImage} className="btn-primary mr-2">
              <MdCloudUpload className="mr-2" />
              Upload Image
            </button>
            <button onClick={retakeImage} className="btn-secondary">
              <MdRefresh className="mr-2" />
              Retake
            </button>
          </div>
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
            className={`max-w-full h-64 bg-black rounded-lg ${capturing ? "block" : "hidden"}`}
            playsInline
          />
          <canvas ref={canvasRef} className="hidden" />
          {capturedImage && (
            <img
              src={URL.createObjectURL(capturedImage) || "/placeholder.svg"}
              alt="Captured"
              className="max-w-full h-64 rounded-lg"
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default CameraCapture
