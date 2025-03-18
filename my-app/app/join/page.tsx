"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Check, AlertCircle } from "lucide-react"


// Team options
const TEAM_OPTIONS = [
  "Organizing Team",
  "Media Team",
  "Culture Team",
  "Discipline Team",
  "Promotion Team",
  "Graphics Team",
]

// Year options
const YEAR_OPTIONS = ["1st Year", "2nd Year", "3rd Year", "4th Year"]

export default function JoinCommunity() {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rollNo: "",
    year: "",
    team: "",
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }
    if (!formData.rollNo.trim()) newErrors.rollNo = "Roll number is required"
    if (!formData.year) newErrors.year = "Please select your year"
    if (!formData.team) newErrors.team = "Please select a team"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      // In a real app, you would submit the form data to your API
      console.log("Form submitted:", formData)
      router.push("/community/welcome")
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-black text-white">
     

      <main className="pt-24 pb-16 max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <Link href="/community" className="inline-flex items-center text-gray-400 hover:text-white mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Community
          </Link>

          <h1 className="text-3xl font-bold">Join Our Community</h1>
          <p className="text-gray-400 mt-2">
            Become a part of Bits &apos;N&apos; Bytes and connect with like-minded individuals
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-900 rounded-xl border border-gray-800 p-6 md:p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-gray-800 border ${errors.name ? "border-red-500" : "border-gray-700"} rounded-lg focus:ring-red-500 focus:border-red-500 text-white`}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-gray-800 border ${errors.email ? "border-red-500" : "border-gray-700"} rounded-lg focus:ring-red-500 focus:border-red-500 text-white`}
                placeholder="your.email@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="rollNo" className="block text-sm font-medium text-gray-300 mb-1">
                Roll Number <span className="text-red-500">*</span>
              </label>
              <input
                id="rollNo"
                name="rollNo"
                type="text"
                value={formData.rollNo}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-gray-800 border ${errors.rollNo ? "border-red-500" : "border-gray-700"} rounded-lg focus:ring-red-500 focus:border-red-500 text-white`}
                placeholder="Enter your roll number"
              />
              {errors.rollNo && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.rollNo}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-300 mb-1">
                Year <span className="text-red-500">*</span>
              </label>
              <select
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-gray-800 border ${errors.year ? "border-red-500" : "border-gray-700"} rounded-lg focus:ring-red-500 focus:border-red-500 text-white`}
              >
                <option value="">Select your year</option>
                {YEAR_OPTIONS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              {errors.year && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.year}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="team" className="block text-sm font-medium text-gray-300 mb-1">
                Select Team <span className="text-red-500">*</span>
              </label>
              <select
                id="team"
                name="team"
                value={formData.team}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-gray-800 border ${errors.team ? "border-red-500" : "border-gray-700"} rounded-lg focus:ring-red-500 focus:border-red-500 text-white`}
              >
                <option value="">Select a team</option>
                {TEAM_OPTIONS.map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>
              {errors.team && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.team}
                </p>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Check className="h-5 w-5 mr-2" />
                )}
                Submit Application
              </button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  )
}
