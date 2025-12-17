"use client"

import { BarChart as RechartsContainer, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface BarChartProps {
  data: Array<{ name: string; value: number }>
  color?: string
}

export function BarChart({ data, color = "hsl(280, 90%, 65%)" }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsContainer data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
        <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
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
          cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }}
        />
        <Bar dataKey="value" fill={color} radius={[8, 8, 0, 0]} animationDuration={800} />
      </RechartsContainer>
    </ResponsiveContainer>
  )
}
