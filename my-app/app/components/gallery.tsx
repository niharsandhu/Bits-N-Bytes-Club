"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

interface GalleryItem {
  id: string
  title: string
  description?: string
  image: string
  link?: string
  size: "small" | "medium" | "large" | "tall" | "wide"
  color?: string
}

interface GalleryProps {
  items: GalleryItem[]
}

export default function Gallery({ items }: GalleryProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {items.map((item) => (
        <GalleryCard key={item.id} item={item} />
      ))}
    </div>
  )
}

function GalleryCard({ item }: { item: GalleryItem }) {
  const sizeClasses = {
    small: "col-span-1 row-span-1",
    medium: "col-span-1 row-span-2",
    large: "col-span-2 row-span-2",
    tall: "col-span-1 row-span-2",
    wide: "col-span-2 row-span-1",
  }

  const cardContent = (
    <motion.div
      className={`${sizeClasses[item.size]} rounded-xl overflow-hidden relative group`}
      style={{ backgroundColor: item.color || "#111" }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      {item.image && (
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={item.image || "/placeholder.svg"}
            alt={item.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        </div>
      )}
      <div className="relative z-10 p-4 h-full flex flex-col justify-end">
        <h3 className="text-xl font-bold text-white mb-1">{item.title}</h3>
        {item.description && <p className="text-sm text-gray-200">{item.description}</p>}
      </div>
    </motion.div>
  )

  if (item.link) {
    return <Link href={item.link}>{cardContent}</Link>
  }

  return cardContent
}

