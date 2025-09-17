"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { IMAGE_BASE_URL } from "../context/AuthContext"
import { Clock, Star, MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import axios from "axios"
import toast from "react-hot-toast"

const Services = () => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentLocationIndex, setCurrentLocationIndex] = useState(0)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await axios.get("/services")
      console.log("Services data:", response.data)
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

  const fallbackServices = [
    {
      title: "Deep Tissue Massage",
      description: "Therapeutic massage targeting deep muscle layers to relieve chronic tension and pain.",
      duration: ["60 minutes", "90 minutes"],
      price: { "60min": "120", "90min": "170" },
    },
    {
      title: "Swedish Massage",
      description: "Classic relaxation massage using long, flowing strokes to promote relaxation.",
      duration: ["60 minutes", "90 minutes"],
      price: { "60min": "100", "90min": "140" },
    },
    {
      title: "Sports Massage",
      description: "Specialized massage for athletes and active individuals to enhance performance.",
      duration: ["60 minutes", "90 minutes"],
      price: { "60min": "130", "90min": "180" },
    },
    {
      title: "Aromatherapy Massage",
      description: "Relaxing massage with essential oils to enhance mood and reduce stress.",
      duration: ["60 minutes", "90 minutes"],
      price: { "60min": "110", "90min": "150" },
    },
    {
      title: "Hot Stone Massage",
      description: "Therapeutic massage using heated stones to relax muscles and improve circulation.",
      duration: ["60 minutes", "90 minutes"],
      price: { "60min": "140", "90min": "190" },
    },
    {
      title: "Pregnancy Massage",
      description: "Gentle massage designed specifically for expectant mothers to reduce discomfort.",
      duration: ["60 minutes", "90 minutes"],
      price: { "60min": "115", "90min": "155" },
    },
  ]

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

  const londonLocations = [
    {
      name: "Hackney",
      image:
        "https://offloadmedia.feverup.com/secretldn.com/wp-content/uploads/2016/11/25120826/397df08f-fc78-45b0-b159-d0312fa60db8.jpg",
    },
    {
      name: "Stratford",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwNj6upCmGZfUV01KG6_CshG5FtXKhuxdSag&s",
    },
    {
      name: "Camden Town",
      image:
        "https://cdn.sanity.io/images/0flxhg4o/production/9b26f341587bb9575ac374cfd44003e1e46c306b-612x407.jpg?w=3840&q=70&auto=format",
    },
    {
      name: "Finsbury Park",
      image:
        "https://ents24.imgix.net/image/000/238/882/a746facefa4b1197728fdc56399d42b46f394bef.jpg?auto=format&crop=faces&w=600&h=350&q=50",
    },
    {
      name: "Walthamstow",
      image:
        "https://www.walthamforest.gov.uk/sites/default/files/styles/x_small_3_2_546_x_364_/public/2024-02/Walthamstow%20Market_900px.jpg.webp?itok=B2jy2LQO",
    },
    {
      name: "Notting Hill",
      image: "https://lp-cms-production.imgix.net/2024-08/GettyRF501568040.jpg?auto=format,compress&q=72&fit=crop",
    },
    {
      name: "Hammersmith",
      image:
        "https://offloadmedia.feverup.com/secretldn.com/wp-content/uploads/2024/06/04153656/shutterstock_2136107763-1-1024x676.jpg",
    },
    {
      name: "Brixton",
      image: "https://www.shutterstock.com/image-photo/london-february-2018-wide-angle-600nw-1023815050.jpg",
    },
    {
      name: "Southwark",
      image:
        "https://www.ft.com/__origami/service/image/v2/images/raw/http%3A%2F%2Fcom.ft.imagepublish.upp-prod-eu.s3.amazonaws.com%2F4146fd58-fe7a-11e8-aebf-99e208d3e521?source=next-article&fit=scale-down&quality=highest&width=700&dpr=1",
    },
    {
      name: "Canary Wharf",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhCmiaXfcSu0Hf8BWbbcGVaym_LXCbemnO4g&s",
    },
    {
      name: "Canning Town",
      image:
        "https://images.squarespace-cdn.com/content/v1/5a0c05169f07f51c64a336a2/1591372856902-HMXDVEMY9WG6ZPG75YJ4/Canning+Town+leading+image",
    },
    {
      name: "Westminster",
      image: "https://a.travel-assets.com/findyours-php/viewfinder/images/res70/542000/542170-westminster-bridge.jpg",
    },
    { name: "Battersea", image: "https://i.natgeofe.com/n/d98e9124-af77-444b-b92b-97f383d25d2f/battersea.png" },
    {
      name: "Clapham Common",
      image:
        "https://images.squarespace-cdn.com/content/v1/58ecaded15d5db8a631e8a5c/1573574225371-F6B3JDV9HR9JAJA89WEJ/Clapham+Common+Bandstand+3+SV-min.jpg?format=1500w",
    },
    {
      name: "Paddington",
      image: "https://c8.alamy.com/comp/ADXH4E/mansion-houses-near-paddington-station-london-england-ADXH4E.jpg",
    },
    {
      name: "Shepherd's Bush",
      image:
        "https://i.guim.co.uk/img/static/sys-images/Travel/Pix/gallery/2013/1/1/1357040869823/Shepherds-Bush-Market-008.jpg?width=465&dpr=1&s=none&crop=none",
    },
  ]

  const nextLocations = () => {
    setCurrentLocationIndex((prev) => (prev + 1) % Math.ceil(londonLocations.length / 4))
  }

  const prevLocations = () => {
    setCurrentLocationIndex(
      (prev) => (prev - 1 + Math.ceil(londonLocations.length / 4)) % Math.ceil(londonLocations.length / 4),
    )
  }

  useEffect(() => {
    const interval = setInterval(nextLocations, 4000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-cyan-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading our premium services...</p>
        </div>
      </div>
    )
  }

  const displayServices = services.length > 0 ? services.slice(0, 6) : fallbackServices

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-r from-cyan-700 via-cyan-600 to-cyan-700 text-white py-20 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight animate-slide-up">
            Premium Home Massage Services
            <span className="block text-blue-200 text-3xl md:text-4xl font-light mt-2 animate-slide-up-delay">
              Delivered to Your Door
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed animate-fade-in-delay">
            Professional therapeutic massage treatments delivered to your home or office by certified therapists across
            London
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm animate-slide-up-delay-2">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <Star className="text-yellow-400 fill-current" size={16} />
              <span>4.9/5 Rating</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <Clock className="text-blue-200" size={16} />
              <span>7am - 10pm Daily</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <span>Home Service Available</span>
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Premium Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional massage therapy delivered to your home or office across London
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {displayServices.map((service, index) => {
              const imageUrl = service.image
                ? `${IMAGE_BASE_URL}${service.image}`
                : `/placeholder.svg?height=200&width=350&text=${encodeURIComponent(service.title)}`

              return (
                <div
                  key={service._id || index}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative overflow-hidden group">
                    <img
                      src={imageUrl || "/placeholder.svg"}
                      alt={service.title}
                      className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.target.src = `/placeholder.svg?height=192&width=350&text=${encodeURIComponent(service.title)}`
                      }}
                    />
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1 shadow-lg transform transition-all duration-300 hover:scale-110">
                      <Star className="text-yellow-400 fill-current" size={12} />
                      <span className="text-sm font-bold">4.9</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">{service.description}</p>

                    <div className="space-y-3 mb-6">
                      {service.duration?.slice(0, 3).map((duration, idx) => (
                        <div
                          key={duration}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors duration-300"
                        >
                          <div className="flex items-center space-x-2">
                            <Clock size={14} className="text-cyan-600" />
                            <span className="text-gray-700 font-medium">{duration}</span>
                          </div>
                          <span className="font-bold text-cyan-600 text-lg">
                            £{service.price?.[duration.replace(" minutes", "min")] || "N/A"}
                          </span>
                        </div>
                      )) || (
                        <>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors duration-300">
                            <div className="flex items-center space-x-2">
                              <Clock size={14} className="text-cyan-600" />
                              <span className="text-gray-700 font-medium">60 minutes</span>
                            </div>
                            <span className="font-bold text-cyan-600 text-lg">From £100</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors duration-300">
                            <div className="flex items-center space-x-2">
                              <Clock size={14} className="text-cyan-600" />
                              <span className="text-gray-700 font-medium">90 minutes</span>
                            </div>
                            <span className="font-bold text-cyan-600 text-lg">From £140</span>
                          </div>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => handleBookService(service)}
                      className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                    >
                      Book at Home
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mb-12">
            <div className="text-center mb-8 animate-fade-in">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Professional Therapists</h2>
              <p className="text-lg text-gray-600">Choose from our experienced male and female therapists</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {therapists.map((therapist, index) => (
                <div
                  key={therapist.id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 animate-slide-up"
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

          <div className="mb-12">
            <div className="text-center mb-8 animate-fade-in">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Available in These Locations</h2>
              <p className="text-lg text-gray-600">We provide home massage services across London</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 relative overflow-hidden">
              <div className="hidden md:block">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={prevLocations}
                    className="p-2 rounded-full bg-cyan-100 hover:bg-cyan-200 text-cyan-600 transition-all duration-300 hover:scale-110 hover:shadow-md"
                    aria-label="Previous locations"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={nextLocations}
                    className="p-2 rounded-full bg-cyan-100 hover:bg-cyan-200 text-cyan-600 transition-all duration-300 hover:scale-110 hover:shadow-md"
                    aria-label="Next locations"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                <div className="overflow-hidden">
                  <div
                    className="flex transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(-${currentLocationIndex * 100}%)` }}
                  >
                    {Array.from({ length: Math.ceil(londonLocations.length / 4) }).map((_, slideIndex) => (
                      <div key={slideIndex} className="w-full flex-shrink-0">
                        <div className="grid grid-cols-4 gap-4">
                          {londonLocations.slice(slideIndex * 4, (slideIndex + 1) * 4).map((location, index) => (
                            <div
                              key={index}
                              className="bg-gradient-to-br from-cyan-50 to-indigo-50 rounded-xl p-4 border border-blue-100 hover:shadow-lg transition-all duration-500 transform hover:-translate-y-2 hover:scale-105"
                            >
                              <div className="text-center">
                                <img
                                  src={location.image || "/placeholder.svg"}
                                  alt={location.name}
                                  className="w-full h-30 object-cover rounded-lg mb-3 transition-transform duration-300 hover:scale-110"
                                />
                                <div className="flex items-center justify-center space-x-2">
                                  <MapPin className="text-cyan-600 flex-shrink-0" size={14} />
                                  <span className="text-sm font-medium text-gray-800">{location.name}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="md:hidden">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={prevLocations}
                    className="p-2 rounded-full bg-cyan-100 hover:bg-cyan-200 text-cyan-600 transition-all duration-300 hover:scale-110"
                    aria-label="Previous locations"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={nextLocations}
                    className="p-2 rounded-full bg-cyan-100 hover:bg-cyan-200 text-cyan-600 transition-all duration-300 hover:scale-110"
                    aria-label="Next locations"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                <div className="overflow-hidden">
                  <div
                    className="flex transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(-${currentLocationIndex * 100}%)` }}
                  >
                    {Array.from({ length: Math.ceil(londonLocations.length / 2) }).map((_, slideIndex) => (
                      <div key={slideIndex} className="w-full flex-shrink-0">
                        <div className="grid grid-cols-2 gap-3">
                          {londonLocations.slice(slideIndex * 2, (slideIndex + 1) * 2).map((location, index) => (
                            <div
                              key={index}
                              className="bg-gradient-to-br from-cyan-50 to-indigo-50 rounded-xl p-3 border border-blue-100 hover:shadow-lg transition-all duration-500 hover:scale-105"
                            >
                              <div className="text-center">
                                <img
                                  src={location.image || "/placeholder.svg"}
                                  alt={location.name}
                                  className="w-full h-12 object-cover rounded-lg mb-2 transition-transform duration-300 hover:scale-110"
                                />
                                <div className="flex items-center justify-center space-x-1">
                                  <MapPin className="text-cyan-600 flex-shrink-0" size={12} />
                                  <span className="text-xs font-medium text-gray-800">{location.name}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-center mt-6 space-x-2">
                {Array.from({ length: Math.ceil(londonLocations.length / (window.innerWidth >= 768 ? 4 : 2)) }).map(
                  (_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentLocationIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 hover:scale-125 ${
                        currentLocationIndex === index ? "bg-cyan-600" : "bg-gray-300"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white py-16 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold mb-4 animate-slide-up">Ready to Experience Premium Massage at Home?</h3>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto animate-fade-in-delay">
            Join thousands of satisfied customers across London who trust us for their wellness needs.
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-sm animate-slide-up-delay">
            <div className="flex items-center space-x-2 hover:scale-110 transition-transform duration-300">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Certified Therapists</span>
            </div>
            <div className="flex items-center space-x-2 hover:scale-110 transition-transform duration-300">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>Same-Day Booking</span>
            </div>
            <div className="flex items-center space-x-2 hover:scale-110 transition-transform duration-300">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span>Premium Equipment</span>
            </div>
            <div className="flex items-center space-x-2 hover:scale-110 transition-transform duration-300">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span>Satisfaction Guaranteed</span>
            </div>
          </div>
        </div>
      </div>

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

export default Services
