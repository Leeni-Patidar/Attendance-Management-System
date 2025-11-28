import { useEffect, useState } from "react"
import API from "../../api/axios"

export default function AdminDashboard() {
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [users, setUsers] = useState([])

  const [className, setClassName] = useState("")
  const [subjectName, setSubjectName] = useState("")
  const [subjectCode, setSubjectCode] = useState("")
  const [subjectClassId, setSubjectClassId] = useState("")
  const [subjectTeacherId, setSubjectTeacherId] = useState("")

  useEffect(() => {
    (async () => {
      try {
        const [cl, us, sj] = await Promise.all([
          API.get("/classes"),
          API.get("/users"),
          API.get("/subjects")
        ])
        setClasses(cl.data || [])
        setUsers(us.data || [])
        setSubjects(sj.data || [])
      } catch {}
    })()
  }, [])

  const createClass = async () => {
    const { data } = await API.post("/classes", { name: className })
    setClasses((x) => [data, ...x])
    setClassName("")
  }

  const createSubject = async () => {
    const { data } = await API.post("/subjects", { name: subjectName, code: subjectCode, classId: subjectClassId, teacher: subjectTeacherId })
    setSubjects((x) => [data, ...x])
    setSubjectName(""); setSubjectCode(""); setSubjectClassId(""); setSubjectTeacherId("")
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="card">
        <h2 className="text-xl font-semibold">Admin Dashboard</h2>

        <div className="mt-4">
          <h3 className="font-semibold mb-2">Create Class</h3>
          <div className="flex gap-2">
            <input className="input" placeholder="New class name" value={className} onChange={e=>setClassName(e.target.value)} />
            <button className="btn" onClick={createClass}>Create</button>
          </div>
          <ul className="list-disc pl-6 mt-2">
            {classes.map(c => <li key={c._id}>{c.name}</li>)}
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold mb-2">Create Subject</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <input className="input" placeholder="Subject name" value={subjectName} onChange={e=>setSubjectName(e.target.value)} />
            <input className="input" placeholder="Subject code" value={subjectCode} onChange={e=>setSubjectCode(e.target.value)} />
            <input className="input" placeholder="Class ID" value={subjectClassId} onChange={e=>setSubjectClassId(e.target.value)} />
            <input className="input" placeholder="Teacher ID" value={subjectTeacherId} onChange={e=>setSubjectTeacherId(e.target.value)} />
          </div>
          <button className="btn mt-2" onClick={createSubject}>Create</button>
          <ul className="list-disc pl-6 mt-2">
            {subjects.map(s => <li key={s._id}>{s.name} · {s.code} · class:{s.classId} · teacher:{s.teacher}</li>)}
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold mb-2">Users (first 20)</h3>
          <ol className="list-decimal pl-6">
            {users.slice(0,20).map(u => <li key={u._id}>{u.name} ({u.email}) — {u.role}</li>)}
          </ol>
        </div>
      </div>
    </div>
  )
}
