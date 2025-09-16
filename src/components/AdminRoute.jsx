"use client"

import { useAuth } from "../context/AuthContext"
import { Navigate } from "react-router-dom"

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth()

  console.log("AdminRoute - User:", user)
  console.log("AdminRoute - Loading:", loading)
  console.log("AdminRoute - User role:", user?.role)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    console.log("AdminRoute - Redirecting to home, user is not admin")
    return <Navigate to="/" replace />
  }

  console.log("AdminRoute - Rendering admin content")
  return children
}

export default AdminRoute
