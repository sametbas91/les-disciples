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

  // 6 dernières séances (fenêtre glissante)
  const last6Sessions = sessions?.slice(-6) || []
  const last6Ids = new Set(last6Sessions.map((s) => s.id))
  const last6Count = last6Sessions.length

  // Stats globales (pour "séances assistées" au total)
  const memberStatsTotal = new Map<string, number>()
  attendances?.forEach((a) => {
    memberStatsTotal.set(a.member_id, (memberStatsTotal.get(a.member_id) || 0) + 1)
  })

  // Stats sur les 6 dernières
  const memberStatsLast6 = new Map<string, number>()
  attendances?.filter((a) => last6Ids.has(a.session_id)).forEach((a) => {
    memberStatsLast6.set(a.member_id, (memberStatsLast6.get(a.member_id) || 0) + 1)
  })

  const membersWithStats = (members || []).map((m) => ({
    ...m,
    sessionsAttended: memberStatsTotal.get(m.id) || 0,
    sessionsAttendedLast6: memberStatsLast6.get(m.id) || 0,
    attendanceRate: last6Count > 0 ? Math.round(((memberStatsLast6.get(m.id) || 0) / last6Count) * 100) : 0,
    isNew: (memberStatsTotal.get(m.id) || 0) <= 3 && (memberStatsTotal.get(m.id) || 0) > 0,
  }))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Membres</h1>
      <MembersList members={membersWithStats} isAdmin={isAdmin} totalSessions={totalSessions} last6Count={last6Count} isLoggedIn={isLoggedIn} />
    </div>
  )
}
