import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function StatsSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 w-full max-w-6xl">
            {/* Profile Card Skeleton */}
            <Card className="col-span-1 md:col-span-2 bg-white/50 dark:bg-black/50 backdrop-blur-sm border-black/5 dark:border-white/10">
                <CardHeader className="flex flex-col items-center gap-4">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className="space-y-2 text-center w-full flex flex-col items-center">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between">
                        <Skeleton className="h-16 w-24 rounded-xl" />
                        <Skeleton className="h-16 w-24 rounded-xl" />
                    </div>
                    <div className="flex justify-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                </CardContent>
            </Card>

            {/* Stats Grid Skeleton */}
            <div className="col-span-1 md:col-span-2 lg:col-span-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="bg-white/50 dark:bg-black/50 backdrop-blur-sm border-black/5 dark:border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-20 mb-2" />
                            <Skeleton className="h-3 w-full" />
                        </CardContent>
                    </Card>
                ))}

                {/* Chart Skeleton */}
                <Card className="col-span-full bg-white/50 dark:bg-black/50 backdrop-blur-sm border-black/5 dark:border-white/10">
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[200px] w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
