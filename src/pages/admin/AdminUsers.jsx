"use client"

import { useState, useEffect } from "react"
import { Users, Search, Filter, Trash2, UserCheck, UserX, Eye } from "lucide-react"
import axios from "axios"
import toast from "react-hot-toast"

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [selectedUsers, setSelectedUsers] = useState([])
  const [showUserModal, setShowUserModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const usersPerPage = 15

  useEffect(() => {
    loadUsers()
  }, [currentPage, searchTerm, roleFilter, statusFilter])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const params = {
        page: currentPage,
        limit: usersPerPage,
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter && { status: statusFilter }),
      }

      const response = await axios.get("/admin/users", { params })

      setUsers(response.data.users || [])
      setTotalPages(response.data.pagination?.pages || 1)
      setTotalUsers(response.data.pagination?.total || 0)
    } catch (error) {
      console.error("Error loading users:", error)
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleRoleFilter = (role) => {
    setRoleFilter(role)
    setCurrentPage(1)
  }

  const handleUserAction = async (userId, action, value = null) => {
    setActionLoading(true)
    try {
      let endpoint = ""
      let data = {}

      switch (action) {
        case "activate":
          endpoint = `/admin/users/${userId}/status`
          data = { isActive: true }
          break
        case "deactivate":
          endpoint = `/admin/users/${userId}/status`
          data = { isActive: false }
          break
        case "verify":
          endpoint = `/admin/users/${userId}/status`
          data = { isVerified: true }
          break
        case "unverify":
          endpoint = `/admin/users/${userId}/status`
          data = { isVerified: false }
          break
        case "delete":
          if (!window.confirm("Are you sure you want to delete this user?")) return
          endpoint = `/admin/users/${userId}`
          break
      }

      if (action === "delete") {
        await axios.delete(endpoint)
        toast.success("User deleted successfully")
      } else {
        await axios.put(endpoint, data)
        toast.success(`User ${action}d successfully`)
      }

      loadUsers()
    } catch (error) {
      toast.error(`Failed to ${action} user`)
    } finally {
      setActionLoading(false)
    }
  }

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      toast.error("Please select users first")
      return
    }

    if (!window.confirm(`Are you sure you want to ${action} ${selectedUsers.length} users?`)) {
      return
    }

    setActionLoading(true)
    try {
      await Promise.all(selectedUsers.map((userId) => handleUserAction(userId, action)))
      setSelectedUsers([])
      toast.success(`Bulk ${action} completed`)
    } catch (error) {
      toast.error(`Bulk ${action} failed`)
    } finally {
      setActionLoading(false)
    }
  }

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const selectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map((user) => user._id))
    }
  }

  const getRoleColor = (role) => {
    const colors = {
      customer: "bg-blue-100 text-blue-800",
      therapist: "bg-green-100 text-green-800",
      admin: "bg-purple-100 text-purple-800",
    }
    return colors[role] || "bg-gray-100 text-gray-800"
  }

  const getStatusColor = (user) => {
    if (user.role === "therapist") {
      return user.therapistProfile?.isVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
    }
    return "bg-green-100 text-green-800"
  }

  const getStatusText = (user) => {
    if (user.role === "therapist") {
      return user.therapistProfile?.isVerified ? "Verified" : "Pending"
    }
    return "Active"
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
              <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
              <p className="text-gray-600 mt-2">Manage all platform users - customers and admins</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
              </div>
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Customers</p>
                <p className="text-2xl font-bold text-blue-600">{users.filter((u) => u.role === "customer").length}</p>
              </div>
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Users</p>
                <p className="text-2xl font-bold text-green-600">
                  {users.filter((u) => u.role === "therapist").length}
                </p>
              </div>
              <UserCheck className="text-green-600" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-purple-600">{users.filter((u) => u.role === "admin").length}</p>
              </div>
              <UserCheck className="text-purple-600" size={24} />
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
                placeholder="Search users by name or email..."
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
                value={roleFilter}
                onChange={(e) => handleRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="customer">Customers</option>
                <option value="therapist">Users</option>
                <option value="admin">Admins</option>
              </select>

              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">{selectedUsers.length} users selected</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleBulkAction("activate")}
                    disabled={actionLoading}
                    className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-1 px-3 rounded transition-colors disabled:opacity-50"
                  >
                    Activate
                  </button>
                  <button
                    onClick={() => handleBulkAction("deactivate")}
                    disabled={actionLoading}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium py-1 px-3 rounded transition-colors disabled:opacity-50"
                  >
                    Deactivate
                  </button>
                  <button
                    onClick={() => handleBulkAction("delete")}
                    disabled={actionLoading}
                    className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-1 px-3 rounded transition-colors disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === users.length && users.length > 0}
                      onChange={selectAllUsers}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => toggleUserSelection(user._id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {user.name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          {user.phone && <div className="text-xs text-gray-400">{user.phone}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getRoleColor(user.role)}`}
                      >
                        {user.role === "customer" ? "Customer" : user.role === "therapist" ? "User" : user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user)}`}
                      >
                        {getStatusText(user)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setShowUserModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-700 p-1 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>

                        {user.role === "therapist" && !user.therapistProfile?.isVerified && (
                          <button
                            onClick={() => handleUserAction(user._id, "verify")}
                            disabled={actionLoading}
                            className="text-green-600 hover:text-green-700 p-1 rounded transition-colors disabled:opacity-50"
                            title="Verify Therapist"
                          >
                            <UserCheck size={16} />
                          </button>
                        )}

                        {user.role === "therapist" && user.therapistProfile?.isVerified && (
                          <button
                            onClick={() => handleUserAction(user._id, "unverify")}
                            disabled={actionLoading}
                            className="text-yellow-600 hover:text-yellow-700 p-1 rounded transition-colors disabled:opacity-50"
                            title="Unverify Therapist"
                          >
                            <UserX size={16} />
                          </button>
                        )}

                        {user.role !== "admin" && (
                          <button
                            onClick={() => handleUserAction(user._id, "delete")}
                            disabled={actionLoading}
                            className="text-red-600 hover:text-red-700 p-1 rounded transition-colors disabled:opacity-50"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
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
                  Showing {(currentPage - 1) * usersPerPage + 1} to {Math.min(currentPage * usersPerPage, totalUsers)}{" "}
                  of {totalUsers} users
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const page = i + 1
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 border rounded-lg text-sm font-medium ${
                          currentPage === page
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {users.length === 0 && !loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Users className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500">
              {searchTerm || roleFilter || statusFilter
                ? "Try adjusting your search or filters"
                : "No users have been registered yet"}
            </p>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">User Details</h2>
                <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-gray-600 p-2">
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xl">{selectedUser.name?.charAt(0)?.toUpperCase()}</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{selectedUser.name}</h3>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize mt-1 ${getRoleColor(selectedUser.role)}`}
                  >
                    {selectedUser.role === "customer"
                      ? "Customer"
                      : selectedUser.role === "therapist"
                        ? "User"
                        : selectedUser.role}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <p className="text-sm text-gray-900">{selectedUser.phone || "Not provided"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Joined</label>
                  <p className="text-sm text-gray-900">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {selectedUser.role === "therapist" && selectedUser.therapistProfile && (
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Therapist Profile</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                      <p className="text-sm text-gray-900">{selectedUser.therapistProfile.bio || "Not provided"}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                        <p className="text-sm text-gray-900">{selectedUser.therapistProfile.experience || 0} years</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                        <p className="text-sm text-gray-900">{selectedUser.therapistProfile.rating || 0}/5</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Verification Status</label>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedUser)}`}
                      >
                        {getStatusText(selectedUser)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers
