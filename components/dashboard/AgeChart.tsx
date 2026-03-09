'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

type MemberAge = {
  name: string
  age: number
}

type AgeGroup = {
  age: number
  count: number
  names: string[]
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: AgeGroup }[] }) {
  if (!active || !payload?.length) return null
  const { age, count, names } = payload[0].payload
  return (
    <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-3 shadow-xl text-sm">
      <p className="font-bold text-[#e8b84b] mb-1">{age} ans — {count} membre{count > 1 ? 's' : ''}</p>
      <ul className="space-y-0.5">
        {names.map((n) => (
          <li key={n} className="text-[#f5f0e8]">• {n}</li>
        ))}
      </ul>
    </div>
  )
}

export default function AgeChart({ data }: { data: MemberAge[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted">Aucune donnée d&apos;âge disponible.</p>
  }

  // Grouper par âge
  const groupMap = new Map<number, AgeGroup>()
  data.forEach(({ name, age }) => {
    if (!groupMap.has(age)) groupMap.set(age, { age, count: 0, names: [] })
    const g = groupMap.get(age)!
    g.count++
    g.names.push(name)
  })

  const grouped = Array.from(groupMap.values()).sort((a, b) => b.age - a.age)
  const maxCount = Math.max(...grouped.map((g) => g.count))
  const barHeight = 44
  const chartHeight = Math.max(grouped.length * barHeight + 20, 120)

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart data={grouped} layout="vertical" margin={{ left: 0, right: 40, top: 5, bottom: 5 }}>
        <defs>
          <linearGradient id="ageGold" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#c9922a" />
            <stop offset="100%" stopColor="#e8b84b" />
          </linearGradient>
        </defs>
        <XAxis
          type="number"
          domain={[0, maxCount + 1]}
          hide
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="age"
          tick={{ fill: '#f5f0e8', fontSize: 13 }}
          axisLine={false}
          tickLine={false}
          width={50}
          tickFormatter={(v) => `${v} ans`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(201,146,42,0.08)' }} />
        <Bar
          dataKey="count"
          fill="url(#ageGold)"
          radius={[0, 10, 10, 0]}
          barSize={24}
          label={{
            position: 'right',
            fill: '#a89880',
            fontSize: 12,
            formatter: (v: unknown) => {
              const n = Number(v)
              return n > 1 ? `${n} membres` : `${n} membre`
            },
          }}
        >
          {grouped.map((entry, i) => (
            <Cell key={i} fill="url(#ageGold)" />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
