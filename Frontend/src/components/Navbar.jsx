import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const doLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <header className="sticky top-0 z-10 backdrop-blur bg-white/80 border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-semibold">🎓 AMS</Link>
        <nav className="flex items-center gap-3">
          {user && <span className="badge capitalize">{user.role}</span>}
          {user ? (
            <button className="btn-secondary px-3 py-1.5 rounded-lg" onClick={doLogout}>Logout</button>
          ) : (
            <Link className="btn-secondary px-3 py-1.5 rounded-lg" to="/login">Login</Link>
          )}
        </nav>
      </div>
    </header>
  )
}
