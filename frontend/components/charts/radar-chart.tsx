"use client";

import { RadarChart as RechartsContainer, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface RadarChartProps {
    data: Array<{ subject: string; [key: string]: string | number }>;
    datasets: Array<{ dataKey: string; color: string; name: string }>;
}

export function RadarChart({ data, datasets }: RadarChartProps) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <RechartsContainer data={data}>
                <PolarGrid stroke="var(--border)" strokeOpacity={0.4} />
                <PolarAngleAxis dataKey="subject" stroke="var(--muted-foreground)" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                <PolarRadiusAxis stroke="var(--muted-foreground)" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} angle={30} dx={10} />
                <Tooltip
                    content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                            return (
                                <div className="rounded-lg border border-border bg-popover p-3 shadow-lg">
                                    <p className="mb-2 text-xs text-muted-foreground font-medium">{label}</p>
                                    {payload.map((entry, index) => (
                                        <div key={index} className="flex items-center gap-2 text-sm text-popover-foreground">
                                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                            <span className="font-medium">{entry.name}:</span>
                                            <span>{entry.value}</span>
                                        </div>
                                    ))}
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
                {datasets.map((dataset) => (
                    <Radar
                        key={dataset.dataKey}
                        name={dataset.name}
                        dataKey={dataset.dataKey}
                        stroke={dataset.color}
                        fill={dataset.color}
                        fillOpacity={0.2}
                        animationDuration={1000}
                    />
                ))}
            </RechartsContainer>
        </ResponsiveContainer>
    );
}
