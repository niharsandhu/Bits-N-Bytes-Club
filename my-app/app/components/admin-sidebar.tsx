"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Calendar, Menu, X, Home } from "lucide-react"

interface SidebarLink {
  href: string
  label: string
  icon: React.ElementType
}

interface AdminSidebarProps {
  additionalLinks?: SidebarLink[]
}

export default function AdminSidebar({ additionalLinks = [] }: AdminSidebarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const pathname = usePathname()

  // Default sidebar links
  const defaultLinks: SidebarLink[] = [
    { href: "/admindashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/adminevent", label: "Events", icon: Calendar },
  ]

  // Combine default and additional links
  const links = [...defaultLinks, ...additionalLinks]

  useEffect(() => {
    setIsMounted(true)

    // Close sidebar on route change for mobile
    setIsSidebarOpen(false)

    // Handle escape key to close sidebar
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSidebarOpen(false)
      }
    }

    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [pathname])

  // Don't render anything during SSR to prevent hydration mismatch
  if (!isMounted) return null

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <>
      {/* Floating toggle button */}
      <div className="fixed bottom-6 left-6 z-50">
        <motion.button
          onClick={toggleSidebar}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700 focus:outline-none"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </motion.button>
      </div>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className="fixed inset-y-0 left-0 w-64 bg-gray-900 border-r border-gray-800 z-40 pt-20 overflow-hidden"
        initial={{ x: "-100%" }}
        animate={{ x: isSidebarOpen ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto py-4 px-3">
            <nav className="space-y-1">
              {links.map((link) => {
                const isActive = pathname === link.href
                const Icon = link.icon

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      isActive ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {link.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-gray-800">
            <Link
              href="/"
              className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <Home className="mr-3 h-5 w-5" />
              Back to Home
            </Link>
          </div>
        </div>
      </motion.div>
    </>
  )
}

