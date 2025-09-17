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

  const fallbackServices = [
    {
      title: "Deep Tissue Massage",
      description: "Therapeutic massage targeting deep muscle layers to relieve chronic tension and pain.",
      duration: ["30 minutes", "60 minutes", "90 minutes"],
      price: { "30min": 25, "60min": 50, "90min": 75 },
    },
    {
      title: "Swedish Massage",
      description: "Classic relaxation massage using long, flowing strokes to promote relaxation.",
      duration: ["30 minutes", "60 minutes", "90 minutes"],
      price: { "30min": 25, "60min": 50, "90min": 75 },
    },
    {
      title: "Sports Massage",
      description: "Specialized massage for athletes and active individuals to enhance performance.",
      duration: ["30 minutes", "60 minutes", "90 minutes"],
      price: { "30min": 25, "60min": 50, "90min": 75 },
    },
    {
      title: "Aromatherapy Massage",
      description: "Relaxing massage with essential oils to enhance mood and reduce stress.",
      duration: ["30 minutes", "60 minutes", "90 minutes"],
      price: { "30min": 25, "60min": 50, "90min": 75 },
    },
    {
      title: "Hot Stone Massage",
      description: "Therapeutic massage using heated stones to relax muscles and improve circulation.",
      duration: ["30 minutes", "60 minutes", "90 minutes"],
      price: { "30min": 25, "60min": 50, "90min": 75 },
    },
    {
      title: "Pregnancy Massage",
      description: "Gentle massage designed specifically for expectant mothers to reduce discomfort.",
      duration: ["30 minutes", "60 minutes", "90 minutes"],
      price: { "30min": 25, "60min": 50, "90min": 75 },
    },
  ]

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await axios.get("/services")
      setServices(response.data.slice(0, 3))
    } catch (error) {
      console.error("Error fetching services:", error)
      setServices(fallbackServices.slice(0, 3))
    }
  }

  const handleBookNow = () => {
    if (user) {
      navigate("/services")
    } else {
      navigate("/register")
    }
  }

  const therapists = [
    {
      id: 1,
      name: "James Jerry",
      gender: "Male",
      experience: "8+ Years Experience",
      specialties: ["Deep Tissue", "Sports Massage", "Swedish"],
      rating: 4.4,
      description: "Professional male therapist specializing in therapeutic and sports massage treatments.",
    },
    {
      id: 2,
      name: "Rina Lucy",
      gender: "Female",
      experience: "6+ Years Experience",
      specialties: ["Swedish", "Aromatherapy", "Pregnancy"],
      rating: 4.2,
      description: "Experienced female therapist with expertise in relaxation and prenatal massage therapy.",
    },
  ]

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-12 sm:py-16 lg:py-20 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight mb-4 sm:mb-6 animate-slide-up">
                Book a massage at home in <span className="text-cyan-600 block sm:inline">minutes</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0 animate-fade-in-delay">
                Professional massage therapists come to you. Same-day bookings available. Vetted, insured professionals
                at your doorstep in as little as 60 minutes.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto lg:mx-0 animate-slide-up-delay">
                <button
                  onClick={handleBookNow}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <span>Book Now</span>
                  <ArrowRight size={20} />
                </button>
                <Link
                  to="/how-it-works"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-lg transition-all duration-300 text-center border border-gray-200 transform hover:scale-105"
                >
                  How it works
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 mt-6 sm:mt-8 text-sm text-gray-600 animate-slide-up-delay-2">
                <div className="flex items-center space-x-2 hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Licensed therapists</span>
                </div>
                <div className="flex items-center space-x-2 hover:scale-110 transition-transform duration-300">
                  <Shield className="text-cyan-600" size={16} />
                  <span>Fully insured</span>
                </div>
                <div className="flex items-center space-x-2 hover:scale-110 transition-transform duration-300">
                  <Star className="text-yellow-500" size={16} />
                  <span>5-star rated</span>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative order-1 lg:order-2 animate-slide-up">
              <div className="rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-500 hover:scale-105">
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

      <section className="py-12 sm:py-16 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              {
                number: "500+",
                label: "Happy Customers",
              },
              {
                number: "50+",
                label: "Expert Therapists",
              },
              {
                number: "4.9",
                label: "Average Rating",
              },
              {
                number: "24/7",
                label: "Available",
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center animate-slide-up transform hover:scale-110 transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-cyan-600 mb-2">{stat.number}</div>
                <div className="text-sm sm:text-base text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Why choose Relax On?</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              We bring professional wellness services directly to your home, office, or hotel
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: Clock,
                title: "Fast & Convenient",
                description:
                  "Book in minutes, therapist arrives in 60 minutes or less. Same-day appointments available.",
              },
              {
                icon: Shield,
                title: "Vetted Professionals",
                description:
                  "All therapists are licensed, insured, and background-checked for your safety and peace of mind.",
              },
              {
                icon: Star,
                title: "5-Star Experience",
                description:
                  "Consistently rated 5 stars by customers. Professional equipment and premium oils included.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-6 sm:p-8 text-center shadow-sm hover:shadow-md transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 animate-slide-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6 transform transition-all duration-300 hover:scale-110 hover:bg-cyan-200">
                  <feature.icon className="text-cyan-600" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Popular Services</h2>
            <p className="text-lg sm:text-xl text-gray-600">Choose from our range of professional massage treatments</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
            {services.map((service, index) => {
              const imageUrl = service.image ? `${IMAGE_BASE_URL}${service.image}` : "/placeholder.svg"

              return (
                <div
                  key={service._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="aspect-w-16 aspect-h-10 group">
                    <img
                      src={imageUrl || "/placeholder.svg"}
                      alt={service.title}
                      className="w-full h-48 sm:h-56 object-cover transition-transform duration-500 group-hover:scale-110"
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
                      <span className="text-xl sm:text-2xl font-bold text-cyan-600">
                        €{service.price?.["30min"] || "25"}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-500">30 minutes</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="text-center animate-fade-in">
            <Link
              to="/services"
              className="inline-block bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              View All Services
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8 animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Professional Therapists</h2>
            <p className="text-lg text-gray-600">Choose from our experienced male and female therapists</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {therapists.map((therapist, index) => (
              <div
                key={therapist.id}
                className="bg-gray-50 rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 animate-slide-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="relative overflow-hidden h-48 group">
                  <img
                    src={
                      therapist.gender === "Male"
                        ? "https://media.istockphoto.com/id/915704700/photo/whatever-pain-you-have-we-will-sort-it-out.jpg?s=612x612&w=0&k=20&c=K2q0npEXddIThgfKp5GvMVkjGGa_0JuuS8wjICfS2K0="
                        : "https://www.beckfield.edu/wp-content/uploads/2022/04/iStock-1079106430-scaled.jpg"
                    }
                    alt={`${therapist.name} - ${therapist.gender} Therapist`}
                    className="w-full h-70 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1 shadow-lg transform transition-all duration-300 hover:scale-110">
                    <Star className="text-yellow-400 fill-current" size={10} />
                    <span className="text-sm font-bold">{therapist.rating}</span>
                  </div>
                </div>

                <div className="p-8">
                  <div className="flex items-center space-x-4 mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{therapist.name}</h3>
                      <p className="text-cyan-600 font-medium">{therapist.gender} Therapist</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <Star className="text-yellow-400 fill-current" size={14} />
                        <span className="text-sm font-medium text-gray-600">{therapist.rating}/5</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">{therapist.description}</p>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">{therapist.experience}</p>
                    <div className="flex flex-wrap gap-2">
                      {therapist.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-cyan-100 text-cyan-800 text-xs font-medium rounded-full hover:bg-cyan-200 transition-colors duration-300"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-gradient-to-b from-cyan-600 to-cyan-900 animate-fade-in">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-6 animate-slide-up">
            Ready to relax at home?
          </h2>
          <p className="text-lg sm:text-xl text-cyan-100 mb-6 sm:mb-8 max-w-2xl mx-auto animate-fade-in-delay">
            Book your massage now and have a professional therapist at your door in 60 minutes
          </p>
          <button
            onClick={handleBookNow}
            className="bg-white text-cyan-800 hover:bg-gray-200 font-semibold text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 animate-slide-up-delay"
          >
            Book Your Massage
          </button>
        </div>
      </section>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-up {
          from { 
            opacity: 0; 
            transform: translateY(30px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-fade-in-delay {
          animation: fade-in 0.8s ease-out 0.3s both;
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }
        
        .animate-slide-up-delay {
          animation: slide-up 0.8s ease-out 0.2s both;
        }
        
        .animate-slide-up-delay-2 {
          animation: slide-up 0.8s ease-out 0.4s both;
        }
      `}</style>
    </div>
  )
}

export default Home
