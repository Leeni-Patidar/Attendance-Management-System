"use client"

import { useState, useEffect } from "react"

const AddStudent = ({ onBack, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    rollNumber: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    bloodGroup: "",
    address: "",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    emergencyContact: "",
    previousSchool: "",
    admissionDate: "",
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const [availableSubjects] = useState([
    { code: "CS301", name: "Data Structures & Algorithms", teacher: "Prof. Smith", mandatory: true },
    { code: "CS302", name: "Database Management Systems", teacher: "Dr. Johnson", mandatory: true },
    { code: "CS303", name: "Computer Networks", teacher: "Prof. Wilson", mandatory: true },
    { code: "CS304", name: "Software Engineering", teacher: "Dr. Brown", mandatory: true },
    { code: "CS305", name: "Operating Systems", teacher: "Prof. Davis", mandatory: false },
    { code: "CS306", name: "Machine Learning", teacher: "Dr. Anderson", mandatory: false },
    { code: "CS307", name: "Web Development", teacher: "Prof. Taylor", mandatory: false },
    { code: "CS308", name: "Mobile App Development", teacher: "Dr. White", mandatory: false },
    { code: "CS309", name: "Artificial Intelligence", teacher: "Dr. Kumar", mandatory: false },
    { code: "CS310", name: "Blockchain Technology", teacher: "Prof. Singh", mandatory: false },
  ])
  const [selectedSubjects, setSelectedSubjects] = useState([])

  useEffect(() => {
    // Auto-select mandatory subjects
    const mandatorySubjects = availableSubjects.filter((subject) => subject.mandatory).map((subject) => subject.code)
    setSelectedSubjects(mandatorySubjects)
  }, [])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.rollNumber.trim()) newErrors.rollNumber = "Roll number is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid"
    if (!formData.phone.trim()) newErrors.phone = "Phone is required"
    if (!formData.address.trim()) newErrors.address = "Address is required"
    if (!formData.parentName.trim()) newErrors.parentName = "Parent name is required"
    if (!formData.parentPhone.trim()) newErrors.parentPhone = "Parent phone is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubjectChange = (subjectCode, isChecked) => {
    if (isChecked) {
      setSelectedSubjects((prev) => [...prev, subjectCode])
    } else {
      // Don't allow unchecking mandatory subjects
      const subject = availableSubjects.find((s) => s.code === subjectCode)
      if (!subject.mandatory) {
        setSelectedSubjects((prev) => prev.filter((code) => code !== subjectCode))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (selectedSubjects.length === 0) {
      alert("Please select at least one subject")
      return
    }

    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      const studentData = {
        ...formData,
        subjects: selectedSubjects,
      }
      console.log("Adding new student:", studentData)
      setLoading(false)

      // Call onSubmit callback if provided
      if (onSubmit) {
        onSubmit(studentData)
      }

      // Navigate back
      if (onBack) {
        onBack()
      }
    }, 1000)
  }

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Add New Student</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Student Information</h2>
            <p className="text-sm text-gray-600 mt-1">Fill in the details to add a new student to your class</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-medium text-gray-900 border-b pb-2 mb-4">Personal Information</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.name ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Enter student's full name"
                      />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Roll Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.rollNumber}
                        onChange={(e) => handleInputChange("rollNumber", e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.rollNumber ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="e.g., CS21B004"
                      />
                      {errors.rollNumber && <p className="text-red-500 text-xs mt-1">{errors.rollNumber}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.email ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="student@college.edu"
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.phone ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="+1234567890"
                      />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                        <input
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                        <select
                          value={formData.bloodGroup}
                          onChange={(e) => handleInputChange("bloodGroup", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Blood Group</option>
                          {bloodGroups.map((group) => (
                            <option key={group} value={group}>
                              {group}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        rows="3"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.address ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Enter complete address"
                      />
                      {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Parent/Guardian and Additional Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-medium text-gray-900 border-b pb-2 mb-4">Parent/Guardian Information</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parent/Guardian Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.parentName}
                        onChange={(e) => handleInputChange("parentName", e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.parentName ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Enter parent/guardian name"
                      />
                      {errors.parentName && <p className="text-red-500 text-xs mt-1">{errors.parentName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parent/Guardian Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.parentPhone}
                        onChange={(e) => handleInputChange("parentPhone", e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.parentPhone ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="+1234567890"
                      />
                      {errors.parentPhone && <p className="text-red-500 text-xs mt-1">{errors.parentPhone}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Parent/Guardian Email</label>
                      <input
                        type="email"
                        value={formData.parentEmail}
                        onChange={(e) => handleInputChange("parentEmail", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="parent@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                      <input
                        type="tel"
                        value={formData.emergencyContact}
                        onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Emergency contact number"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-900 border-b pb-2 mb-4">Academic Information</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Previous School</label>
                      <input
                        type="text"
                        value={formData.previousSchool}
                        onChange={(e) => handleInputChange("previousSchool", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Name of previous school"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Admission Date</label>
                      <input
                        type="date"
                        value={formData.admissionDate}
                        onChange={(e) => handleInputChange("admissionDate", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-900 border-b pb-2 mb-4">Subject Selection</h3>

                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-md">
                      <div className="flex">
                        <svg
                          className="w-5 h-5 text-blue-400 mr-2 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <div>
                          <h4 className="text-sm font-medium text-blue-800">Subject Enrollment</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            Mandatory subjects are automatically selected. You can choose additional elective subjects.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Mandatory Subjects</h4>
                        <div className="space-y-2">
                          {availableSubjects
                            .filter((subject) => subject.mandatory)
                            .map((subject) => (
                              <div key={subject.code} className="flex items-center p-3 bg-gray-50 rounded-lg">
                                <input
                                  type="checkbox"
                                  id={subject.code}
                                  checked={selectedSubjects.includes(subject.code)}
                                  onChange={(e) => handleSubjectChange(subject.code, e.target.checked)}
                                  disabled={subject.mandatory}
                                  className="mr-3"
                                />
                                <div className="flex-1">
                                  <label htmlFor={subject.code} className="font-medium text-gray-900 cursor-pointer">
                                    {subject.code} - {subject.name}
                                  </label>
                                  <p className="text-sm text-gray-600">Teacher: {subject.teacher}</p>
                                </div>
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Mandatory</span>
                              </div>
                            ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Elective Subjects</h4>
                        <div className="space-y-2">
                          {availableSubjects
                            .filter((subject) => !subject.mandatory)
                            .map((subject) => (
                              <div
                                key={subject.code}
                                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                              >
                                <input
                                  type="checkbox"
                                  id={subject.code}
                                  checked={selectedSubjects.includes(subject.code)}
                                  onChange={(e) => handleSubjectChange(subject.code, e.target.checked)}
                                  className="mr-3"
                                />
                                <div className="flex-1">
                                  <label htmlFor={subject.code} className="font-medium text-gray-900 cursor-pointer">
                                    {subject.code} - {subject.name}
                                  </label>
                                  <p className="text-sm text-gray-600">Teacher: {subject.teacher}</p>
                                </div>
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Elective</span>
                              </div>
                            ))}
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                          <strong>Selected Subjects ({selectedSubjects.length}):</strong>{" "}
                          {selectedSubjects.length > 0 ? selectedSubjects.join(", ") : "No subjects selected"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Information Note */}
                <div className="bg-blue-50 p-4 rounded-md">
                  <div className="flex">
                    <svg
                      className="w-5 h-5 text-blue-400 mr-2 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-blue-800">Important Note</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        After adding the student, they will be automatically enrolled in all subjects for this class.
                        You can modify subject enrollments later from the student's detail page.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Adding Student...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Add Student
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddStudent
