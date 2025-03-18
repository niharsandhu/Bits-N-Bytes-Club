"use client";


import axios from "axios";
import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, Camera, Share2, Download } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

// Register GSAP plugins only on the client side
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function EventCard({ event, index, isSelected, onClick }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [30, -30]);
  const rotateY = useTransform(x, [-100, 100], [-30, 30]);


  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const centerX = rect.left + width / 2;
    const centerY = rect.top + height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    x.set(mouseX);
    y.set(mouseY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      className="event-card perspective-1000 cursor-pointer"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onClick={onClick}
    >
      <motion.div
        className={`relative h-64 rounded-xl overflow-hidden ${
          isSelected ? "ring-2 ring-red-500 ring-offset-2 ring-offset-black" : ""
        }`}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />

        {/* Background image */}
        <Image
          src={event.images[0].url || "/placeholder.svg"}
          alt={event.title || "Event Image"}
          fill
          className="object-cover transition-transform duration-700 hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 z-20">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            <h3 className="text-2xl font-bold text-white mb-2">{event.eventName}</h3>
            <p className="text-gray-300 text-sm mb-4">{event.eventType}</p>

            <div className="flex items-center">
              <div className="bg-red-600 h-8 w-8 rounded-full flex items-center justify-center mr-3">
                <Camera className="w-4 h-4 text-white" />
              </div>
              <span className="text-white text-sm">{event.images.length} photos</span>
            </div>
          </motion.div>
        </div>

        {/* Hover state */}
        <motion.div
          className="absolute inset-0 bg-red-600/20 opacity-0 z-10"
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />

        {/* Selected indicator */}
        {isSelected && (
          <motion.div
            className="absolute top-4 right-4 bg-red-600 rounded-full w-6 h-6 flex items-center justify-center z-20"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 10 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function GalleryPage() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterYear, setFilterYear] = useState(null);
  const [events, setEvents] = useState([]);
  const containerRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);
  const eventsRef = useRef(null);
  const galleryRef = useRef(null);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_SERVER;

  // Fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/admin/gallery`);
        const data = await response.json();
        setEvents(data.gallery);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
    setIsMounted(true);
  }, []);

  // GSAP animations
  useEffect(() => {
    if (!isLoading && eventsRef.current && typeof window !== "undefined") {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          ".event-card",
          {
            y: 100,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            stagger: 0.15,
            duration: 0.8,
            ease: "back.out(1.2)",
            scrollTrigger: {
              trigger: eventsRef.current,
              start: "top bottom-=50",
              toggleActions: "play none none none",
            },
          },
        );
      });

      return () => ctx.revert();
    }
  }, [isLoading]);

  // Handle image navigation
  const navigateImage = useCallback((direction) => {
    if (!selectedImage) return;

    const currentEvent = events.find((e) => e._id === selectedImage.eventId);
    if (!currentEvent) return;

    const currentIndex = currentEvent.images.findIndex((img) => img._id === selectedImage.imageId);
    const newIndex =
      direction === "next"
        ? (currentIndex + 1) % currentEvent.images.length
        : (currentIndex - 1 + currentEvent.images.length) % currentEvent.images.length;

    const newImage = currentEvent.images[newIndex];
    setSelectedImage({
      src: newImage.url,
      alt: newImage.public_id,
      eventId: selectedImage.eventId,
      imageId: newImage._id,
      year: new Date(currentEvent.eventDate).getFullYear().toString(),
    });
  }, [selectedImage, events]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedImage) {
        if (e.key === "ArrowLeft") navigateImage("prev");
        if (e.key === "ArrowRight") navigateImage("next");
        if (e.key === "Escape") setSelectedImage(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, navigateImage]);

  // Handle share functionality
  const handleShare = useCallback(() => {
    if (navigator.share && selectedImage) {
      navigator.share({
        title: selectedImage.alt,
        text: `Check out this image from ${events.find((e) => e._id === selectedImage.eventId)?.eventName}`,
        url: window.location.href,
      }).catch(() => {
        alert("Sharing is not available on this device or browser.");
      });
    } else {
      alert("Sharing is not available on this device or browser.");
    }
  }, [selectedImage, events]);

  // Handle download functionality
  const handleDownload = useCallback(() => {
    if (selectedImage) {
      const link = document.createElement('a');
      link.href = selectedImage.src;
      link.download = `${selectedImage.alt.replace(/ /g, '_')}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [selectedImage]);

  // Filter images by year
  const getFilteredImages = useCallback((eventId) => {
    const event = events.find((e) => e._id === eventId);
    if (!event) return [];

    if (!filterYear) return event.images;

    return event.images.filter(img => new Date(event.eventDate).getFullYear().toString() === filterYear);
  }, [filterYear, events]);

  // Get unique years for filter
  const getUniqueYears = useCallback((eventId) => {
    const event = events.find((e) => e._id === eventId);
    if (!event) return [];

    return [...new Set(event.images.map(img => new Date(event.eventDate).getFullYear().toString()))].sort().reverse();
  }, [events]);

  // Loading animation
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div className="flex flex-col items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <motion.div
            className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />
          <motion.p
            className="text-white text-lg"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          >
            Loading Gallery...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-24 px-4 md:px-6" ref={containerRef}>
      <div className="max-w-7xl mx-auto">
        {/* Header with animated text */}
        <div className="banner-content relative z-10 h-full max-w-7xl mx-auto px-4 flex flex-col justify-center items-center text-center">
          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Event Gallery
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-gray-200 mb-6 max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Explore our events and relive the moments
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
      </div>
      {/* Event Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16" ref={eventsRef}>
        {events?.map((event, index) => (
          <EventCard
            key={event._id}
            event={event}
            index={index}
            isSelected={selectedEvent === event._id}
            onClick={() => {
              setSelectedEvent(event._id === selectedEvent ? null : event._id);
              setFilterYear(null);
            }}
          />
        ))}
      </div>

      {/* Gallery Grid */}
      <div ref={galleryRef}>
        <AnimatePresence mode="wait">
          {selectedEvent ? (
            <motion.div
              key={selectedEvent}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                <div className="flex flex-col md:flex-row md:items-center mb-4 md:mb-0">
                  <motion.h2
                    className="text-2xl md:text-3xl font-bold text-white flex items-center mr-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <span className="text-red-500 mr-2">#</span>
                    {events.find((e) => e._id === selectedEvent)?.eventName}
                  </motion.h2>

                  {/* Year filter */}
                  <div className="mt-2 md:mt-0 flex items-center">
                    <span className="text-gray-400 mr-2 text-sm">Filter by year:</span>
                    <div className="flex space-x-2">
                      <button
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${!filterYear ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                        onClick={() => setFilterYear(null)}
                      >
                        All
                      </button>
                      {getUniqueYears(selectedEvent).map(year => (
                        <button
                          key={year}
                          className={`px-3 py-1 text-sm rounded-full transition-colors ${filterYear === year ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                          onClick={() => setFilterYear(year)}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <motion.button
                  className="text-gray-400 hover:text-white transition-colors flex items-center text-sm"
                  onClick={() => {
                    setSelectedEvent(null);
                    setFilterYear(null);
                  }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="mr-1">View All Events</span>
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Masonry grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-[minmax(200px,auto)]">
                {getFilteredImages(selectedEvent).length > 0 ? (
                  getFilteredImages(selectedEvent).map((image, index) => (
                    <motion.div
                      key={image._id}
                      className={`relative rounded-xl overflow-hidden cursor-pointer ${
                        index % 5 === 0 ? "row-span-2 col-span-1" : index % 7 === 0 ? "col-span-2" : ""
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      whileHover={{
                        scale: 1.02,
                        transition: { duration: 0.2 },
                      }}
                      onClick={() =>
                        setSelectedImage({
                          src: image.url,
                          alt: image.public_id,
                          eventId: selectedEvent,
                          imageId: image._id,
                          year: new Date(events.find((e) => e._id === selectedEvent).eventDate).getFullYear().toString(),
                        })
                      }
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />

                      <Image
                        src={image.url || "/placeholder.svg"}
                        alt={image.public_id}
                        fill
                        className="object-cover transition-transform duration-700 hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />

                      <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                        <div className="flex items-center justify-between">
                          
                          <span className="text-gray-300 text-sm bg-black/50 px-2 py-1 rounded">{image.year}</span>
                        </div>
                      </div>

                      <motion.div
                        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300 z-20"
                        whileHover={{ opacity: 1 }}
                      >
                        <motion.div className="bg-red-600 rounded-full p-3" whileHover={{ scale: 1.1 }}>
                          <Camera className="w-6 h-6 text-white" />
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-12">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center"
                    >
                      <Camera className="w-12 h-12 mb-4 text-red-500 opacity-50" />
                      <p className="text-xl text-gray-400">No images found for {filterYear}</p>
                      <button
                        className="mt-4 px-4 py-2 bg-red-600 rounded-full text-white text-sm hover:bg-red-700 transition-colors"
                        onClick={() => setFilterYear(null)}
                      >
                        View all images
                      </button>
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-400 py-12 flex flex-col items-center"
            >
              <Camera className="w-12 h-12 mb-4 text-red-500" />
              <p className="text-xl">Select an event to view its gallery</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              className="relative max-w-7xl w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                className="absolute top-4 right-4 text-white p-2 rounded-full bg-red-600/80 hover:bg-red-600 transition-colors z-10"
                onClick={() => setSelectedImage(null)}
              >
                <X className="w-6 h-6" />
              </button>

              {/* Navigation buttons */}
              <button
                className="absolute left-4 text-white p-3 rounded-full bg-black/50 hover:bg-red-600/80 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage("prev");
                }}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                className="absolute right-4 text-white p-3 rounded-full bg-black/50 hover:bg-red-600/80 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage("next");
                }}
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Image */}
              <motion.div
                className="relative w-full h-full flex items-center justify-center"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25 }}
              >
                <Image
                  src={selectedImage.src || "/placeholder.svg"}
                  alt={selectedImage.alt}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />

                {/* Image info overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 md:p-6">
                  <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div>
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-1">{selectedImage.alt}</h3>
                        <p className="text-gray-300 text-sm">
                          {events.find((e) => e._id === selectedImage.eventId)?.eventName} • {selectedImage.year}
                        </p>
                      </div>

                      <div className="mt-2 md:mt-0 flex space-x-3">
                        <motion.button
                          className="bg-white/10 hover:bg-white/20 text-white text-sm py-1 px-3 rounded-full flex items-center"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleShare}
                        >
                          <Share2 className="w-4 h-4 mr-1" />
                          <span>Share</span>
                        </motion.button>
                        <motion.button
                          className="bg-red-600 hover:bg-red-700 text-white text-sm py-1 px-3 rounded-full flex items-center"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleDownload}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          <span>Download</span>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


