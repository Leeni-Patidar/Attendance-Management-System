import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { Toaster } from "react-hot-toast"

// Import pages
import LoginPage from "./pages/LoginPage"

// Student pages
import StudentDashboard from "./pages/student/Dashboard"
import StudentSubjectDetail from "./pages/student/SubjectDetail"
import StudentQRScan from "./pages/student/QRScan"
import StudentRequests from "./pages/student/Requests"
import StudentProfile from "./pages/student/Profile"
import TimeTable from "./pages/student/TimeTable"

// Class Teacher pages
import ClassTeacherDashboard from "./pages/class-teacher/Dashboard"
import ClassTeacherRequests from "./pages/class-teacher/Requests"
import ClassTeacherProfile from "./pages/class-teacher/Profile"
import AddStudent from "./pages/class-teacher/addStudent"
import DownloadReports from "./pages/class-teacher/downloadReport"
import StudentDetails from "./pages/class-teacher/studentDetail"
import ViewCalendar from "./pages/class-teacher/viewCalendar"

// Subject Teacher pages
import SubjectTeacherDashboard from "./pages/subject-teacher/Dashboard"
import ClassDetail from "./pages/subject-teacher/ClassDetail"
import SubjectTeacherProfile from "./pages/subject-teacher/Profile"
import ArrangementClasses from "./pages/subject-teacher/ArrangementClasses"
import AttendanceAnalytics from "./pages/subject-teacher/AttendanceAnalytics"
import ManageStudents from "./pages/subject-teacher/ManageStudent"
import MyClasses from "./pages/subject-teacher/MyClasses"
import ViewReports from "./pages/subject-teacher/ViewReports"
import ViewSchedule from "./pages/subject-teacher/ViewSchedule"
import QRHistory from "./pages/subject-teacher/QRHistory"
import GenerateQR from "./pages/subject-teacher/GenerateQR"
import RecentActivity from "./pages/subject-teacher/RecentActivity"

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard"
import AdminUsers from "./pages/admin/Users"
import AdminReports from "./pages/admin/Reports"
import AdminSettings from "./pages/admin/Settings"
// import AdminClasses from "./pages/admin/Classes"
// import AdminSubjects from "./pages/admin/Subjects"
// import AdminBackup from "./pages/admin/Backup"

// Shared pages
import NotFound from "./pages/NotFound"
import Unauthorized from "./pages/Unauthorized"

// Import components
import ProtectedRoute from "./components/ProtectedRoute"
import ErrorBoundary from "./components/ErrorBoundary"

// Import styles
import "./App.css"


function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              {/* <Route path="/" element={<LoginPage />} /> */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Student Routes */}
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/subject/:id"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentSubjectDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/qr-scan"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentQRScan />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/requests"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentRequests />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/profile"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/timeTable"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <TimeTable />
                  </ProtectedRoute>
                }
              />

              {/* Class Teacher Routes */}
              <Route
                path="/class-teacher/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["class_teacher"]}>
                    <ClassTeacherDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/class-teacher/requests"
                element={
                  <ProtectedRoute allowedRoles={["class_teacher"]}>
                    <ClassTeacherRequests />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/class-teacher/profile"
                element={
                  <ProtectedRoute allowedRoles={["class_teacher"]}>
                    <ClassTeacherProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/class-teacher/students-detail"
                element={
                  <ProtectedRoute allowedRoles={["class_teacher"]}>
                    <StudentDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/class-teacher/addStudent"
                element={
                  <ProtectedRoute allowedRoles={["class_teacher"]}>
                    <AddStudent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/class-teacher/downloadReports"
                element={
                  <ProtectedRoute allowedRoles={["class_teacher"]}>
                    <DownloadReports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/class-teacher/viewCalendar"
                element={
                  <ProtectedRoute allowedRoles={["class_teacher"]}>
                    <ViewCalendar/>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/class-teacher/timeTable"
                element={
                  <ProtectedRoute allowedRoles={["class_teacher"]}>
                    <TimeTable />
                  </ProtectedRoute>
                }
              />


              {/* Subject Teacher Routes */}
              <Route
                path="/subject-teacher/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["subject_teacher"]}>
                    <SubjectTeacherDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subject-teacher/class/:id"
                element={
                  <ProtectedRoute allowedRoles={["subject_teacher"]}>
                    <ClassDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subject-teacher/qr-history"
                element={
                  <ProtectedRoute allowedRoles={["subject_teacher"]}>
                    <QRHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subject-teacher/profile"
                element={
                  <ProtectedRoute allowedRoles={["subject_teacher"]}>
                    <SubjectTeacherProfile />
                  </ProtectedRoute>
                }
              />
              {/* <Route
                path="/subject-teacher/reports"
                element={
                  <ProtectedRoute allowedRoles={["subject_teacher"]}>
                    <ViewReports />
                  </ProtectedRoute>
                }
              /> */}
              <Route
                path="/subject-teacher/arrangementClasses"
                element={
                  <ProtectedRoute allowedRoles={["subject_teacher"]}>
                    <ArrangementClasses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subject-teacher/AttendanceAnalytics"
                element={
                  <ProtectedRoute allowedRoles={["subject_teacher"]}>
                    <AttendanceAnalytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subject-teacher/ManageStudents"
                element={
                  <ProtectedRoute allowedRoles={["subject_teacher"]}>
                    <ManageStudents/>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subject-teacher/MyClasses"
                element={
                  <ProtectedRoute allowedRoles={["subject_teacher"]}>
                    <MyClasses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subject-teacher/ViewSchedule"
                element={
                  <ProtectedRoute allowedRoles={["subject_teacher"]}>
                    <ViewSchedule />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subject-teacher/ViewReports"
                element={
                  <ProtectedRoute allowedRoles={["subject_teacher"]}>
                    <ViewReports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subject-teacher/GenerateQR"
                element={
                  <ProtectedRoute allowedRoles={["subject_teacher"]}>
                    <GenerateQR />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subject-teacher/RecentActivity"
                element={
                  <ProtectedRoute allowedRoles={["subject_teacher"]}>
                    <RecentActivity />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              {/* <Route
                path="/admin/classes"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminClasses />
                  </ProtectedRoute>
                }
              /> */}
              {/* <Route
                path="/admin/subjects"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminSubjects />
                  </ProtectedRoute>
                }
              /> */}
              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminReports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminSettings />
                  </ProtectedRoute>
                }
              />
              {/* <Route
                path="/admin/backup"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminBackup />
                  </ProtectedRoute>
                }
              /> */}

              {/* Catch all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>

            {/* Global components */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#363636",
                  color: "#fff",
                },
                success: {
                  duration: 3000,
                  theme: {
                    primary: "#4aed88",
                  },
                },
                error: {
                  duration: 4000,
                  theme: {
                    primary: "#ff6b6b",
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
