"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Menu, X, User, Calendar, LogOut } from "lucide-react"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/")
    setShowUserMenu(false)
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden border-2 border-black">
              <img
                src="/logo.png"
                alt="Relax On Admin Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-lg sm:text-xl font-bold text-cyan-600 hidden xs:block">Relax On</span>
            <span className="text-lg sm:text-xl font-bold text-cyan-600 xs:hidden">Relax On</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <Link to="/services" className="text-gray-600 hover:text-cyan-600 transition-colors font-medium">
              Services
            </Link>
            <Link to="/how-it-works" className="text-gray-600 hover:text-cyan-600 transition-colors font-medium">
              How it works
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-cyan-600 transition-colors font-medium"
                >
                  <User size={18} />
                  <span className="hidden lg:block">{user.name}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                    <Link
                      to="/dashboard"
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-cyan-200 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Calendar size={16} />
                      <span>My Bookings</span>
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-cyan-200 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User size={16} />
                      <span>Profile</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-cyan-200 w-full text-left transition-colors"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3 sm:space-x-4">
                <Link to="/login" className="text-gray-600 hover:text-cyan-600 transition-colors font-medium">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2 px-3 sm:px-4 rounded-lg transition-colors text-sm sm:text-base"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-4">
              <Link
                to="/services"
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium py-2"
                onClick={() => setIsOpen(false)}
              >
                Services
              </Link>
              <Link
                to="/how-it-works"
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium py-2"
                onClick={() => setIsOpen(false)}
              >
                How it works
              </Link>

              {user ? (
                <>
                  <div className="border-t border-gray-100 pt-4">
                    <div className="text-sm text-gray-500 mb-2">Hello, {user.name}</div>
                  </div>
                  <Link
                    to="/dashboard"
                    className="text-gray-600 hover:text-blue-600 transition-colors font-medium py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    My Bookings
                  </Link>
                  <Link
                    to="/profile"
                    className="text-gray-600 hover:text-blue-600 transition-colors font-medium py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-left text-gray-600 hover:text-blue-600 transition-colors font-medium py-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <div className="border-t border-gray-100 pt-4 space-y-4">
                    <Link
                      to="/login"
                      className="block text-gray-600 hover:text-blue-600 transition-colors font-medium py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-center"
                      onClick={() => setIsOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
