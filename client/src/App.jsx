import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import StudentDashboard from "./components/Dashboards/StudentDashboard"
import Layout from "./components/Layout/Layout"
import { AuthProvider } from "./contexts/AuthContext" // ✅ Add this back

function App() {
  return (
    <AuthProvider> {/* ✅ Wrap the whole app */}
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/student" />} />
            <Route
              path="/student/*"
              element={
                <Layout>
                  <StudentDashboard />
                </Layout>
              }
            />
            <Route
              path="*"
              element={
                <Layout>
                  <StudentDashboard />
                </Layout>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
