'use server'

import { auth, currentUser } from '@clerk/nextjs/server'
import { getServiceSupabase } from './supabase'
import { revalidatePath } from 'next/cache'

async function requireAdmin() {
  const { sessionClaims } = await auth()
  if (sessionClaims?.metadata?.role !== 'admin') {
    throw new Error('Non autorise')
  }
}

// SESSIONS
export async function createSession(formData: FormData) {
  await requireAdmin()
  const db = getServiceSupabase()

  const date = formData.get('date') as string
  const theme = formData.get('theme') as string
  const duration = parseInt(formData.get('duration') as string)
  const disciplesCountRaw = formData.get('disciples_count') as string
  const invitesCountRaw = formData.get('invites_count') as string
  const disciples_count = disciplesCountRaw ? parseInt(disciplesCountRaw) : null
  const invites_count = invitesCountRaw ? parseInt(invitesCountRaw) : null
  const attendees = JSON.parse(formData.get('attendees') as string) as { member_id: string; is_first_time: boolean }[]

  const { data: session, error } = await db
    .from('sessions')
    .insert({ date, theme, duration, disciples_count, invites_count })
    .select()
    .single()

  if (error) throw new Error(error.message)

  if (attendees.length > 0) {
    const { error: attError } = await db.from('attendances').insert(
      attendees.map((a) => ({
        session_id: session.id,
        member_id: a.member_id,
        is_first_time: a.is_first_time,
      }))
    )
    if (attError) throw new Error(attError.message)
  }

  revalidatePath('/')
  revalidatePath('/sessions')
  return session
}

export async function updateSession(id: string, formData: FormData) {
  await requireAdmin()
  const db = getServiceSupabase()

  const date = formData.get('date') as string
  const theme = formData.get('theme') as string
  const duration = parseInt(formData.get('duration') as string)
  const disciplesCountRaw = formData.get('disciples_count') as string
  const invitesCountRaw = formData.get('invites_count') as string
  const disciples_count = disciplesCountRaw ? parseInt(disciplesCountRaw) : null
  const invites_count = invitesCountRaw ? parseInt(invitesCountRaw) : null
  const attendees = JSON.parse(formData.get('attendees') as string) as { member_id: string; is_first_time: boolean }[]

  const { error } = await db.from('sessions').update({ date, theme, duration, disciples_count, invites_count }).eq('id', id)
  if (error) throw new Error(error.message)

  await db.from('attendances').delete().eq('session_id', id)

  if (attendees.length > 0) {
    await db.from('attendances').insert(
      attendees.map((a) => ({
        session_id: id,
        member_id: a.member_id,
        is_first_time: a.is_first_time,
      }))
    )
  }

  revalidatePath('/')
  revalidatePath('/sessions')
  revalidatePath(`/sessions/${id}`)
}

export async function deleteSession(id: string) {
  await requireAdmin()
  const db = getServiceSupabase()
  const { error } = await db.from('sessions').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/')
  revalidatePath('/sessions')
}

// MEMBERS
export async function createMember(formData: FormData) {
  await requireAdmin()
  const db = getServiceSupabase()

  const name = formData.get('name') as string
  const status = formData.get('status') as string
  const birthday = formData.get('birthday') as string || null

  const { data, error } = await db
    .from('members')
    .insert({ name, status, birthday })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/membres')
  return data
}

export async function updateMember(id: string, formData: FormData) {
  await requireAdmin()
  const db = getServiceSupabase()

  const updates: Record<string, unknown> = {}
  const name = formData.get('name')
  const status = formData.get('status')
  const birthday = formData.get('birthday')

  if (name) updates.name = name
  if (status) updates.status = status
  if (birthday !== null) updates.birthday = birthday || null

  const { error } = await db.from('members').update(updates).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/membres')
  revalidatePath('/')
}

export async function deleteMember(id: string) {
  await requireAdmin()
  const db = getServiceSupabase()
  const { error } = await db.from('members').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/membres')
  revalidatePath('/')
}

// COMMENTS
export async function addComment(sessionId: string, content: string, parentId?: string) {
  const user = await currentUser()
  if (!user) throw new Error('Connexion requise')

  const db = getServiceSupabase()
  const authorName = user.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user.emailAddresses[0]?.emailAddress || 'Anonyme'

  const { error } = await db.from('comments').insert({
    session_id: sessionId,
    author_name: authorName,
    author_id: user.id,
    content,
    parent_id: parentId || null,
  })

  if (error) throw new Error(error.message)
  revalidatePath(`/sessions/${sessionId}`)
}

export async function toggleCommentLike(commentId: string, sessionId: string) {
  const user = await currentUser()
  if (!user) throw new Error('Connexion requise')

  const db = getServiceSupabase()

  const { data: existing } = await db
    .from('comment_likes')
    .select('id')
    .eq('comment_id', commentId)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    await db.from('comment_likes').delete().eq('id', existing.id)
  } else {
    await db.from('comment_likes').insert({ comment_id: commentId, user_id: user.id })
  }

  revalidatePath(`/sessions/${sessionId}`)
}

export async function deleteComment(commentId: string, sessionId: string) {
  const user = await currentUser()
  if (!user) throw new Error('Connexion requise')

  const db = getServiceSupabase()
  const { sessionClaims } = await auth()
  const isAdmin = sessionClaims?.metadata?.role === 'admin'

  if (!isAdmin) {
    const { data: comment } = await db.from('comments').select('author_id').eq('id', commentId).single()
    if (comment?.author_id !== user.id) throw new Error('Non autorise')
  }

  const { error } = await db.from('comments').delete().eq('id', commentId)
  if (error) throw new Error(error.message)
  revalidatePath(`/sessions/${sessionId}`)
}

// PROFILES
export async function saveProfile(formData: FormData) {
  const user = await currentUser()
  if (!user) throw new Error('Connexion requise')

  const db = getServiceSupabase()

  const first_name = formData.get('first_name') as string || null
  const last_name = formData.get('last_name') as string || null
  const birth_date = formData.get('birth_date') as string || null
  const address = formData.get('address') as string || null
  const city = formData.get('city') as string || null
  const country = formData.get('country') as string || null
  const bio = formData.get('bio') as string || null
  const avatarFile = formData.get('avatar') as File | null

  // Upload avatar to Supabase Storage if provided
  let avatar_url: string | undefined = undefined
  if (avatarFile && avatarFile.size > 0) {
    const ext = avatarFile.name.split('.').pop() || 'jpg'
    const filePath = `${user.id}/avatar.${ext}`
    const buffer = Buffer.from(await avatarFile.arrayBuffer())

    const { error: uploadError } = await db.storage
      .from('avatars')
      .upload(filePath, buffer, {
        upsert: true,
        contentType: avatarFile.type,
      })

    if (!uploadError) {
      const { data: publicUrl } = db.storage.from('avatars').getPublicUrl(filePath)
      avatar_url = `${publicUrl.publicUrl}?t=${Date.now()}`
    }
  }

  // Geocode address
  let latitude: number | null = null
  let longitude: number | null = null

  const addressParts = [address, city, country].filter(Boolean).join(', ')
  if (addressParts) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressParts)}&limit=1`,
        { headers: { 'User-Agent': 'LesDisciplesApp/1.0' } }
      )
      const data = await res.json()
      if (data.length > 0) {
        latitude = parseFloat(data[0].lat)
        longitude = parseFloat(data[0].lon)
      }
    } catch {
      // Geocoding failed silently
    }
  }

  const profileData: Record<string, unknown> = {
    user_id: user.id,
    first_name,
    last_name,
    birth_date: birth_date || null,
    address,
    city,
    country,
    latitude,
    longitude,
    bio,
    updated_at: new Date().toISOString(),
  }

  if (avatar_url !== undefined) {
    profileData.avatar_url = avatar_url
  }

  const { data: existing } = await db
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (existing) {
    const { error } = await db.from('profiles').update(profileData).eq('user_id', user.id)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await db.from('profiles').insert(profileData)
    if (error) throw new Error(error.message)
  }

  revalidatePath('/profil')
  revalidatePath('/')
}

// ATTENDANCE
export async function removeAttendance(sessionId: string, memberId: string) {
  await requireAdmin()
  const db = getServiceSupabase()
  const { error } = await db.from('attendances').delete().eq('session_id', sessionId).eq('member_id', memberId)
  if (error) throw new Error(error.message)
  revalidatePath(`/sessions/${sessionId}`)
}
