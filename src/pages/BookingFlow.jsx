"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Check, AlertTriangle, X } from "lucide-react"
import axios from "axios"
import toast from "react-hot-toast"

const BookingFlow = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, authLoading } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setLoading] = useState(false)
  const [showDistanceWarning, setShowDistanceWarning] = useState(false)
  const [nearbyBranches, setNearbyBranches] = useState([])
  const [postalCodeError, setPostalCodeError] = useState("")
  const [isValidPostalCode, setIsValidPostalCode] = useState(true)
  const [validatingPostcode, setValidatingPostcode] = useState(false)
  const [availableTimeSlots, setAvailableTimeSlots] = useState([])
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false)

  // Get service from navigation state
  const selectedService = location.state?.service
  const preferredLocation = location.state?.preferredLocation

  const [bookingData, setBookingData] = useState({
    service: selectedService || null,
    duration: "",
    date: "",
    time: "",
    therapistGender: "male",
    address: {
      street: "",
      city: "",
      postalCode: "",
      instructions: "",
    },
    preferredBranch: preferredLocation?.id || "",
  })

  useEffect(() => {
    // If no service from navigation, use mock service for demo
    if (!selectedService) {
      const mockService = {
        _id: "1",
        title: "Relaxing Full Body Massage",
        description: "Professional therapeutic massage service",
        category: "massage",
        duration: ["30 minutes", "60 minutes", "90 minutes"],
        price: {
          "30min": 25,
          "60min": 50,
          "90min": 75,
        },
      }

      setBookingData((prev) => ({
        ...prev,
        service: mockService,
      }))
    }

    if (!user && !authLoading) {
      console.log("User not authenticated, but continuing with demo")
    }
  }, [selectedService, user, authLoading, navigate])

  const steps = [
    { id: 1, title: "Duration", icon: Clock },
    { id: 2, title: "Date & Time", icon: Calendar },
    { id: 3, title: "Address", icon: MapPin },
    { id: 4, title: "Confirm", icon: Check },
  ]

  // Function to validate postcode using backend API
  const validatePostcodeWithBackend = async (postcode) => {
    if (!postcode || postcode.length < 5) {
      return {
        isValid: false,
        error: "Please enter a valid postal code",
        withinServiceArea: false,
      }
    }

    try {
      setValidatingPostcode(true)
      console.log(`🔍 Validating postcode: ${postcode}`)

      const response = await axios.post("/postcode/validate", { postcode })

      if (response.data.success) {
        const data = response.data.data
        console.log(`✅ Postcode validation result:`, data)

        return {
          isValid: true,
          withinServiceArea: data.withinServiceArea,
          distanceFromCenter: data.distanceFromCenter,
          nearbyBranches: data.nearbyBranches || [],
          error: data.withinServiceArea
            ? ""
            : `You are ${data.distanceFromCenter} miles from our service area (EC1Y 1AA). We serve within 10 miles of Central London.`,
        }
      } else {
        return {
          isValid: false,
          error: response.data.message || "Invalid postal code",
          withinServiceArea: false,
        }
      }
    } catch (error) {
      console.error("❌ Postcode validation error:", error)

      if (error.response?.status === 400) {
        return {
          isValid: false,
          error: error.response.data.message || "Invalid postal code",
          withinServiceArea: false,
        }
      }

      return {
        isValid: false,
        error: "Unable to validate postal code. Please try again.",
        withinServiceArea: false,
      }
    } finally {
      setValidatingPostcode(false)
    }
  }

  // Function to calculate travel time between branches (for therapist scheduling)
  const calculateTravelTime = (fromBranchId, toBranchId) => {
    // Simple calculation - in real app this would use the backend
    return 15 // Default 15 minutes travel buffer
  }

  const generateTimeSlots = () => {
    return availableTimeSlots
  }

  const handleNext = async () => {
    // Special validation for address step (step 3)
    if (currentStep === 3) {
      const isValid = await canProceedFromAddressStep()
      if (!isValid) {
        return // Don't proceed if validation fails
      }
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handlePostalCodeChange = async (postalCode) => {
    setBookingData({
      ...bookingData,
      address: { ...bookingData.address, postalCode },
    })

    // Clear previous errors
    setPostalCodeError("")
    setIsValidPostalCode(true)
    setShowDistanceWarning(false)

    // Validate postal code when it looks complete (UK postcodes are typically 6-8 characters)
    if (postalCode.length >= 6) {
      const validation = await validatePostcodeWithBackend(postalCode)

      if (!validation.isValid) {
        setPostalCodeError(validation.error)
        setIsValidPostalCode(false)
      } else if (!validation.withinServiceArea) {
        setPostalCodeError(
          `You are ${validation.distanceFromCenter} miles from our service area (EC1Y 1AA). We serve within 10 miles of Central London.`,
        )
        setIsValidPostalCode(false)
      } else {
        // Valid postcode within service area
        setPostalCodeError("")
        setIsValidPostalCode(true)
        setShowDistanceWarning(false)
        toast.success("✅ Postcode verified - within service area!")
      }
    }
  }

  const fetchAvailableTimeSlots = async (date, therapistGender, duration) => {
    if (!date || !therapistGender || !duration) return

    setLoadingTimeSlots(true)
    try {
      const response = await axios.get("/bookings/available-slots", {
        params: { date, therapistGender, duration },
      })

      if (response.data.success) {
        setAvailableTimeSlots(response.data.availableSlots)

        if (response.data.availableSlots.length === 0) {
          toast.error(
            `No available time slots for ${therapistGender} therapist on ${date}. Please try a different date.`,
          )
        } else {
          console.log(
            `✅ Found ${response.data.availableSlots.length} available slots for ${therapistGender} therapist`,
          )
        }
      }
    } catch (error) {
      console.error("Error fetching available time slots:", error)
      toast.error("Failed to load available time slots")
      setAvailableTimeSlots([])
    } finally {
      setLoadingTimeSlots(false)
    }
  }

  useEffect(() => {
    if (bookingData.date && bookingData.therapistGender && bookingData.duration) {
      fetchAvailableTimeSlots(bookingData.date, bookingData.therapistGender, bookingData.duration)
    }
  }, [bookingData.date, bookingData.therapistGender, bookingData.duration])

  const handleBookingSubmit = async () => {
    setLoading(true)
    try {
      console.log("🚀 Submitting booking with data:", bookingData)

      const bookingPayload = {
        serviceId: bookingData.service._id,
        duration: bookingData.duration,
        date: bookingData.date,
        time: bookingData.time,
        therapistGender: bookingData.therapistGender,
        address: {
          street: bookingData.address.street,
          city: bookingData.address.city,
          postalCode: bookingData.address.postalCode,
          instructions: bookingData.address.instructions,
        },
        preferredBranch: bookingData.preferredBranch,
        travelTimeBuffer: calculateTravelTime("base", bookingData.preferredBranch),
      }

      console.log("📦 Booking payload:", bookingPayload)

      const response = await axios.post("/bookings", bookingPayload)

      console.log("✅ Booking created:", response.data)

      if (response.data.success) {
        toast.success("Booking confirmed successfully!")

        const bookingData_complete = {
          ...response.data.booking,
          service: bookingData.service,
          duration: bookingData.duration,
          date: bookingData.date,
          time: bookingData.time,
          therapistGender: bookingData.therapistGender,
          address: bookingData.address,
          preferredBranch: bookingData.preferredBranch,
          bookingId: response.data.booking._id || response.data.booking.bookingId,
          totalAmount: response.data.booking.totalAmount || bookingData.service.price,
        }

        console.log("📋 Complete booking data for payment page:", bookingData_complete)

        setTimeout(() => {
          navigate(`/payment/${bookingData_complete.bookingId}`, {
            state: {
              booking: bookingData_complete,
            },
          })
        }, 1000)
      } else {
        toast.error("Booking creation failed")
      }
    } catch (error) {
      console.error("❌ Booking error:", error)

      if (error.response?.status === 409 || error.response?.data?.errorType === "BOOKING_CONFLICT") {
        toast.error("⚠️ This time slot was just booked by another customer! Please choose a different time.")

        // Go back to step 2 and refresh available slots
        setCurrentStep(2)
        fetchAvailableTimeSlots(bookingData.date, bookingData.therapistGender, bookingData.duration)

        // Clear the selected time since it's no longer available
        setBookingData((prev) => ({ ...prev, time: "" }))
      } else if (
        error.response?.data?.message?.includes("already booked") ||
        error.response?.data?.message?.includes("conflict")
      ) {
        toast.error("This time slot is no longer available. Please choose a different time.")
        // Refresh available slots
        fetchAvailableTimeSlots(bookingData.date, bookingData.therapistGender, bookingData.duration)
        setCurrentStep(2)
        setBookingData((prev) => ({ ...prev, time: "" }))
      } else {
        toast.error(error.response?.data?.message || "Booking failed. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return bookingData.duration !== "" && bookingData.therapistGender !== ""
      case 2:
        return bookingData.date !== "" && bookingData.time !== ""
      case 3:
        const hasRequiredFields =
          bookingData.address.street !== "" &&
          bookingData.address.city !== "" &&
          bookingData.address.postalCode !== "" &&
          bookingData.address.postalCode.length >= 6

        return hasRequiredFields && !validatingPostcode && isValidPostalCode
      case 4:
        return true
      default:
        return false
    }
  }

  const canProceedFromAddressStep = async () => {
    // Check basic fields
    const hasRequiredFields =
      bookingData.address.street !== "" &&
      bookingData.address.city !== "" &&
      bookingData.address.postalCode !== "" &&
      bookingData.address.postalCode.length >= 6

    if (!hasRequiredFields) {
      toast.error("Please fill in all required address fields")
      return false
    }

    // Validate postcode if not already validated
    if (!isValidPostalCode || postalCodeError) {
      const validation = await validatePostcodeWithBackend(bookingData.address.postalCode)

      if (!validation.isValid) {
        setPostalCodeError(validation.error)
        setIsValidPostalCode(false)
        toast.error("Please enter a valid postal code")
        return false
      }

      if (!validation.withinServiceArea) {
        setPostalCodeError(
          `You are ${validation.distanceFromCenter} miles from our service area (EC1Y 1AA). We serve within 10 miles of Central London.`,
        )
        setIsValidPostalCode(false)
        toast.error("This postcode is outside our service area")
        return false
      }
    }

    return true
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Distance Warning Modal */}
        {showDistanceWarning && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 transform transition-all">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-orange-100 rounded-full">
                    <AlertTriangle className="text-orange-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Service Area Notice</h3>
                    <p className="text-sm text-gray-600">Outside our 10-mile service radius</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDistanceWarning(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
                  <p className="text-orange-800 font-medium">
                    📍 Your postcode is outside our standard 10-mile service area from Central London (EC1Y 1AA)
                  </p>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  We currently don't provide services to this area. However, you can check these nearby locations that
                  might be closer to you:
                </p>
              </div>

              <div className="space-y-3 mb-8">
                {nearbyBranches.map((branch) => (
                  <div
                    key={branch.name}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-cyan-50 to-teal-50 rounded-xl border border-cyan-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-cyan-100 rounded-full">
                        <MapPin className="text-cyan-600" size={16} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{branch.name}</h4>
                        <p className="text-sm text-gray-600">{branch.postcode}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-cyan-600">{branch.distance} miles</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDistanceWarning(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDistanceWarning(false)
                    navigate("/services")
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-bold rounded-lg hover:from-cyan-700 hover:to-teal-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  Find Services
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= step.id ? "bg-cyan-600 text-white" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  <step.icon size={20} />
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${currentStep >= step.id ? "text-cyan-600" : "text-gray-500"}`}
                >
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-4 ${currentStep > step.id ? "bg-cyan-600" : "bg-gray-200"}`} />
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
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Duration & Therapist</h2>

              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">Choose Gender Therapist</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                  value={bookingData.therapistGender}
                  onChange={(e) => setBookingData({ ...bookingData, therapistGender: e.target.value })}
                >
                  <option value="male">Male Therapist</option>
                  <option value="female">Female Therapist</option>
                </select>
              </div>

              <div className="space-y-4">
                {bookingData.service.duration?.map((duration) => (
                  <div
                    key={duration}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      bookingData.duration === duration
                        ? "border-cyan-600 bg-cyan-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setBookingData({ ...bookingData, duration })}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{duration}</h3>
                        <p className="text-gray-600">{bookingData.service.title}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-cyan-600">
                          £{bookingData.service.price?.[duration.replace(" minutes", "min")] || "N/A"}
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

              {/* <div className="mb-6 p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
                <p className="text-cyan-800 text-sm">
                  <strong>Note:</strong> Time slots include service duration plus travel time. For example, a 60-minute
                  massage will block 7:00 AM, 7:30 AM, 8:00 AM, and 8:30 AM to ensure your therapist has adequate time
                  for service and travel.
                </p>
              </div> */}

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                    value={bookingData.date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setBookingData({ ...bookingData, date: e.target.value, time: "" })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                    {loadingTimeSlots && <span className="text-cyan-600 ml-2">(Loading available slots...)</span>}
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                    value={bookingData.time}
                    onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                    disabled={loadingTimeSlots || availableTimeSlots.length === 0}
                  >
                    <option value="">
                      {loadingTimeSlots
                        ? "Loading available times..."
                        : availableTimeSlots.length === 0
                          ? "No available times for this date"
                          : "Select time"}
                    </option>
                    {availableTimeSlots.map((slot) => (
                      <option key={slot.value} value={slot.value}>
                        {slot.display}
                      </option>
                    ))}
                  </select>
                  {!loadingTimeSlots && bookingData.date && bookingData.therapistGender && bookingData.duration && (
                    <p className="text-sm text-gray-600 mt-2">
                      {availableTimeSlots.length} available time slots for {bookingData.therapistGender} therapist
                      {availableTimeSlots.length > 0 && <span className="text-green-600 ml-1">✓</span>}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Address */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Where should we come?</h2>

              {/* Service Area Notice */}
              <div className="mb-6 p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
                <p className="text-cyan-800 text-sm">
                  <strong>Service Area:</strong> We serve within 10 miles of Central London (EC1Y 1AA). Your postcode
                  will be validated automatically.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code *{validatingPostcode && <span className="text-cyan-600 ml-2">(Validating...)</span>}
                    </label>
                    <input
                      type="text"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-colors ${
                        postalCodeError ? "border-red-500 bg-red-50" : "border-gray-300"
                      }`}
                      placeholder="e.g. EC1Y 1AA"
                      value={bookingData.address.postalCode}
                      onChange={(e) => handlePostalCodeChange(e.target.value.toUpperCase())}
                    />
                    {postalCodeError && <div className="mt-2 text-sm text-red-600 font-medium">{postalCodeError}</div>}
                    {isValidPostalCode && bookingData.address.postalCode.length >= 6 && !postalCodeError && (
                      <div className="mt-2 text-sm text-green-600 font-medium">
                        ✅ Postcode verified - within service area!
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
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
                      <span className="text-gray-600">Therapist:</span>
                      <span className="font-medium capitalize">{bookingData.therapistGender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{bookingData.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">
                        {generateTimeSlots().find((slot) => slot.value === bookingData.time)?.display ||
                          bookingData.time}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Address:</span>
                      <span className="font-medium">
                        {bookingData.address.street}, {bookingData.address.city}, {bookingData.address.postalCode}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-cyan-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Pricing</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service Price:</span>
                      <span className="font-medium">
                        £{bookingData.service.price?.[bookingData.duration.replace(" minutes", "min")] || 0}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-900">Total Price:</span>
                        <span className="font-bold text-cyan-600 text-xl">
                          £
                          {(bookingData.service.price?.[bookingData.duration.replace(" minutes", "min")] || 0) +
                            Math.round(
                              (bookingData.service.price?.[bookingData.duration.replace(" minutes", "min")] || 0) * 0,
                            )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    <strong>Note:</strong> After confirming this booking, you will be redirected to complete your
                    payment securely. Your postcode has been verified as within our service area.
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
                disabled={!canProceedToNextStep() || validatingPostcode}
                className="flex items-center space-x-2 px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{currentStep === 3 && validatingPostcode ? "Validating..." : "Next"}</span>
                <ChevronRight size={20} />
              </button>
            ) : (
              <button
                onClick={handleBookingSubmit}
                disabled={isLoading}
                className="flex items-center space-x-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
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