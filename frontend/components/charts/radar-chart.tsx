"use client"

import {
  RadarChart as RechartsContainer,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts"

interface RadarChartProps {
  data: Array<{ subject: string; [key: string]: string | number }>
  datasets: Array<{ dataKey: string; color: string; name: string }>
}

export function RadarChart({ data, datasets }: RadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsContainer data={data}>
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis dataKey="subject" stroke="hsl(var(--muted-foreground))" />
        <PolarRadiusAxis stroke="hsl(var(--muted-foreground))" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
        <Legend />
        {datasets.map((dataset) => (
          <Radar
            key={dataset.dataKey}
            name={dataset.name}
            dataKey={dataset.dataKey}
            stroke={dataset.color}
            fill={dataset.color}
            fillOpacity={0.3}
          />
        ))}
      </RechartsContainer>
    </ResponsiveContainer>
  )
}
