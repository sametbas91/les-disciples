'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

type MemberAge = {
  name: string
  age: number
}

export default function AgeChart({ data }: { data: MemberAge[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted">Aucune donnee d&apos;age disponible.</p>
  }

  const sorted = [...data].sort((a, b) => b.age - a.age)
  const barHeight = 40
  const chartHeight = Math.max(sorted.length * barHeight + 20, 120)

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart data={sorted} layout="vertical" margin={{ left: 0, right: 20, top: 5, bottom: 5 }}>
        <defs>
          <linearGradient id="ageGold" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#c9922a" />
            <stop offset="100%" stopColor="#e8b84b" />
          </linearGradient>
        </defs>
        <XAxis
          type="number"
          tick={{ fill: '#a89880', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          domain={[0, 'dataMax + 2']}
          hide
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fill: '#f5f0e8', fontSize: 13 }}
          axisLine={false}
          tickLine={false}
          width={90}
        />
        <Tooltip
          contentStyle={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, color: '#f5f0e8' }}
          formatter={(value) => [`${value} ans`, 'Age']}
          cursor={{ fill: 'rgba(201,146,42,0.08)' }}
        />
        <Bar
          dataKey="age"
          fill="url(#ageGold)"
          radius={[0, 10, 10, 0]}
          barSize={22}
          label={{ position: 'right', fill: '#a89880', fontSize: 12, formatter: (v: unknown) => `${v} ans` }}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
