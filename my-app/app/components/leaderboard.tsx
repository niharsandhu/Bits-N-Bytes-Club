"use client"

import { useRef, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Trophy, ChevronUp, Star, ChevronDown, Medal } from "lucide-react"
import { useMediaQuery } from "@/hook/use-mobile"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export default function LeaderboardSection() {
  const sectionRef = useRef(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [expandedUser, setExpandedUser] = useState<number | null>(null)
  const [filterType, setFilterType] = useState("all")
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [isMounted, setIsMounted] = useState(false)

  // Mount state to prevent hydration issues
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const ctx = gsap.context(() => {
      if (sectionRef.current && headingRef.current) {
        // Animate heading with similar text reveal effect as in EventsSection
        if (isMobile) {
          gsap.fromTo(
            headingRef.current,
            {
              y: 30,
              opacity: 0,
            },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: "power2.out",
              scrollTrigger: {
                trigger: headingRef.current,
                start: "top bottom-=100",
                toggleActions: "play none none none",
              },
            }
          )
        } else {
          const chars = (headingRef.current as HTMLElement).innerText.split("")
          headingRef.current.innerHTML = ""

          chars.forEach((char) => {
            const span = document.createElement("span")
            span.innerText = char
            span.style.opacity = "0"
            span.style.display = "inline-block"
            if (char === " ") span.innerHTML = "&nbsp;"
            headingRef.current?.appendChild(span)
          })

          gsap.to(headingRef.current.children, {
            opacity: 1,
            stagger: 0.05,
            duration: 0.5,
            ease: "power2.out",
            scrollTrigger: {
              trigger: headingRef.current,
              start: "top bottom-=100",
              toggleActions: "play none none none",
            },
          })
        }

        // Animate leaderboard entries with stagger
        gsap.fromTo(
          ".leaderboard-entry",
          {
            y: 50,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            stagger: 0.1,
            duration: 0.7,
            ease: "back.out(1.2)",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom-=50",
              toggleActions: "play none none none",
            },
          }
        )
      }
    })

    return () => ctx.revert()
  }, [isMobile, isMounted])

  // Matching background gradient with the events section
  const sectionBackground = {
    background:
      "linear-gradient(90deg, rgba(120,115,119,0.8128501400560224) 0%, rgba(62,5,5,1) 0%, rgba(25,0,0,1) 0%, rgba(88,0,0,1) 48%, rgba(25,0,0,1) 74%)",
  }

  // Sample leaderboard data with different event types
  const leaderboardData = [
    {
      id: 1,
      name: "Alex Johnson",
      avatar: "A",
      score: 985,
      rank: 1,
      eventType: "HACKATHON",
      badges: ["First Place", "Most Innovative", "Team Leader"],
      project: "Smart City IoT Solution",
    },
    {
      id: 2,
      name: "Maria Garcia",
      avatar: "M",
      score: 950,
      rank: 2,
      eventType: "CODATHON",
      badges: ["Algorithm Master", "Fast Coder"],
      project: "ML-based Code Optimizer",
    },
    {
      id: 3,
      name: "Sam Thompson",
      avatar: "S",
      score: 920,
      rank: 3,
      eventType: "HACKATHON",
      badges: ["UI Excellence", "Best Presentation"],
      project: "AR Fitness Trainer",
    },
    {
      id: 4,
      name: "Raj Patel",
      avatar: "R",
      score: 890,
      rank: 4,
      eventType: "WORKSHOPS",
      badges: ["Most Helpful", "Knowledge Sharing"],
      project: "Blockchain Workshop Series",
    },
    {
      id: 5,
      name: "Emily Wang",
      avatar: "E",
      score: 860,
      rank: 5,
      eventType: "SEMINARS",
      badges: ["Active Participant", "Networking Star"],
      project: "Future of AI Seminar",
    },
    {
      id: 6,
      name: "David Kim",
      avatar: "D",
      score: 830,
      rank: 6,
      eventType: "CODATHON",
      badges: ["Clean Code", "Problem Solver"],
      project: "Real-time Data Pipeline",
    },
  ]

  // Filter leaderboard data based on event type
  const filteredData = filterType === "all"
    ? leaderboardData
    : leaderboardData.filter(user => user.eventType === filterType)

  // Get the medal icon based on rank
  const getMedalIcon = (rank: number) => {
    switch(rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-400" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-300" />
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />
      default:
        return <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-xs">{rank}</div>
    }
  }

  // Fewer particles on mobile for better performance
  const particleCount = isMobile ? 8 : 15

  // Return null during SSR to prevent hydration issues
  if (!isMounted) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20" ref={sectionRef}>
      <div className="rounded-3xl p-6 md:p-8 overflow-hidden relative" style={sectionBackground}>
        {/* Animated background elements - similar to EventsSection */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(particleCount)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-red-500 rounded-full opacity-30"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [1, 2, 1],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 5,
                repeat: Number.POSITIVE_INFINITY,
                delay: Math.random() * 5,
              }}
              suppressHydrationWarning
            />
          ))}
        </div>

        <div className="relative z-10">
          {/* Heading */}
          <h2
            ref={headingRef}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 md:mb-8 text-white leading-tight"
            suppressHydrationWarning
          >
            Leaderboard Champions
          </h2>

          {/* Filter buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            <motion.button
              className={`px-3 py-1.5 rounded-full text-xs md:text-sm font-medium ${
                filterType === "all" ? "bg-red-600 text-white" : "bg-black/30 text-gray-300 border border-gray-800"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilterType("all")}
              suppressHydrationWarning
            >
              All Events
            </motion.button>
            {["WORKSHOPS", "SEMINARS", "HACKATHON", "CODATHON"].map((type) => (
              <motion.button
                key={type}
                className={`px-3 py-1.5 rounded-full text-xs md:text-sm font-medium ${
                  filterType === type ? "bg-red-600 text-white" : "bg-black/30 text-gray-300 border border-gray-800"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterType(type)}
                suppressHydrationWarning
              >
                {type}
              </motion.button>
            ))}
          </div>

          {/* Leaderboard list */}
          <div className="space-y-3 md:space-y-4">
            <AnimatePresence initial={false}>
              {filteredData.map((user) => (
                <motion.div
                  key={user.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="leaderboard-entry"
                  suppressHydrationWarning
                >
                  <motion.div
                    className="bg-black/30 border border-gray-800 rounded-xl overflow-hidden"
                    whileHover={{
                      scale: 1.01,
                      backgroundColor: "rgba(0,0,0,0.5)",
                      borderColor: "#ff3e3e",
                    }}
                    suppressHydrationWarning
                  >
                    {/* Main user row */}
                    <div
                      className="p-4 flex items-center justify-between cursor-pointer"
                      onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                    >
                      <div className="flex items-center space-x-3 md:space-x-4">
                        {/* Rank with custom styling for top 3 */}
                        <div className="flex-shrink-0">
                          {getMedalIcon(user.rank)}
                        </div>

                        {/* Avatar */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-black font-bold ${
                          user.rank === 1 ? "bg-gradient-to-br from-yellow-300 to-yellow-500" :
                          user.rank === 2 ? "bg-gradient-to-br from-gray-300 to-gray-400" :
                          user.rank === 3 ? "bg-gradient-to-br from-amber-500 to-amber-700" :
                          "bg-white"
                        }`}>
                          {user.avatar}
                        </div>

                        {/* Name and badges */}
                        <div>
                          <div className="text-white font-medium md:text-lg">{user.name}</div>
                          <div className="text-xs text-gray-400">{user.eventType}</div>
                        </div>
                      </div>

                      {/* Score and expand button */}
                      <div className="flex items-center space-x-3">
                        <div className="text-center">
                          <div className="text-lg md:text-xl font-bold text-red-500">{user.score}</div>
                          <div className="text-xs text-gray-400">POINTS</div>
                        </div>

                        <div>
                          {expandedUser === user.id ?
                            <ChevronUp className="w-5 h-5 text-gray-400" /> :
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          }
                        </div>
                      </div>
                    </div>

                    {/* Expanded details */}
                    <AnimatePresence>
                      {expandedUser === user.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                          suppressHydrationWarning
                        >
                          <div className="p-4 pt-0 border-t border-gray-800">
                            <div className="mb-3">
                              <div className="text-sm text-gray-400 mb-1">Project</div>
                              <div className="text-white">{user.project}</div>
                            </div>

                            <div>
                              <div className="text-sm text-gray-400 mb-1">Achievements</div>
                              <div className="flex flex-wrap gap-2">
                                {user.badges.map((badge, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center bg-black/40 px-2 py-1 rounded-full text-xs"
                                    suppressHydrationWarning
                                  >
                                    <Star className="w-3 h-3 text-yellow-500 mr-1" />
                                    <span className="text-gray-300">{badge}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
