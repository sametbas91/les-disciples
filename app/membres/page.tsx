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
  const { data: sessions } = await db.from('sessions').select('id').order('date', { ascending: true })
  const { data: attendances } = await db.from('attendances').select('member_id, session_id')

  const totalSessions = sessions?.length || 0

  // Toutes les séances (fenêtre dynamique)
  const allSessionIds = new Set((sessions || []).map((s) => s.id))
  const totalSessionCount = sessions?.length || 0

  // Stats sur toutes les séances
  const memberStatsTotal = new Map<string, number>()
  attendances?.forEach((a) => {
    memberStatsTotal.set(a.member_id, (memberStatsTotal.get(a.member_id) || 0) + 1)
  })

  const membersWithStats = (members || []).map((m) => ({
    ...m,
    sessionsAttended: memberStatsTotal.get(m.id) || 0,
    sessionsAttendedLast6: memberStatsTotal.get(m.id) || 0,
    attendanceRate: totalSessionCount > 0 ? Math.round(((memberStatsTotal.get(m.id) || 0) / totalSessionCount) * 100) : 0,
    isNew: (memberStatsTotal.get(m.id) || 0) <= 3 && (memberStatsTotal.get(m.id) || 0) > 0,
  }))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Membres</h1>
      <MembersList members={membersWithStats} isAdmin={isAdmin} totalSessions={totalSessions} last6Count={totalSessionCount} isLoggedIn={isLoggedIn} />
    </div>
  )
}
