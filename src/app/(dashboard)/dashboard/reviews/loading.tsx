import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Review History</h1>
        <p className="text-slate-400">A log of all Pull Requests processed by IntelliPR.</p>
      </div>

      <Card className="bg-slate-900/50 border-white/10 backdrop-blur">
        <CardHeader>
          <CardTitle>Recent Pull Requests</CardTitle>
          <CardDescription className="text-slate-400">
            Loading your review history...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Generate 5 dummy skeleton rows */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-white/5 rounded-lg bg-white/5">
                <Skeleton className="h-6 w-32 bg-slate-800" />
                <Skeleton className="h-6 w-48 bg-slate-800" />
                <Skeleton className="h-6 w-24 bg-slate-800" />
                <Skeleton className="h-8 w-8 rounded-full bg-slate-800" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
