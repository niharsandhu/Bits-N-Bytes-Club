"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useScroll } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import axios from "axios"

// Register GSAP plugins
let gsapInitialized = false

// Define EventData type globally
interface EventData {
  id: string;
  _id: string; // Original ID from API
  name: string;
  description?: string;
  date: string;
  time?: string;
  location?: string;
  byteCoinReward?: number;
  maxParticipants?: number;
  type?: string;
  image?: {
    url: string;
    public_id?: string; // Optional, if you need it
  };
}

// Functional Component
export default function Events() {
  const [, setIsScrolled] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_SERVER
  const [upcomingEvents, setUpcomingEvents] = useState<EventData[]>([])
  const [, setIsLoading] = useState(true)
  const [, setError] = useState<string | null>(null)
  const { scrollY } = useScroll()
  const bannerRef = useRef(null)
  const upcomingEventsRef = useRef<HTMLDivElement>(null)
  const pastEventsRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [aspectRatios, setAspectRatios] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true)
        const { data } = await axios.get('${backendUrl}/api/events/getAllEvents')
        
        // Sort events by date (assuming date is in format YYYY-MM-DD)
        const sortedEvents = data.events.sort((a: { date: string }, b: { date: string }) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        })
        
        // Format events for display
        const formattedEvents = sortedEvents.map((event: EventData) => ({
          _id: event._id,
          name: event.name,
          date: new Date(event.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          time: event.time,
          location: event.location,
          description: event.description,
          image: event.image || "/api/placeholder/400/300",
          byteCoinReward: event.byteCoinReward,
          maxParticipants: event.maxParticipants,
          type: event.type
        }))
        
        setUpcomingEvents(formattedEvents)
        setIsLoading(false)
      } catch (err) {
        console.error("Error fetching events:", err)
        setError("Failed to load events. Please try again later.")
        setIsLoading(false)
      }
    }
    
    fetchEvents()
  }, [])

  const handleRegister = async (eventId: string) => {
    try {
      const token = localStorage.getItem("token") // Get JWT token
      if (!token) {
        alert("Please log in to register for the event.")
        return
      }
  
      const { data } = await axios.post(
        "http://localhost:3000/api/events/register",
        { eventId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
  
      alert(data.message) // Show success message
    } catch (err) {
      console.error("Error registering for event:", err)
      alert("Failed to register. Please try again.")
    }
  }
  
  // Initialize client-side only features
  useEffect(() => {
    setIsMounted(true)

    // Register GSAP plugins only on client side
    if (!gsapInitialized && typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger)
      gsapInitialized = true
    }
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const unsubscribe = scrollY.on("change", (y) => {
      setIsScrolled(y > 50)
    })
    return () => unsubscribe()
  }, [scrollY, isMounted])

  useEffect(() => {
    if (!isMounted) return
    
    // Create all animations
    const ctx = gsap.context(() => {
      // Banner animation
      if (bannerRef.current) {
        gsap.fromTo(
          (bannerRef.current as HTMLElement).querySelector('.banner-content'),
          {
            y: 100,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: bannerRef.current,
              start: "top center",
              toggleActions: "play none none none",
            },
          }
        )
      }
      
      // Upcoming events animation
      if (upcomingEventsRef.current) {
        gsap.fromTo(
          upcomingEventsRef.current.querySelectorAll('.event-card'),
          {
            y: 50,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: upcomingEventsRef.current,
              start: "top bottom-=150",
              toggleActions: "play none none none",
            },
          }
        )
      }
      
      // Past events animation
      if (pastEventsRef.current) {
        gsap.fromTo(
          (pastEventsRef.current as HTMLElement).querySelectorAll('.highlight-card'),
          {
            scale: 0.9,
            opacity: 0,
          },
          {
            scale: 1,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: pastEventsRef.current,
              start: "top bottom-=100",
              toggleActions: "play none none none",
            },
          }
        )
      }
    })
    
    return () => ctx.revert()
  }, [isMounted])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Main content */}
      <main className="pt-24 md:pt-32 pb-16">
        {/* Banner Section */}
        <section 
          ref={bannerRef}
          className="relative h-80 md:h-96 overflow-hidden"
          style={{
            backgroundImage: "linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url('/m2.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-900/50 to-black/70"></div>
          
          <div className="banner-content relative z-10 h-full max-w-7xl mx-auto px-4 flex flex-col justify-center items-center text-center">
            <motion.h1
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Our Events
            </motion.h1>
            
            <motion.p
              className="text-xl md:text-2xl text-gray-200 mb-6 max-w-3xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Where Innovation Happens
            </motion.p>
            
            <motion.div
              className="w-16 h-1 bg-red-600 mb-6"
              initial={{ width: 0 }}
              animate={{ width: "4rem" }}
              transition={{ delay: 0.7, duration: 0.8 }}
            ></motion.div>
            
            <motion.p
              className="text-base md:text-lg text-gray-300 max-w-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
            >
              Discover our upcoming events and relive the highlights of our past gatherings. Join us to learn, connect, and create together.
            </motion.p>
          </div>
          
          {/* Animated shapes in background */}
          {isMounted && (
            <>
              <motion.div 
                className="absolute w-24 h-24 rounded-full bg-red-600/20"
                initial={{ x: -100, y: -100 }}
                animate={{ 
                  x: [-100, 50, -100],
                  y: [-100, 100, -100],
                }}
                transition={{ 
                  repeat: Infinity,
                  duration: 15,
                  ease: "easeInOut" 
                }}
              />
              <motion.div 
                className="absolute right-0 bottom-0 w-32 h-32 rounded-full bg-red-600/10"
                initial={{ x: 100, y: 100 }}
                animate={{ 
                  x: [100, -50, 100],
                  y: [100, -100, 100],
                }}
                transition={{ 
                  repeat: Infinity,
                  duration: 18,
                  ease: "easeInOut" 
                }}
              />
            </>
          )}
        </section>
        
        {/* Upcoming Events Section */}
        <section ref={upcomingEventsRef} className="py-12 md:py-16 max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Upcoming Events</h2>
            <div className="w-16 h-1 bg-red-600 mx-auto mb-4"></div>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Join us for these exciting upcoming events. Mark your calendars and don&apos;t miss out!
            </p>
          </div>
          
          <div className="space-y-8 md:space-y-10">
            {upcomingEvents.map((event) => (
              <motion.div
                key={event._id}
                className="event-card bg-gray-900/50 rounded-xl overflow-hidden border border-gray-800"
                whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)" }}
              >
                <div className="flex flex-col md:flex-row">
                  {/* Outer div to handle width */}
                  <div className="md:w-2/5">
                    {/* Inner div to adjust height based on aspect ratio */}
                    <div
                      className="relative bg-gray-900"
                      style={{
                        aspectRatio: aspectRatios[event._id] || 'auto',
                        height: aspectRatios[event._id] ? 'auto' : '224px', // Fallback height
                      }}
                    >
                      {event.image?.url ? (
                        <Image
                          src={event.image.url}
                          alt={event.name}
                          layout="fill"
                          objectFit="contain"
                          onLoadingComplete={(img) => {
                            const aspectRatio = img.naturalWidth / img.naturalHeight
                            setAspectRatios((prev) => ({ ...prev, [event._id]: aspectRatio }))
                          }}
                        />
                      ) : (
                        <div className="bg-gray-300 h-full w-full flex items-center justify-center">
                          No Image
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-red-900/ to-black/50"></div>
                    </div>
                  </div>
                  
                  <div className="p-6 md:p-8 md:w-3/5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <h3 className="text-2xl font-bold text-white mb-2 md:mb-0">{event.name}</h3>
                      
                      <div className="flex items-center space-x-2 text-red-400 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{event.date}</span>
                      </div>
                    </div>
                    
                    <div className="mb-4 space-y-2">
                      <div className="flex items-center text-gray-300 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{event.time}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-300 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{event.location}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 mb-6 md:mb-8">{event.description}</p>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => {
                          if (event?._id) {
                            if (event.type === "team") {
                              router.push(`/createteam/${event._id}`);
                            } else {
                              handleRegister(event._id);
                            }
                          } else {
                            console.error("Event ID is missing!", event);
                          }
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium text-center transition-colors"
                      >
                        Register Now
                      </button>
                      <Link 
                        href={`/events/${event._id}`}
                        className="border border-gray-600 hover:border-red-500 text-white hover:text-red-500 px-6 py-2 rounded-lg font-medium text-center transition-colors"
                      >
                        Learn More
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Link
              href="/events/calendar"
              className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 font-medium"
            >
              <span>View Full Calendar</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </section>
        
        {/* Newsletter Signup */}
        <section className="py-12 md:py-16 max-w-7xl mx-auto px-4">
          <div className="rounded-3xl overflow-hidden relative">
            <div 
              className="absolute inset-0 bg-gradient-to-r from-red-900/90 to-black/90 z-10"
              style={{
                backgroundImage: "url('/api/placeholder/1200/400')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundBlendMode: "overlay"
              }}
            ></div>
            
            <div className="relative z-20 py-12 md:py-16 px-6 md:px-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay Updated</h2>
              <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
                Subscribe to our newsletter and never miss an event announcement or update.
              </p>
              
              <div className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="email" 
                    placeholder="Your email address" 
                    className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <motion.button
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Subscribe
                  </motion.button>
                </div>
              </div>
            </div>
            
            {/* Animated shapes */}
            {isMounted && (
              <>
                <motion.div 
                  className="absolute w-40 h-40 rounded-full bg-red-600/20 z-0 left-0 top-0"
                  animate={{ 
                    x: [-100, 50, -100],
                    y: [-100, 50, -100],
                  }}
                  transition={{ 
                    repeat: Infinity,
                    duration: 15,
                    ease: "easeInOut" 
                  }}
                />
                <motion.div 
                  className="absolute w-32 h-32 rounded-full bg-red-600/10 z-0 right-0 bottom-0"
                  animate={{ 
                    x: [100, -50, 100],
                    y: [100, -50, 100],
                  }}
                  transition={{ 
                    repeat: Infinity,
                    duration: 18,
                    ease: "easeInOut" 
                  }}
                />
              </>
            )}
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <motion.div
              className="w-10 h-8 bg-red-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden rounded-lg"
              whileHover={{ scale: 1.05 }}
            >
              BnB
            </motion.div>
            <span className="text-gray-300 text-lg">Bits &apos;N&apos; Bytes</span>
          </div>
          <p className="text-gray-500 text-sm">
            Where Coding Meets Culture • ©️ {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  )
}
