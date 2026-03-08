'use client'

import { createSession, updateSession, createMember } from '@/lib/actions'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { Member, Session } from '@/lib/supabase'
import { Plus, Save } from 'lucide-react'

export default function SessionForm({
  members,
  session,
  existingAttendees,
}: {
  members: Member[]
  session: Session | null
  existingAttendees: { member_id: string; is_first_time: boolean; is_late?: boolean }[]
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [allMembers, setAllMembers] = useState(members)
  const [attendees, setAttendees] = useState<Map<string, { is_first_time: boolean; is_late: boolean }>>(
    new Map(existingAttendees.map((a) => [a.member_id, { is_first_time: a.is_first_time, is_late: a.is_late ?? false }]))
  )
  const [showNewMember, setShowNewMember] = useState(false)
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberStatus, setNewMemberStatus] = useState<'Disciple' | 'Invité(e)'>('Invité(e)')

  const toggleAttendee = (memberId: string) => {
    const next = new Map(attendees)
    if (next.has(memberId)) next.delete(memberId)
    else next.set(memberId, { is_first_time: false, is_late: false })
    setAttendees(next)
  }

  const toggleFirstTime = (memberId: string) => {
    const next = new Map(attendees)
    const cur = next.get(memberId)
    if (cur) next.set(memberId, { ...cur, is_first_time: !cur.is_first_time })
    setAttendees(next)
  }

  const toggleLate = (memberId: string) => {
    const next = new Map(attendees)
    const cur = next.get(memberId)
    if (cur) next.set(memberId, { ...cur, is_late: !cur.is_late })
    setAttendees(next)
  }

  const handleAddMember = async () => {
    if (!newMemberName.trim()) return
    const fd = new FormData()
    fd.set('name', newMemberName.trim())
    fd.set('status', newMemberStatus)
    fd.set('birthday', '')
    try {
      const member = await createMember(fd)
      setAllMembers((prev) => [...prev, member])
      const next = new Map(attendees)
      next.set(member.id, { is_first_time: false, is_late: false })
      setAttendees(next)
      setNewMemberName('')
      setShowNewMember(false)
    } catch {
      alert('Erreur lors de l\'ajout')
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    // Convertir heures + minutes en minutes total
    const hours = parseInt(fd.get('duration_hours') as string || '0')
    const mins = parseInt(fd.get('duration_minutes') as string || '0')
    fd.set('duration', String(hours * 60 + mins))
    fd.set('attendees', JSON.stringify(
      Array.from(attendees.entries()).map(([member_id, { is_first_time, is_late }]) => ({ member_id, is_first_time, is_late }))
    ))
    try {
      if (session) {
        await updateSession(session.id, fd)
        router.push(`/sessions/${session.id}`)
      } else {
        const s = await createSession(fd)
        router.push(`/sessions/${s.id}`)
      }
    } catch {
      alert('Erreur lors de l\'enregistrement')
    }
    setLoading(false)
  }

  const disciples = allMembers.filter((m) => m.status === 'Disciple')
  const invites = allMembers.filter((m) => m.status !== 'Disciple')

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div>
          <label className="block text-sm text-muted mb-1">Date</label>
          <input
            type="date"
            name="date"
            defaultValue={session?.date || ''}
            required
            className="w-full bg-card-hover border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm text-muted mb-1">Theme</label>
          <input
            type="text"
            name="theme"
            defaultValue={session?.theme || ''}
            required
            className="w-full bg-card-hover border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm text-muted mb-1">Durée</label>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <input
                type="number"
                name="duration_hours"
                defaultValue={session ? Math.floor(session.duration / 60) : 2}
                min={0}
                max={12}
                className="w-full bg-card-hover border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:border-primary pr-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted pointer-events-none">h</span>
            </div>
            <div className="relative">
              <input
                type="number"
                name="duration_minutes"
                defaultValue={session ? session.duration % 60 : 0}
                min={0}
                max={59}
                className="w-full bg-card-hover border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:border-primary pr-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted pointer-events-none">min</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-muted mb-1">Nb Disciples (optionnel)</label>
            <input
              type="number"
              name="disciples_count"
              defaultValue={session?.disciples_count ?? ''}
              min={0}
              className="w-full bg-card-hover border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">Nb Invit&eacute;s (optionnel)</label>
            <input
              type="number"
              name="invites_count"
              defaultValue={session?.invites_count ?? ''}
              min={0}
              className="w-full bg-card-hover border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Participants (optionnel) */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Participants - optionnel ({attendees.size})</h3>
          <button
            type="button"
            onClick={() => setShowNewMember(!showNewMember)}
            className="flex items-center gap-1 text-primary text-sm hover:text-primary-light transition-colors"
          >
            <Plus size={14} />
            Nouveau membre
          </button>
        </div>

        {showNewMember && (
          <div className="bg-card-hover rounded-lg p-3 mb-4 flex flex-wrap gap-2 items-end">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs text-muted mb-1">Nom</label>
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-foreground outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Statut</label>
              <select
                value={newMemberStatus}
                onChange={(e) => setNewMemberStatus(e.target.value as 'Disciple' | 'Invité(e)')}
                className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-foreground outline-none"
              >
                <option value="Disciple">Disciple</option>
                <option value="Invité(e)">Invite(e)</option>
              </select>
            </div>
            <button type="button" onClick={handleAddMember} className="bg-primary text-background px-3 py-1.5 rounded-lg text-sm">
              Ajouter
            </button>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <h4 className="text-sm text-disciple font-medium mb-2">Disciples</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {disciples.map((m) => (
                <label key={m.id} className="flex items-center gap-2 bg-card-hover rounded-lg px-3 py-2 cursor-pointer hover:bg-border transition-colors">
                  <input type="checkbox" checked={attendees.has(m.id)} onChange={() => toggleAttendee(m.id)} className="accent-primary" />
                  <span className="text-sm flex-1">{m.name}</span>
                  {attendees.has(m.id) && (<>
                    <label className="flex items-center gap-1 text-xs text-nouveau cursor-pointer" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={attendees.get(m.id)?.is_first_time || false} onChange={() => toggleFirstTime(m.id)} className="accent-nouveau" />
                      1ère fois
                    </label>
                    <label className="flex items-center gap-1 text-xs text-yellow-400 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={attendees.get(m.id)?.is_late || false} onChange={() => toggleLate(m.id)} className="accent-yellow-400" />
                      Retard
                    </label>
                  </>)}
                </label>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm text-invite font-medium mb-2">Invites</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {invites.map((m) => (
                <label key={m.id} className="flex items-center gap-2 bg-card-hover rounded-lg px-3 py-2 cursor-pointer hover:bg-border transition-colors">
                  <input type="checkbox" checked={attendees.has(m.id)} onChange={() => toggleAttendee(m.id)} className="accent-primary" />
                  <span className="text-sm flex-1">{m.name}</span>
                  {attendees.has(m.id) && (<>
                    <label className="flex items-center gap-1 text-xs text-nouveau cursor-pointer" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={attendees.get(m.id)?.is_first_time || false} onChange={() => toggleFirstTime(m.id)} className="accent-nouveau" />
                      1ère fois
                    </label>
                    <label className="flex items-center gap-1 text-xs text-yellow-400 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={attendees.get(m.id)?.is_late || false} onChange={() => toggleLate(m.id)} className="accent-yellow-400" />
                      Retard
                    </label>
                  </>)}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-primary text-background py-3 rounded-xl font-medium hover:bg-primary-light transition-colors disabled:opacity-50"
      >
        <Save size={18} />
        {loading ? 'Enregistrement...' : session ? 'Mettre a jour' : 'Enregistrer'}
      </button>
    </form>
  )
}
