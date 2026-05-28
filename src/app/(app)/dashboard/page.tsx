'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { 
  BarChart3, 
  MessageSquare, 
  Zap, 
  ArrowUpRight, 
  Target, 
  Settings, 
  Users, 
  Sparkles,
  TrendingUp,
  BrainCircuit,
  ShieldCheck,
  History,
  Timer,
  Activity,
  ArrowRight,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

function confidenceToPercent(value: unknown): number {
  const normalized = String(value ?? "").toLowerCase();
  if (normalized === "high") return 95;
  if (normalized === "low") return 55;
  return 75;
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  const isAiEnabled = data?.user?.aiEnabled ?? false;

  const toggleAi = async () => {
    try {
      const res = await fetch("/api/ai/deploy", { method: "POST" });
      if (res.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error toggling AI:", error);
    }
  };

  if (isLoading) return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-[var(--text-secondary)] font-medium animate-pulse text-sm">Syncing your dashboard...</p>
      </div>
    </div>
  );

  const count1 = data?.user?._count?.conversations1 || 0;
  const count2 = data?.user?._count?.conversations2 || 0;
  const totalConversations = count1 + count2;

  return (
    <div className="flex-1 overflow-y-auto w-full bg-[var(--bg-primary)] font-sans scrollbar-none">
      <div className="mx-auto max-w-[1200px] p-6 md:p-10">
        
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="ai">Overview</Badge>
            </div>
            <h1 className="text-[40px] md:text-[48px] font-bold text-[var(--text-primary)] tracking-[-0.04em] leading-[1.02]">Dashboard</h1>
            <p className="text-[var(--text-secondary)] mt-2 text-[15px] leading-relaxed max-w-md">Manage your AI representation and track your social activity matrix in real-time.</p>
          </div>
          
          {/* AI Toggle */}
          <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] backdrop-blur-md p-5 rounded-[var(--radius)] flex items-center gap-6 shrink-0 transition-all duration-500 hover:border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.04)] shadow-card">
             <div className="flex flex-col">
               <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] tracking-[0.08em] mb-1">AI Status</span>
               <span className={cn(
                 "text-xs font-semibold uppercase tracking-[0.08em] flex items-center gap-2",
                 isAiEnabled ? "text-emerald-500" : "text-zinc-500"
               )}>
                 {isAiEnabled && <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                 {isAiEnabled ? 'Enabled' : 'Disabled'}
               </span>
             </div>
             
             <button 
               onClick={toggleAi}
               className={cn(
                 "relative inline-flex h-7 w-12 items-center rounded-full transition-all",
                 isAiEnabled ? "bg-indigo-500" : "bg-white/10"
               )}
             >
               <span className={cn(
                 "inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-lg",
                 isAiEnabled ? "translate-x-6" : "translate-x-1"
               )} />
             </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card hoverable className="p-8 flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-lg bg-[rgba(99,102,241,0.08)] text-indigo-400">
                <MessageSquare size={20} />
              </div>
              <Activity size={16} className="text-[var(--text-tertiary)] group-hover:text-indigo-400 transition-colors duration-500" />
            </div>
            <div>
              <p className="text-4xl font-bold text-[var(--text-primary)] tracking-tight">{data?.user?._count?.messages || 0}</p>
              <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.08em] mt-2">Total Messages</p>
            </div>
          </Card>
          
          <Card hoverable className="p-8 flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-lg bg-[rgba(99,102,241,0.08)] text-indigo-400">
                <Users size={20} />
              </div>
              <TrendingUp size={16} className="text-[var(--text-tertiary)] group-hover:text-indigo-400 transition-colors duration-500" />
            </div>
            <div>
              <p className="text-4xl font-bold text-[var(--text-primary)] tracking-tight">{totalConversations}</p>
              <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.08em] mt-2">Connections</p>
            </div>
          </Card>
          
          <Card className="md:col-span-2 p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-full w-56 bg-indigo-500/10 blur-[60px] pointer-events-none group-hover:bg-[rgba(99,102,241,0.15)] transition-all" />
            
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-start mb-8">
                <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.08em]">Active behavior profile</div>
                <Badge variant="success">Operational</Badge>
              </div>
              
              <div className="mb-10">
                <h3 className="text-3xl md:text-4xl font-semibold text-[var(--text-primary)] tracking-[-0.02em] leading-[1.1]">
                  &ldquo;{data?.user?.behaviorProfile?.tone || "Adaptive & Friendly"}&rdquo;
                </h3>
                <p className="text-[13px] text-[var(--text-secondary)] mt-4 font-medium tracking-wide">
                  Humor: {data?.user?.behaviorProfile?.humorLevel || 5}/10 <span className="text-[var(--border-color)] mx-2">|</span> EQ: {data?.user?.behaviorProfile?.emotionalSensitivity || "Medium"}
                </p>
              </div>

              <div className="mt-auto">
                <Link href="/setup/behavior">
                  <Button variant="outline" className="gap-2 h-10">
                    Edit Profile
                    <Sparkles size={14} />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
             <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                <div className="flex items-center gap-3">
                  <History size={18} className="text-zinc-500" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">Recent Activity</h2>
                </div>
             </div>

             <div className="space-y-4">
               {(!data?.recentActivity || data.recentActivity.length === 0) && (
                 <div className="py-20 text-center rounded-2xl border-2 border-dashed border-zinc-900">
                    <p className="text-zinc-600 font-medium text-sm">No activity recorded yet.</p>
                 </div>
               )}

               {data?.recentActivity?.map((activity: any) => (
                 <Card hoverable key={activity.id} className="p-0 border-transparent bg-[rgba(255,255,255,0.01)] hover:bg-[rgba(255,255,255,0.03)] hover:border-[rgba(255,255,255,0.05)] transition-all overflow-hidden duration-500">
                    <div className="p-8">
                      <div className="flex justify-between items-start mb-6">
                         <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center font-bold text-[13px] text-[var(--text-primary)] border border-transparent">
                               {activity.targetName?.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                               <span className="text-sm font-bold text-white">{activity.targetName}</span>
                               <span className="text-[10px] font-medium text-zinc-500 uppercase">{new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                         </div>
                          <Badge variant={activity.isAi ? "ai" : "outline"} className="h-6">
                            {activity.isAi ? `AI Response (${confidenceToPercent(activity.confidenceLevel)}%)` : "Human Response"}
                          </Badge>
                      </div>
                      
                      <div className="relative pl-6 py-4 border-l-[3px] border-indigo-500/30 bg-[rgba(255,255,255,0.02)] rounded-r-xl mb-6">
                          <p className="text-[15px] text-[var(--text-secondary)] italic leading-relaxed">
                            &ldquo;{activity.content}&rdquo;
                          </p>
                      </div>
                      
                      <div className="flex justify-end">
                         <Link href={`/chat/${activity.conversationId}`} className="text-xs font-semibold text-[var(--text-tertiary)] hover:text-indigo-200 transition-colors flex items-center gap-1.5 group/link">
                            View Conversation <ArrowRight size={14} className="group-hover/link:translate-x-0.5 transition-transform" />
                         </Link>
                      </div>
                    </div>
                 </Card>
               ))}
             </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="border-b border-zinc-900 pb-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-3">
                <Zap size={18} className="text-indigo-300" />
                Quick Actions
              </h2>
            </div>
            
            <div className="space-y-3">
              {[
                { label: "Train AI Model", icon: BrainCircuit, href: "/training", color: "text-indigo-400 bg-indigo-500/10" },
                { label: "Sync Identity Maps", icon: Sparkles, href: "/setup/behavior", color: "text-amber-400 bg-amber-500/10" },
                { label: "Global Settings", icon: Settings, href: "/setup/identity", color: "text-[var(--text-secondary)] bg-white/5" }
              ].map((action, i) => (
                <Link key={i} href={action.href}>
                  <Card hoverable className="p-6 bg-[rgba(255,255,255,0.01)] border-[rgba(255,255,255,0.02)] hover:border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.03)] transition-all duration-500 flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className={cn("p-2.5 rounded-xl", action.color)}>
                        <action.icon size={18} />
                      </div>
                      <span className="text-[14px] font-bold text-[var(--text-primary)] transition-colors">{action.label}</span>
                    </div>
                    <ChevronRight size={18} className="text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)] group-hover:translate-x-1 transition-all duration-300" />
                  </Card>
                </Link>
              ))}
            </div>

            <Card className="p-8 bg-indigo-500/5 border-indigo-500/20 relative overflow-hidden group mt-10">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                <ShieldCheck size={64} className="text-indigo-300" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                   <ShieldCheck className="text-indigo-300" size={20} />
                   <h3 className="font-bold text-sm text-white">System Integrity</h3>
                </div>
                <p className="text-zinc-500 text-xs leading-relaxed mb-6">
                  Your digital twin is synchronized and learning from your latest interactions. Accuracy level is currently optimal.
                </p>
                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: "88%" }}
                     transition={{ duration: 1.5, ease: "easeOut" }}
                     className="h-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.25)]"
                   />
                </div>
                <div className="mt-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Efficiency: 88%</div>
              </div>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
