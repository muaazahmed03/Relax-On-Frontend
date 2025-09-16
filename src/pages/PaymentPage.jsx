"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js"
import { ArrowLeft, Calendar, Clock, MapPin, User, CreditCard, Lock } from "lucide-react"
import axios from "axios"
import toast from "react-hot-toast"

const PaymentPage = () => {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const stripe = useStripe()
  const elements = useElements()

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [clientSecret, setClientSecret] = useState("")

  useEffect(() => {
    console.log("🔍 Payment page loaded for booking:", bookingId)
    console.log("📋 Location state:", location.state)

    if (location.state?.booking) {
      console.log("✅ Using booking data from state")
      setBooking(location.state.booking)
      createPaymentIntent(location.state.booking.totalAmount)
      setLoading(false)
    } else {
      console.log("📡 Fetching booking details from API")
      fetchBookingDetails()
    }
  }, [bookingId, location.state])

  const fetchBookingDetails = async () => {
    try {
      console.log("📡 Fetching booking details...")
      const response = await axios.get(`/bookings/${bookingId}`)

      console.log("✅ Booking details response:", response.data)

      if (response.data.success) {
        setBooking(response.data.booking)
        // Create payment intent
        await createPaymentIntent(response.data.booking.totalAmount)
      } else {
        toast.error("Booking not found")
        navigate("/dashboard")
      }
    } catch (error) {
      console.error("❌ Error fetching booking:", error)
      toast.error("Failed to load booking details")
      navigate("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const createPaymentIntent = async (amount) => {
    try {
      console.log("💳 Creating payment intent for amount:", amount)

      const response = await axios.post("/payments/create-payment-intent", {
        amount: amount * 100, // Convert to pence
        bookingId,
      })

      console.log("✅ Payment intent created:", response.data)

      if (response.data.success) {
        setClientSecret(response.data.clientSecret)
      } else {
        toast.error("Failed to initialize payment")
      }
    } catch (error) {
      console.error("❌ Error creating payment intent:", error)
      toast.error("Payment initialization failed")
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!stripe || !elements || !clientSecret) {
      toast.error("Payment system not ready")
      return
    }

    setProcessing(true)

    try {
      console.log("🚀 Processing payment...")

      const card = elements.getElement(CardElement)

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: card,
          billing_details: {
            name: booking?.userId?.name || "Customer",
            email: booking?.userId?.email || "",
          },
        },
      })

      if (error) {
        console.error("❌ Payment failed:", error)
        toast.error(error.message)
      } else if (paymentIntent.status === "succeeded") {
        console.log("🎉 Payment succeeded:", paymentIntent.id)

         // API call to update booking status on backend
        // Yahan par payment status ko 'paid' mein update kiya ja raha hai
        await axios.put(`/bookings/${bookingId}/payment`, {
          status: 'confirmed', // 'confirmed' ya 'paid' jo bhi aap use kar rahe hain
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        
        // Is line se user ko dashboard par refresh ke liye signal milega
        navigate("/dashboard", { state: { refreshBookings: true } })
        
        toast.success("Payment successful!")

      }
    } catch (error) {
      console.error("❌ Payment processing error:", error)
      toast.error("Payment failed. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  const updateBookingStatus = async (paymentIntentId) => {
    try {
      console.log("📝 Updating booking status...")
      await axios.patch(`/bookings/${bookingId}/payment`, {
        paymentIntentId,
      })
      console.log("✅ Booking status updated")
    } catch (error) {
      console.error("❌ Error updating booking status:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h2>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Payment</h1>
          <p className="text-gray-600 mt-2">Booking ID: {booking.bookingId || booking._id}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Booking Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Booking Summary</h2>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="text-blue-600" size={16} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{booking.service?.title || booking.serviceId?.title}</p>
                  <p className="text-gray-600 text-sm">
                    {booking.service?.description || booking.serviceId?.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Clock className="text-green-600" size={16} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {new Date(booking.date).toLocaleDateString()} at {booking.time}
                  </p>
                  <p className="text-gray-600 text-sm">Duration: {booking.duration}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="text-purple-600" size={16} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Service Location</p>
                  <p className="text-gray-600 text-sm">
                    {booking.address?.street && booking.address?.city && booking.address?.postalCode
                      ? `${booking.address.street}, ${booking.address.city}, ${booking.address.postalCode}`
                      : booking.address || "Address not provided"}
                  </p>
                  {booking.preferredBranch && (
                    <p className="text-gray-500 text-xs mt-1">Branch: {booking.preferredBranch}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <User className="text-orange-600" size={16} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Therapist</p>
                  <p className="text-gray-600 text-sm">
                    {booking.therapistGender
                      ? `${booking.therapistGender.charAt(0).toUpperCase() + booking.therapistGender.slice(1)} Therapist`
                      : "Auto-assigned (Best available)"}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 mt-6 pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service Fee:</span>
                  <span className="font-medium">£{booking.servicePrice || booking.service?.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Platform Fee:</span>
                  <span className="font-medium">£{booking.platformFee || 0}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total Amount:</span>
                    <span className="font-bold text-cyan-500 text-xl">£{booking.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <CreditCard className="text-cyan-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-900">Payment Details</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Card Information</label>
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: "16px",
                          color: "#424770",
                          "::placeholder": {
                            color: "#aab7c4",
                          },
                        },
                        invalid: {
                          color: "#9e2146",
                        },
                      },
                    }}
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Lock className="text-blue-600" size={16} />
                  <p className="text-blue-800 text-sm">Your payment information is secure and encrypted</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={!stripe || processing || !clientSecret}
                className="w-full bg-cyan-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={20} />
                    <span>Pay £{booking.totalAmount}</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">By completing this payment, you agree to our terms of service</p>
              <p className="text-xs text-gray-400 mt-1">🔒 Powered by Stripe</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentPage
