"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
    type ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

interface ChartAreaInteractiveProps {
    data: { date: string; player1?: number; player2?: number }[];
    p1Name: string;
    p2Name?: string;
}

export default function ChartAreaInteractive({ data, p1Name, p2Name }: ChartAreaInteractiveProps) {
    const chartConfig = {
        player1: {
            label: p1Name,
            color: "#f97316", // Orange
        },
        player2: {
            label: p2Name || "Player 2",
            color: "#14b8a6", // Teal
        },
    } satisfies ChartConfig;

    return (
        <div className="w-full rounded-3xl border border-black/5 dark:border-white/10 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-sm p-6">
            <div className="mb-4">
                <h3 className="text-lg font-semibold">Rapid Rating History</h3>
                <p className="text-sm text-muted-foreground">Past 12 months</p>
            </div>
            <ChartContainer
                className="aspect-auto h-[300px] w-full"
                config={chartConfig}
            >
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="fillPlayer1" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-player1)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--color-player1)" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="fillPlayer2" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-player2)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--color-player2)" stopOpacity={0.1} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted/30" />
                    <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        minTickGap={32}
                        tickFormatter={(value) => {
                            const date = new Date(value);
                            return date.toLocaleDateString("en-US", {
                                month: "short",
                                year: "2-digit",
                            });
                        }}
                    />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Area
                        dataKey="player1"
                        type="natural"
                        fill="url(#fillPlayer1)"
                        stroke="var(--color-player1)"
                        strokeWidth={2}
                        connectNulls={true}
                    />
                    {p2Name && (
                        <Area
                            dataKey="player2"
                            type="natural"
                            fill="url(#fillPlayer2)"
                            stroke="var(--color-player2)"
                            strokeWidth={2}
                            connectNulls={true}
                        />
                    )}
                    <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
            </ChartContainer>
        </div>
    );
}
