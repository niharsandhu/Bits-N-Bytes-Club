"use client"

import { useRef, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Check, ChevronRight, Sparkles } from "lucide-react"
import { useMediaQuery } from "@/hook/use-mobile"

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const featureItemsRef = useRef<HTMLDivElement>(null)
  const [activeFeature, setActiveFeature] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Reduce particle count on mobile for better performance
  const particleCount = isMobile ? 15 : 30

  // Particle system for the sparkle effect
  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1 + Math.random() * (isMobile ? 2 : 3),
    color: `hsl(${Math.random() * 60 + 340}, 100%, ${50 + Math.random() * 30}%)`,
    duration: 2 + Math.random() * 4,
  }))

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (sectionRef.current && textRef.current && featureItemsRef.current) {
        // Animate heading and text
        gsap.fromTo(
          textRef.current,
          {
            x: isMobile ? -50 : -100,
            opacity: 0,
          },
          {
            x: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom-=100",
              toggleActions: "play none none none",
            },
          },
        )

        // Animate feature items with stagger
        gsap.fromTo(
          featureItemsRef.current.children,
          {
            y: 50,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            stagger: 0.2,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: featureItemsRef.current,
              start: "top bottom-=50",
              toggleActions: "play none none none",
            },
          },
        )
      }
    })

    return () => ctx.revert()
  }, [isMobile])

  // Auto-rotate through features
  useEffect(() => {
    if (isHovering) return

    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3)
    }, 3000)

    return () => clearInterval(interval)
  }, [isHovering])

  // Common background gradient matching the existing cards
  const sectionBackground = {
    background:
      "linear-gradient(90deg, rgba(120,115,119,0.8128501400560224) 0%, rgba(62,5,5,1) 0%, rgba(25,0,0,1) 0%, rgba(88,0,0,1) 48%, rgba(25,0,0,1) 74%)",
  }

  const features = [
    {
      title: "Become industry ready with us",
      description:
        "Our industry-focused curriculum and hands-on projects prepare you for real-world challenges and opportunities.",
      icon: "💼",
    },
    {
      title: "Regular competitions / events",
      description:
        "Participate in hackathons, coding challenges, and tech talks to sharpen your skills and expand your network.",
      icon: "🏆",
    },
    {
      title: "Chance to learn and earn",
      description:
        "Gain valuable skills while earning through internships, freelance opportunities, and our student ambassador program.",
      icon: "💰",
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-16" ref={sectionRef}>
      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 rounded-3xl p-6 md:p-8 overflow-hidden relative"
        style={sectionBackground}
      >
        {/* Animated particles in background - fewer on mobile */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                top: `${particle.y}%`,
                left: `${particle.x}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                backgroundColor: particle.color,
              }}
              animate={{
                y: [`${particle.y}%`, `${particle.y - 20 - Math.random() * 30}%`],
                opacity: [0, 0.8, 0],
                scale: [0, 1, 0.5],
              }}
              transition={{
                duration: particle.duration,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
                ease: "easeInOut",
                delay: Math.random() * 5,
              }}
              suppressHydrationWarning
            />
          ))}
        </div>

        {/* 3D Character with floating icons - shown at top on mobile, left on desktop */}
        <div className={`relative flex items-center justify-center ${isMobile ? "order-first" : ""}`}>
          <motion.div
            className="relative w-64 h-64 md:w-80 md:h-80"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 4,
              ease: "easeInOut",
            }}
            suppressHydrationWarning
          >
            <div className="relative">
              <Image
                src="/placeholder.svg?height=400&width=400"
                alt="3D Character"
                width={400}
                height={400}
                className="object-contain"
                priority={isMobile} // Load with priority on mobile since it's at the top
                suppressHydrationWarning
              />

              {/* Animated glow effect - simplified on mobile */}
              <motion.div
                className="absolute -inset-4 rounded-full blur-2xl z-0"
                animate={{
                  background: [
                    "radial-gradient(circle, rgba(255,62,62,0.3) 0%, rgba(0,0,0,0) 70%)",
                    "radial-gradient(circle, rgba(255,62,62,0.5) 0%, rgba(0,0,0,0) 70%)",
                    "radial-gradient(circle, rgba(255,62,62,0.3) 0%, rgba(0,0,0,0) 70%)",
                  ],
                }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                suppressHydrationWarning
              />
            </div>

            {/* Floating icons - fewer and smaller on mobile */}
            {/* HTML/CSS icon */}
            <motion.div
              className="absolute top-0 left-0 bg-white p-2 rounded-lg shadow-lg"
              animate={{
                y: [0, -15, 0],
                rotate: [0, 5, 0],
                boxShadow: [
                  "0 4px 6px rgba(255, 62, 62, 0.1)",
                  "0 10px 15px rgba(255, 62, 62, 0.3)",
                  "0 4px 6px rgba(255, 62, 62, 0.1)",
                ],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 5,
                delay: 0.5,
              }}
              suppressHydrationWarning
            >
              <div className="flex">
                <div
                  className={`${isMobile ? "w-6 h-6" : "w-8 h-8"} bg-red-500 flex items-center justify-center text-white text-xs font-bold rounded-sm`}
                >
                  HTML
                </div>
                <div
                  className={`${isMobile ? "w-6 h-6" : "w-8 h-8"} bg-blue-500 flex items-center justify-center text-white text-xs font-bold rounded-sm`}
                >
                  CSS
                </div>
              </div>
            </motion.div>

            {/* Python icon */}
            <motion.div
              className="absolute bottom-10 left-0 bg-white p-1 rounded-full shadow-lg"
              animate={{
                x: [0, 10, 0],
                y: [0, 5, 0],
                boxShadow: [
                  "0 4px 6px rgba(255, 62, 62, 0.1)",
                  "0 10px 15px rgba(255, 62, 62, 0.3)",
                  "0 4px 6px rgba(255, 62, 62, 0.1)",
                ],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 4,
                delay: 1,
              }}
              suppressHydrationWarning
            >
              <div
                className={`${isMobile ? "w-10 h-10" : "w-12 h-12"} rounded-full bg-gradient-to-r from-blue-500 to-yellow-500 flex items-center justify-center`}
              >
                <span className="text-white font-bold text-xs">Python</span>
              </div>
            </motion.div>

            {/* React icon */}
            <motion.div
              className="absolute top-10 right-0 bg-white p-1 rounded-lg shadow-lg"
              animate={{
                rotate: [0, 360],
                boxShadow: [
                  "0 4px 6px rgba(255, 62, 62, 0.1)",
                  "0 10px 15px rgba(255, 62, 62, 0.3)",
                  "0 4px 6px rgba(255, 62, 62, 0.1)",
                ],
              }}
              transition={{
                rotate: {
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 10,
                  ease: "linear",
                },
                boxShadow: {
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 3,
                },
              }}
              suppressHydrationWarning
            >
              <div
                className={`${isMobile ? "w-10 h-10" : "w-12 h-12"} rounded-lg bg-black flex items-center justify-center`}
              >
                <div className={`${isMobile ? "w-8 h-8" : "w-10 h-10"} rounded-full border-2 border-cyan-400 relative`}>
                  <div className="absolute w-full h-1.5 bg-cyan-400 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute w-full h-1.5 bg-cyan-400 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-60"></div>
                  <div className="absolute w-full h-1.5 bg-cyan-400 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-60"></div>
                </div>
              </div>
            </motion.div>

            {/* Only show these icons on desktop for better mobile performance */}
            {!isMobile && (
              <>
                {/* Chart icon */}
                <motion.div
                  className="absolute bottom-0 right-10 bg-white p-1 rounded-lg shadow-lg"
                  animate={{
                    y: [0, 10, 0],
                    boxShadow: [
                      "0 4px 6px rgba(255, 62, 62, 0.1)",
                      "0 10px 15px rgba(255, 62, 62, 0.3)",
                      "0 4px 6px rgba(255, 62, 62, 0.1)",
                    ],
                  }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 3,
                    delay: 2,
                  }}
                  suppressHydrationWarning
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-b from-purple-500 to-pink-500 flex items-center justify-center p-1">
                    <div className="flex h-full items-end space-x-1">
                      <div className="w-2 h-3 bg-white rounded-t-sm"></div>
                      <div className="w-2 h-5 bg-white rounded-t-sm"></div>
                      <div className="w-2 h-7 bg-white rounded-t-sm"></div>
                    </div>
                  </div>
                </motion.div>

                {/* Code icon */}
                <motion.div
                  className="absolute right-0 bottom-20 bg-white p-1 rounded-lg shadow-lg"
                  animate={{
                    x: [0, -10, 0],
                    boxShadow: [
                      "0 4px 6px rgba(255, 62, 62, 0.1)",
                      "0 10px 15px rgba(255, 62, 62, 0.3)",
                      "0 4px 6px rgba(255, 62, 62, 0.1)",
                    ],
                  }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 4,
                    delay: 1.5,
                  }}
                  suppressHydrationWarning
                >
                  <div className="w-14 h-14 rounded-lg bg-gradient-to-r from-green-400 to-teal-500 flex items-center justify-center p-2">
                    <div className="text-white text-xs">
                      <div className="mb-1">{"{}"}</div>
                      <div className="h-0.5 w-full bg-white/70"></div>
                      <div className="h-0.5 w-3/4 bg-white/70 mt-1"></div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </motion.div>
        </div>

        {/* Text content */}
        <div className="flex flex-col justify-center" ref={textRef}>
          <div className="flex items-center mb-4">
            <motion.div
              className="mr-3 bg-red-600 p-1.5 rounded-md"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, 0, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
              }}
              suppressHydrationWarning
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">What sets us apart</h2>
          </div>

          <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-white">from others?</h3>

          <p className="text-gray-300 mb-6 md:mb-8 text-sm md:text-base">
          The team at Bits &apos;n&apos; Bytes believes that coding is more than just writing lines of code—it’s a bridge that connects diverse cultures, ideas, and creativity. &quot;Where Culture Meets Coding&quot; isn’t just our slogan; it’s our mission. We provide a space where students can sharpen their technical skills while exploring the cultural dimensions of technology. From hands-on coding sessions to discussions on how tech shapes societies, we offer unique opportunities for learning, collaboration, and networking
          </p>

          {/* Interactive Feature list */}
          <div className="space-y-3 md:space-y-4" ref={featureItemsRef}>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className={`relative overflow-hidden rounded-lg border ${
                  activeFeature === index
                    ? "border-red-500 bg-gradient-to-r from-black/60 to-red-950/30"
                    : "border-gray-800 bg-black/30"
                }`}
                onMouseEnter={() => {
                  setActiveFeature(index)
                  setIsHovering(true)
                }}
                onMouseLeave={() => setIsHovering(false)}
                // Make it tap-friendly on mobile
                onTouchStart={() => {
                  setActiveFeature(index)
                  setIsHovering(true)
                }}
                onTouchEnd={() => setTimeout(() => setIsHovering(false), 3000)}
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.2 },
                }}
                whileTap={{
                  scale: 0.98,
                  transition: { duration: 0.2 },
                }}
                layout
                suppressHydrationWarning
              >
                <div className="flex items-start p-3 md:p-4">
                  <div
                    className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-md flex items-center justify-center mr-3 md:mr-4 ${
                      activeFeature === index ? "bg-red-600" : "bg-white"
                    }`}
                  >
                    {activeFeature === index ? (
                      <Check className={`w-5 h-5 md:w-6 md:h-6 text-white`} />
                    ) : (
                      <span className="text-lg md:text-xl">{feature.icon}</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-medium text-base md:text-lg">{feature.title}</h3>
                      <ChevronRight
                        className={`w-4 h-4 md:w-5 md:h-5 ${
                          activeFeature === index ? "text-red-500" : "text-gray-500"
                        }`}
                      />
                    </div>

                    {/* Expandable description */}
                    <AnimatePresence>
                      {activeFeature === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                          suppressHydrationWarning
                        >
                          <p className="text-gray-300 mt-2 text-xs md:text-sm">{feature.description}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Animated highlight bar */}
                {activeFeature === index && (
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-red-600"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.5 }}
                    suppressHydrationWarning
                  />
                )}
              </motion.div>
            ))}
          </div>

          {/* CTA Button */}
          <motion.button
            className="mt-6 md:mt-8 bg-red-600 text-white px-4 py-2.5 md:px-6 md:py-3 rounded-md text-base md:text-lg font-medium shadow-lg flex items-center justify-center group w-full sm:w-auto"
            whileHover={{
              scale: 1.05,
              backgroundColor: "#ff3e3e",
              boxShadow: "0 10px 25px -5px rgba(255, 62, 62, 0.4)",
            }}
            whileTap={{ scale: 0.98 }}
            suppressHydrationWarning
          >
            <span>Join our community</span>
            <motion.div
              className="ml-2"
              animate={{ x: [0, 5, 0] }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
                duration: 1.5,
                repeatDelay: 0.5,
              }}
              suppressHydrationWarning
            >
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
            </motion.div>
          </motion.button>
        </div>
      </div>
    </div>
  )
}
