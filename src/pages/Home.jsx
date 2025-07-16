"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { IMAGE_BASE_URL } from "../context/AuthContext"
import { Clock, Shield, Star, ArrowRight, CheckCircle } from "lucide-react"
import axios from "axios"

const Home = () => {
  const [services, setServices] = useState([])
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await axios.get("/services")
      setServices(response.data.slice(0, 3))
    } catch (error) {
      console.error("Error fetching services:", error)
    }
  }

  const handleBookNow = () => {
    if (user) {
      navigate("/services")
    } else {
      navigate("/register")
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section - Clean without floating card */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight mb-4 sm:mb-6">
                Book a massage at home in <span className="text-blue-600 block sm:inline">minutes</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Professional massage therapists come to you. Same-day bookings available. Vetted, insured professionals
                at your doorstep in as little as 60 minutes.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto lg:mx-0">
                <button
                  onClick={handleBookNow}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  <span>Book Now</span>
                  <ArrowRight size={20} />
                </button>
                <Link
                  to="/how-it-works"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-lg transition-colors text-center border border-gray-200"
                >
                  How it works
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 mt-6 sm:mt-8 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Licensed therapists</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="text-blue-500" size={16} />
                  <span>Fully insured</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="text-yellow-500" size={16} />
                  <span>5-star rated</span>
                </div>
              </div>
            </div>

            {/* Hero Image - Clean without floating card */}
            <div className="relative order-1 lg:order-2">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://img.freepik.com/premium-photo/relaxed-man-enjoying-back-massage-with-herbal-compress-spa-treatment_637285-2252.jpg"
                  alt="Professional massage therapy at home"
                  className="w-full h-64 sm:h-80 lg:h-96 xl:h-[500px] object-cover"
                  onError={(e) => {
                    e.target.src = "/placeholder.svg?height=500&width=600&text=Professional+Massage"
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-sm sm:text-base text-gray-600">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-sm sm:text-base text-gray-600">Expert Therapists</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600 mb-2">4.9</div>
              <div className="text-sm sm:text-base text-gray-600">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-sm sm:text-base text-gray-600">Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Why choose Urban Massage?</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              We bring professional wellness services directly to your home, office, or hotel
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white rounded-xl p-6 sm:p-8 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Fast & Convenient</h3>
              <p className="text-gray-600 leading-relaxed">
                Book in minutes, therapist arrives in 60 minutes or less. Same-day appointments available.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 sm:p-8 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Vetted Professionals</h3>
              <p className="text-gray-600 leading-relaxed">
                All therapists are licensed, insured, and background-checked for your safety and peace of mind.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 sm:p-8 text-center shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">5-Star Experience</h3>
              <p className="text-gray-600 leading-relaxed">
                Consistently rated 5 stars by customers. Professional equipment and premium oils included.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Popular Services</h2>
            <p className="text-lg sm:text-xl text-gray-600">Choose from our range of professional massage treatments</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
            {services.map((service) => {
              const imageUrl = service.image ? `${IMAGE_BASE_URL}${service.image}` : "/placeholder.svg"

              return (
                <div
                  key={service._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="aspect-w-16 aspect-h-10">
                    <img
                      src={imageUrl || "/placeholder.svg"}
                      alt={service.title}
                      className="w-full h-48 sm:h-56 object-cover"
                      onError={(e) => {
                        e.target.src = `/placeholder.svg?height=200&width=300&text=${encodeURIComponent(service.title)}`
                      }}
                    />
                  </div>
                  <div className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex-1">{service.title}</h3>
                      <div className="flex items-center space-x-1 ml-2">
                        <Star className="text-yellow-400 fill-current" size={16} />
                        <span className="text-sm text-gray-600">4.9</span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4 text-sm sm:text-base line-clamp-2">{service.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl sm:text-2xl font-bold text-blue-600">
                        ${service.price?.["60min"] || "N/A"}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-500">60 minutes</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="text-center">
            <Link
              to="/services"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">Ready to relax at home?</h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Book your massage now and have a professional therapist at your door in 60 minutes
          </p>
          <button
            onClick={handleBookNow}
            className="bg-white text-blue-600 hover:bg-gray-50 font-semibold text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-lg transition-colors shadow-lg hover:shadow-xl"
          >
            Book Your Massage
          </button>
        </div>
      </section>
    </div>
  )
}

export default Home
