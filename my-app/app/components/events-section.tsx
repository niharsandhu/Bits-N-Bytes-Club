"use client"

import { useRef, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Monitor, Users, Briefcase, Code, ExternalLink } from "lucide-react"
import { useMediaQuery } from "@/hook/use-mobile"

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export default function EventsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const isMobile = useMediaQuery("(max-width: 768px)")

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (sectionRef.current && headingRef.current) {
        // Animate heading with text reveal effect - simplified on mobile
        if (isMobile) {
          // Simpler animation for mobile
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
          // More complex character animation for desktop
          const chars = headingRef.current.innerText.split("")
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

        // Animate cards with stagger
        gsap.fromTo(
          ".event-card",
          {
            y: 50,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            stagger: 0.15,
            duration: 0.8,
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
  }, [isMobile])

  // Common background gradient matching the existing cards
  const sectionBackground = {
    background:
      "linear-gradient(90deg, rgba(120,115,119,0.8128501400560224) 0%, rgba(62,5,5,1) 0%, rgba(25,0,0,1) 0%, rgba(88,0,0,1) 48%, rgba(25,0,0,1) 74%)",
  }

  const eventTypes = [
    {
      title: "WORKSHOPS",
      icon: <Users className="w-6 h-6 md:w-8 md:h-8" />,
      description:
        "By scheduling frequent workshops, we make sure that your path to becoming a master programmer is seamless.",
    },
    {
      title: "SEMINARS",
      icon: <Monitor className="w-6 h-6 md:w-8 md:h-8" />,
      description:
        "We host seminars featuring industry leaders that help students to prepare for the workplace and also improve their skills.",
    },
    {
      title: "HACKATHON",
      icon: <Briefcase className="w-6 h-6 md:w-8 md:h-8" />,
      description:
        "An event for all the programmers and enthusiasts to build new software programs and display them in front of experienced individuals.",
    },
    {
      title: "CODATHON",
      icon: <Code className="w-6 h-6 md:w-8 md:h-8" />,
      description:
        "We organize codathons for everyone to analyze their coding threshold, grow one's coding abilities, helping one to boost their technical career.",
    },
  ]

  // Fewer particles on mobile for better performance
  const particleCount = isMobile ? 10 : 20

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20" ref={sectionRef} suppressHydrationWarning>
      <div className="rounded-3xl p-6 md:p-8 overflow-hidden relative" style={sectionBackground} suppressHydrationWarning>
        {/* Animated background elements - fewer on mobile */}
        <div className="absolute inset-0 overflow-hidden" suppressHydrationWarning>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 relative z-10" suppressHydrationWarning>
          {/* Heading and description */}
          <div className="lg:col-span-2" suppressHydrationWarning>
            <h2
              ref={headingRef}
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 md:mb-8 text-white leading-tight"
              suppressHydrationWarning
            >
              What do we organize for you?
            </h2>

            {/* Event cards grid - 1 column on mobile, 2 on tablet+ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6" suppressHydrationWarning>
              {eventTypes.map((event, index) => (
                <motion.div
                  key={index}
                  className="event-card bg-black/30 border border-gray-800 rounded-xl p-4 md:p-6 relative overflow-hidden"
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                  // Make it tap-friendly on mobile
                  onTouchStart={() => setHoveredCard(index)}
                  onTouchEnd={() => setTimeout(() => setHoveredCard(null), 1500)}
                  whileHover={{
                    scale: 1.03,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    borderColor: "#ff3e3e",
                  }}
                  whileTap={{
                    scale: 0.98,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    borderColor: "#ff3e3e",
                  }}
                  suppressHydrationWarning
                >
                  {/* Animated background on hover/tap */}
                  <AnimatePresence>
                    {hoveredCard === index && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-red-900/20 to-transparent"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        suppressHydrationWarning
                      />
                    )}
                  </AnimatePresence>

                  {/* Icon with animated container */}
                  <div className="mb-3 md:mb-4 relative" suppressHydrationWarning>
                    <motion.div
                      className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-lg flex items-center justify-center relative z-10"
                      animate={
                        hoveredCard === index
                          ? {
                              y: [0, -5, 0],
                              rotate: [0, -5, 0, 5, 0],
                            }
                          : {}
                      }
                      transition={{ duration: 1, repeat: hoveredCard === index ? Number.POSITIVE_INFINITY : 0 }}
                      suppressHydrationWarning
                    >
                      <div className="text-black">{event.icon}</div>
                    </motion.div>

                    {/* Animated glow effect on hover */}
                    <AnimatePresence>
                      {hoveredCard === index && (
                        <motion.div
                          className="absolute -inset-1 bg-red-500 rounded-lg blur-lg z-0 opacity-30"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 0.3, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.3 }}
                          suppressHydrationWarning
                        />
                      )}
                    </AnimatePresence>
                  </div>

                  <h3 className="text-lg md:text-xl font-bold text-white mb-2 relative z-10" suppressHydrationWarning>
                    {event.title}
                  </h3>
                  <p className="text-gray-300 text-xs md:text-sm relative z-10" suppressHydrationWarning>
                    {event.description}
                  </p>

                  {/* Learn more link that appears on hover/tap */}
                  <AnimatePresence>
                    {hoveredCard === index && (
                      <motion.div
                        className="mt-3 md:mt-4 flex items-center text-red-400 text-xs md:text-sm font-medium relative z-10"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        suppressHydrationWarning
                      >
                        <span className="mr-1">Learn more</span>
                        <ExternalLink className="w-3 h-3" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 3D Character - hidden on mobile, shown on desktop */}
          <div className="hidden lg:flex items-center justify-center relative" suppressHydrationWarning>
            <motion.div
              className="relative w-full h-96"
              animate={{
                y: [0, -15, 0],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 6,
                ease: "easeInOut",
              }}
              suppressHydrationWarning
            >
              <Image
                src="/placeholder.svg?height=500&width=400"
                alt="3D Character with floating app icons"
                width={400}
                height={500}
                className="object-contain"
                suppressHydrationWarning
              />

              {/* Floating app icons */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-xl shadow-lg"
                  style={{
                    top: `${20 + Math.random() * 60}%`,
                    left: `${Math.random() * 80}%`,
                    width: `${30 + Math.random() * 20}px`,
                    height: `${30 + Math.random() * 20}px`,
                    background: `linear-gradient(45deg,
                      hsl(${Math.random() * 360}, 80%, 60%),
                      hsl(${Math.random() * 360}, 80%, 70%))`,
                  }}
                  animate={{
                    x: [0, Math.random() * 20 - 10, 0],
                    y: [0, Math.random() * 20 - 10, 0],
                    rotate: [0, Math.random() * 20 - 10, 0],
                  }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 2 + Math.random() * 3,
                    delay: Math.random() * 2,
                  }}
                  suppressHydrationWarning
                >
                  <div className="w-full h-full flex items-center justify-center">
                    {i % 3 === 0 && <div className="w-3 h-3 bg-white rounded-full" />}
                    {i % 3 === 1 && <div className="w-4 h-1 bg-white rounded-full" />}
                    {i % 3 === 2 && (
                      <div className="flex flex-col gap-0.5">
                        <div className="w-3 h-0.5 bg-white rounded-full" />
                        <div className="w-3 h-0.5 bg-white rounded-full" />
                        <div className="w-3 h-0.5 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Plus signs */}
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={`plus-${i}`}
                  className="absolute text-indigo-400 font-bold text-xl"
                  style={{
                    top: `${Math.random() * 80}%`,
                    left: `${Math.random() * 80}%`,
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 2 + Math.random() * 2,
                    delay: Math.random() * 2,
                  }}
                  suppressHydrationWarning
                >
                  +
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Mobile-only 3D character representation - simplified version */}
          <div className="lg:hidden flex justify-center mt-8" suppressHydrationWarning>
            <motion.div
              className="relative w-64 h-48 bg-black/40 rounded-xl overflow-hidden flex items-center justify-center"
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 3,
                ease: "easeInOut",
              }}
              suppressHydrationWarning
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 10, 0, -10, 0],
                  }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 4,
                  }}
                  suppressHydrationWarning
                >
                  <span className="text-white text-2xl font-bold">B&B</span>
                </motion.div>
              </div>

              {/* Simplified floating icons for mobile */}
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={`mobile-icon-${i}`}
                  className="absolute rounded-lg shadow-lg"
                  style={{
                    top: `${20 + Math.random() * 60}%`,
                    left: `${Math.random() * 80}%`,
                    width: `${20 + Math.random() * 10}px`,
                    height: `${20 + Math.random() * 10}px`,
                    background: `linear-gradient(45deg,
                      hsl(${Math.random() * 360}, 80%, 60%),
                      hsl(${Math.random() * 360}, 80%, 70%))`,
                  }}
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 10, 0],
                  }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 2 + Math.random() * 2,
                    delay: Math.random() * 2,
                  }}
                  suppressHydrationWarning
                />
              ))}

              {/* Plus signs */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={`mobile-plus-${i}`}
                  className="absolute text-indigo-400 font-bold text-lg"
                  style={{
                    top: `${Math.random() * 80}%`,
                    left: `${Math.random() * 80}%`,
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 2,
                    delay: Math.random(),
                  }}
                  suppressHydrationWarning
                >
                  +
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
