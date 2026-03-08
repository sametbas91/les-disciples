'use client'

import { useState } from 'react'
import { createMember, updateMember, deleteMember } from '@/lib/actions'
import { Plus, Trash2, Sparkles, Edit, X } from 'lucide-react'
import type { Member } from '@/lib/supabase'

type MemberWithStats = Member & {
  sessionsAttended: number
  sessionsAttendedLast6: number
  attendanceRate: number
  isNew: boolean
}

export default function MembersList({
  members,
  isAdmin,
  totalSessions,
  last6Count,
  isLoggedIn,
}: {
  members: MemberWithStats[]
  isAdmin: boolean
  totalSessions: number
  last6Count: number
  isLoggedIn: boolean
}) {
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<'all' | 'Berger' | 'Disciple' | 'Invité(e)'>('all')
  const [editingMember, setEditingMember] = useState<MemberWithStats | null>(null)
  const [editSaving, setEditSaving] = useState(false)

  const filtered = filter === 'all' ? members : members.filter((m) => m.status === filter)
  const bergers = filtered.filter((m) => m.status === 'Berger')
  const disciples = filtered.filter((m) => m.status === 'Disciple')
  const invites = filtered.filter((m) => m.status === 'Invité(e)')

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    await createMember(fd)
    setShowForm(false)
  }

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingMember) return
    if (!confirm('Sauvegarder les modifications ?')) return
    setEditSaving(true)
    const fd = new FormData(e.currentTarget)
    await updateMember(editingMember.id, fd)
    setEditingMember(null)
    setEditSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer ce membre ?')) {
      await deleteMember(id)
    }
  }

  const renderMember = (m: MemberWithStats) => (
    <div key={m.id} className="bg-card-hover rounded-xl p-3 sm:p-4">
      <div className="flex items-start sm:items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium truncate">{m.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
              m.status === 'Berger' ? 'bg-primary/20 text-primary' :
              m.status === 'Disciple' ? 'bg-disciple/20 text-disciple' : 'bg-invite/20 text-invite'
            }`}>
              {m.status}
            </span>
            {m.isNew && (
              <span className="flex items-center gap-1 text-xs text-nouveau shrink-0">
                <Sparkles size={10} /> Nouveau
              </span>
            )}
          </div>
          {isLoggedIn && (
            <div className="flex items-center gap-3 mt-2 text-sm text-muted">
              <span className="shrink-0 text-xs">{m.sessionsAttendedLast6}/{last6Count} dernières</span>
              <div className="flex-1 max-w-[100px] bg-border rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${m.attendanceRate}%`,
                    backgroundColor: m.attendanceRate > 66 ? '#2ecc71' : m.attendanceRate > 33 ? '#e8b84b' : '#e74c3c',
                  }}
                />
              </div>
              <span className="text-xs shrink-0">{m.attendanceRate}%</span>
            </div>
          )}
        </div>
        {isAdmin && (
          <div className="flex gap-1.5 shrink-0">
            <button
              onClick={() => setEditingMember(m)}
              className="p-1.5 text-muted hover:text-primary transition-colors"
              title="Modifier"
            >
              <Edit size={14} />
            </button>
            <button onClick={() => handleDelete(m.id)} className="p-1.5 text-muted hover:text-red-400 transition-colors" title="Supprimer">
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Edit Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setEditingMember(null)}>
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Modifier le membre</h3>
              <button onClick={() => setEditingMember(null)} className="text-muted hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-xs text-muted mb-1">Nom</label>
                <input
                  name="name"
                  defaultValue={editingMember.name}
                  required
                  className="w-full bg-card-hover border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Statut</label>
                <select
                  name="status"
                  defaultValue={editingMember.status}
                  className="w-full bg-card-hover border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                >
                  <option value="Berger">Berger</option>
                  <option value="Disciple">Disciple</option>
                  <option value="Invité(e)">Invite(e)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Date d&apos;anniversaire</label>
                <input
                  type="date"
                  name="birthday"
                  defaultValue={editingMember.birthday || ''}
                  className="w-full bg-card-hover border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="flex-1 bg-card-hover border border-border px-4 py-2 rounded-lg text-sm hover:bg-border transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="flex-1 bg-primary text-background px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors disabled:opacity-50"
                >
                  {editSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-2">
          {(['all', 'Berger', 'Disciple', 'Invité(e)'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                filter === f ? 'bg-primary text-background' : 'bg-card-hover text-muted hover:text-foreground'
              }`}
            >
              {f === 'all' ? 'Tous' : f === 'Berger' ? 'Bergers' : f === 'Disciple' ? 'Disciples' : 'Invites'}
            </button>
          ))}
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1 text-primary text-sm hover:text-primary-light ml-auto"
          >
            <Plus size={14} />
            Ajouter
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <form onSubmit={handleCreate} className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <div>
            <label className="block text-xs text-muted mb-1">Nom</label>
            <input name="name" required className="w-full bg-card-hover border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted mb-1">Statut</label>
              <select name="status" className="w-full bg-card-hover border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none">
                <option value="Berger">Berger</option>
                <option value="Disciple">Disciple</option>
                <option value="Invité(e)">Invite(e)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Anniversaire</label>
              <input type="date" name="birthday" className="w-full bg-card-hover border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none" />
            </div>
          </div>
          <button type="submit" className="w-full bg-primary text-background px-4 py-2 rounded-lg text-sm font-medium">Ajouter</button>
        </form>
      )}

      {(filter === 'all' || filter === 'Berger') && bergers.length > 0 ? (
        <div>
          <h3 className="text-sm font-medium text-primary mb-2">Bergers ({bergers.length})</h3>
          <div className="space-y-2">{bergers.map(renderMember)}</div>
        </div>
      ) : null}

      {filter === 'all' || filter === 'Disciple' ? (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-disciple mb-2">Disciples ({disciples.length})</h3>
          <div className="space-y-2">{disciples.map(renderMember)}</div>
        </div>
      ) : null}

      {filter === 'all' || filter === 'Invité(e)' ? (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-invite mb-2">Invites ({invites.length})</h3>
          <div className="space-y-2">{invites.map(renderMember)}</div>
        </div>
      ) : null}
    </div>
  )
}
