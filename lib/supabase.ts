import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export type Member = {
  id: string
  name: string
  status: 'Berger' | 'Disciple' | 'Invité(e)'
  birthday: string | null
  created_at: string
}

export type Session = {
  id: string
  date: string
  theme: string
  duration: number
  disciples_count: number | null
  invites_count: number | null
  audio_url: string | null
  created_at: string
}

export type Attendance = {
  id: string
  session_id: string
  member_id: string
  is_first_time: boolean
  created_at: string
  member?: Member
}

export type Profile = {
  id: string
  user_id: string
  first_name: string | null
  last_name: string | null
  birth_date: string | null
  address: string | null
  city: string | null
  country: string | null
  latitude: number | null
  longitude: number | null
  bio: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export type Comment = {
  id: string
  session_id: string
  author_name: string
  author_id: string | null
  content: string
  parent_id: string | null
  created_at: string
}

export type CommentLike = {
  id: string
  comment_id: string
  user_id: string
  created_at: string
}
