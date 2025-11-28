import { useState } from "react"
import API from "../../api/axios"

export default function SubjectAttendance() {
  const [subjectId, setSubjectId] = useState("")
  const [rows, setRows] = useState([])

  const load = async () => {
    const { data } = await API.get(`/attendance/subject/${subjectId}`)
    setRows(data)
  }

  const toggle = async (id, current) => {
    const next = current === "Present" ? "Absent" : "Present"
    const { data } = await API.put(`/attendance/${id}`, { status: next })
    setRows((r) => r.map(x => x._id === id ? data : x))
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="card">
        <h2 className="text-xl font-semibold">Subject Attendance</h2>
        <div className="flex gap-2 mt-3">
          <input className="input" placeholder="Subject ID" value={subjectId} onChange={e=>setSubjectId(e.target.value)} />
          <button className="btn" onClick={load}>Load</button>
        </div>
        <div className="overflow-auto mt-3">
          <table className="table">
            <thead>
              <tr className="text-slate-600">
                <th className="th">Student</th>
                <th className="th">Date</th>
                <th className="th">Status</th>
                <th className="th">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id}>
                  <td className="td">{r.student?.name || r.student}</td>
                  <td className="td">{new Date(r.date).toLocaleString()}</td>
                  <td className="td"><span className="badge">{r.status}</span></td>
                  <td className="td">
                    <button className="btn btn-secondary" onClick={() => toggle(r._id, r.status)}>Toggle</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
