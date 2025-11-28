// "use client"

// import { useState } from "react"
// import { useAuth } from "../contexts/AuthContext"
// import { Navigate, useNavigate } from "react-router-dom"
// import React from "react"
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
// import { faGraduationCap } from "@fortawesome/free-solid-svg-icons"

// const LoginPage = () => {
//   const { login, isAuthenticated, user } = useAuth()
//   const [credentials, setCredentials] = useState({ email: "", password: "" })
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState("")
//   const navigate = useNavigate()

//   if (isAuthenticated) {
//     let redirectUrl = "/"
//     if (user?.role === "student") redirectUrl = "/student/dashboard"
//     else if (user?.role === "class_teacher") redirectUrl = "/class-teacher/dashboard"
//     else if (user?.role === "subject_teacher") redirectUrl = "/subject-teacher/dashboard"
//     else if (user?.role === "admin") redirectUrl = "/admin/dashboard"
//     return <Navigate to={redirectUrl} replace />
//   }

//   const handleLogin = async (e) => {
//     e.preventDefault()
//     setLoading(true)
//     setError("")

//     const result = await login(credentials)

//     if (result.success) {
//       navigate(result.redirectUrl, { replace: true })
//     } else {
//       setError(result.error || "Login failed")
//     }

//     setLoading(false)
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
//       <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
//         <div className="text-center mb-6">
//           <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
//             <FontAwesomeIcon icon={faGraduationCap} className="w-6 h-6 text-white" />
//           </div>
//           <h1 className="text-2xl font-bold text-gray-900">College Attendance System</h1>
//           <p className="text-gray-600">Sign in to your account</p>
//         </div>

//         <form onSubmit={handleLogin} className="space-y-4">
//           {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

//           <div>
//             <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
//               Email
//             </label>
//             <input
//               id="email"
//               type="email"
//               placeholder="Enter your email"
//               value={credentials.email}
//               onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             />
//           </div>

//           <div>
//             <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
//               Password
//             </label>
//             <input
//               id="password"
//               type="password"
//               placeholder="Enter your password"
//               value={credentials.password}
//               onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             />
//           </div>

//           <button
//             type="submit"
//             className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
//             disabled={!credentials.email || !credentials.password || loading}
//           >
//             {loading ? "Signing In..." : "Sign In"}
//           </button>
//         </form>
//       </div>
//     </div>
//   )
// }

// export default LoginPage


import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      login(res.data); // save to context
      navigate("/dashboard"); // redirect to dashboard (change path if needed)
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {error && (
          <p className="text-red-500 text-center text-sm mb-4">{error}</p>
        )}

        <label className="block mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          required
        />

        <label className="block mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
