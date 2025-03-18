"use client";

import { useState, useEffect } from "react";
import { motion, useScroll } from "framer-motion";
import Link from "next/link";
import { User, LogOut } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Define the User type
interface UserType {
  _id: string
  name: string
  email: string
  phone: number
  department: string
  rollNo: number
  year: number
  group: number
  points: number
  password: string
  createdAt: string
  updatedAt: string
  __v: number
  role?: string // Added role field
  image: {
    public_id: string
    url: string
  }
  registeredEvents: {
    eventId: string
    name: string
    date: string
  }[]
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { scrollY } = useScroll()
  const [user, setUser] = useState<UserType | null>(null)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsMounted(true)
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  useEffect(() => {
    if (!isMounted) return
    const unsubscribe = scrollY.on("change", (y) => {
      setIsScrolled(y > 50)
    })
    return () => unsubscribe()
  }, [scrollY, isMounted])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen)
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    setUser(null)
    setIsProfileMenuOpen(false)
    // Redirect to home page
    window.location.href = "/"
  }

  // Function to navigate to the appropriate dashboard based on user role
  const navigateToDashboard = () => {
    if (user?.role === "admin") {
      router.push("/admindashboard")
    } else {
      router.push("/userdashboard")
    }
    setIsProfileMenuOpen(false) // Close the profile menu after navigation
  }

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 transition-all"
      initial={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      animate={{
        backgroundColor: isScrolled ? "rgba(0,0,0,0.9)" : "rgba(0,0,0,0.5)",
        boxShadow: isScrolled ? "0 4px 20px rgba(0,0,0,0.3)" : "none",
      }}
      suppressHydrationWarning
    >
      <div className="max-w-7xl mx-auto px-4">
        {/* Top navigation */}
        <div className="flex items-center justify-between py-3 border-b border-gray-800">
          <div className="flex items-center justify-between w-full md:w-auto md:justify-start md:space-x-8">
            <Image src="/logo.png" alt="logo" width={50} height={50} />

            {/* Mobile menu button */}
            <button className="md:hidden text-white focus:outline-none" onClick={toggleMobileMenu}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6 text-sm text-white font-medium">
              <Link href="/" className="hover:text-red-500 transition-colors py-1">
                Home
              </Link>
              <Link href="/about" className="hover:text-red-500 transition-colors py-1">
                About
              </Link>
              <Link href="/event" className="hover:text-red-500 transition-colors py-1">
                Events
              </Link>
              <Link href="/gallery" className="hover:text-red-500 transition-colors py-1">
                Gallery
              </Link>
            </nav>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            {/* Profile button */}
            {user ? (
              <div className="relative">
                <motion.button
                  className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleProfileMenu}
                >
                  <Image
                    src={user.image?.url || "/user.png"}
                    alt="profile"
                    width={40}
                    height={40}
                    className="rounded-full object-cover border-white h-12 w-12"
                  />
                </motion.button>
                
                {/* Profile dropdown menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-black bg-opacity-90 border border-gray-800 rounded shadow-lg">
                    <div className="p-3 border-b border-gray-800">
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-gray-400 text-xs">{user.email}</p>
                      {user.role === "admin" && (
                        <span className="inline-block px-2 py-1 text-xs font-semibold text-red-500 bg-red-900 bg-opacity-30 rounded mt-1">Admin</span>
                      )}
                    </div>
                    <button 
                      onClick={navigateToDashboard} 
                      className="block w-full text-left px-4 py-2 text-white hover:bg-gray-800 transition-colors"
                    >
                      Dashboard
                    </button>
                   
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-white hover:bg-gray-800 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/login">
                  <div className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded-full p-3 h-10 w-10 transition-colors">
                    <User size={16} />
                  </div>
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMounted && isMobileMenuOpen && (
        <div className="md:hidden bg-black text-white bg-opacity-95 border-b border-gray-800">
          <nav className="flex flex-col px-4 py-3 space-y-2 text-sm font-medium">
            <Link href="/" className="hover:text-red-500 transition-colors py-2 border-b border-gray-800">
              Home
            </Link>
            <Link href="/about" className="hover:text-red-500 transition-colors py-2 border-b border-gray-800">
              About
            </Link>
            <Link href="/event" className="hover:text-red-500 transition-colors py-2 border-b border-gray-800">
              Events
            </Link>
            <Link href="/gallery" className="hover:text-red-500 transition-colors py-2 border-b border-gray-800">
              Gallery
            </Link>
            
            {user ? (
              <>
                <div className="flex items-center gap-2 py-2 border-b border-gray-800">
                  <Image
                    src={user.image?.url || "/user.png"}
                    alt="profile"
                    width={24}
                    height={24}
                    className="rounded-full object-cover"
                  />
                  <span>{user.name}</span>
                  {user.role === "admin" && (
                    <span className="ml-2 px-2 py-0.5 text-xs font-semibold text-red-500 bg-red-900 bg-opacity-30 rounded">Admin</span>
                  )}
                </div>
                <button 
                  onClick={navigateToDashboard}
                  className="text-left hover:text-red-500 transition-colors py-2 border-b border-gray-800 flex items-center gap-2 w-full"
                >
                  <User className="h-4 w-4" />
                  Dashboard
                </button>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center text-left w-full hover:text-red-500 transition-colors py-2"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" className="hover:text-red-500 transition-colors py-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </motion.header>
  )
}