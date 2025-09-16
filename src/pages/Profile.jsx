"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { User, MapPin, Lock, Camera, Edit3, Save, X, Plus, Trash2 } from "lucide-react"
import axios from "axios"
import toast from "react-hot-toast"

const Profile = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("personal")
  const [loading, setLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [profileImage, setProfileImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [currentProfileImage, setCurrentProfileImage] = useState(null)

  // Personal Info State
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    email: "",
    phone: "",
  })

  // Address State
  const [addresses, setAddresses] = useState([])
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [newAddress, setNewAddress] = useState({
    label: "",
    address: "",
    isDefault: false,
  })

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [bookingStats, setBookingStats] = useState({
    total: 0,
    completed: 0,
    upcoming: 0,
    cancelled: 0,
  })

  useEffect(() => {
    if (!user) {
      navigate("/login")
      return
    }
    loadUserData()
    loadBookingStats()
  }, [user])

  const loadUserData = async () => {
    try {
      const response = await axios.get("/auth/profile")
      const userData = response.data.user

      setPersonalInfo({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
      })

      setAddresses(userData.addresses || [])

      // Load existing profile image
      if (userData.profileImage) {
        setCurrentProfileImage(`http://localhost:5000${userData.profileImage}`)
      }
    } catch (error) {
      toast.error("Failed to load profile data")
    }
  }

  const loadBookingStats = async () => {
    try {
      const response = await axios.get("/bookings/user", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      console.log("✅ Booking stats response:", response.data)

      if (response.data.success) {
        const bookings = response.data.bookings || []

        setBookingStats({
          total: bookings.length,
          completed: bookings.filter((b) => b.status === "completed").length,
          upcoming: bookings.filter((b) => !["completed", "cancelled"].includes(b.status)).length,
          cancelled: bookings.filter((b) => b.status === "cancelled").length,
        })
      } else {
        setBookingStats({
          total: 0,
          completed: 0,
          upcoming: 0,
          cancelled: 0,
        })
      }
    } catch (error) {
      console.error("Failed to load booking stats:", error)
      setBookingStats({
        total: 0,
        completed: 0,
        upcoming: 0,
        cancelled: 0,
      })
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfileImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageUpload = async () => {
    if (!profileImage) return

    const formData = new FormData()
    formData.append("profileImage", profileImage)

    setLoading(true)
    try {
      const response = await axios.post("/auth/upload-profile-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      toast.success("Profile picture updated successfully!")

      // Update current profile image with new uploaded image
      setCurrentProfileImage(`http://localhost:5000${response.data.profileImage}`)
      setImagePreview(null)
      setProfileImage(null)

      // Reload user data to get updated profile
      loadUserData()
    } catch (error) {
      toast.error("Failed to upload profile picture")
    } finally {
      setLoading(false)
    }
  }

  const handlePersonalInfoUpdate = async () => {
    setLoading(true)
    try {
      await axios.put("/auth/profile", personalInfo)
      toast.success("Profile updated successfully!")
      setEditMode(false)
    } catch (error) {
      toast.error("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setLoading(true)
    try {
      await axios.put("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      toast.success("Password changed successfully!")
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password")
    } finally {
      setLoading(false)
    }
  }

  const handleAddAddress = async () => {
    if (!newAddress.label || !newAddress.address) {
      toast.error("Please fill all fields")
      return
    }

    setLoading(true)
    try {
      await axios.post("/auth/addresses", newAddress)
      toast.success("Address added successfully!")
      setNewAddress({ label: "", address: "", isDefault: false })
      setShowAddressForm(false)
      loadUserData()
    } catch (error) {
      toast.error("Failed to add address")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        await axios.delete(`/auth/addresses/${addressId}`)
        toast.success("Address deleted successfully!")
        loadUserData()
      } catch (error) {
        toast.error("Failed to delete address")
      }
    }
  }

  // Only basic tabs for customers - NO therapist profile
  const tabs = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "addresses", label: "My Addresses", icon: MapPin },
    { id: "security", label: "Security", icon: Lock },
  ]

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-100 to-cyan-50 rounded-full flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : currentProfileImage ? (
                  <img
                    src={currentProfileImage || "/placeholder.svg"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="text-cyan-500" size={32} />
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white hover:bg-cyan-600 transition-colors cursor-pointer">
                <Camera size={16} />
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              {imagePreview && (
                <button
                  onClick={handleImageUpload}
                  disabled={loading}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white hover:bg-green-700 transition-colors text-xs"
                >
                  {loading ? "..." : "✓"}
                </button>
              )}
            </div>
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex items-center justify-center sm:justify-start mt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cyan-100 text-blue-700 border border-blue-200">
                  Customer
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xl font-semibold text-gray-900">{bookingStats.total}</div>
                <div className="text-xs text-gray-600 mt-1">Total Bookings</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-xl font-semibold text-green-700">{bookingStats.completed}</div>
                <div className="text-xs text-gray-600 mt-1">Completed</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-xl font-semibold text-blue-700">{bookingStats.upcoming}</div>
                <div className="text-xs text-gray-600 mt-1">Upcoming</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xl font-semibold text-gray-700">{bookingStats.cancelled}</div>
                <div className="text-xs text-gray-600 mt-1">Cancelled</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? "bg-cyan-50 text-cyan-500 border border-cyan-300"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <tab.icon size={20} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              {/* Personal Info Tab */}
              {activeTab === "personal" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                    <button
                      onClick={() => setEditMode(!editMode)}
                      className="flex items-center space-x-2 text-cyan-500 hover:text-cyan-600 transition-colors"
                    >
                      {editMode ? <X size={16} /> : <Edit3 size={16} />}
                      <span>{editMode ? "Cancel" : "Edit"}</span>
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        disabled={!editMode}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-600"
                        value={personalInfo.name}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        disabled={!editMode}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-600"
                        value={personalInfo.email}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        disabled={!editMode}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-600"
                        value={personalInfo.phone}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                      />
                    </div>

                    {editMode && (
                      <div className="flex space-x-4">
                        <button
                          onClick={handlePersonalInfoUpdate}
                          disabled={loading}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
                        >
                          <Save size={16} />
                          <span>{loading ? "Saving..." : "Save Changes"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === "addresses" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">My Addresses</h2>
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      <Plus size={16} />
                      <span>Add Address</span>
                    </button>
                  </div>

                  {/* Add Address Form */}
                  {showAddressForm && (
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Address</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Label</label>
                          <input
                            type="text"
                            placeholder="e.g., Home, Office"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            value={newAddress.label}
                            onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                          <textarea
                            placeholder="Enter full address"
                            rows="3"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            value={newAddress.address}
                            onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                          />
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="isDefault"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            checked={newAddress.isDefault}
                            onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                          />
                          <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                            Set as default address
                          </label>
                        </div>
                        <div className="flex space-x-4">
                          <button
                            onClick={handleAddAddress}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {loading ? "Adding..." : "Add Address"}
                          </button>
                          <button
                            onClick={() => setShowAddressForm(false)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Address List */}
                  <div className="space-y-4">
                    {addresses.length === 0 ? (
                      <div className="text-center py-12">
                        <MapPin className="mx-auto text-gray-400 mb-4" size={48} />
                        <p className="text-gray-500 text-lg">No addresses saved yet</p>
                        <p className="text-gray-400 text-sm">Add an address to make booking easier</p>
                      </div>
                    ) : (
                      addresses.map((address, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-medium text-gray-900">{address.label}</h3>
                                {address.isDefault && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600">{address.address}</p>
                            </div>
                            <button
                              onClick={() => handleDeleteAddress(address._id)}
                              className="text-gray-400 hover:text-red-600 p-2 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>

                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          />
                        </div>
                        <button
                          onClick={handlePasswordChange}
                          disabled={loading}
                          className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {loading ? "Changing..." : "Change Password"}
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h3>
                      <div className="space-y-3">
                        <button
                          onClick={() => {
                            logout()
                            navigate("/")
                          }}
                          className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                        >
                          Logout from All Devices
                        </button>
                        <button className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors ml-4">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
