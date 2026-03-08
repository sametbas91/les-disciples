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
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
      {/* Grande photo en haut à gauche (2x2) */}
      <div className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photos[0]}
          alt=""
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
        />
      </div>

      {/* Photo 2 */}
      <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: '1/1' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photos[1]}
          alt=""
          className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
        />
      </div>

      {/* Photo 3 */}
      <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: '1/1' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photos[2]}
          alt=""
          className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
        />
      </div>

      {/* Photo 4 — large en bas */}
      <div className="col-span-1 md:col-span-2 relative rounded-2xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photos[3]}
          alt=""
          className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
        />
      </div>

      {/* Photo 5 */}
      <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: '1/1' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photos[4]}
          alt=""
          className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
        />
      </div>
    </div>
  )
}
