import { getServiceSupabase } from '@/lib/supabase'
import { formatDuration, formatDate, daysUntilBirthday, getNextSunday } from '@/lib/utils'
import KPICard from '@/components/dashboard/KPICard'
import AttendanceChart from '@/components/dashboard/AttendanceChart'
import DonutChart from '@/components/dashboard/DonutChart'
import BirthdayWidget from '@/components/dashboard/BirthdayWidget'
import Link from 'next/link'
import { Calendar, Clock, Users, BookOpen, Target, TrendingUp, ExternalLink } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const db = getServiceSupabase()

  const [
    { data: sessions },
    { data: members },
    { data: attendances },
  ] = await Promise.all([
    db.from('sessions').select('*').order('date', { ascending: true }),
    db.from('members').select('*'),
    db.from('attendances').select('*, member:members(*)'),
  ])

  const totalSessions = sessions?.length || 0
  const disciples = members?.filter((m) => m.status === 'Disciple') || []
  const invites = members?.filter((m) => m.status === 'Invit\u00e9(e)') || []
  const totalDuration = sessions?.reduce((sum, s) => sum + s.duration, 0) || 0

  const uniqueParticipants = new Set(attendances?.map((a) => a.member_id)).size

  // Taux de fidelite
  const memberAttendanceCounts = new Map<string, number>()
  attendances?.forEach((a) => {
    memberAttendanceCounts.set(a.member_id, (memberAttendanceCounts.get(a.member_id) || 0) + 1)
  })
  const avgFidelity = totalSessions > 0 && memberAttendanceCounts.size > 0
    ? Math.round(
        (Array.from(memberAttendanceCounts.values()).reduce((s, c) => s + c, 0) /
          memberAttendanceCounts.size /
          totalSessions) *
          100
      )
    : 0

  // Chart data
  const chartData = sessions?.map((s) => {
    const sessionAttendances = attendances?.filter((a) => a.session_id === s.id) || []
    const discipleCount = sessionAttendances.filter((a) => a.member?.status === 'Disciple').length
    const inviteCount = sessionAttendances.filter((a) => a.member?.status !== 'Disciple').length
    return {
      date: new Date(s.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      Disciples: discipleCount,
      'Invit\u00e9s': inviteCount,
      Total: sessionAttendances.length,
    }
  }) || []

  // Birthdays
  const membersWithBirthday = members
    ?.filter((m) => m.birthday)
    .map((m) => ({
      ...m,
      daysUntil: daysUntilBirthday(m.birthday!),
    }))
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 3) || []

  // Last session
  const lastSession = sessions?.[sessions.length - 1]
  const lastSessionAttendances = lastSession
    ? attendances?.filter((a) => a.session_id === lastSession.id) || []
    : []

  // Nouveaux ce mois
  const now = new Date()
  const firstTimers = attendances?.filter((a) => {
    if (!a.is_first_time) return false
    const session = sessions?.find((s) => s.id === a.session_id)
    if (!session) return false
    const sDate = new Date(session.date)
    return sDate.getMonth() === now.getMonth() && sDate.getFullYear() === now.getFullYear()
  }) || []

  const nextSunday = getNextSunday()

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-primary mb-2">
          Les Disciples
        </h1>
        <p className="text-muted text-sm sm:text-base mb-4">
          Groupe de jeunes hommes du RGL d&apos;AP Samuel qui veulent vivre et d&eacute;montrer Christ &agrave; leur g&eacute;n&eacute;ration.
        </p>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2 text-foreground">
            <Calendar size={16} className="text-primary" />
            <span>Prochaine session : Dimanche {nextSunday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} &agrave; 21h00</span>
          </div>
          <a
            href="https://meet.google.com/ppe-fwcd-sbr"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-primary hover:text-primary-light transition-colors"
          >
            <ExternalLink size={16} />
            Rejoindre le Meet
          </a>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard icon={<BookOpen size={20} />} label="Sessions" value={totalSessions} />
        <KPICard icon={<Users size={20} />} label="Participants uniques" value={uniqueParticipants} />
        <KPICard icon={<Target size={20} />} label="Disciples" value={disciples.length} color="text-disciple" />
        <KPICard icon={<Users size={20} />} label="Invit&eacute;s" value={invites.length} color="text-invite" />
        <KPICard icon={<Clock size={20} />} label="Heures totales" value={`${Math.round(totalDuration / 60)}h`} />
        <KPICard icon={<TrendingUp size={20} />} label="Fid&eacute;lit&eacute;" value={`${avgFidelity}%`} />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Participation par session</h2>
          <AttendanceChart data={chartData} />
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">R&eacute;partition</h2>
          <DonutChart disciples={disciples.length} invites={invites.length} />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Birthdays */}
        <BirthdayWidget members={membersWithBirthday} />

        {/* Last session */}
        {lastSession && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Derni&egrave;re session</h2>
            <Link href={`/sessions/${lastSession.id}`} className="block hover:bg-card-hover rounded-xl p-3 -m-3 transition-colors">
              <p className="text-primary font-medium">{lastSession.theme}</p>
              <p className="text-muted text-sm mt-1">{formatDate(lastSession.date)}</p>
              <div className="flex gap-4 mt-2 text-sm text-muted">
                <span>{formatDuration(lastSession.duration)}</span>
                <span>{lastSessionAttendances.length} pr&eacute;sents</span>
              </div>
            </Link>
          </div>
        )}

        {/* Nouveaux ce mois */}
        {firstTimers.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Nouveaux ce mois-ci</h2>
            <div className="space-y-2">
              {firstTimers.map((a) => (
                <div key={a.id} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-nouveau" />
                  <span className="text-sm">{a.member?.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
