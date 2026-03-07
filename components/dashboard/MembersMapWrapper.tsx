'use client'

import dynamic from 'next/dynamic'

const MembersMap = dynamic(() => import('./MembersMap'), { ssr: false })

type MapProfile = {
  first_name: string | null
  last_name: string | null
  city: string | null
  country: string | null
  latitude: number
  longitude: number
  avatar_url: string | null
}

export default function MembersMapWrapper({ profiles }: { profiles: MapProfile[] }) {
  return <MembersMap profiles={profiles} />
}
