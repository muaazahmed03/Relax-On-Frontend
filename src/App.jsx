"use client"

import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { StripeProvider } from "./context/StripeContext"
import Navbar from "./components/Navbar"
import AdminNavbar from "./components/admin/AdminNavbar"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Services from "./pages/Services"
import BookingFlow from "./pages/BookingFlow"
import PaymentPage from "./pages/PaymentPage"
import BookingSuccess from "./pages/BookingSuccess"
import Profile from "./pages/Profile"
import HowItWorks from "./pages/HowItWorks"
import AdminRoute from "./components/AdminRoute"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminUsers from "./pages/admin/AdminUsers"
import AdminBookings from "./pages/admin/AdminBookings"
import AdminServices from "./pages/admin/AdminServices"

// Component to redirect admin users from customer dashboard to admin dashboard
function DashboardRedirect() {
  const { user } = useAuth()

  if (user?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />
  }

  return <Dashboard />
}

function AppContent() {
  const { user } = useAuth()
  const location = useLocation()

  // Show admin navbar for admin users on ALL routes
  const showAdminNavbar = user?.role === "admin"

  console.log("🔍 Current route:", location.pathname)
  console.log("👤 User role:", user?.role)
  console.log("🎯 Show admin navbar:", showAdminNavbar)

  return (
    <div className="App">
      {showAdminNavbar ? <AdminNavbar /> : <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard route with admin redirect */}
        <Route path="/dashboard" element={<DashboardRedirect />} />

        <Route path="/services" element={<Services />} />
        <Route path="/booking" element={<BookingFlow />} />
        <Route path="/payment/:bookingId" element={<PaymentPage />} />
        <Route path="/booking-success" element={<BookingSuccess />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/how-it-works" element={<HowItWorks />} />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <AdminRoute>
              <AdminBookings />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/services"
          element={
            <AdminRoute>
              <AdminServices />
            </AdminRoute>
          }
        />
      </Routes>
      <Toaster position="top-right" />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <StripeProvider>
        <Router>
          <AppContent />
        </Router>
      </StripeProvider>
    </AuthProvider>
  )
}

export default App
