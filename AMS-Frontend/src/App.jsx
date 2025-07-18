import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { Toaster } from "react-hot-toast"


// Import pages
import LoginPage from "./pages/LoginPage"

// Common pages
import ViewCalendar from "./pages/commonpages/ViewCalendar"
import Layout from "./pages/commonpages/Layout"

// Student pages
import StudentDashboard from "./pages/student/Dashboard"
import StudentProfile from "./pages/student/Profile"
import StudentQRScan from "./pages/student/QRScan"
import StudentRequests from "./pages/student/Requests"
import StudentSubjectDetail from "./pages/student/SubjectDetail"
import StudentTimetable from "./pages/student/TimeTable"



// Class Teacher pages
import AddStudent from "./pages/class-teacher/addStudent"
import ClassTeacherDashboard from "./pages/class-teacher/Dashboard"
import DownloadReports from "./pages/class-teacher/downloadReport"
import ClassTeacherProfile from "./pages/class-teacher/Profile"
import ClassTeacherRequests from "./pages/class-teacher/Requests"
import StudentDetail from "./pages/class-teacher/StudentDetails"


// Subject Teacher pages
import ArrangementClasses from "./pages/subject-teacher/ArrangementClasses"
import ClassDetail from "./pages/subject-teacher/ClassDetail"
import SubjectTeacherDashboard from "./pages/subject-teacher/Dashboard"
import GenerateQR from "./pages/subject-teacher/GenerateQR"
import GeneratedQRDisplay from "./pages/subject-teacher/GeneratedQRDisplay"
import MyClasses from "./pages/subject-teacher/MyClasses"
import SubjectTeacherProfile from "./pages/subject-teacher/Profile"
import QRHistory from "./pages/subject-teacher/QRHistory"
// import RecentActivity from "./pages/subject-teacher/RecentActivity"
import ViewSchedule from "./pages/subject-teacher/ViewSchedule"


// Admin pages
import AssignClassTeacher from"./pages/admin/AssignClassTeacher"
import AssignSubjectTeacher from"./pages/admin/AssignSubjectTeacher"
// import ClassDetail from "./pages/admin/ClassDetail"
import ClassTimeTable from "./pages/admin/ClassTimeTable"
import Dashboard from "./pages/admin/Dashboard"
import DownloadReport from "./pages/admin/DownloadReport"
import ManageArrangement from "./pages/admin/ManageArrangement"
import Profile from "./pages/admin/Profile"
// import RecentActivity from "./pages/admin/RecentActivity"
import TeacherDetail from "./pages/admin/TeacherDetail"
import TeacherTimeTable from "./pages/admin/TeacherTimeTable"


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
                path="/student/profile"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentProfile />
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
                path="/student/subject/:id"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentSubjectDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/timeTable"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentTimetable />
                  </ProtectedRoute>
                }
              />
               <Route
                path="/student/viewCalendar"
                element={
                  <ProtectedRoute allowedRoles={["class_teacher"]}>
                    <ViewCalendar/>
                  </ProtectedRoute>
                }
              />


              {/* Class Teacher Routes */}

              <Route
                path="/class-teacher/addStudent"
                element={
                  <ProtectedRoute allowedRoles={["class_teacher"]}>
                    <AddStudent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/class-teacher/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["class_teacher"]}>
                    <ClassTeacherDashboard />
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
                path="/class-teacher/profile"
                element={
                  <ProtectedRoute allowedRoles={["class_teacher"]}>
                    <ClassTeacherProfile />
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
                path="/class-teacher/students-detail"
                element={
                  <ProtectedRoute allowedRoles={["class_teacher"]}>
                    <StudentDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/class-teacher/timeTable"
                element={
                  <ProtectedRoute allowedRoles={["class_teacher"]}>
                    <StudentTimetable />   {/* student timetable from student components  */}
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


              {/* Subject Teacher Routes */}
               <Route
                path="/subject-teacher/arrangementClasses"
                element={
                  <ProtectedRoute allowedRoles={["subject_teacher"]}>
                    <ArrangementClasses />
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
                path="/subject-teacher/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["subject_teacher"]}>
                    <SubjectTeacherDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subject-teacher/GenerateQRDisplay"
                element={
                  <ProtectedRoute allowedRoles={["subject_teacher"]}>
                    <GeneratedQRDisplay/>
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
                path="/subject-teacher/MyClasses"
                element={
                  <ProtectedRoute allowedRoles={["subject_teacher"]}>
                    <MyClasses />
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
              <Route
                path="/subject-teacher/qr-history"
                element={
                  <ProtectedRoute allowedRoles={["subject_teacher"]}>
                    <QRHistory />
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
               <Route
                path="/subject-teacher/ViewCalendar"
                element={
                  <ProtectedRoute allowedRoles={["subject_teacher"]}>
                    <ViewCalendar />
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


              {/* Admin Routes */}
              
               <Route
                path="/admin/AssignClassTeacher"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AssignClassTeacher />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/AssignSubjectTeacher"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AssignSubjectTeacher />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/ClassDetail"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <ClassDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/ClassTimeTable"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <ClassTimeTable/>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/downloadReport"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <DownloadReport/>
                  </ProtectedRoute>
                }
              />
               <Route
                path="/admin/manageArrangement"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <ManageArrangement/>
                  </ProtectedRoute>
                }
              />
               <Route
                path="/admin/profile"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <Profile/>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/RecentActivity"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <RecentActivity/>
                  </ProtectedRoute>
                }
              />
               <Route
                path="/admin/TeacherDetail"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <TeacherDetail/>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/TeacherTimeTable"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <TeacherTimeTable />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/TeacherDetail"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <ViewCalendar />
                  </ProtectedRoute>
                }
              />


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
