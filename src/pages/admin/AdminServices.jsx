"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import toast from "react-hot-toast"

const AdminServices = () => {
  const [services, setServices] = useState([])
  const [filteredServices, setFilteredServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [selectedServices, setSelectedServices] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    categories: {},
  })

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    benefits: [],
    pricing: {
      60: 0,
      90: 0,
      120: 0,
    },
    duration: [60],
    imageUrl: "",
    isActive: true,
  })

  const categories = ["Swedish", "Deep Tissue", "Hot Stone", "Aromatherapy", "Sports", "Prenatal", "Couples"]

  useEffect(() => {
    fetchServices()
  }, [])

  useEffect(() => {
    filterServices()
  }, [services, searchTerm, filterCategory, filterStatus])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      if (!token) {
        toast.error("No authentication token found")
        return
      }

      console.log("Fetching services with token:", token)

      // Use relative URLs instead of hardcoded localhost
      let response
      try {
        response = await axios.get("/admin/services", {
          headers: { Authorization: `Bearer ${token}` },
        })
      } catch (error) {
        console.log("Admin services endpoint failed, trying general services endpoint")
        response = await axios.get("/services", {
          headers: { Authorization: `Bearer ${token}` },
        })
      }

      console.log("Services fetched successfully:", response.data)
      setServices(response.data)
      calculateStats(response.data)
      toast.success("Services loaded successfully")
    } catch (error) {
      console.error("Error fetching services:", error)
      toast.error("Failed to fetch services. Please check your connection.")

      // Set empty array as fallback
      setServices([])
      calculateStats([])
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (servicesData) => {
    const total = servicesData.length
    const active = servicesData.filter((s) => s.isActive).length
    const inactive = total - active

    const categories = {}
    servicesData.forEach((service) => {
      categories[service.category] = (categories[service.category] || 0) + 1
    })

    setStats({ total, active, inactive, categories })
  }

  const filterServices = () => {
    let filtered = services

    if (searchTerm) {
      filtered = filtered.filter(
        (service) =>
          service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.category.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filterCategory) {
      filtered = filtered.filter((service) => service.category === filterCategory)
    }

    if (filterStatus) {
      filtered = filtered.filter((service) => (filterStatus === "active" ? service.isActive : !service.isActive))
    }

    setFilteredServices(filtered)
  }

  const handleSelectService = (serviceId) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId],
    )
  }

  const handleSelectAll = () => {
    if (selectedServices.length === filteredServices.length) {
      setSelectedServices([])
    } else {
      setSelectedServices(filteredServices.map((service) => service._id))
    }
  }

  const handleBulkAction = async (action) => {
    if (selectedServices.length === 0) {
      toast.error("Please select services first")
      return
    }

    try {
      const token = localStorage.getItem("token")

      if (action === "delete") {
        if (!window.confirm(`Are you sure you want to delete ${selectedServices.length} services?`)) {
          return
        }

        await Promise.all(
          selectedServices.map((id) =>
            axios.delete(`/admin/services/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ),
        )
      } else {
        const isActive = action === "activate"
        await Promise.all(
          selectedServices.map((id) =>
            axios.patch(
              `/admin/services/${id}/status`,
              { isActive },
              { headers: { Authorization: `Bearer ${token}` } },
            ),
          ),
        )
      }

      setSelectedServices([])
      fetchServices()
      toast.success(`Services ${action}d successfully`)
    } catch (error) {
      console.error(`Error ${action}ing services:`, error)
      toast.error(`Failed to ${action} services`)
    }
  }

  const handleStatusChange = async (serviceId, isActive) => {
    try {
      const token = localStorage.getItem("token")
      await axios.patch(
        `/admin/services/${serviceId}/status`,
        { isActive },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      fetchServices()
      toast.success("Service status updated")
    } catch (error) {
      console.error("Error updating service status:", error)
      toast.error("Failed to update service status")
    }
  }

  const handleDelete = async (serviceId) => {
    if (!window.confirm("Are you sure you want to delete this service?")) {
      return
    }

    try {
      const token = localStorage.getItem("token")
      await axios.delete(`/admin/services/${serviceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchServices()
      toast.success("Service deleted successfully")
    } catch (error) {
      console.error("Error deleting service:", error)
      toast.error("Failed to delete service")
    }
  }

  const handleEdit = (service) => {
    setEditingService(service)
    setFormData({
      title: service.title,
      category: service.category,
      description: service.description,
      benefits: service.benefits || [],
      pricing: service.pricing || { 60: 0, 90: 0, 120: 0 },
      duration: service.duration || [60],
      imageUrl: service.imageUrl || "",
      isActive: service.isActive,
    })
    setShowModal(true)
  }

  const handleCreate = () => {
    setEditingService(null)
    setFormData({
      title: "",
      category: "",
      description: "",
      benefits: [],
      pricing: { 60: 0, 90: 0, 120: 0 },
      duration: [60],
      imageUrl: "",
      isActive: true,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem("token")

      if (editingService) {
        await axios.put(`/admin/services/${editingService._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        })
        toast.success("Service updated successfully")
      } else {
        await axios.post("/admin/services", formData, {
          headers: { Authorization: `Bearer ${token}` },
        })
        toast.success("Service created successfully")
      }

      setShowModal(false)
      fetchServices()
    } catch (error) {
      console.error("Error saving service:", error)
      toast.error("Failed to save service")
    }
  }

  const addBenefit = () => {
    setFormData((prev) => ({
      ...prev,
      benefits: [...prev.benefits, ""],
    }))
  }

  const updateBenefit = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      benefits: prev.benefits.map((benefit, i) => (i === index ? value : benefit)),
    }))
  }

  const removeBenefit = (index) => {
    setFormData((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index),
    }))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Services Management</h1>
        <p className="text-gray-600">Manage your massage services and pricing</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Services</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-purple-600">{Object.keys(stats.categories).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Service
              </button>
            </div>
          </div>

          {selectedServices.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-800">{selectedServices.length} service(s) selected</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBulkAction("activate")}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    Activate
                  </button>
                  <button
                    onClick={() => handleBulkAction("deactivate")}
                    className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                  >
                    Deactivate
                  </button>
                  <button
                    onClick={() => handleBulkAction("delete")}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedServices.length === filteredServices.length && filteredServices.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pricing
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No services found. Click "Add Service" to create your first service.
                  </td>
                </tr>
              ) : (
                filteredServices.map((service) => (
                  <tr key={service._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(service._id)}
                        onChange={() => handleSelectService(service._id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {service.imageUrl && (
                          <img
                            src={service.imageUrl || "/placeholder.svg"}
                            alt={service.title}
                            className="h-12 w-12 rounded-lg object-cover mr-4"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{service.title}</div>
                          <div className="text-sm text-gray-500">{service.description?.substring(0, 60)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {service.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {service.duration?.map((duration) => (
                          <div key={duration}>
                            {duration}min: £{service.pricing?.[duration] || 0}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={service.isActive}
                          onChange={(e) => handleStatusChange(service._id, e.target.checked)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className={`ml-2 text-sm ${service.isActive ? "text-green-600" : "text-red-600"}`}>
                          {service.isActive ? "Active" : "Inactive"}
                        </span>
                      </label>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button onClick={() => handleEdit(service)} className="text-blue-600 hover:text-blue-900">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button onClick={() => handleDelete(service._id)} className="text-red-600 hover:text-red-900">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">{editingService ? "Edit Service" : "Create New Service"}</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Service Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pricing</label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">60 minutes</label>
                      <input
                        type="number"
                        value={formData.pricing["60"]}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            pricing: { ...prev.pricing, 60: Number.parseInt(e.target.value) || 0 },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">90 minutes</label>
                      <input
                        type="number"
                        value={formData.pricing["90"]}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            pricing: { ...prev.pricing, 90: Number.parseInt(e.target.value) || 0 },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">120 minutes</label>
                      <input
                        type="number"
                        value={formData.pricing["120"]}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            pricing: { ...prev.pricing, 120: Number.parseInt(e.target.value) || 0 },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Available Durations</label>
                  <div className="flex gap-4">
                    {[60, 90, 120].map((duration) => (
                      <label key={duration} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.duration.includes(duration)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData((prev) => ({
                                ...prev,
                                duration: [...prev.duration, duration],
                              }))
                            } else {
                              setFormData((prev) => ({
                                ...prev,
                                duration: prev.duration.filter((d) => d !== duration),
                              }))
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm">{duration} min</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Benefits</label>
                  {formData.benefits.map((benefit, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={benefit}
                        onChange={(e) => updateBenefit(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter benefit"
                      />
                      <button
                        type="button"
                        onClick={() => removeBenefit(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-800"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={addBenefit} className="text-blue-600 hover:text-blue-800 text-sm">
                    + Add Benefit
                  </button>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm">Active Service</span>
                  </label>
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    {editingService ? "Update Service" : "Create Service"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminServices
