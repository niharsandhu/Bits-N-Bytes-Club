"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Calendar, Clock, Trophy, Coins, User, CalendarIcon } from "lucide-react"
import axios from "axios"

export default function UserDashboard() {
  const [isMounted, setIsMounted] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [userData, setUserData] = useState(null)
  const [allEvents, setAllEvents] = useState([])
  const [token, setToken] = useState(null)
  const [message, setMessage] = useState("")
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_SERVER;
  const [hoveredEvent, setHoveredEvent] = useState(null)

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (storedToken) {
      setToken(storedToken)
    } else {
      setMessage("Access denied: No token detected")
    }
  }, [])

  useEffect(() => {
    if (token) {
      setIsMounted(true)
      fetchUserDetails()
      fetchAllEvents()
    }
  }, [token]) // Only run when token is available

  const fetchUserDetails = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/users/me`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      })
      setUserData(res.data.user)
    } catch (error) {
      console.log(error.message)
      console.error("Failed to fetch user details", error)
    }
  }

  const fetchAllEvents = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/events/getAllEvents`)
      setAllEvents(res.data.events)
    } catch (error) {
      console.error("Failed to fetch events", error)
    }
  }

  if (!isMounted || !userData) {
    return null
  }

  // 💡 Filter and map events with registration status
  const mappedEvents = allEvents.map((event) => {
    const isRegistered =
      event.registeredUsers && Array.isArray(event.registeredUsers)
        ? event.registeredUsers.some((registeredUser) => registeredUser._id === userData._id)
        : false
    return {
      id: event._id,
      name: event.name,
      date: new Date(event.date).toISOString().split("T")[0], // format date YYYY-MM-DD
      status: isRegistered ? "Registered" : "Not Registered",
    }
  })

  // 🌐 Calendar helpers
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const eventDates = mappedEvents
    .filter((event) => {
      const eventDate = new Date(event.date)
      return eventDate.getMonth() === currentMonth.getMonth() && eventDate.getFullYear() === currentMonth.getFullYear()
    })
    .map((event) => new Date(event.date).getDate())

  const calculateLevel = (points) => {
    const pointsPerLevel = 100
    const level = Math.floor(points / pointsPerLevel)
    const pointsToNextLevel = pointsPerLevel - (points % pointsPerLevel)

    return { level, pointsToNextLevel }
  }
  const { level, pointsToNextLevel } = calculateLevel(userData.points)

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="pt-24 pb-16 max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Your Dashboard</h1>
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">Welcome back,</span>
            <span className="font-semibold">{userData.name}</span>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* User Profile Card */}
          <motion.div
            className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-6 col-span-1 row-span-1 border border-gray-800"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center space-x-4">
              <motion.div
                className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-red-600 ring-4 ring-red-600/20 shadow-lg flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {userData.image?.url ? (
                  <div className="w-full h-full rounded-full overflow-hidden">
                    <Image
                      src={userData.image.url || "/placeholder.svg"}
                      alt={userData.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="bg-gray-700 w-full h-full flex items-center justify-center rounded-full">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </motion.div>
              <div>
                <h2 className="text-xl font-bold">{userData.name}</h2>
                <p className="text-gray-400 text-sm">{userData.email}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-800">
              <Link href="/profile" className="text-red-500 hover:text-red-400 text-sm flex items-center group">
                <User className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform" />
                <span className="group-hover:underline">Edit Profile</span>
              </Link>
            </div>
          </motion.div>

          {/* Byte Coins Card */}
          <motion.div
            className="bg-gradient-to-br from-yellow-900 to-black rounded-3xl p-6 col-span-1 row-span-1 border border-yellow-900"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Byte Coins</h2>
              <Coins className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="mt-4 flex items-center">
              <motion.div
                className="w-12 h-12 bg-gradient-to-br from-yellow-500 via-yellow-400 to-yellow-300 rounded-full flex items-center justify-center border-2 border-yellow-600 mr-3 shadow-lg shadow-yellow-500/20"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.8 }}
              >
                <span className="text-xl font-bold text-yellow-800">B</span>
              </motion.div>
              <div className="text-3xl font-bold text-yellow-500">{userData.points}</div>
            </div>
            <div className="mt-4 text-sm text-gray-400">
              Level {level} • {pointsToNextLevel} coins until next level
            </div>
            <div className="mt-2 w-full bg-gray-800 rounded-full h-2">
              <motion.div
                className="bg-yellow-500 h-2 rounded-full"
                style={{ width: `${((userData.points % 100) / 100) * 100}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${((userData.points % 100) / 100) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              ></motion.div>
            </div>
          </motion.div>

          {/* Calendar Card */}
          <motion.div
            className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-6 col-span-2 row-span-2 border border-gray-800"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Event Calendar</h2>
              <div className="flex space-x-2">
                <motion.button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="p-1 rounded-full hover:bg-gray-800"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </motion.button>
                <motion.button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="p-1 rounded-full hover:bg-gray-800"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </motion.button>
              </div>
            </div>

            <div className="text-center mb-4">
              <h3 className="text-xl font-medium">
                {currentMonth.toLocaleString("default", { month: "long" })} {currentMonth.getFullYear()}
              </h3>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={`weekday-${day}`} className="text-center text-xs text-gray-500 font-medium py-1">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                <div key={`empty-${index}`} className="h-10 rounded-lg"></div>
              ))}

              {days.map((day) => {
                const isEventDay = eventDates.includes(day)
                return (
                  <motion.div
                    key={`day-${day}`}
                    className={`h-10 rounded-lg flex items-center justify-center text-sm relative cursor-pointer ${
                      isEventDay ? "bg-red-900/30" : "hover:bg-gray-800"
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {day}
                    {isEventDay && (
                      <motion.div
                        className="absolute bottom-1 w-1 h-1 rounded-full bg-red-500"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          repeatType: "reverse",
                          repeat: Number.POSITIVE_INFINITY,
                          duration: 1,
                        }}
                      ></motion.div>
                    )}
                  </motion.div>
                )
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-800">
              <h4 className="font-medium mb-2">Upcoming Events</h4>
              <div className="space-y-2">
                {allEvents &&
                  allEvents.map((event) => (
                    <motion.div
                      key={`upcoming-${event._id}`}
                      className="flex items-center text-sm p-2 rounded-lg hover:bg-gray-800/50 cursor-pointer"
                      whileHover={{ x: 5 }}
                    >
                      <CalendarIcon className="w-4 h-4 mr-2 text-red-500" />
                      <span>{event.name} - </span>
                      <span className="text-gray-400 ml-1">
                        {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </motion.div>
                  ))}
              </div>
            </div>
          </motion.div>

          {/* Registered Events Card */}
          <motion.div
            className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-6 col-span-1 md:col-span-2 row-span-1 border border-gray-800"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Your Events</h2>
              <Calendar className="w-5 h-5 text-red-500" />
            </div>

            <div className="space-y-3">
              {userData?.registeredEvents &&
                userData.registeredEvents.map((event) => (
                  <motion.div
                    key={`registered-${event.eventId}`}
                    className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-800/50 cursor-pointer"
                    whileHover={{ x: 5, backgroundColor: "rgba(31, 41, 55, 0.4)" }}
                  >
                    <div>
                      <div className="font-medium">{event.name}</div>
                      <div className="text-sm text-gray-400">
                        {new Date(event.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                    <motion.div
                      className={`text-xs px-2 py-1 rounded-full ${
                        event.status === "registered"
                          ? "bg-green-900/30 text-green-400"
                          : "bg-yellow-900/30 text-yellow-400"
                      }`}
                      whileHover={{ scale: 1.1 }}
                    >
                      {event.status || "Registered"} {/* Fallback to "Registered" if status is missing */}
                    </motion.div>
                  </motion.div>
                ))}

              {(!userData?.registeredEvents || userData.registeredEvents.length === 0) && (
                <div className="text-gray-400 text-center py-4">No registered events yet.</div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-800">
              <Link href="/event" className="text-red-500 hover:text-red-400 text-sm group flex items-center">
                <span className="group-hover:underline">View all events</span>
                <span className="group-hover:translate-x-1 transition-transform inline-block ml-1">→</span>
              </Link>
            </div>
          </motion.div>

          {/* Achievements Card */}
          <motion.div
            className="bg-gradient-to-br from-purple-900 to-black rounded-3xl p-6 col-span-1 row-span-1 border border-purple-900"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Achievements</h2>
              <motion.div
                animate={{
                  rotateY: [0, 360],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 5,
                }}
              >
                <Trophy className="w-5 h-5 text-yellow-500" />
              </motion.div>
            </div>

            {/* Empty state or placeholder for achievements */}
            <div className="text-gray-400 text-center py-4">No achievements yet.</div>

            <div className="mt-4 pt-4 border-t border-gray-800">
              <Link href="/achievements" className="text-red-500 hover:text-red-400 text-sm group flex items-center">
                <span className="group-hover:underline">View all achievements</span>
                <span className="group-hover:translate-x-1 transition-transform inline-block ml-1">→</span>
              </Link>
            </div>
          </motion.div>

          {/* Discover Events Card */}
          <motion.div
            className="bg-gradient-to-br from-blue-900 to-black rounded-3xl p-6 col-span-1 md:col-span-2 row-span-1 border border-blue-900"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Discover Events</h2>
              <Clock className="w-5 h-5 text-blue-500" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {allEvents &&
                allEvents.slice(0, 4).map((event) => (
                  <motion.div
                    key={`discover-${event._id}`}
                    className="relative rounded-xl overflow-hidden aspect-square cursor-pointer"
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)",
                    }}
                    onHoverStart={() => setHoveredEvent(event._id)}
                    onHoverEnd={() => setHoveredEvent(null)}
                  >
                    {event.image?.url ? (
                      <div className="w-full h-full relative">
                        <Image
                          src={event.image.url || "/placeholder.svg"}
                          alt={event.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 300px"
                          className="object-contain transition-transform duration-500 ease-in-out"
                          style={{ transform: hoveredEvent === event._id ? "scale(1.1)" : "scale(1)" }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <Calendar className="w-8 h-8 text-gray-600" />
                      </div>
                    )}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col justify-end p-3"
                      initial={{ opacity: 0.7 }}
                      animate={{
                        opacity: hoveredEvent === event._id ? 0.9 : 0.7,
                        background:
                          hoveredEvent === event._id
                            ? "linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.7) 70%, transparent)"
                            : "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.5) 70%, transparent)",
                      }}
                    >
                      <div className="font-medium text-sm">{event.name}</div>
                      <div className="text-xs text-gray-300 flex items-center mt-1">
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                      {hoveredEvent === event._id && (
                        <motion.div
                          className="mt-2 text-xs text-blue-300"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          Click to view details
                        </motion.div>
                      )}
                    </motion.div>
                  </motion.div>
                ))}

              {(!allEvents || allEvents.length === 0) && (
                <div className="col-span-2 text-gray-400 text-center py-4">No events available.</div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-800">
              <Link href="/event" className="text-red-500 hover:text-red-400 text-sm group flex items-center">
                <span className="group-hover:underline">Explore all events</span>
                <span className="group-hover:translate-x-1 transition-transform inline-block ml-1">→</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

