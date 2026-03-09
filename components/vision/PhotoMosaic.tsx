'use client'

const photos = [
  '/images/vision/photo1.jpeg',
  '/images/vision/photo2.jpeg',
  '/images/vision/photo3.jpeg',
  '/images/vision/photo4.jpeg',
  '/images/vision/photo5.jpeg',
]

export default function PhotoMosaic() {
  return (
    <div className="flex flex-col gap-2 md:gap-3">
      {/* Ligne 1 : grande photo gauche + petite droite */}
      <div className="flex gap-2 md:gap-3">
        <div className="flex-[2] relative rounded-2xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photos[0]} alt="" className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700" />
        </div>
        <div className="flex-1 relative rounded-2xl overflow-hidden" style={{ aspectRatio: '3/4' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photos[1]} alt="" className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700" />
        </div>
      </div>

      {/* Ligne 2 : petite gauche + grande droite */}
      <div className="flex gap-2 md:gap-3">
        <div className="flex-1 relative rounded-2xl overflow-hidden" style={{ aspectRatio: '3/4' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photos[2]} alt="" className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700" />
        </div>
        <div className="flex-[2] relative rounded-2xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photos[3]} alt="" className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700" />
        </div>
      </div>

      {/* Ligne 3 : photo pleine largeur */}
      <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: '21/9' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photos[4]} alt="" className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700" />
      </div>
    </div>
  )
}
