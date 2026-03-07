import { getServiceSupabase } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'
import MembersList from '@/components/members/MembersList'

export const dynamic = 'force-dynamic'

export default async function MembresPage() {
  const { sessionClaims, userId } = await auth()
  const isAdmin = sessionClaims?.metadata?.role === 'admin'
  const isLoggedIn = !!userId
  const db = getServiceSupabase()

  const { data: members } = await db.from('members').select('*').order('name')
  const { data: sessions } = await db.from('sessions').select('id')
  const { data: attendances } = await db.from('attendances').select('member_id, session_id')

  const totalSessions = sessions?.length || 0
  const memberStats = new Map<string, number>()
  attendances?.forEach((a) => {
    memberStats.set(a.member_id, (memberStats.get(a.member_id) || 0) + 1)
  })

  const membersWithStats = (members || []).map((m) => ({
    ...m,
    sessionsAttended: memberStats.get(m.id) || 0,
    attendanceRate: totalSessions > 0 ? Math.round(((memberStats.get(m.id) || 0) / totalSessions) * 100) : 0,
    isNew: (memberStats.get(m.id) || 0) <= 3 && (memberStats.get(m.id) || 0) > 0,
  }))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Membres</h1>
      <MembersList members={membersWithStats} isAdmin={isAdmin} totalSessions={totalSessions} isLoggedIn={isLoggedIn} />
    </div>
  )
}
