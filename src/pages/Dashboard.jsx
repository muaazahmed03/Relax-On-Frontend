"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { Calendar, Clock, MapPin, CreditCard, CheckCircle, XCircle, AlertCircle, Eye, Trash2 } from "lucide-react"
import axios from "axios"
import toast from "react-hot-toast"

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)

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
      // Fixed API endpoint to match backend routes
      const response = await axios.get("/bookings/user", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
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

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to delete this booking? This action cannot be undone.")) {
      return
    }

    try {
      // Fixed API endpoint to match backend routes
      await axios.delete(`/bookings/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      toast.success("Booking deleted successfully")
      fetchBookings() // Refresh the list
    } catch (error) {
      console.error("Error deleting booking:", error)
      toast.error("Failed to delete booking")
    }
  }

  const handleCancelBooking = async (booking) => {
    // Check if payment is completed
    if (booking.paymentStatus === "paid") {
      toast.error("Cannot cancel booking - payment has already been completed")
      return
    }

    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return
    }

    try {
      // Fixed API endpoint to match backend routes
      await axios.patch(
        `/bookings/${booking._id}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      )
      toast.success("Booking cancelled successfully")
      fetchBookings() // Refresh the list
    } catch (error) {
      console.error("Error cancelling booking:", error)
      toast.error("Failed to cancel booking")
    }
  }

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking)
    setShowDetailsModal(true)
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
          <h1 className="text-3xl font-bold text-gray-900">Hello, {user?.name}!</h1>
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
                {
                  key: "all",
                  label: "All Bookings",
                  count: bookingCounts.all,
                },
                { key: "pending", label: "Pending", count: bookingCounts.pending },
                { key: "confirmed", label: "Confirmed", count: bookingCounts.confirmed },
                { key: "cancelled", label: "Cancelled", count: bookingCounts.cancelled },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? "border-cyan-500 text-cyan-500"
                      : "border-transparent text-gray-500 hover:text-cyan-500 hover:border-cyan-500"
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
                  className="bg-cyan-600 text-white px-6 py-3 rounded-lg hover:bg-cyan-500 transition-colors"
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
                            <div>
                              <span>
                                {booking.address?.street && booking.address?.city && booking.address?.postalCode
                                  ? `${booking.address.street}, ${booking.address.city}, ${booking.address.postalCode}`
                                  : booking.address?.street || "Address not provided"}
                              </span>
                              {(booking.branch || booking.selectedLocation || booking.preferredBranch) && (
                                <div className="text-xs text-blue-600 font-medium mt-1">
                                  Branch: {booking.branch || booking.selectedLocation || booking.preferredBranch}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div>
                            <span className="text-sm text-gray-600">Booking ID: </span>
                            <span className="text-sm font-medium text-gray-900">{booking.bookingId}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold text-cyan-600">£{booking.servicePrice || booking.service?.price}</span>
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
                          className="bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-cyan-500 transition-colors"
                        >
                          Complete Payment
                        </button>
                      )}
                      {booking.status === "pending" && booking.paymentStatus === "paid" && (
                        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-medium border border-green-200">
                          Payment Completed - Awaiting Confirmation
                        </div>
                      )}
                      {booking.status === "confirmed" && (
                        <div className="bg-cyan-100 text-cyan-800 px-4 py-2 rounded-lg text-sm font-medium border border-blue-200">
                          Booking Confirmed
                        </div>
                      )}
                      <button
                        onClick={() => handleViewDetails(booking)}
                        className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center space-x-2"
                      >
                        <Eye size={16} />
                        <span>View Details</span>
                      </button>
                      {(booking.status === "confirmed" || booking.status === "pending") && (
                        <button
                          onClick={() => handleCancelBooking(booking)}
                          className="border border-red-300 text-red-700 px-4 py-2 rounded-lg text-sm hover:bg-red-50 transition-colors"
                        >
                          Cancel Booking
                        </button>
                      )}
                      {booking.paymentStatus === "pending" && (
                        <button
                          onClick={() => handleDeleteBooking(booking._id)}
                          className="border border-red-300 text-red-700 px-4 py-2 rounded-lg text-sm hover:bg-red-50 transition-colors flex items-center space-x-2"
                        >
                          <Trash2 size={16} />
                          <span>Delete</span>
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

      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Booking Details</h2>
                <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600 p-2">
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Service Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Service Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium">{selectedBooking.serviceId?.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{selectedBooking.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{new Date(selectedBooking.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{selectedBooking.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Therapist:</span>
                    <span className="font-medium capitalize">{selectedBooking.therapistGender || "Not specified"}</span>
                  </div>
                </div>
              </div>

              {/* Address Details */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Service Address</h3>
                <div className="space-y-2">
                  <p className="text-gray-900">
                    {selectedBooking.address?.street &&
                    selectedBooking.address?.city &&
                    selectedBooking.address?.postalCode
                      ? `${selectedBooking.address.street}, ${selectedBooking.address.city}, ${selectedBooking.address.postalCode}`
                      : "Address not provided"}
                  </p>
                  {selectedBooking.address?.instructions && (
                    <div>
                      <span className="text-gray-600 font-medium">Instructions: </span>
                      <span className="text-gray-900">{selectedBooking.address.instructions}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Status */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Status & Payment</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking Status:</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedBooking.status)}`}
                    >
                      {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status:</span>
                    <span className="font-medium capitalize">{selectedBooking.paymentStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-bold text-green-600">£{selectedBooking.totalAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking ID:</span>
                    <span className="font-mono text-sm">{selectedBooking.bookingId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="text-sm">{new Date(selectedBooking.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
