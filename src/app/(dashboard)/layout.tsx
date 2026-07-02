import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { GitBranch, Activity, Settings, GitPullRequest } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30">
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-slate-950/50 backdrop-blur-xl hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <GitPullRequest className="w-6 h-6 text-indigo-400 mr-2" />
          <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
            IntelliPR
          </span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link href="/dashboard" className="flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-white/5 text-slate-300 hover:text-white group">
            <GitBranch className="w-5 h-5 mr-3 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            Repositories
          </Link>
          <Link href="/dashboard/reviews" className="flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-white/5 text-slate-300 hover:text-white group">
            <Activity className="w-5 h-5 mr-3 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            Review History
          </Link>
        </nav>
        
        <div className="p-4 border-t border-white/10">
          <a 
            href="https://github.com/apps/intellipr/installations/new" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center px-4 py-2 rounded-lg bg-indigo-600/20 text-indigo-400 text-sm font-medium hover:bg-indigo-600/30 transition-colors border border-indigo-500/20"
          >
            Connect GitHub
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 flex items-center justify-end px-8 border-b border-white/10 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-10">
          <UserButton appearance={{ elements: { avatarBox: "w-9 h-9 border border-white/20" } }} />
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
}
