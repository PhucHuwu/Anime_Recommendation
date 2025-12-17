"use client";

import { PieChart as RechartsContainer, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface PieChartProps {
    data: Array<{ name: string; value: number }>;
    colors?: string[];
}

const DEFAULT_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

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
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke="var(--background)" strokeWidth={2} />
                    ))}
                </Pie>
                <Tooltip
                    content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            return (
                                <div className="rounded-lg border border-border bg-popover p-3 shadow-lg">
                                    <p className="mb-1 text-xs text-muted-foreground font-medium">{payload[0].name}</p>
                                    <p className="text-lg font-bold text-popover-foreground">{payload[0].value}</p>
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                <Legend
                    wrapperStyle={{
                        paddingTop: "20px",
                    }}
                    formatter={(value) => <span className="text-sm font-medium text-foreground">{value}</span>}
                />
            </RechartsContainer>
        </ResponsiveContainer>
    );
}
