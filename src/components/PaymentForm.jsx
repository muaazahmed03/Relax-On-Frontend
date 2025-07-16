"use client"

import { useState } from "react"
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { CreditCard, Lock, CheckCircle } from "lucide-react"
import axios from "axios"
import toast from "react-hot-toast"

const PaymentForm = ({ booking, onPaymentSuccess }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [paymentError, setPaymentError] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setLoading(true)
    setPaymentError(null)

    try {
      console.log("🚀 Starting payment process for booking:", booking._id)

      // Create payment intent
      const { data } = await axios.post("/payments/create-payment-intent", {
        bookingId: booking._id,
        amount: booking.totalAmount * 100, // Convert to cents
      })

      console.log("✅ Payment intent created:", data.clientSecret)

      const cardElement = elements.getElement(CardElement)

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: booking.userId?.name || "Customer",
            email: booking.userId?.email || "",
          },
        },
      })

      if (error) {
        console.error("❌ Payment error:", error)
        setPaymentError(error.message)
        toast.error(error.message)
      } else if (paymentIntent.status === "succeeded") {
        console.log("🎉 Payment succeeded:", paymentIntent.id)

        // Update booking status
        await axios.put(`/bookings/${booking._id}/payment-success`, {
          paymentIntentId: paymentIntent.id,
        })

        toast.success("Payment successful!")
        onPaymentSuccess()
      }
    } catch (error) {
      console.error("❌ Payment process error:", error)
      const errorMessage = error.response?.data?.message || "Payment failed"
      setPaymentError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const cardElementOptions = {
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
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <CreditCard className="text-blue-600" size={24} />
        <h2 className="text-xl font-semibold text-gray-900">Payment Details</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Card Information</label>
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        {paymentError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{paymentError}</p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Lock className="text-blue-600" size={16} />
            <p className="text-blue-800 text-sm">Your payment information is secure and encrypted</p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
            <span className="text-2xl font-bold text-blue-600">${booking.totalAmount}</span>
          </div>

          <button
            type="submit"
            disabled={!stripe || loading}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processing Payment...</span>
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                <span>Pay ${booking.totalAmount}</span>
              </>
            )}
          </button>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">By completing this payment, you agree to our terms of service</p>
        </div>
      </form>
    </div>
  )
}

export default PaymentForm
