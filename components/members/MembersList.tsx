'use client'

import { useState } from 'react'
import { createMember, updateMember, deleteMember } from '@/lib/actions'
import { Plus, Trash2, Sparkles } from 'lucide-react'
import type { Member } from '@/lib/supabase'

type MemberWithStats = Member & {
  sessionsAttended: number
  attendanceRate: number
  isNew: boolean
}

export default function MembersList({
  members,
  isAdmin,
  totalSessions,
}: {
  members: MemberWithStats[]
  isAdmin: boolean
  totalSessions: number
}) {
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<'all' | 'Disciple' | 'Invit\u00e9(e)'>('all')

  const filtered = filter === 'all' ? members : members.filter((m) => m.status === filter)
  const disciples = filtered.filter((m) => m.status === 'Disciple')
  const invites = filtered.filter((m) => m.status !== 'Disciple')

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    await createMember(fd)
    setShowForm(false)
  }

  const handleStatusToggle = async (m: MemberWithStats) => {
    const fd = new FormData()
    fd.set('status', m.status === 'Disciple' ? 'Invit\u00e9(e)' : 'Disciple')
    await updateMember(m.id, fd)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer ce membre ?')) {
      await deleteMember(id)
    }
  }

  const renderMember = (m: MemberWithStats) => (
    <div key={m.id} className="bg-card-hover rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{m.name}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${m.status === 'Disciple' ? 'bg-disciple/20 text-disciple' : 'bg-invite/20 text-invite'}`}>
            {m.status}
          </span>
          {m.isNew && (
            <span className="flex items-center gap-1 text-xs text-nouveau">
              <Sparkles size={10} /> Nouveau
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 mt-2 text-sm text-muted">
          <span>{m.sessionsAttended}/{totalSessions} sessions</span>
          <div className="flex-1 max-w-[120px] bg-border rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${m.attendanceRate}%`,
                backgroundColor: m.attendanceRate > 66 ? '#2ecc71' : m.attendanceRate > 33 ? '#e8b84b' : '#e74c3c',
              }}
            />
          </div>
          <span className="text-xs">{m.attendanceRate}%</span>
        </div>
      </div>
      {isAdmin && (
        <div className="flex gap-2">
          <button
            onClick={() => handleStatusToggle(m)}
            className="text-xs bg-card border border-border px-2 py-1 rounded-lg hover:border-primary transition-colors"
          >
            {m.status === 'Disciple' ? 'Passer Invite' : 'Passer Disciple'}
          </button>
          <button onClick={() => handleDelete(m.id)} className="text-muted hover:text-red-400">
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {(['all', 'Disciple', 'Invit\u00e9(e)'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                filter === f ? 'bg-primary text-background' : 'bg-card-hover text-muted hover:text-foreground'
              }`}
            >
              {f === 'all' ? 'Tous' : f === 'Disciple' ? 'Disciples' : 'Invites'}
            </button>
          ))}
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1 text-primary text-sm hover:text-primary-light ml-auto"
          >
            <Plus size={14} />
            Ajouter un membre
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <form onSubmit={handleCreate} className="bg-card border border-border rounded-2xl p-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs text-muted mb-1">Nom</label>
            <input name="name" required className="w-full bg-card-hover border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none" />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Statut</label>
            <select name="status" className="bg-card-hover border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none">
              <option value="Disciple">Disciple</option>
              <option value="Invit&eacute;(e)">Invite(e)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Anniversaire</label>
            <input type="date" name="birthday" className="bg-card-hover border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none" />
          </div>
          <button type="submit" className="bg-primary text-background px-4 py-2 rounded-lg text-sm">Ajouter</button>
        </form>
      )}

      {filter === 'all' || filter === 'Disciple' ? (
        <div>
          <h3 className="text-sm font-medium text-disciple mb-2">Disciples ({disciples.length})</h3>
          <div className="space-y-2">{disciples.map(renderMember)}</div>
        </div>
      ) : null}

      {filter === 'all' || filter === 'Invit\u00e9(e)' ? (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-invite mb-2">Invites ({invites.length})</h3>
          <div className="space-y-2">{invites.map(renderMember)}</div>
        </div>
      ) : null}
    </div>
  )
}
