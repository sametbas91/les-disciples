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
    <div
      style={{
        columns: '2',
        columnGap: '12px',
      }}
    >
      {photos.map((src, i) => (
        <div
          key={i}
          style={{ breakInside: 'avoid', marginBottom: '12px' }}
          className="rounded-2xl overflow-hidden"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            className="w-full h-auto block hover:scale-105 transition-transform duration-700"
          />
        </div>
      ))}
    </div>
  )
}
