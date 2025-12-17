"use client"

import {
  AreaChart as RechartsContainer,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface AreaChartProps {
  data: Array<{ name: string; value: number }>
  color?: string
}

export function AreaChart({ data, color = "hsl(var(--primary))" }: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsContainer data={data}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.8} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
        <YAxis stroke="hsl(var(--muted-foreground))" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
        <Area type="monotone" dataKey="value" stroke={color} fillOpacity={1} fill="url(#colorValue)" />
      </RechartsContainer>
    </ResponsiveContainer>
  )
}
