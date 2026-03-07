'use client'

import { ReactNode } from 'react'

export default function KPICard({
  icon,
  label,
  value,
  color = 'text-foreground',
}: {
  icon: ReactNode
  label: string
  value: string | number
  color?: string
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-2 hover:border-primary/30 transition-colors">
      <div className="text-primary">{icon}</div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-muted text-xs">{label}</p>
    </div>
  )
}
