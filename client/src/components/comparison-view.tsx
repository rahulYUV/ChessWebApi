import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pie, PieChart, LabelList } from "recharts";
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import type { PlayerData, GameRecord } from "@/types";
import ChartAreaInteractive from "@/components/chart-area-interactive";

interface ComparisonViewProps {
    p1Data: PlayerData;
    p2Data: PlayerData;
    history?: { date: string; player1?: number; player2?: number }[];
}

const chartConfig = {
    win: {
        label: "Win",
        color: "#22c55e",
    },
    loss: {
        label: "Loss",
        color: "#ef4444",
    },
    draw: {
        label: "Draw",
        color: "#9ca3af",
    },
} satisfies ChartConfig

export default function ComparisonView({ p1Data, p2Data, history }: ComparisonViewProps) {
    const categories = [
        { key: 'chess_rapid', label: 'Rapid' },
        { key: 'chess_blitz', label: 'Blitz' },
        { key: 'chess_bullet', label: 'Bullet' },
    ];

    const getChartData = (record?: GameRecord) => [
        { name: 'win', value: record?.win || 0, fill: "var(--color-win)" },
        { name: 'loss', value: record?.loss || 0, fill: "var(--color-loss)" },
        { name: 'draw', value: record?.draw || 0, fill: "var(--color-draw)" },
    ];

    return (
        <div className="space-y-8 w-full max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col items-center space-y-4 p-6 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-3xl border border-black/5 dark:border-white/10">
                    <img src={p1Data.avatar} alt={p1Data.username} className="w-24 h-24 rounded-full border-4 border-primary" />
                    <h2 className="text-2xl font-bold">{p1Data.username}</h2>
                    <div className="text-sm text-muted-foreground">{p1Data.title}</div>
                </div>
                <div className="flex flex-col items-center space-y-4 p-6 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-3xl border border-black/5 dark:border-white/10">
                    <img src={p2Data.avatar} alt={p2Data.username} className="w-24 h-24 rounded-full border-4 border-primary" />
                    <h2 className="text-2xl font-bold">{p2Data.username}</h2>
                    <div className="text-sm text-muted-foreground">{p2Data.title}</div>
                </div>
            </div>

            {history && history.length > 0 && (
                <ChartAreaInteractive
                    data={history}
                    p1Name={p1Data.username}
                    p2Name={p2Data.username}
                />
            )}

            <div className="grid grid-cols-1 gap-6">
                {categories.map((cat) => (
                    <Card key={cat.key} className="bg-white/40 dark:bg-neutral-900/40 backdrop-blur-sm border-none shadow-none">
                        <CardHeader>
                            <CardTitle className="text-center text-xl">{cat.label} Comparison</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                <div className="flex flex-col items-center">
                                    <ChartContainer
                                        config={chartConfig}
                                        className="mx-auto aspect-square max-h-[250px] w-full"
                                    >
                                        <PieChart>
                                            <ChartTooltip
                                                content={<ChartTooltipContent hideLabel />}
                                            />
                                            <Pie data={getChartData(p1Data.stats[cat.key]?.record)} dataKey="value" innerRadius={60} strokeWidth={5}>
                                                <LabelList
                                                    dataKey="name"
                                                    className="fill-foreground"
                                                    stroke="none"
                                                    fontSize={12}
                                                    formatter={(value: any) =>
                                                        (chartConfig[value as keyof typeof chartConfig]?.label as string) || value
                                                    }
                                                />
                                            </Pie>
                                        </PieChart>
                                    </ChartContainer>
                                    <p className="text-center text-sm font-medium mt-2">{p1Data.username}</p>
                                </div>

                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-center">Metric</TableHead>
                                            <TableHead className="text-center">{p1Data.username}</TableHead>
                                            <TableHead className="text-center">{p2Data.username}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="font-medium text-center">Rating</TableCell>
                                            <TableCell className={`text-center ${p1Data.stats[cat.key]?.last?.rating > p2Data.stats[cat.key]?.last?.rating ? 'text-green-500 font-bold' : ''}`}>
                                                {p1Data.stats[cat.key]?.last?.rating || '-'}
                                            </TableCell>
                                            <TableCell className={`text-center ${p2Data.stats[cat.key]?.last?.rating > p1Data.stats[cat.key]?.last?.rating ? 'text-green-500 font-bold' : ''}`}>
                                                {p2Data.stats[cat.key]?.last?.rating || '-'}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium text-center">Best</TableCell>
                                            <TableCell className="text-center">{p1Data.stats[cat.key]?.best?.rating || '-'}</TableCell>
                                            <TableCell className="text-center">{p2Data.stats[cat.key]?.best?.rating || '-'}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium text-center">Total Games</TableCell>
                                            <TableCell className="text-center">
                                                {(p1Data.stats[cat.key]?.record?.win || 0) + (p1Data.stats[cat.key]?.record?.loss || 0) + (p1Data.stats[cat.key]?.record?.draw || 0)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {(p2Data.stats[cat.key]?.record?.win || 0) + (p2Data.stats[cat.key]?.record?.loss || 0) + (p2Data.stats[cat.key]?.record?.draw || 0)}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>

                                <div className="flex flex-col items-center">
                                    <ChartContainer
                                        config={chartConfig}
                                        className="mx-auto aspect-square max-h-[250px] w-full"
                                    >
                                        <PieChart>
                                            <ChartTooltip
                                                content={<ChartTooltipContent hideLabel />}
                                            />
                                            <Pie data={getChartData(p2Data.stats[cat.key]?.record)} dataKey="value" innerRadius={60} strokeWidth={5}>
                                                <LabelList
                                                    dataKey="name"
                                                    className="fill-foreground"
                                                    stroke="none"
                                                    fontSize={12}
                                                    formatter={(value: any) =>
                                                        (chartConfig[value as keyof typeof chartConfig]?.label as string) || value
                                                    }
                                                />
                                            </Pie>
                                        </PieChart>
                                    </ChartContainer>
                                    <p className="text-center text-sm font-medium mt-2">{p2Data.username}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
