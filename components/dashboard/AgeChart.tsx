'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

type AgeData = {
  tranche: string
  count: number
}

const COLORS = ['#2ecc71', '#c9922a', '#e8b84b', '#5a5a5a', '#a89880']

export default function AgeChart({ data }: { data: AgeData[] }) {
  if (data.every((d) => d.count === 0)) {
    return <p className="text-sm text-muted">Aucune donnee d&apos;age disponible.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <XAxis dataKey="tranche" tick={{ fill: '#a89880', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#a89880', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, color: '#f5f0e8' }}
        />
        <Bar dataKey="count" name="Membres" radius={[6, 6, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
