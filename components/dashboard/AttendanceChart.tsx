'use client'

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts'

type ChartData = {
  date: string
  Disciples: number
  'Invités': number
  Total: number
}

export default function AttendanceChart({ data }: { data: ChartData[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
          <XAxis dataKey="date" stroke="#a89880" fontSize={12} />
          <YAxis stroke="#a89880" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#111111',
              border: '1px solid #2a2a2a',
              borderRadius: '8px',
              color: '#f5f0e8',
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="Total" stroke="#f5f0e8" strokeWidth={2} dot={{ fill: '#f5f0e8' }} />
          <Line type="monotone" dataKey="Disciples" stroke="#c9922a" strokeWidth={2} dot={{ fill: '#c9922a' }} />
          <Line type="monotone" dataKey="Invités" stroke="#5a5a5a" strokeWidth={2} dot={{ fill: '#5a5a5a' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
