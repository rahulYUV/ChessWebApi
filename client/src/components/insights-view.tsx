import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import type { PlayerData } from "@/types";

interface InsightsViewProps {
    data: PlayerData;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function InsightsView({ data }: InsightsViewProps) {
    const activity = data.activity || [];
    const openings = data.openings || [];
    const dailyActivity = data.dailyActivity || [];
    const summary = data.summary || { wins: 0, loss: 0, draw: 0, total: 0 };
    const colorStats = data.colorStats || { white: { wins: 0, loss: 0, draw: 0, total: 0 }, black: { wins: 0, loss: 0, draw: 0, total: 0 } };

    // Hourly max for color scale
    const maxHourlyActivity = Math.max(1, ...activity.flatMap((d: any) => d.hours.map((h: any) => h.count)));

    // Daily max for color scale
    const maxDailyActivity = Math.max(1, ...dailyActivity.map((d: any) => d.count));

    const getHourlyColor = (count: number) => {
        if (count === 0) return 'bg-neutral-100 dark:bg-neutral-800';
        const intensity = count / maxHourlyActivity;
        if (intensity < 0.25) return 'bg-green-200 dark:bg-green-900/40';
        if (intensity < 0.5) return 'bg-green-400 dark:bg-green-700/60';
        if (intensity < 0.75) return 'bg-green-600 dark:bg-green-600/80';
        return 'bg-green-800 dark:bg-green-500';
    };

    const getDailyColor = (count: number) => {
        if (count === 0) return 'bg-neutral-100 dark:bg-neutral-800';
        const intensity = count / maxDailyActivity;
        if (intensity < 0.25) return 'bg-green-200 dark:bg-green-900/40';
        if (intensity < 0.5) return 'bg-green-400 dark:bg-green-700/60';
        if (intensity < 0.75) return 'bg-green-600 dark:bg-green-600/80';
        return 'bg-green-800 dark:bg-green-500';
    };

    // Generate Calendar Days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 365);

    // Adjust start date to previous Sunday
    while (startDate.getDay() !== 0) {
        startDate.setDate(startDate.getDate() - 1);
    }

    const calendarDays: Date[] = [];
    let current = new Date(startDate);
    while (current <= endDate) {
        calendarDays.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }

    const dailyMap = new Map(dailyActivity.map((d: any) => [d.date, d.count]));

    return (
        <div className="space-y-8 w-full max-w-6xl">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-white/40 dark:bg-neutral-900/40 backdrop-blur-sm border-none shadow-none p-4 flex flex-col items-center justify-center">
                    <div className="text-sm text-muted-foreground">Games (Last Month)</div>
                    <div className="text-2xl font-bold">{summary.total}</div>
                </Card>
                <Card className="bg-white/40 dark:bg-neutral-900/40 backdrop-blur-sm border-none shadow-none p-4 flex flex-col items-center justify-center">
                    <div className="text-sm text-muted-foreground">Win Rate</div>
                    <div className="text-2xl font-bold text-green-600">
                        {summary.total > 0 ? Math.round((summary.wins / summary.total) * 100) : 0}%
                    </div>
                </Card>
                <Card className="bg-white/40 dark:bg-neutral-900/40 backdrop-blur-sm border-none shadow-none p-4 flex flex-col items-center justify-center">
                    <div className="text-sm text-muted-foreground">White Win %</div>
                    <div className="text-2xl font-bold text-neutral-600 dark:text-neutral-300">
                        {colorStats.white.total > 0 ? Math.round((colorStats.white.wins / colorStats.white.total) * 100) : 0}%
                    </div>
                </Card>
                <Card className="bg-white/40 dark:bg-neutral-900/40 backdrop-blur-sm border-none shadow-none p-4 flex flex-col items-center justify-center">
                    <div className="text-sm text-muted-foreground">Black Win %</div>
                    <div className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
                        {colorStats.black.total > 0 ? Math.round((colorStats.black.wins / colorStats.black.total) * 100) : 0}%
                    </div>
                </Card>
            </div>

            {/* Calendar Heatmap */}
            <Card className="bg-white/40 dark:bg-neutral-900/40 backdrop-blur-sm border-none shadow-none">
                <CardHeader>
                    <CardTitle>Activity Heatmap (Last Year)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto pb-4">
                        <div className="min-w-[800px] flex flex-col gap-2">
                            {/* Months Labels - simplified */}
                            <div className="flex text-xs text-muted-foreground ml-8">
                                {Array.from({ length: 12 }).map((_, i) => {
                                    const d = new Date();
                                    d.setMonth(d.getMonth() - (11 - i));
                                    return (
                                        <div key={i} className="flex-1 text-center">
                                            {d.toLocaleString('default', { month: 'short' })}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex gap-2">
                                {/* Day Labels */}
                                <div className="flex flex-col justify-between text-[10px] text-muted-foreground h-[100px] py-1">
                                    <span>Mon</span>
                                    <span>Wed</span>
                                    <span>Fri</span>
                                </div>

                                {/* The Grid */}
                                <div className="grid grid-rows-7 grid-flow-col gap-1 flex-1 h-[115px]">
                                    {calendarDays.map((date, i) => {
                                        const dateStr = date.toISOString().split('T')[0];
                                        const count = dailyMap.get(dateStr) || 0;
                                        return (
                                            <div
                                                key={dateStr}
                                                className={`w-3 h-3 rounded-sm ${getDailyColor(count)} transition-colors hover:opacity-80`}
                                                title={`${date.toDateString()}: ${count} games`}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>



            <Card className="bg-white/40 dark:bg-neutral-900/40 backdrop-blur-sm border-none shadow-none">
                <CardHeader>
                    <CardTitle>Top Openings Performance (Last Month)</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Opening</TableHead>
                                <TableHead className="text-center">Games</TableHead>
                                <TableHead className="text-center">Win Rate</TableHead>
                                <TableHead className="text-center">W / L / D</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {openings.map((op: any, idx: number) => (
                                <TableRow key={idx}>
                                    <TableCell className="font-medium">{op.name}</TableCell>
                                    <TableCell className="text-center">{op.total}</TableCell>
                                    <TableCell className="text-center font-bold text-green-600">
                                        {Math.round((op.wins / op.total) * 100)}%
                                    </TableCell>
                                    <TableCell className="text-center text-xs">
                                        <span className="text-green-500">{op.wins}</span> / <span className="text-red-500">{op.loss}</span> / <span className="text-gray-500">{op.draw}</span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
