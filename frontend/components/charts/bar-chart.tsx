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
                <defs>
                    <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} vertical={false} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} style={{ fontSize: "12px" }} dy={8} />
                <YAxis stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} style={{ fontSize: "12px" }} />
                <Tooltip
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }}
                    content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                            return (
                                <div className="rounded-lg border bg-background p-3 shadow-lg ring-1 ring-black/5">
                                    <p className="mb-1 text-xs text-muted-foreground font-medium">{label}</p>
                                    <p className="text-lg font-bold text-foreground">{payload[0].value}</p>
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                <Bar dataKey="value" fill={color || "url(#primaryGradient)"} radius={[6, 6, 0, 0]} animationDuration={1000} />
            </RechartsContainer>
        </ResponsiveContainer>
    );
}
