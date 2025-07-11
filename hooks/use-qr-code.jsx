"use client"

import { useState, useCallback } from "react"

export function useQRCode() {
  const [activeQRCodes, setActiveQRCodes] = useState([])

  const generateQRCode = useCallback((classData, settings = {}) => {
    const defaultSettings = {
      duration: 10, // minutes
      sessionType: "lecture",
      ...settings,
    }

    const qrData = {
      type: "ATTENDANCE",
      classId: classData.id,
      subject: classData.subject,
      subjectCode: classData.subjectCode,
      teacherId: "EMP002", // This would come from auth context
      timestamp: Date.now(),
      validUntil: Date.now() + defaultSettings.duration * 60 * 1000,
      sessionType: defaultSettings.sessionType,
      date: new Date().toISOString().split("T")[0],
      code: `ATT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }

    return {
      id: Date.now(),
      data: JSON.stringify(qrData),
      ...qrData,
      settings: defaultSettings,
    }
  }, [])

  const addQRCode = useCallback((qrCode) => {
    setActiveQRCodes((prev) => [...prev, qrCode])
  }, [])

  const removeQRCode = useCallback((qrCodeId) => {
    setActiveQRCodes((prev) => prev.filter((qr) => qr.id !== qrCodeId))
  }, [])

  const getActiveQRCodes = useCallback(() => {
    const now = Date.now()
    return activeQRCodes.filter((qr) => qr.validUntil > now)
  }, [activeQRCodes])

  return {
    activeQRCodes,
    generateQRCode,
    addQRCode,
    removeQRCode,
    getActiveQRCodes,
  }
}
