"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { IMAGE_BASE_URL } from "../context/AuthContext"
import { Clock, Star } from "lucide-react"
import axios from "axios"
import toast from "react-hot-toast"

const Services = () => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await axios.get("/services")
      console.log("Services data:", response.data) // Debug line
      setServices(response.data)
    } catch (error) {
      toast.error("Failed to load services")
    } finally {
      setLoading(false)
    }
  }

  const handleBookService = (service) => {
    if (!user) {
      toast.error("Please login to book a service")
      navigate("/login")
      return
    }
    navigate("/booking", { state: { service } })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose from our range of professional massage treatments, all performed by licensed and vetted therapists
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => {
            console.log("Service image:", service.image) // Debug line
            const imageUrl = service.image ? `${IMAGE_BASE_URL}${service.image}` : "/placeholder.svg"
            console.log("Full image URL:", imageUrl) // Debug line

            return (
              <div
                key={service._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <img
                  src={imageUrl || "/placeholder.svg"}
                  alt={service.title}
                  className="w-full h-48 sm:h-56 object-cover"
                  onError={(e) => {
                    console.log("Image failed to load:", imageUrl) // Debug line
                    e.target.src = `/placeholder.svg?height=200&width=300&text=${encodeURIComponent(service.title)}`
                  }}
                />
                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex-1">{service.title}</h3>
                    <div className="flex items-center space-x-1 ml-2">
                      <Star className="text-yellow-400 fill-current" size={16} />
                      <span className="text-sm text-gray-600">4.9</span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 text-sm sm:text-base line-clamp-2">{service.description}</p>

                  <div className="space-y-3 mb-6">
                    {service.duration?.map((duration) => (
                      <div key={duration} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Clock size={16} className="text-gray-500" />
                          <span className="text-gray-700">{duration}</span>
                        </div>
                        <span className="font-semibold text-blue-600">
                          ${service.price?.[duration.replace(" minutes", "min")] || "N/A"}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleBookService(service)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {services.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No services available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Services
