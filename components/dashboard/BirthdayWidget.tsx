'use client'

import { Cake } from 'lucide-react'

type MemberWithBirthday = {
  id: string
  name: string
  birthday: string
  daysUntil: number
}

export default function BirthdayWidget({ members }: { members: MemberWithBirthday[] }) {
  const todayBirthday = members.find((m) => m.daysUntil === 0)

  return (
    <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden">
      {todayBirthday && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
      )}
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Cake size={20} className="text-primary" />
        Anniversaires
      </h2>
      {members.length === 0 ? (
        <p className="text-muted text-sm">Aucun anniversaire enregistr&eacute;</p>
      ) : (
        <div className="space-y-3">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{m.name}</p>
                <p className="text-xs text-muted">
                  {new Date(m.birthday).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                </p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  m.daysUntil === 0
                    ? 'bg-primary text-background animate-pulse'
                    : 'bg-card-hover text-muted'
                }`}
              >
                {m.daysUntil === 0 ? 'Aujourd\'hui !' : `${m.daysUntil}j`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
