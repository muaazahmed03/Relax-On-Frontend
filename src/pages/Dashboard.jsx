"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { Calendar, Clock, MapPin, CreditCard, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import axios from "axios"
import toast from "react-hot-toast"

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    if (!user) {
      navigate("/login")
      return
    }
    fetchBookings()
  }, [user, navigate])

  const fetchBookings = async () => {
    try {
      console.log("📡 Fetching user bookings...")
      const response = await axios.get("/bookings")
      console.log("✅ Bookings response:", response.data)

      if (response.data.success) {
        setBookings(response.data.bookings || [])
      } else {
        setBookings([])
      }
    } catch (error) {
      console.error("❌ Error fetching bookings:", error)
      if (error.response?.status !== 404) {
        toast.error("Failed to load bookings")
      }
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="text-green-500" size={20} />
      case "pending":
        return <AlertCircle className="text-yellow-500" size={20} />
      case "cancelled":
        return <XCircle className="text-red-500" size={20} />
      default:
        return <Clock className="text-gray-500" size={20} />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === "all") return true
    return booking.status === activeTab
  })

  const bookingCounts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600 mt-2">Manage your massage bookings and appointments</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <Calendar className="text-blue-600" size={24} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{bookingCounts.all}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <AlertCircle className="text-yellow-600" size={24} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{bookingCounts.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <CheckCircle className="text-green-600" size={24} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-gray-900">{bookingCounts.confirmed}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <CreditCard className="text-purple-600" size={24} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bookings.filter((b) => new Date(b.createdAt).getMonth() === new Date().getMonth()).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: "all", label: "All Bookings", count: bookingCounts.all },
                { key: "pending", label: "Pending", count: bookingCounts.pending },
                { key: "confirmed", label: "Confirmed", count: bookingCounts.confirmed },
                { key: "cancelled", label: "Cancelled", count: bookingCounts.cancelled },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>

          {/* Bookings List */}
          <div className="p-6">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                <p className="text-gray-600 mb-6">
                  {activeTab === "all"
                    ? "You haven't made any bookings yet. Book your first massage!"
                    : `No ${activeTab} bookings at the moment.`}
                </p>
                <button
                  onClick={() => navigate("/services")}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Book Now
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          {getStatusIcon(booking.status)}
                          <h3 className="text-lg font-semibold text-gray-900">{booking.serviceId?.title}</h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}
                          >
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Calendar size={16} />
                            <span>{new Date(booking.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock size={16} />
                            <span>
                              {booking.time} • {booking.duration}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin size={16} />
                            <span>{booking.address?.street || "Address not provided"}</span>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div>
                            <span className="text-sm text-gray-600">Booking ID: </span>
                            <span className="text-sm font-medium text-gray-900">{booking.bookingId}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold text-blue-600">£{booking.totalAmount}</span>
                            <div className="text-xs text-gray-500">
                              {booking.paymentStatus === "paid" ? "Paid" : "Payment Pending"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 flex space-x-3">
                      {booking.status === "pending" && booking.paymentStatus === "pending" && (
                        <button
                          onClick={() => navigate(`/payment/${booking._id}`)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                        >
                          Complete Payment
                        </button>
                      )}
                      <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                        View Details
                      </button>
                      {booking.status === "confirmed" && (
                        <button className="border border-red-300 text-red-700 px-4 py-2 rounded-lg text-sm hover:bg-red-50 transition-colors">
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
