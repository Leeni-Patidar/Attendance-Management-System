import { useEffect, useState } from "react"
import API from "../../api/axios"

export default function MyAttendance() {
  const [rows, setRows] = useState([])

  useEffect(() => {
    (async () => {
      const { data } = await API.get("/attendance/me")
      setRows(data)
    })()
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="card">
        <h2 className="text-xl font-semibold mb-3">My Attendance</h2>
        <div className="overflow-auto">
          <table className="table">
            <thead>
              <tr className="text-slate-600">
                <th className="th">Subject</th>
                <th className="th">Total</th>
                <th className="th">Present</th>
                <th className="th">% </th>
                <th className="th">Last Marked</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.subject}>
                  <td className="td">{r.subject}</td>
                  <td className="td">{r.total}</td>
                  <td className="td">{r.present}</td>
                  <td className="td">{Math.round(r.percentage)}%</td>
                  <td className="td">{r.lastDate ? new Date(r.lastDate).toLocaleString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
