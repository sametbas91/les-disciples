import { getServiceSupabase } from '@/lib/supabase'
import { formatDate, formatDuration } from '@/lib/utils'
import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { Plus, Users, Sparkles } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SessionsPage() {
  const { sessionClaims } = await auth()
  const isAdmin = sessionClaims?.metadata?.role === 'admin'
  const db = getServiceSupabase()

  const { data: sessions } = await db.from('sessions').select('*').order('date', { ascending: false })
  const { data: attendances } = await db.from('attendances').select('session_id, is_first_time')

  const attendanceMap = new Map<string, { total: number; newCount: number }>()
  attendances?.forEach((a) => {
    const entry = attendanceMap.get(a.session_id) || { total: 0, newCount: 0 }
    entry.total++
    if (a.is_first_time) entry.newCount++
    attendanceMap.set(a.session_id, entry)
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold">Sessions</h1>
        {isAdmin && (
          <Link
            href="/sessions/new"
            className="flex items-center gap-2 bg-primary text-background px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors"
          >
            <Plus size={16} />
            Nouvelle session
          </Link>
        )}
      </div>

      <div className="grid gap-4">
        {sessions?.map((session) => {
          const raw = attendanceMap.get(session.id)
          const stats = raw || { total: (session.disciples_count ?? 0) + (session.invites_count ?? 0), newCount: 0 }
          return (
            <Link
              key={session.id}
              href={`/sessions/${session.id}`}
              className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-colors group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {session.theme}
                  </h3>
                  <p className="text-sm text-muted mt-1">{formatDate(session.date)}</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted">
                  <span>{formatDuration(session.duration)}</span>
                  <span className="flex items-center gap-1">
                    <Users size={14} />
                    {stats.total}
                  </span>
                  {stats.newCount > 0 && (
                    <span className="flex items-center gap-1 text-nouveau">
                      <Sparkles size={14} />
                      {stats.newCount}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          )
        })}

        {(!sessions || sessions.length === 0) && (
          <p className="text-center text-muted py-12">Aucune session enregistr&eacute;e</p>
        )}
      </div>
    </div>
  )
}
