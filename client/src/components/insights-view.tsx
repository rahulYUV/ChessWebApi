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
    const maxActivity = Math.max(1, ...activity.flatMap((d: any) => d.hours.map((h: any) => h.count)));

    const getColor = (count: number) => {
        if (count === 0) return 'bg-neutral-100 dark:bg-neutral-800';
        const intensity = count / maxActivity;
        if (intensity < 0.25) return 'bg-green-200 dark:bg-green-900/40';
        if (intensity < 0.5) return 'bg-green-400 dark:bg-green-700/60';
        if (intensity < 0.75) return 'bg-green-600 dark:bg-green-600/80';
        return 'bg-green-800 dark:bg-green-500';
    };

    return (
        <div className="space-y-8 w-full max-w-6xl">
            <Card className="bg-white/40 dark:bg-neutral-900/40 backdrop-blur-sm border-none shadow-none">
                <CardHeader>
                    <CardTitle>Activity Heatmap (Last Month)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <div className="min-w-[600px] grid grid-cols-[auto_repeat(24,1fr)] gap-1">
                            <div className="h-6"></div>
                            {Array.from({ length: 24 }).map((_, i) => (
                                <div key={i} className="text-xs text-center text-muted-foreground">{i}</div>
                            ))}

                            {activity.map((dayData: any, dayIndex: number) => (
                                <>
                                    <div key={`day-${dayIndex}`} className="text-xs font-medium flex items-center pr-2">
                                        {DAYS[dayIndex]}
                                    </div>
                                    {dayData.hours.map((hourData: any) => (
                                        <div
                                            key={`${dayIndex}-${hourData.hour}`}
                                            className={`h-6 w-full rounded-sm ${getColor(hourData.count)} transition-colors hover:opacity-80`}
                                            title={`${DAYS[dayIndex]} ${hourData.hour}:00 - ${hourData.count} games`}
                                        />
                                    ))}
                                </>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white/40 dark:bg-neutral-900/40 backdrop-blur-sm border-none shadow-none">
                <CardHeader>
                    <CardTitle>Top Openings Performance</CardTitle>
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
