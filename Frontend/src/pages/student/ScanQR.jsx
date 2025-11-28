import { useState } from "react"
import API from "../../api/axios"

export default function ScanQR() {
  const [token, setToken] = useState("")
  const [msg, setMsg] = useState("")

  const submit = async () => {
    setMsg("")
    try {
      const { data } = await API.post("/qr/scan", { token })
      setMsg(data.message || "Attendance marked")
    } catch (e) {
      setMsg(e.response?.data?.message || "Scan failed")
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="card">
        <h2 className="text-xl font-semibold">Scan QR</h2>
        <p className="text-slate-600 mb-3">Paste the token read from the QR code.</p>
        <div className="flex gap-2">
          <input className="input" placeholder="QR token" value={token} onChange={e=>setToken(e.target.value)} />
          <button className="btn" onClick={submit}>Submit</button>
        </div>
        {msg && <p className="mt-3">{msg}</p>}
      </div>
    </div>
  )
}
