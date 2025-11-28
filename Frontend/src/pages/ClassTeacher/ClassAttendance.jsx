import { useState } from "react"
import API from "../../api/axios"

export default function ClassAttendance() {
  const [classId, setClassId] = useState("")
  const [rows, setRows] = useState([])

  const load = async () => {
    const { data } = await API.get(`/attendance/class/${classId}`)
    setRows(data)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="card">
        <h2 className="text-xl font-semibold">Class Attendance</h2>
        <div className="flex gap-2 mt-3">
          <input className="input" placeholder="Class ID" value={classId} onChange={e=>setClassId(e.target.value)} />
          <button className="btn" onClick={load}>Load</button>
        </div>
        <div className="overflow-auto mt-3">
          <table className="table">
            <thead>
              <tr className="text-slate-600">
                <th className="th">Student</th>
                <th className="th">Subject</th>
                <th className="th">Date</th>
                <th className="th">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id}>
                  <td className="td">{r.student?.name || r.student}</td>
                  <td className="td">{r.subject?.name || r.subject}</td>
                  <td className="td">{new Date(r.date).toLocaleString()}</td>
                  <td className="td"><span className="badge">{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
