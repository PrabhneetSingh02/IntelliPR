import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, GitPullRequest, SearchX } from "lucide-react";
import Link from "next/link";

export default async function ReviewsPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  // Fetch pull requests with their repository info
  const pullRequests = await prisma.pullRequest.findMany({
    where: {
      repository: {
        userId: user.id
      }
    },
    include: {
      repository: true,
      reviews: true // Bring in the review summaries if needed
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 50 // Limit to 50 for now
  });

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'reviewed':
        return <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20">Reviewed</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/20">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

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
            Click the external link icon to view the PR on GitHub.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pullRequests.length === 0 ? (
            <div className="text-center py-12">
              <SearchX className="mx-auto h-12 w-12 text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-slate-200">No PRs found</h3>
              <p className="text-slate-400 mt-2">Open a Pull Request on one of your connected repositories to see it here.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-slate-300">Pull Request</TableHead>
                  <TableHead className="text-slate-300">Repository</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Analyzed On</TableHead>
                  <TableHead className="text-slate-300 text-right">Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pullRequests.map((pr) => (
                  <TableRow key={pr.id} className="border-white/10 hover:bg-white/5 transition-colors">
                    <TableCell className="font-medium text-slate-200">
                      <div className="flex items-center">
                        <GitPullRequest className="w-4 h-4 mr-2 text-indigo-400" />
                        PR #{pr.githubPrNumber}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm">
                      {pr.repository.fullName}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(pr.status)}
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm">
                      {new Date(pr.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <a 
                        href={`https://github.com/${pr.repository.fullName}/pull/${pr.githubPrNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center p-2 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
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
