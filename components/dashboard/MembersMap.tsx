'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

type MapProfile = {
  first_name: string | null
  last_name: string | null
  city: string | null
  country: string | null
  latitude: number
  longitude: number
  avatar_url: string | null
}

function createAvatarIcon(avatarUrl: string | null) {
  const url = avatarUrl || '/default-avatar.png'
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="width:36px;height:36px;border-radius:50%;border:2px solid #c9922a;overflow:hidden;background:#111;">
      <img src="${url}" style="width:100%;height:100%;object-fit:cover;" />
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  })
}

export default function MembersMap({ profiles }: { profiles: MapProfile[] }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div className="h-[400px] bg-card rounded-xl animate-pulse" />

  const validProfiles = profiles.filter((p) => p.latitude && p.longitude)

  if (validProfiles.length === 0) {
    return (
      <div className="h-[400px] bg-card rounded-xl flex items-center justify-center text-muted text-sm">
        Aucun membre n&apos;a renseigne son adresse.
      </div>
    )
  }

  const center: [number, number] = [48.8566, 2.3522]

  return (
    <div className="h-[400px] rounded-xl overflow-hidden border border-border">
      <MapContainer center={center} zoom={8} minZoom={6} maxZoom={18} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {validProfiles.map((p, i) => (
          <Marker key={i} position={[p.latitude, p.longitude]} icon={createAvatarIcon(p.avatar_url)}>
            <Popup>
              <span style={{ color: '#111' }}>
                {p.first_name} {p.last_name}
                {p.city && ` - ${p.city}`}
                {p.country && `, ${p.country}`}
              </span>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
