"use client";

import { BarChart as RechartsContainer, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface BarChartProps {
    data: Array<{ name: string; value: number }>;
    color?: string;
}

export function BarChart({ data, color }: BarChartProps) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <RechartsContainer data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.2} vertical={false} />
                <XAxis
                    dataKey="name"
                    stroke="var(--muted-foreground)"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    dy={8}
                />
                <YAxis stroke="var(--muted-foreground)" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                <Tooltip
                    cursor={{ fill: "var(--muted)", opacity: 0.1 }}
                    content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                            return (
                                <div className="rounded-lg border border-border bg-popover p-3 shadow-lg">
                                    <p className="mb-1 text-xs text-muted-foreground font-medium">{label}</p>
                                    <p className="text-lg font-bold text-popover-foreground">{payload[0].value}</p>
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                <Bar dataKey="value" fill={color || "var(--primary)"} radius={[6, 6, 0, 0]} animationDuration={1000} />
            </RechartsContainer>
        </ResponsiveContainer>
    );
}
