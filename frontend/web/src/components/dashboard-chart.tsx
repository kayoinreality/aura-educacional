'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type ChartDatum = {
  name: string
  total: number
  color?: string | null
}

export function DashboardChart({
  data,
}: {
  data: ChartDatum[]
}) {
  return (
    <div className="chart-shell">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(15, 23, 42, 0.08)" />
          <XAxis dataKey="name" tickLine={false} axisLine={false} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
          <Tooltip
            cursor={{ fill: 'rgba(15, 23, 42, 0.04)' }}
            contentStyle={{
              borderRadius: 16,
              border: '1px solid rgba(15, 23, 42, 0.08)',
              boxShadow: '0 24px 48px rgba(15, 23, 42, 0.12)',
            }}
          />
          <Bar dataKey="total" radius={[12, 12, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color || '#0f766e'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
