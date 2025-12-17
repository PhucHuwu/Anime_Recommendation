"use client"

import { PieChart as RechartsContainer, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface PieChartProps {
  data: Array<{ name: string; value: number }>
  colors?: string[]
}

const DEFAULT_COLORS = [
  "hsl(280, 90%, 65%)", // vibrant purple
  "hsl(330, 85%, 70%)", // cute pink
  "hsl(180, 75%, 60%)", // teal
  "hsl(45, 90%, 65%)", // golden yellow
  "hsl(15, 85%, 65%)", // coral orange
]

export function PieChart({ data, colors = DEFAULT_COLORS }: PieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsContainer>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "2px solid hsl(var(--border))",
            borderRadius: "12px",
            padding: "12px",
          }}
          labelStyle={{
            color: "hsl(var(--foreground))",
            fontWeight: 600,
            marginBottom: "4px",
          }}
        />
        <Legend
          wrapperStyle={{
            paddingTop: "20px",
          }}
        />
      </RechartsContainer>
    </ResponsiveContainer>
  )
}
