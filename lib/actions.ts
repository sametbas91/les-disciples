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
  const attendees = JSON.parse(formData.get('attendees') as string) as { member_id: string; is_first_time: boolean }[]

  const { data: session, error } = await db
    .from('sessions')
    .insert({ date, theme, duration })
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
  const attendees = JSON.parse(formData.get('attendees') as string) as { member_id: string; is_first_time: boolean }[]

  const { error } = await db.from('sessions').update({ date, theme, duration }).eq('id', id)
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
export async function addComment(sessionId: string, content: string) {
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
  })

  if (error) throw new Error(error.message)
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

// ATTENDANCE
export async function removeAttendance(sessionId: string, memberId: string) {
  await requireAdmin()
  const db = getServiceSupabase()
  const { error } = await db.from('attendances').delete().eq('session_id', sessionId).eq('member_id', memberId)
  if (error) throw new Error(error.message)
  revalidatePath(`/sessions/${sessionId}`)
}
