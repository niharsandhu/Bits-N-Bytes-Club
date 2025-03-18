"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Key, Upload, Save, ArrowLeft, Trash2, Eye, EyeOff } from "lucide-react"
import axios from 'axios'

export default function EditProfile() {

  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [avatar, setAvatar] = useState("/placeholder.svg?height=200&width=200")
  const [avatarFile, setAvatarFile] = useState(null)
  const [message, setMessage] = useState("")
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_SERVER;
  
  const [formData, setFormData] = useState({
    group: "",
    year: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    const storedUserData = localStorage.getItem("user")
    if (storedUserData) {
      const parsedUser = JSON.parse(storedUserData)
      setUser(parsedUser)
      setAvatar(parsedUser.avatar || "/placeholder.svg?height=200&width=200")
      
      // Set initial form data
      setFormData((prev) => ({
        ...prev,
        group: parsedUser.group || "",
        year: parsedUser.year || "",
      }))
    } else {
      setMessage("Access denied: No user detected")
    }
  }, [])

  if (!isMounted) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAvatarFile(file)

      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) setAvatar(event.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeAvatar = () => {
    setAvatar("/placeholder.svg?height=200&width=200")
    setAvatarFile(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        alert("New passwords don't match")
        setIsLoading(false)
        return
      }

      if (!formData.currentPassword) {
        alert("Please enter your current password")
        setIsLoading(false)
        return
      }
    }

    const formDataToSend = new FormData()
    formDataToSend.append('group', formData.group)
    formDataToSend.append('year', formData.year)
    formDataToSend.append('currentPassword', formData.currentPassword)
    formDataToSend.append('newPassword', formData.newPassword)
    formDataToSend.append('confirmPassword', formData.confirmPassword)

    if (avatarFile) formDataToSend.append('image', avatarFile)

    try {
      const response = await axios.put(`${backendUrl}/api/users/update/${user._id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setIsLoading(false)
      console.log("Profile updated:", response.data)
      router.push("/userdashboard")
    } catch (error) {
      setIsLoading(false)
      console.error("Error updating profile:", error)
      alert("Failed to update profile. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="pt-24 pb-16 max-w-4xl mx-auto px-4">
        <Link href="/userdashboard" className="inline-flex items-center text-gray-400 hover:text-white mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold">Edit Profile</h1>
        <p className="text-gray-400 mt-2">Update your profile information</p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Picture Section */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h2 className="text-xl font-bold mb-4">Profile Picture</h2>

              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-red-600">
                    <Image
                      src={avatar || "/placeholder.svg?height=200&width=200"}
                      alt="Profile picture"
                      width={128}
                      height={128}
                      className="object-cover w-full h-full"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1 text-white hover:bg-red-700"
                    title="Remove avatar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Upload a new profile picture</label>

                  <div className="flex items-center space-x-4">
                    <label className="cursor-pointer bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-md inline-flex items-center border border-gray-700">
                      <Upload className="h-4 w-4 mr-2" />
                      <span>Choose File</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                    </label>

                    {avatarFile && (
                      <span className="text-sm text-gray-400">
                        {avatarFile.name} ({Math.round(avatarFile.size / 1024)} KB)
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    Recommended: Square image, at least 300x300 pixels, maximum 2MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Group and Year Section */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h2 className="text-xl font-bold mb-4">Group and Year</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="group" className="block text-sm font-medium text-gray-300 mb-1">
                    Group
                  </label>
                  <input
                    id="group"
                    name="group"
                    type="number"
                    value={formData.group}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-red-500 focus:border-red-500 text-white"
                  />
                </div>

                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-300 mb-1">
                    Year
                  </label>
                  <input
                    id="year"
                    name="year"
                    type="number"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-red-500 focus:border-red-500 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h2 className="text-xl font-bold mb-4">Change Password</h2>
              <p className="text-gray-400 text-sm mb-4">Leave blank if you don&apos;t want to change your password</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="w-full pl-10 pr-10 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-red-500 focus:border-red-500 text-white"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="newPassword"
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="w-full pl-10 pr-10 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-red-500 focus:border-red-500 text-white"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full pl-10 pr-10 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-red-500 focus:border-red-500 text-white"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <Link
                href="/userdashboard"
                className="px-6 py-3 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Save className="h-5 w-5 mr-2" />
                )}
                Save Changes
              </button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  )
}
