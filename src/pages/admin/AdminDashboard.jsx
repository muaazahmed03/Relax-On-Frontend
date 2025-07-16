"use client"

import { useState, useEffect } from "react"
import { Users, Calendar, DollarSign, TrendingUp, Clock } from "lucide-react"
import axios from "axios"

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingBookings: 0,
    recentBookings: [],
    monthlyRevenue: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token")
      console.log("Fetching admin dashboard stats...")

      // Use axios with relative URL instead of hardcoded localhost
      const response = await axios.get("/admin/dashboard-stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("Dashboard stats received:", response.data)

      // Set stats with fallback values
      setStats({
        totalUsers: response.data.totalUsers || 0,
        totalBookings: response.data.totalBookings || 0,
        totalRevenue: response.data.totalRevenue || 0,
        pendingBookings: response.data.pendingBookings || 0,
        recentBookings: response.data.recentBookings || [],
        monthlyRevenue: response.data.monthlyRevenue || [],
      })
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      // Try alternative endpoint if main one fails
      await fetchAlternativeStats()
    } finally {
      setLoading(false)
    }
  }

  const fetchAlternativeStats = async () => {
    try {
      console.log("Trying alternative stats endpoints...")
      const token = localStorage.getItem("token")

      // Fetch individual stats if combined endpoint fails
      const [usersRes, bookingsRes] = await Promise.allSettled([
        axios.get("/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/admin/bookings", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      let totalUsers = 0
      let totalBookings = 0
      let totalRevenue = 0
      let pendingBookings = 0
      let recentBookings = []

      // Process users data
      if (usersRes.status === "fulfilled") {
        const usersData = usersRes.value.data
        totalUsers = usersData.pagination?.total || usersData.users?.length || 0
        console.log("Users data:", totalUsers)
      }

      // Process bookings data
      if (bookingsRes.status === "fulfilled") {
        const bookingsData = bookingsRes.value.data
        const bookings = bookingsData.bookings || []

        totalBookings = bookings.length
        pendingBookings = bookings.filter((b) => b.status === "pending").length
        totalRevenue = bookings
          .filter((b) => b.status === "completed")
          .reduce((sum, b) => sum + (Number.parseFloat(b.totalAmount) || 0), 0)

        // Get recent bookings (last 5)
        recentBookings = bookings
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map((booking) => ({
            customerName: booking.userId?.name || "Unknown",
            serviceName: booking.serviceId?.title || "Unknown Service",
            date: booking.date || new Date(booking.createdAt).toLocaleDateString(),
            status: booking.status || "pending",
            amount: booking.totalAmount || 0,
          }))

        console.log("Bookings processed:", { totalBookings, pendingBookings, totalRevenue })
      }

      setStats({
        totalUsers,
        totalBookings,
        totalRevenue,
        pendingBookings,
        recentBookings,
        monthlyRevenue: [],
      })
    } catch (error) {
      console.error("Error fetching alternative stats:", error)
      // Set default stats if everything fails
      setStats({
        totalUsers: 0,
        totalBookings: 0,
        totalRevenue: 0,
        pendingBookings: 0,
        recentBookings: [],
        monthlyRevenue: [],
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-blue-500",
      change: "+12%",
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings,
      icon: Calendar,
      color: "bg-green-500",
      change: "+8%",
    },
    {
      title: "Total Revenue",
      value: `£${stats.totalRevenue}`,
      icon: DollarSign,
      color: "bg-purple-500",
      change: "+15%",
    },
    {
      title: "Pending Bookings",
      value: stats.pendingBookings,
      icon: Clock,
      color: "bg-orange-500",
      change: "-5%",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your business.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                  <span className="text-sm text-gray-500 ml-1">from last month</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
          </div>
          <div className="p-6">
            {stats.recentBookings && stats.recentBookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.recentBookings.map((booking, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {booking.customerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.serviceName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              booking.status === "confirmed"
                                ? "bg-green-100 text-green-800"
                                : booking.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">£{booking.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No recent bookings found</p>
                <p className="text-sm text-gray-400 mt-2">Data will appear here once bookings are made</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
