"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import axios from "axios";
import FeaturesSection from "./components/features-section";
import EventsSection from "./components/events-section";
import LeaderboardSection from "./components/leaderboard";

// Define the type for Event
interface Event {
  _id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  maxParticipants: number;
  byteCoins: number;
  status: string;
  totalRegisteredStudents: number;
  totalRounds: number;
  currentRounds: number;
  image: {
    url: string;
  };
}

// Register GSAP plugins
let gsapInitialized = false;

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  // Fetch events data from the API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/events/getAllEvents");
        setAllEvents(response.data.events);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  // Initialize client-side only features
  useEffect(() => {
    setIsMounted(true);

    // Register GSAP plugins only on client side
    if (!gsapInitialized && typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
      gsapInitialized = true;
    }
  }, []);

  useEffect(() => {
    if (!isMounted || !heroRef.current) return;

    // Hero card animation
    const ctx = gsap.context(() => {
      if (heroRef.current) {
        gsap.fromTo(
          heroRef.current.children[0],
          {
            x: -200,
            opacity: 0,
          },
          {
            x: 0,
            opacity: 1,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: heroRef.current,
              start: "top bottom-=100",
              toggleActions: "play none none none",
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, [isMounted]);

  // Automatically scroll events every 3 seconds
  useEffect(() => {
    if (allEvents.length === 0) return;

    const interval = setInterval(() => {
      setCurrentEventIndex((prevIndex) => (prevIndex + 1) % allEvents.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [allEvents]);

  // Common background gradient for all cards
  const cardBackground = {
    background:
      "linear-gradient(90deg, rgba(120,115,119,0.8128501400560224) 0%, rgba(62,5,5,1) 0%, rgba(25,0,0,1) 0%, rgba(88,0,0,1) 48%, rgba(25,0,0,1) 74%)",
  };

  // Get the current event based on the index
  const currentEvent = allEvents[currentEventIndex] || null;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Main content */}
      <main className="pt-24 md:pt-32 pb-16 max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Hero card */}
          <div className="md:col-span-2" ref={heroRef}>
            <motion.div
              className="rounded-3xl p-4 md:p-8 relative overflow-hidden opacity-0"
              style={cardBackground}
              whileHover={{ scale: 1.02 }}
              suppressHydrationWarning
            >
              <div className="relative z-10 text-white">
                <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold mb-2 md:mb-4">Bits &apos;N&apos; Bytes</h1>
                <p className="text-lg md:text-xl mb-4 md:mb-8 ml-4 md:ml-16">Where Culture Meets Code</p>
                <Link
                  href="/about"
                  className="bg-red-600 text-white px-6 md:px-8 py-2 md:py-3 ml-8 md:ml-24 rounded-md text-base md:text-lg font-medium shadow-lg"
                >
                  Explore More
                </Link>
              </div>

              {/* logo */}
              <div className="absolute right-2 md:right-4 lg:right-12 top-1/2 -translate-y-1/2">
                {isMounted && (
                  <motion.div
                    className="relative w-24 h-40 md:w-40 md:h-64 lg:w-48 lg:h-72"
                    animate={{
                      rotate: [0, 2, 0, -2, 0],
                      y: [0, -10, 0, -5, 0],
                    }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 6,
                      ease: "easeInOut",
                    }}
                    suppressHydrationWarning
                  >
                    <Image
                      src="/logo.png"
                      alt="Floating Logo"
                      width={150}
                      height={150}
                      className="rounded-xl shadow-xl mt-[13vh] w-24 h-24 md:w-auto md:h-auto"
                      suppressHydrationWarning
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Upcoming events */}
          <ProductCard
            title="Upcoming Events"
            textColor="text-white"
            delay={0.2}
            direction="top"
            customStyle={cardBackground}
            isMounted={isMounted}
            suppressHydrationWarning
          >
            {currentEvent && (
              <div className="relative h-24 md:h-32 w-full flex items-center justify-center">
                <div className="relative w-16 h-16 md:w-24 md:h-24 bg-red-600 rounded-lg overflow-hidden">
                  <Image
                    src={currentEvent.image.url || "/placeholder.svg"}
                    alt={currentEvent.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute bottom-[-4] left-0 right-0 text-center text-sm md:text-base font-bold">
                  {currentEvent.name}
                </div>
              </div>
            )}
          </ProductCard>

          <ProductCard
            title="Culture"
            textColor="text-white"
            delay={0.3}
            direction="right"
            customStyle={cardBackground}
            isMounted={isMounted}
            suppressHydrationWarning
          >
            <span className="text-sm md:text-base">We promote culture</span>
            <div className="relative h-24 md:h-32 w-full flex justify-center md:ml-24 md:justify-center items-center">
              {isMounted && (
                <motion.img
                  src={"/culture.png"}
                  alt="Culture Image"
                  className="h-24 w-20 md:h-36 md:w-32 object-cover"
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 2,
                  }}
                  suppressHydrationWarning
                />
              )}
            </div>
          </ProductCard>

          {/* Code */}
          <ProductCard
            title="Code"
            textColor="text-white"
            delay={0.4}
            direction="bottom"
            customStyle={cardBackground}
            isMounted={isMounted}
            suppressHydrationWarning
          >
            <div className="relative h-24 md:h-32 w-full flex items-center justify-center">
              {isMounted && (
                <motion.div
                  className="w-16 h-16 md:w-24 md:h-24 bg-red-600 rounded-lg relative"
                  animate={{
                    rotate: [0, 5, 0, -5, 0],
                  }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 4,
                  }}
                  suppressHydrationWarning
                >
                  <motion.div
                    className="absolute -top-4 -right-4 md:-top-6 md:-right-6 w-8 h-8 md:w-12 md:h-12 bg-yellow-400 rounded-full"
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 2,
                      delay: 1,
                    }}
                    suppressHydrationWarning
                  />
                </motion.div>
              )}
            </div>
          </ProductCard>

          {/* Coin */}
          <ProductCard
            title="Byte coin"
            textColor="text-white"
            delay={0.5}
            direction="bottomRight"
            customStyle={cardBackground}
            isMounted={isMounted}
            suppressHydrationWarning
          >
            <div className="relative h-24 md:h-32 w-full flex items-center justify-end">
              {isMounted && (
                <motion.div
                  className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-yellow-500 via-yellow-400 to-yellow-300
                 rounded-full flex items-center justify-center border-4 border-yellow-600
                 shadow-lg relative overflow-hidden"
                  animate={{
                    y: [0, -5, 0],
                    rotate: [0, 1, -1, 0],
                  }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 3,
                  }}
                  suppressHydrationWarning
                >
                  <span className="text-3xl md:text-5xl font-bold text-yellow-800 shadow-inner">B</span>
                </motion.div>
              )}
            </div>
          </ProductCard>
        </div>

        {/* Features Section */}
        <div className="mt-10 md:mt-14">
          <FeaturesSection />

          {/* Events Section */}
          <EventsSection />
          <LeaderboardSection />
        </div>
      </main>
    </div>
  );
}

interface ProductCardProps {
  title: string;
  color?: string;
  textColor: string;
  delay: number;
  children: React.ReactNode;
  direction?: string;
  customStyle?: React.CSSProperties;
  isMounted: boolean;
  suppressHydrationWarning?: boolean;
}

function ProductCard({
  title,
  color,
  textColor,
  delay,
  children,
  direction = "right",
  customStyle,
  isMounted,
  suppressHydrationWarning,
}: ProductCardProps) {
  const cardRef = useRef(null);

  useEffect(() => {
    if (!isMounted || !cardRef.current) return;
    // Set initial position based on direction
    let xPos = 0;
    let yPos = 0;

    switch (direction) {
      case "left":
        xPos = -100;
        break;
      case "right":
        xPos = 100;
        break;
      case "top":
        yPos = -100;
        break;
      case "bottom":
        yPos = 100;
        break;
      case "topLeft":
        xPos = -100;
        yPos = -100;
        break;
      case "topRight":
        xPos = 100;
        yPos = -100;
        break;
      case "bottomLeft":
        xPos = -100;
        yPos = 100;
        break;
      case "bottomRight":
        xPos = 100;
        yPos = 100;
        break;
    }

    // Create GSAP animation
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        {
          x: xPos,
          y: yPos,
          opacity: 0,
        },
        {
          x: 0,
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          delay: delay,
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top bottom-=100",
            toggleActions: "play none none none",
          },
        }
      );
    });

    return () => ctx.revert();
  }, [delay, direction, isMounted]);

  return (
    <motion.div
      ref={cardRef}
      className={`${color || ""} ${textColor} rounded-3xl p-4 md:p-6 overflow-hidden opacity-0`}
      style={customStyle}
      whileHover={{
        y: -5,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      }}
      suppressHydrationWarning={suppressHydrationWarning}
    >
      <h2 className="text-lg md:text-xl font-bold mb-2 md:mb-4">{title}</h2>
      {children}
    </motion.div>
  );
}
