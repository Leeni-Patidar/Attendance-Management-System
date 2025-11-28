import { useState } from "react"
import API from "../../api/axios"

export default function GenerateQR() {
  const [classId, setClassId] = useState("")
  const [subjectId, setSubjectId] = useState("")
  const [minutes, setMinutes] = useState(10)
  const [qr, setQr] = useState("")
  const [token, setToken] = useState("")

  const generate = async () => {
    try {
      const { data } = await API.post("/qr/generate", { classId, subjectId, durationMinutes: Number(minutes) })
      setQr(data.qrImage)
      setToken(data.token)
    } catch (e) {
      alert(e.response?.data?.message || "Generation failed")
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="card">
        <h2 className="text-xl font-semibold">Generate Attendance QR</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-3">
          <input className="input" placeholder="Class ID" value={classId} onChange={e=>setClassId(e.target.value)} />
          <input className="input" placeholder="Subject ID" value={subjectId} onChange={e=>setSubjectId(e.target.value)} />
          <input className="input" type="number" min="1" max="60" value={minutes} onChange={e=>setMinutes(e.target.value)} />
          <button className="btn" onClick={generate}>Generate</button>
        </div>
        {qr && (
          <div className="mt-4">
            <p className="text-sm text-slate-600"><strong>Token:</strong> {token}</p>
            <img src={qr} alt="qr" className="bg-white p-3 rounded-xl border" />
            <p className="text-xs text-slate-500 mt-2">Show this QR on screen for students to scan.</p>
          </div>
        )}
      </div>
    </div>
  )
}
