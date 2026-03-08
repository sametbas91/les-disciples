import { getServiceSupabase } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import SessionForm from '@/components/sessions/SessionForm'

export const dynamic = 'force-dynamic'

export default async function NewSessionPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const { sessionClaims } = await auth()
  if (sessionClaims?.metadata?.role !== 'admin') redirect('/')

  const { edit } = await searchParams
  const db = getServiceSupabase()

  const { data: members } = await db.from('members').select('*').order('name')

  let session = null
  let existingAttendees: { member_id: string; is_first_time: boolean; is_late: boolean }[] = []

  if (edit) {
    const { data } = await db.from('sessions').select('*').eq('id', edit).single()
    session = data
    const { data: att } = await db.from('attendances').select('member_id, is_first_time, is_late').eq('session_id', edit)
    existingAttendees = (att || []).map((a) => ({ ...a, is_late: a.is_late ?? false }))
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{session ? 'Modifier la session' : 'Nouvelle session'}</h1>
      <SessionForm
        members={members || []}
        session={session}
        existingAttendees={existingAttendees}
      />
    </div>
  )
}
