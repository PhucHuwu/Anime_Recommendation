"use client"

import {
  LineChart as RechartsContainer,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

interface LineChartProps {
  data: Array<{ name: string; [key: string]: string | number }>
  lines: Array<{ dataKey: string; color: string; name: string }>
}

export function LineChart({ data, lines }: LineChartProps) {
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
        />
        <Legend
          wrapperStyle={{
            paddingTop: "10px",
          }}
        />
        {lines.map((line) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.color}
            strokeWidth={3}
            name={line.name}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6 }}
            animationDuration={800}
          />
        ))}
      </RechartsContainer>
    </ResponsiveContainer>
  )
}
