"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, useScroll } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
let gsapInitialized = false;

export default function About() {

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_SERVER;


  const [isMounted, setIsMounted] = useState(false);
  const [clubHeads, setClubHeads] = useState([]);
  const [divisionHeads, setDivisionHeads] = useState([]);
  const { scrollY } = useScroll();
  const bannerRef = useRef(null);
  const clubHeadsRef = useRef(null);
  const divisionHeadsRef = useRef(null);

  // Initialize client-side only features
  useEffect(() => {
    setIsMounted(true);

    // Register GSAP plugins only on client side
    if (!gsapInitialized && typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
      gsapInitialized = true;
    }

    // Fetch data from API
    const fetchData = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/admin/clubHeads`);
        const headsData = response.data.clubHeads;

        // Categorize heads based on designation
        const clubHeadsArray = [];
        const divisionHeadsArray = [];

        headsData.forEach((head) => {
          if (head.designation === "President" || head.designation === "Vice President") {
            clubHeadsArray.push(head);
          } else {
            divisionHeadsArray.push(head);
          }
        });

        setClubHeads(clubHeadsArray);
        setDivisionHeads(divisionHeadsArray);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const unsubscribe = scrollY.on("change", () => {});

    return () => unsubscribe();
  }, [isMounted, scrollY]);

  useEffect(() => {
    if (!isMounted) return;

    // Create all animations
    const ctx = gsap.context(() => {
      // Banner animation
      if (bannerRef.current) {
        gsap.fromTo(
          bannerRef.current.querySelector('.banner-content'),
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
        );
      }

      // Club heads animation
      if (clubHeadsRef.current) {
        gsap.fromTo(
          clubHeadsRef.current.querySelectorAll('.head-card'),
          {
            scale: 0.8,
            opacity: 0,
            y: 50,
          },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: clubHeadsRef.current,
              start: "top bottom-=150",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // Division heads animation
      if (divisionHeadsRef.current) {
        gsap.fromTo(
          divisionHeadsRef.current.querySelectorAll('.division-card'),
          {
            x: (i) => (i % 2 === 0 ? -100 : 100),
            opacity: 0,
          },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: divisionHeadsRef.current,
              start: "top bottom-=100",
              toggleActions: "play none none none",
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, [isMounted, scrollY]);

  return (
    <div>
      {/* Main content */}
      <main className="pt-24 md:pt-32 pb-16 bg-black">
        {/* Banner Section */}
        <section
          ref={bannerRef}
          className="relative h-80 md:h-96 overflow-hidden"
          style={{
            backgroundImage: "linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url('/m1.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-900/70 to-black/70"></div>

          <div className="banner-content relative z-10 h-full max-w-7xl mx-auto px-4 flex flex-col justify-center items-center text-center">
            <motion.h1
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              About Bits &apos;N&apos; Bytes
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-gray-200 mb-6 max-w-3xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Where Coding Meets Culture
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
              A community of passionate coders and creators, blending technical excellence with cultural awareness to build the future of technology.
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

        {/* About Club Description */}
        <section className="py-12 md:py-16 max-w-7xl mx-auto px-4">
          <div className="bg-gray-900/50 p-6 md:p-10 rounded-3xl border border-gray-800">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-1/2">
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-red-500">Our Mission</h2>
                <p className="text-gray-300 mb-4">
                  Bits &apos;N&apos; Bytes is a dynamic club at the intersection of technology and culture. We foster an environment where students can develop technical skills while exploring the cultural impacts of technology.
                </p>
                <p className="text-gray-300 mb-4">
                  Our activities span from coding workshops and hackathons to discussions on tech ethics and cultural exchanges. We believe that the best innovations come from diverse perspectives and interdisciplinary collaboration.
                </p>
                <p className="text-gray-300">
                  Founded in 2020, we&apos;ve grown to become a hub for students interested in both the technical aspects of computing and its broader societal implications.
                </p>
              </div>

              <div className="md:w-1/2 h-64 md:h-80 relative rounded-xl overflow-hidden">
                {isMounted && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-red-900/60 to-black/70 z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                  />
                )}
                <Image
                  src="/m2.jpeg"
                  alt="Club activities"
                  layout="fill"
                  objectFit="cover"
                  className="z-0"
                />

                {isMounted && (
                  <motion.div
                    className="absolute z-20 bottom-6 left-6 right-6"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  >
                    <span className="text-xl font-bold text-white">Building tomorrow, together</span>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Club Heads Section */}
        <section ref={clubHeadsRef} className="py-12 md:py-16 max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Our Club Heads</h2>
            <div className="w-16 h-1 bg-red-600 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {clubHeads.map((head, index) => (
              <motion.div
                key={index}
                className="head-card relative rounded-xl overflow-hidden"
                style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.9))" }}
                whileHover={{ y: -10, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)" }}
              >
                <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden relative bg-gray-800 flex-shrink-0">
                    <Image
                      src={head.image.url}
                      alt={head.name}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-bold mb-1 text-white">{head.name}</h3>
                    <p className="text-gray-300 text-sm mb-4">{head.bio}</p>

                  
                  </div>
                </div>

                {/* Animated element */}
                {isMounted && (
                  <motion.div
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-red-600"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.6, 1, 0.6],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 3,
                      delay: index * 0.5,
                    }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* Division Heads Section */}
        <section ref={divisionHeadsRef} className="py-12 md:py-16 max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Team Leads</h2>
            <div className="w-16 h-1 bg-red-600 mx-auto mb-4"></div>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Meet our specialized Team leaders who guide different aspects of our club activities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {divisionHeads.map((head, index) => (
              <motion.div
                key={index}
                className="division-card rounded-xl p-4 md:p-6"
                style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.9))" }}
                whileHover={{ scale: 1.03 }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden relative bg-gray-800 flex-shrink-0">
                    <Image
                      src={head.image.url}
                      alt={head.name}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-bold text-teal-50">{head.name}</h3>
                    <p className="text-red-400 text-sm md:text-base font-medium mb-1">{head.designation}</p>
                    <p className="text-gray-300 text-xs md:text-sm mb-2">{head.bio}</p>

                  
                  </div>

                  {/* Animated decorative element */}
                  {isMounted && (
                    <motion.div
                      className="w-12 h-12 rounded-md bg-red-600/20 absolute -bottom-2 -right-2"
                      animate={{
                        rotate: [0, 10, 0, -10, 0],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 6,
                        delay: index * 0.3,
                      }}
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Join Us CTA Section */}
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
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Join Our Community</h2>
              <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
                Become part of the Bits &apos;N&apos; Bytes family and help us bridge technology and culture.
              </p>

              <motion.button
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg text-lg font-medium shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                Apply Now
              </motion.button>
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

      {/* Simple Footer */}
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
            Where Coding Meets Culture • © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}