"use client"

import { useLocation, Link } from "react-router-dom"
import { CheckCircle, Calendar, Clock, MapPin, User } from "lucide-react"

const BookingSuccess = () => {
  const location = useLocation()
  const booking = location.state?.booking

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No booking information found.</p>
          <Link to="/" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
            Go to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600" size={32} />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">Booking Confirmed!</h1>
          <p className="text-xl text-gray-600 mb-8">
            Your massage has been successfully booked. We'll send you a confirmation email shortly.
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="text-gray-400" size={16} />
                  <span className="text-gray-600">Date & Time:</span>
                </div>
                <span className="font-medium">
                  {booking.date} at {booking.time}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="text-gray-400" size={16} />
                  <span className="text-gray-600">Duration:</span>
                </div>
                <span className="font-medium">{booking.duration}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="text-gray-400" size={16} />
                  <span className="text-gray-600">Location:</span>
                </div>
                <span className="font-medium">{booking.address?.street}</span>
              </div>
              {booking.therapistId && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="text-gray-400" size={16} />
                    <span className="text-gray-600">Therapist:</span>
                  </div>
                  <span className="font-medium">{booking.therapistId.name}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Booking ID:</span>
                  <span className="font-mono font-medium">{booking.bookingId}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-bold text-green-600 text-lg">${booking.totalAmount}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• We'll confirm your therapist within 30 minutes</li>
              <li>• You'll receive SMS updates about your booking</li>
              <li>• Your therapist will arrive 5-10 minutes early</li>
              <li>• Payment will be processed after your session</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              View My Bookings
            </Link>
            <Link
              to="/"
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingSuccess
