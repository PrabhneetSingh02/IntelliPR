import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FolderGit2, Activity, GitPullRequest } from "lucide-react";

export default async function DashboardPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  // Fetch repositories
  const repositories = await prisma.repository.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  });

  // Calculate some basic stats
  const activeRepos = repositories.filter(r => r.isActive).length;
  
  // Total PRs processed
  const totalPRs = await prisma.pullRequest.count({
    where: {
      repository: {
        userId: user.id
      }
    }
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-slate-400">Manage your connected GitHub repositories.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-900/50 border-white/10 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-300">Total Repositories</CardTitle>
            <FolderGit2 className="w-4 h-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{repositories.length}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900/50 border-white/10 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-300">Active Repositories</CardTitle>
            <Activity className="w-4 h-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRepos}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-white/10 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-300">PRs Reviewed</CardTitle>
            <GitPullRequest className="w-4 h-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPRs}</div>
          </CardContent>
        </Card>
      </div>

      {/* Repositories Table */}
      <Card className="bg-slate-900/50 border-white/10 backdrop-blur">
        <CardHeader>
          <CardTitle>Connected Repositories</CardTitle>
          <CardDescription className="text-slate-400">
            Repositories currently monitored by IntelliPR.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {repositories.length === 0 ? (
            <div className="text-center py-12">
              <GitPullRequest className="mx-auto h-12 w-12 text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-slate-200">No repositories connected</h3>
              <p className="text-slate-400 mt-2 mb-6">You haven't installed the GitHub app on any repositories yet.</p>
              <a 
                href="https://github.com/settings/apps/intellipr/installations" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-indigo-600 text-white hover:bg-indigo-700 h-10 px-4 py-2"
              >
                Connect GitHub
              </a>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-slate-300">Repository Name</TableHead>
                  <TableHead className="text-slate-300">GitHub ID</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300 text-right">Added On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {repositories.map((repo) => (
                  <TableRow key={repo.id} className="border-white/10 hover:bg-white/5 transition-colors">
                    <TableCell className="font-medium text-slate-200">
                      <div className="flex items-center">
                        <GitPullRequest className="w-4 h-4 mr-2 text-slate-500" />
                        {repo.fullName}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-400 font-mono text-xs">{repo.githubRepoId}</TableCell>
                    <TableCell>
                      {repo.isActive ? (
                        <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-slate-800 text-slate-400 hover:bg-slate-800">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-slate-400">
                      {new Date(repo.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
