"use client"

// Importing necessary React module
import React from "react"

// Creating a class-based component to catch rendering errors in child components
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    // State tracks whether an error has occurred
    this.state = { hasError: false, error: null }
  }

  // Update state so the next render shows fallback UI
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  // Log error information for debugging
  componentDidCatch(error, errorInfo) {
    console.error("Application Error:", error, errorInfo)
  }

  render() {
    // If an error occurred, show fallback UI with options to retry or refresh
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              {/* Error icon */}
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            {/* Error message */}
            <h1 className="text-xl font-semibold text-gray-900 text-center mb-2">Something went wrong</h1>
            <p className="text-gray-600 text-center mb-4">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            <div className="flex gap-3">
              {/* Reloads the page */}
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Refresh Page
              </button>
              {/* Resets error boundary state */}
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )
    }

    // If no error, render child components
    return this.props.children
  }
}

// Exporting the component for reuse
export default ErrorBoundary
