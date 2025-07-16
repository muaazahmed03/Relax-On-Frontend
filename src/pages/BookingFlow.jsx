"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Check } from "lucide-react"
import axios from "axios"
import toast from "react-hot-toast"

const BookingFlow = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Get service from navigation state
  const selectedService = location.state?.service

  const [bookingData, setBookingData] = useState({
    service: selectedService || null,
    duration: "",
    date: "",
    time: "",
    address: {
      street: "",
      city: "",
      postalCode: "",
      instructions: "",
    },
  })

  useEffect(() => {
    if (!selectedService) {
      navigate("/services")
      return
    }
    if (!user) {
      navigate("/login")
      return
    }
  }, [selectedService, user, navigate])

  const steps = [
    { id: 1, title: "Duration", icon: Clock },
    { id: 2, title: "Date & Time", icon: Calendar },
    { id: 3, title: "Address", icon: MapPin },
    { id: 4, title: "Confirm", icon: Check },
  ]

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleBookingSubmit = async () => {
    setLoading(true)
    try {
      console.log("🚀 Submitting booking with data:", bookingData)

      const bookingPayload = {
        serviceId: bookingData.service._id,
        duration: bookingData.duration,
        date: bookingData.date,
        time: bookingData.time,
        address: `${bookingData.address.street}, ${bookingData.address.city}${bookingData.address.postalCode ? ", " + bookingData.address.postalCode : ""}`,
      }

      console.log("📦 Booking payload:", bookingPayload)

      const response = await axios.post("/bookings", bookingPayload)

      console.log("✅ Booking created:", response.data)

      if (response.data.success) {
        toast.success("Booking created! Redirecting to payment...")

        // Important: Redirect to payment page, not success page
        setTimeout(() => {
          navigate(`/payment/${response.data.booking._id}`)
        }, 1000)
      } else {
        toast.error("Booking creation failed")
      }
    } catch (error) {
      console.error("❌ Booking error:", error)
      toast.error(error.response?.data?.message || "Booking failed")
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return bookingData.duration !== ""
      case 2:
        return bookingData.date !== "" && bookingData.time !== ""
      case 3:
        return bookingData.address.street !== "" && bookingData.address.city !== ""
      case 4:
        return true
      default:
        return false
    }
  }

  if (!selectedService) return null

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= step.id ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  <step.icon size={20} />
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${currentStep >= step.id ? "text-blue-600" : "text-gray-500"}`}
                >
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-4 ${currentStep > step.id ? "bg-blue-600" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          {/* Step 1: Duration Selection */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Duration</h2>
              <div className="space-y-4">
                {selectedService.duration?.map((duration) => (
                  <div
                    key={duration}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      bookingData.duration === duration
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setBookingData({ ...bookingData, duration })}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{duration}</h3>
                        <p className="text-gray-600">{selectedService.title}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-blue-600">
                          £{selectedService.price?.[duration.replace(" minutes", "min")] || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Date & Time Selection */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Date & Time</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    value={bookingData.date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    value={bookingData.time}
                    onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                  >
                    <option value="">Select time</option>
                    {Array.from({ length: 15 }, (_, i) => {
                      const hour = Math.floor(i / 2) + 7
                      const minute = i % 2 === 0 ? "00" : "30"
                      const time = `${hour.toString().padStart(2, "0")}:${minute}`
                      return (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      )
                    })}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Address */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Where should we come?</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Enter your street address"
                    value={bookingData.address.street}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        address: { ...bookingData.address, street: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="City"
                      value={bookingData.address.city}
                      onChange={(e) =>
                        setBookingData({
                          ...bookingData,
                          address: { ...bookingData.address, city: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Postal code"
                      value={bookingData.address.postalCode}
                      onChange={(e) =>
                        setBookingData({
                          ...bookingData,
                          address: { ...bookingData.address, postalCode: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    rows="3"
                    placeholder="Gate code, apartment number, parking instructions, etc."
                    value={bookingData.address.instructions}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        address: { ...bookingData.address, instructions: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Summary</h2>
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Service Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service:</span>
                      <span className="font-medium">{bookingData.service.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{bookingData.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{bookingData.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">{bookingData.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Address:</span>
                      <span className="font-medium">
                        {bookingData.address.street}, {bookingData.address.city}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Therapist:</span>
                      <span className="font-medium">Auto-assigned (Best available)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Pricing</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service Price:</span>
                      <span className="font-medium">
                        £{bookingData.service.price?.[bookingData.duration.replace(" minutes", "min")] || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Platform Fee:</span>
                      <span className="font-medium">
                        £
                        {Math.round(
                          (bookingData.service.price?.[bookingData.duration.replace(" minutes", "min")] || 0) * 0.1,
                        )}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-900">Total:</span>
                        <span className="font-bold text-blue-600 text-xl">
                          £
                          {(bookingData.service.price?.[bookingData.duration.replace(" minutes", "min")] || 0) +
                            Math.round(
                              (bookingData.service.price?.[bookingData.duration.replace(" minutes", "min")] || 0) * 0.1,
                            )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    <strong>Note:</strong> After confirming this booking, you will be redirected to complete your
                    payment securely.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
              <span>Back</span>
            </button>

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ChevronRight size={20} />
              </button>
            ) : (
              <button
                onClick={handleBookingSubmit}
                disabled={loading}
                className="flex items-center space-x-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Creating Booking...</span>
                  </>
                ) : (
                  <span>Confirm Booking</span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingFlow
