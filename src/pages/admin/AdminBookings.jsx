"use client"

import { useState, useEffect } from "react"
import {
  Calendar,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  User,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import axios from "axios"
import toast from "react-hot-toast"

axios.defaults.baseURL = "https://relax-on-backend-production-8652.up.railway.app/api"

const AdminBookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalBookings, setTotalBookings] = useState(0)
  const [selectedBookings, setSelectedBookings] = useState([])
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0,
  })

  const bookingsPerPage = 15

  useEffect(() => {
    loadBookings()
    loadStats()
  }, [currentPage, searchTerm, statusFilter, dateFilter])

  const loadBookings = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const params = {
        page: currentPage,
        limit: bookingsPerPage,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(dateFilter && { date: dateFilter }),
      }

      const response = await axios.get("/admin/bookings", {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setBookings(response.data.bookings || [])
      setTotalPages(response.data.pagination?.pages || 1)
      setTotalBookings(response.data.pagination?.total || 0)
    } catch (error) {
      console.error("Error loading bookings:", error)
      toast.error("Failed to load bookings")
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const token = localStorage.getItem("token")
      console.log("Loading stats...")

      const response = await axios.get("/admin/bookings/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("Stats response:", response.data)
      const data = response.data

      setStats({
        total: data.totalBookings || 0,
        pending: data.pendingBookings || 0,
        confirmed: data.confirmedBookings || 0,
        completed: data.completedBookings || 0,
        cancelled: data.cancelledBookings || 0,
        totalRevenue: data.totalRevenue || 0,
      })
    } catch (error) {
      console.error("Error loading stats:", error)
      toast.error("Failed to load stats")
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleStatusFilter = (status) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const handleDateFilter = (date) => {
    setDateFilter(date)
    setCurrentPage(1)
  }

  const handleBookingAction = async (bookingId, action, newStatus = null) => {
    setActionLoading(true)
    try {
      const token = localStorage.getItem("token")
      let endpoint = ""
      let data = {}

      switch (action) {
        case "updateStatus":
          endpoint = `/admin/bookings/${bookingId}/status`
          data = { status: newStatus }
          break
        case "cancel":
          endpoint = `/admin/bookings/${bookingId}/status`
          data = { status: "cancelled" }
          break
        case "confirm":
          endpoint = `/admin/bookings/${bookingId}/status`
          data = { status: "confirmed" }
          break
        case "complete":
          endpoint = `/admin/bookings/${bookingId}/status`
          data = { status: "completed" }
          break
      }

      console.log(`Making request to ${endpoint} with data:`, data)

      await axios.put(endpoint, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const actionMessage =
        action === "complete" || action === "cancel"
          ? `Booking ${action}d successfully - Time slot is now available for new bookings`
          : `Booking ${action}d successfully`

      toast.success(actionMessage)

      // Reload both bookings and stats
      await loadBookings()
      await loadStats()
    } catch (error) {
      console.error(`Error ${action}ing booking:`, error)
      toast.error(`Failed to ${action} booking`)
    } finally {
      setActionLoading(false)
    }
  }

  const handleBulkAction = async (action, status = null) => {
    if (selectedBookings.length === 0) {
      toast.error("Please select bookings first")
      return
    }

    if (!window.confirm(`Are you sure you want to ${action} ${selectedBookings.length} bookings?`)) {
      return
    }

    setActionLoading(true)
    try {
      const token = localStorage.getItem("token")

      if (action === "delete") {
        // Use the bulk delete endpoint
        await axios.post(
          "/admin/bookings/bulk-delete",
          { bookingIds: selectedBookings },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
      } else {
        // Process each booking individually for status updates
        for (const bookingId of selectedBookings) {
          await axios.put(
            `/admin/bookings/${bookingId}/status`,
            { status },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          )
        }
      }

      setSelectedBookings([])

      const bulkMessage =
        action === "complete" || action === "cancel" || action === "delete"
          ? `Bulk ${action} completed - ${selectedBookings.length} time slots are now available for new bookings`
          : `Bulk ${action} completed`

      toast.success(bulkMessage)

      // Reload both bookings and stats
      await loadBookings()
      await loadStats()
    } catch (error) {
      console.error(`Bulk ${action} error:`, error)
      toast.error(`Bulk ${action} failed`)
    } finally {
      setActionLoading(false)
    }
  }

  const toggleBookingSelection = (bookingId) => {
    setSelectedBookings((prev) =>
      prev.includes(bookingId) ? prev.filter((id) => id !== bookingId) : [...prev, bookingId],
    )
  }

  const selectAllBookings = () => {
    if (selectedBookings.length === bookings.length) {
      setSelectedBookings([])
    } else {
      setSelectedBookings(bookings.map((booking) => booking._id))
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      therapist_assigned: "bg-green-100 text-green-800",
      en_route: "bg-purple-100 text-purple-800",
      arrived: "bg-indigo-100 text-indigo-800",
      in_progress: "bg-orange-100 text-orange-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  const formatStatus = (status) => {
    if (!status) {
      return "UNKNOWN"
    }
    return status.replace("_", " ").toUpperCase()
  }

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to delete this booking? This action cannot be undone.")) {
      return
    }

    try {
      const token = localStorage.getItem("token")
      await axios.delete(`/admin/bookings/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      toast.success("Booking deleted successfully - Time slot is now available for new bookings")
      loadBookings() // Refresh the list
      loadStats() // Refresh stats
    } catch (error) {
      console.error("Error deleting booking:", error)
      toast.error("Failed to delete booking")
    }
  }

  if (loading && currentPage === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bookings Management</h1>
              <p className="text-gray-600 mt-2">Manage all massage bookings and appointments</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Calendar className="text-gray-600" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="text-yellow-600" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
              </div>
              <CheckCircle className="text-blue-600" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
              </div>
              <XCircle className="text-red-600" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-purple-600">${stats.totalRevenue}</p>
              </div>
              <DollarSign className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by booking ID, customer name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter size={16} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>

              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <input
                type="date"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                value={dateFilter}
                onChange={(e) => handleDateFilter(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedBookings.length > 0 && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">{selectedBookings.length} bookings selected</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkAction("confirm", "confirmed")}
                  disabled={actionLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1 px-3 rounded transition-colors disabled:opacity-50"
                >
                  Confirm
                </button>
                <button
                  onClick={() => handleBulkAction("complete", "completed")}
                  disabled={actionLoading}
                  className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-1 px-3 rounded transition-colors disabled:opacity-50"
                >
                  Complete
                </button>
                <button
                  onClick={() => handleBulkAction("cancel", "cancelled")}
                  disabled={actionLoading}
                  className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-1 px-3 rounded transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleBulkAction("delete")}
                  disabled={actionLoading}
                  className="bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium py-1 px-3 rounded transition-colors disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bookings Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedBookings.length === bookings.length && bookings.length > 0}
                      onChange={selectAllBookings}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address & Therapist
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedBookings.includes(booking._id)}
                        onChange={() => toggleBookingSelection(booking._id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{booking.bookingId}</div>
                        <div className="text-xs text-gray-500">{new Date(booking.createdAt).toLocaleDateString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="text-blue-600" size={16} />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{booking.userId?.name}</div>
                          <div className="text-xs text-gray-500">{booking.userId?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{booking.serviceId?.title}</div>
                        <div className="text-xs text-gray-500">{booking.duration}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{booking.date}</div>
                        <div className="text-xs text-gray-500">{booking.time}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {booking.address?.street}, {booking.address?.city}
                      </div>
                      <div className="text-sm text-gray-500">{booking.address?.postalCode}</div>
                      <div className="text-sm text-purple-600 font-medium">
                        Therapist: {booking.therapistGender || "Not specified"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}
                      >
                        {formatStatus(booking.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">${booking.servicePrice || booking.service?.price}</div>
                      <div className="text-xs text-gray-500">{booking.paymentStatus}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedBooking(booking)
                            setShowBookingModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-700 p-1 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>

                        {booking.status === "pending" && (
                          <button
                            onClick={() => handleBookingAction(booking._id, "confirm")}
                            disabled={actionLoading}
                            className="text-blue-600 hover:text-blue-700 p-1 rounded transition-colors disabled:opacity-50"
                            title="Confirm Booking"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}

                        {/* Complete Button - Green Tick for confirmed, in_progress, arrived, en_route, therapist_assigned */}
                        {["confirmed", "therapist_assigned", "en_route", "arrived", "in_progress"].includes(
                          booking.status,
                        ) && (
                          <button
                            onClick={() => handleBookingAction(booking._id, "complete")}
                            disabled={actionLoading}
                            className="text-green-600 hover:text-green-700 p-1 rounded transition-colors disabled:opacity-50"
                            title="Mark Complete"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}

                        {/* Cancel Button - Red X for pending, confirmed */}
                        {["pending", "confirmed"].includes(booking.status) && (
                          <button
                            onClick={() => handleBookingAction(booking._id, "cancel")}
                            disabled={actionLoading}
                            className="text-red-600 hover:text-red-700 p-1 rounded transition-colors disabled:opacity-50"
                            title="Cancel Booking"
                          >
                            <XCircle size={16} />
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteBooking(booking._id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition-colors"
                          title="Delete Booking"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {(currentPage - 1) * bookingsPerPage + 1} to{" "}
                  {Math.min(currentPage * bookingsPerPage, totalBookings)} of {totalBookings} bookings
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} className="mr-1" />
                    Previous
                  </button>

                  {(() => {
                    const pages = []
                    const maxVisiblePages = 5
                    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
                    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

                    // Adjust start page if we're near the end
                    if (endPage - startPage + 1 < maxVisiblePages) {
                      startPage = Math.max(1, endPage - maxVisiblePages + 1)
                    }

                    // Add first page and ellipsis if needed
                    if (startPage > 1) {
                      pages.push(
                        <button
                          key={1}
                          onClick={() => setCurrentPage(1)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          1
                        </button>,
                      )
                      if (startPage > 2) {
                        pages.push(
                          <span key="start-ellipsis" className="px-3 py-2 text-gray-500">
                            ...
                          </span>,
                        )
                      }
                    }

                    // Add visible page numbers
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i)}
                          className={`px-3 py-2 border rounded-lg text-sm font-medium ${
                            currentPage === i
                              ? "bg-blue-600 text-white border-blue-600"
                              : "border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {i}
                        </button>,
                      )
                    }

                    // Add last page and ellipsis if needed
                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) {
                        pages.push(
                          <span key="end-ellipsis" className="px-3 py-2 text-gray-500">
                            ...
                          </span>,
                        )
                      }
                      pages.push(
                        <button
                          key={totalPages}
                          onClick={() => setCurrentPage(totalPages)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          {totalPages}
                        </button>,
                      )
                    }

                    return pages
                  })()}

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight size={16} className="ml-1" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {bookings.length === 0 && !loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter || dateFilter
                ? "Try adjusting your search or filters"
                : "No bookings have been made yet"}
            </p>
          </div>
        )}
      </div>

      {/* Booking Detail Modal */}
      {showBookingModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Booking Details</h2>
                <button onClick={() => setShowBookingModal(false)} className="text-gray-400 hover:text-gray-600 p-2">
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Booking Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Booking ID</label>
                    <p className="text-sm text-gray-900 font-mono">{selectedBooking.bookingId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                    <p className="text-sm text-gray-900">{selectedBooking.serviceId?.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                    <p className="text-sm text-gray-900">{selectedBooking.duration}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                    <p className="text-sm text-gray-900">
                      {selectedBooking.date} at {selectedBooking.time}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedBooking.status)}`}
                    >
                      {formatStatus(selectedBooking.status)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                    <p className="text-sm text-gray-900 capitalize">{selectedBooking.paymentStatus}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                    <p className="text-lg font-semibold text-green-600">${selectedBooking.servicePrice || booking.service?.price}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                    <p className="text-sm text-gray-900">{new Date(selectedBooking.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <p className="text-sm text-gray-900">{selectedBooking.userId?.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-sm text-gray-900">{selectedBooking.userId?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <p className="text-sm text-gray-900">{selectedBooking.userId?.phone || "Not provided"}</p>
                  </div>
                </div>
              </div>

              {/* Address Info */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Service Address & Therapist</h4>
                <div className="space-y-2">
                  <p className="text-sm text-gray-900">{selectedBooking.address?.street}</p>
                  <p className="text-sm text-gray-900">
                    {selectedBooking.address?.city}, {selectedBooking.address?.postalCode}
                  </p>
                  <p className="text-sm text-purple-600 font-medium">
                    Therapist: {selectedBooking.therapistGender || "Not specified"}
                  </p>
                  {selectedBooking.address?.instructions && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
                      <p className="text-sm text-gray-900">{selectedBooking.address.instructions}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Therapist Info */}
              {selectedBooking.therapistId && (
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Assigned Therapist</h4>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="text-green-600" size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedBooking.therapistId.name}</p>
                      <p className="text-xs text-gray-500">Professional Therapist</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex space-x-3">
                  {selectedBooking.status === "pending" && (
                    <button
                      onClick={() => {
                        handleBookingAction(selectedBooking._id, "confirm")
                        setShowBookingModal(false)
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Confirm Booking
                    </button>
                  )}

                  {["confirmed", "therapist_assigned", "en_route", "arrived", "in_progress"].includes(
                    selectedBooking.status,
                  ) && (
                    <button
                      onClick={() => {
                        handleBookingAction(selectedBooking._id, "complete")
                        setShowBookingModal(false)
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Mark Complete
                    </button>
                  )}

                  {["pending", "confirmed"].includes(selectedBooking.status) && (
                    <button
                      onClick={() => {
                        handleBookingAction(selectedBooking._id, "cancel")
                        setShowBookingModal(false)
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminBookings
