'use client'

import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts'

export default function DonutChart({ disciples, invites }: { disciples: number; invites: number }) {
  const data = [
    { name: 'Disciples', value: disciples },
    { name: 'Invit\u00e9s', value: invites },
  ]
  const COLORS = ['#c9922a', '#5a5a5a']

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" strokeWidth={0}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#111111',
              border: '1px solid #2a2a2a',
              borderRadius: '8px',
              color: '#f5f0e8',
            }}
          />
          <Legend
            formatter={(value) => <span style={{ color: '#f5f0e8', fontSize: 12 }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
