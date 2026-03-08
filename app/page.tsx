import { getServiceSupabase } from '@/lib/supabase'
import { formatDuration, formatDate, daysUntilBirthday, getNextSunday } from '@/lib/utils'
import KPICard from '@/components/dashboard/KPICard'
import AttendanceChart from '@/components/dashboard/AttendanceChart'
import DonutChart from '@/components/dashboard/DonutChart'
import BirthdayWidget from '@/components/dashboard/BirthdayWidget'
import Link from 'next/link'
import MembersMapWrapper from '@/components/dashboard/MembersMapWrapper'
import AgeChart from '@/components/dashboard/AgeChart'
import { Calendar, Clock, Users, BookOpen, Target, TrendingUp, ExternalLink, MapPin } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const db = getServiceSupabase()

  const [
    { data: sessions },
    { data: members },
    { data: attendances },
    { data: profiles },
  ] = await Promise.all([
    db.from('sessions').select('*').order('date', { ascending: true }),
    db.from('members').select('*'),
    db.from('attendances').select('*, member:members(*)'),
    db.from('profiles').select('first_name, last_name, city, country, latitude, longitude, avatar_url, birth_date'),
  ])

  const totalSessions = sessions?.length || 0
  const disciples = members?.filter((m) => m.status === 'Disciple') || []
  const invites = members?.filter((m) => m.status === 'Invité(e)') || []
  const totalDuration = sessions?.reduce((sum, s) => sum + s.duration, 0) || 0

  const uniqueParticipants = new Set(attendances?.map((a) => a.member_id)).size

  // Taux de fidélité — disciples uniquement, 6 dernières séances
  const last6Sessions = sessions?.slice(-6) || []
  const last6Ids = new Set(last6Sessions.map((s) => s.id))
  const discipleMemberIds = new Set(members?.filter((m) => m.status === 'Disciple').map((m) => m.id))
  const last6Attendances = attendances?.filter((a) => last6Ids.has(a.session_id) && discipleMemberIds.has(a.member_id)) || []
  const discipleAttCountMap = new Map<string, number>()
  last6Attendances.forEach((a) => {
    discipleAttCountMap.set(a.member_id, (discipleAttCountMap.get(a.member_id) || 0) + 1)
  })
  const avgFidelity = last6Sessions.length > 0 && discipleMemberIds.size > 0
    ? Math.round(
        Array.from(discipleAttCountMap.values()).reduce((s, c) => s + c, 0) /
        discipleMemberIds.size /
        last6Sessions.length * 100
      )
    : 0

  // Chart data — seulement à partir du 25/01/2026 (début des enregistrements réels)
  const CHART_START = new Date('2026-01-25')
  const chartData = sessions?.filter((s) => new Date(s.date) >= CHART_START).map((s) => {
    const sessionAttendances = attendances?.filter((a) => a.session_id === s.id) || []
    const hasAtt = sessionAttendances.length > 0
    const discipleCount = hasAtt ? sessionAttendances.filter((a) => a.member?.status === 'Disciple').length : (s.disciples_count ?? 0)
    const inviteCount = hasAtt ? sessionAttendances.filter((a) => a.member?.status !== 'Disciple').length : (s.invites_count ?? 0)
    return {
      date: new Date(s.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      Disciples: discipleCount,
      'Invités': inviteCount,
      Total: hasAtt ? sessionAttendances.length : (discipleCount + inviteCount),
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

  // Age data from profiles - individual members
  const now2 = new Date()
  const ageData = (profiles || [])
    .filter((p) => p.birth_date && p.first_name)
    .map((p) => ({
      name: p.first_name!,
      age: Math.floor((now2.getTime() - new Date(p.birth_date!).getTime()) / (365.25 * 24 * 60 * 60 * 1000)),
    }))

  const nextSunday = getNextSunday()

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-primary mb-2">
          Impact Disciple
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <KPICard icon={<BookOpen size={20} />} label="Sessions" value={totalSessions} />
        <KPICard icon={<Users size={20} />} label="Participants uniques" value={uniqueParticipants} />
        <KPICard icon={<Target size={20} />} label="Disciples" value={disciples.length} color="text-disciple" />
        <KPICard icon={<Users size={20} />} label="Invit&eacute;s" value={invites.length} color="text-invite" />
        <KPICard icon={<Clock size={20} />} label="Heures totales" value={`${Math.round(totalDuration / 60)}h`} subtitle="sur toutes les sessions" />
        <KPICard icon={<TrendingUp size={20} />} label="Assiduit&eacute; disciples" value={`${avgFidelity}%`} subtitle="6 derni&egrave;res s&eacute;ances" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="md:col-span-2 bg-card border border-border rounded-2xl p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4">Participation par session</h2>
          <AttendanceChart data={chartData} />
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4">R&eacute;partition</h2>
          <DonutChart disciples={disciples.length} invites={invites.length} />
        </div>
      </div>

      {/* Age Distribution */}
      <div className="bg-card border border-border rounded-2xl p-4 sm:p-6">
        <h2 className="text-lg font-semibold mb-4">Repartition des ages</h2>
        <AgeChart data={ageData} />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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

      {/* Members Map - bottom */}
      <div className="bg-card border border-border rounded-2xl p-4 sm:p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MapPin size={20} className="text-primary" />
          Ou sont nos membres ?
        </h2>
        {(profiles || []).some((p) => p.latitude && p.longitude) ? (
          <MembersMapWrapper profiles={(profiles || []).filter((p) => p.latitude && p.longitude) as { first_name: string | null; last_name: string | null; city: string | null; country: string | null; latitude: number; longitude: number; avatar_url: string | null }[]} />
        ) : (
          <div className="h-[300px] rounded-xl bg-card-hover border border-border flex flex-col items-center justify-center gap-3">
            <MapPin size={40} className="text-muted" />
            <p className="text-muted text-sm text-center max-w-xs">
              Aucun membre n&apos;a encore partage sa localisation. Remplis ton profil pour apparaitre sur la carte !
            </p>
            <a href="/profil" className="text-primary text-sm hover:text-primary-light transition-colors">
              Completer mon profil
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
