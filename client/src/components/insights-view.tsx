import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Target, Swords, Activity, TrendingUp } from "lucide-react";
import { motion } from "motion/react";

import type { PlayerData } from "@/types";

import OpeningExplorer from "./opening-explorer";

interface InsightsViewProps {
    data: PlayerData;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

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
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8 w-full max-w-6xl"
        >
            {/* Summary Cards */}
            <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-white/40 dark:bg-neutral-900/40 backdrop-blur-sm border-none shadow-none p-6 flex flex-row items-center justify-between space-y-0">
                    <div className="flex flex-col gap-1">
                        <div className="text-sm font-medium text-muted-foreground">Games</div>
                        <div className="text-2xl font-bold">{summary.total}</div>
                        <div className="text-xs text-muted-foreground">Last Month</div>
                    </div>
                </Card>
                <Card className="bg-white/40 dark:bg-neutral-900/40 backdrop-blur-sm border-none shadow-none p-6 flex flex-row items-center justify-between space-y-0">
                    <div className="flex flex-col gap-1">
                        <div className="text-sm font-medium text-muted-foreground">Win Rate</div>
                        <div className="text-2xl font-bold text-green-600">
                            {summary.total > 0 ? Math.round((summary.wins / summary.total) * 100) : 0}%
                        </div>
                        <div className="text-xs text-muted-foreground">Overall</div>
                    </div>
                </Card>
                <Card className="bg-white/40 dark:bg-neutral-900/40 backdrop-blur-sm border-none shadow-none p-6 flex flex-row items-center justify-between space-y-0">
                    <div className="flex flex-col gap-1">
                        <div className="text-sm font-medium text-muted-foreground">White Win %</div>
                        <div className="text-2xl font-bold text-neutral-600 dark:text-neutral-300">
                            {colorStats.white.total > 0 ? Math.round((colorStats.white.wins / colorStats.white.total) * 100) : 0}%
                        </div>
                        <div className="text-xs text-muted-foreground">{colorStats.white.total} games</div>
                    </div>
                    <div className="h-8 w-8 rounded-full border-2 border-neutral-400 bg-white" />
                </Card>
                <Card className="bg-white/40 dark:bg-neutral-900/40 backdrop-blur-sm border-none shadow-none p-6 flex flex-row items-center justify-between space-y-0">
                    <div className="flex flex-col gap-1">
                        <div className="text-sm font-medium text-muted-foreground">Black Win %</div>
                        <div className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
                            {colorStats.black.total > 0 ? Math.round((colorStats.black.wins / colorStats.black.total) * 100) : 0}%
                        </div>
                        <div className="text-xs text-muted-foreground">{colorStats.black.total} games</div>
                    </div>
                    <div className="h-8 w-8 rounded-full border-2 border-neutral-600 bg-black" />
                </Card>
            </motion.div>

            {/* Calendar Heatmap */}
            <motion.div variants={item}>
                <Card className="bg-white/40 dark:bg-neutral-900/40 backdrop-blur-sm border-none shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-green-500" />
                            Activity Heatmap (Last Year)
                        </CardTitle>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Less</span>
                            <div className="flex gap-1">
                                <div className="w-3 h-3 rounded-sm bg-neutral-100 dark:bg-neutral-800" />
                                <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900/40" />
                                <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700/60" />
                                <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-600/80" />
                                <div className="w-3 h-3 rounded-sm bg-green-800 dark:bg-green-500" />
                            </div>
                            <span>More</span>
                        </div>
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
                                                    className={`w-3 h-3 rounded-sm ${getDailyColor(count)} transition-all hover:scale-125 hover:ring-2 ring-offset-1 ring-offset-background ring-primary z-0 hover:z-10`}
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
            </motion.div>

            {/* Opening Explorer */}
            <motion.div variants={item}>
                <OpeningExplorer games={data.games || []} username={data.username || ""} />
            </motion.div>

            <motion.div variants={item}>
                <Card className="bg-white/40 dark:bg-neutral-900/40 backdrop-blur-sm border-none shadow-none">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-500" />
                            Top Openings Performance (Last Month)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-b border-black/5 dark:border-white/5">
                                    <TableHead>Opening</TableHead>
                                    <TableHead className="text-center">Games</TableHead>
                                    <TableHead className="text-center w-[200px]">Win Rate</TableHead>
                                    <TableHead className="text-center">W / L / D</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {openings.map((op: any, idx: number) => {
                                    const winRate = Math.round((op.wins / op.total) * 100);
                                    return (
                                        <TableRow key={idx} className="hover:bg-black/5 dark:hover:bg-white/5 border-none">
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Swords className="h-4 w-4 text-muted-foreground" />
                                                    {op.name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center font-mono">{op.total}</TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 flex-1 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-green-500 rounded-full"
                                                            style={{ width: `${winRate}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-bold w-8 text-right">{winRate}%</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center text-xs font-mono">
                                                <span className="text-green-600 font-bold">{op.wins}</span>
                                                <span className="mx-1 text-muted-foreground">/</span>
                                                <span className="text-red-500 font-bold">{op.loss}</span>
                                                <span className="mx-1 text-muted-foreground">/</span>
                                                <span className="text-muted-foreground">{op.draw}</span>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
