'use client'

import { removeAttendance } from '@/lib/actions'
import { X, Sparkles } from 'lucide-react'
import type { Attendance, Member } from '@/lib/supabase'

type AttendanceWithMember = Attendance & { member: Member }

export default function AttendanceList({
  disciples,
  invites,
  sessionId,
  isAdmin,
}: {
  disciples: AttendanceWithMember[]
  invites: AttendanceWithMember[]
  sessionId: string
  isAdmin: boolean
}) {
  const handleRemove = async (memberId: string) => {
    if (confirm('Retirer ce participant ?')) {
      await removeAttendance(sessionId, memberId)
    }
  }

  const renderMember = (a: AttendanceWithMember) => (
    <div key={a.id} className="flex items-center gap-2 bg-card-hover rounded-lg px-3 py-2">
      <span className="text-sm">{a.member?.name}</span>
      {a.is_first_time && (
        <span className="flex items-center gap-1 text-xs bg-nouveau/20 text-nouveau px-2 py-0.5 rounded-full">
          <Sparkles size={10} />
          1ere fois
        </span>
      )}
      {isAdmin && (
        <button
          onClick={() => handleRemove(a.member_id)}
          className="ml-auto text-muted hover:text-red-400 transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-disciple" />
          Disciples ({disciples.length})
        </h3>
        <div className="space-y-2">
          {disciples.map(renderMember)}
        </div>
      </div>
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-invite" />
          Invites ({invites.length})
        </h3>
        <div className="space-y-2">
          {invites.map(renderMember)}
        </div>
      </div>
    </div>
  )
}
