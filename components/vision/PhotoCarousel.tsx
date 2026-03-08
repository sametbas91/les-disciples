'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const photos = [
  { src: '/images/vision/photo1.jpg', label: 'Le noyau — les 6 premiers' },
  { src: '/images/vision/photo2.jpg', label: 'Le réseau — plus de 20 frères' },
  { src: '/images/vision/photo3.jpg', label: 'La communauté — ensemble après la séance' },
  { src: '/images/vision/photo4.jpg', label: 'La famille — en dehors des sessions' },
  { src: '/images/vision/photo5.jpg', label: "L'équipe — unis pour la mission" },
]

export default function PhotoCarousel() {
  const [current, setCurrent] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const go = (index: number) => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrent((index + photos.length) % photos.length)
    setTimeout(() => setIsAnimating(false), 600)
  }

  useEffect(() => {
    timerRef.current = setInterval(() => go(current + 1), 4500)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current])

  return (
    <div className="relative w-full overflow-hidden rounded-2xl" style={{ aspectRatio: '16/9' }}>
      {photos.map((photo, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-all duration-700 ease-in-out"
          style={{
            opacity: i === current ? 1 : 0,
            transform: i === current ? 'scale(1)' : 'scale(1.04)',
            zIndex: i === current ? 1 : 0,
          }}
        >
          <Image
            src={photo.src}
            alt={photo.label}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 80vw"
            priority={i === 0}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          {/* Caption */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p className="text-white/90 text-sm font-medium tracking-wider uppercase">{photo.label}</p>
          </div>
        </div>
      ))}

      {/* Navigation arrows */}
      <button
        onClick={() => go(current - 1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all hover:scale-110"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={() => go(current + 1)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all hover:scale-110"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {photos.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className={`transition-all duration-300 rounded-full ${
              i === current ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
