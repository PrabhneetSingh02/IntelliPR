import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderGit2, Activity, GitPullRequest } from "lucide-react";

export default function Loading() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-slate-400">Manage your connected GitHub repositories.</p>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-900/50 border-white/10 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-300">Total Repositories</CardTitle>
            <FolderGit2 className="w-4 h-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 bg-slate-800" />
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900/50 border-white/10 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-300">Active Repositories</CardTitle>
            <Activity className="w-4 h-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 bg-slate-800" />
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-white/10 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-300">PRs Reviewed</CardTitle>
            <GitPullRequest className="w-4 h-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 bg-slate-800" />
          </CardContent>
        </Card>
      </div>

      {/* Repositories Table Skeleton */}
      <Card className="bg-slate-900/50 border-white/10 backdrop-blur">
        <CardHeader>
          <CardTitle>Connected Repositories</CardTitle>
          <CardDescription className="text-slate-400">
            Loading your repositories...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Generate 5 dummy skeleton rows */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-white/5 rounded-lg bg-white/5">
                <Skeleton className="h-6 w-48 bg-slate-800" />
                <Skeleton className="h-6 w-32 bg-slate-800" />
                <Skeleton className="h-6 w-24 bg-slate-800" />
                <Skeleton className="h-6 w-24 bg-slate-800" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
