'use client';

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { RightPanel } from "@/components/layout/RightPanel";
import { 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  MessageSquare, 
  BrainCircuit, 
  ShieldCheck, 
  Activity,
  BarChart3,
  Cpu,
  Zap,
  ArrowRight,
  Sparkles,
  Search,
  Filter,
  Check,
  AlertCircle,
  MoreVertical,
  Target,
  Terminal,
  Eraser,
  MessageCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ReviewPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [alignmentScore, setAlignmentScore] = useState(100);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const fetchData = async () => {
    try {
      const res = await fetch("/api/user/review");
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews);
        setStats(data.stats);
        setAlignmentScore(data.alignmentScore);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (messageId: string, feedbackType: string, correctedText?: string) => {
    try {
      const res = await fetch("/api/user/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, feedbackType, correctedText }),
      });

      if (res.ok) {
        setReviews(prev => prev.filter(r => r.id !== messageId));
        fetchData();
        setEditingId(null);
      } else {
        console.error("Failed to submit feedback.");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  const handleStartEdit = (review: any) => {
    setEditingId(review.id);
    setEditValue(review.content);
  };

  if (isLoading) return (
    <div className="flex-1 bg-[var(--bg-primary)] flex flex-col items-center justify-center font-sans">
       <div className="h-12 w-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
       <p className="text-[var(--text-tertiary)] font-medium uppercase tracking-[0.08em] text-[10px]">Loading logs...</p>
    </div>
  );

  return (
    <div className="flex-1 flex overflow-hidden w-full bg-[var(--bg-primary)] font-sans">
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="mx-auto max-w-[1200px] py-12 px-6 lg:px-10">
          <motion.header 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-14"
          >
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="ai" className="font-bold flex items-center gap-2">
                <Sparkles size={12} className="text-indigo-300" />
                Quality Control
              </Badge>
            </div>
            <h1 className="text-[40px] md:text-[56px] font-bold text-[var(--text-primary)] tracking-[-0.03em] leading-[1.02] mb-4">Feedback & Review</h1>
            <p className="text-[var(--text-secondary)] font-medium text-sm max-w-2xl leading-relaxed">
              Review your AI profile&apos;s recent interactions. Your feedback directly trains the underlying model to better represent your unique perspective.
            </p>
          </motion.header>

          {reviews.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="p-16 text-center bg-zinc-900/20 border-zinc-800/50 flex flex-col items-center">
                <div className="h-20 w-20 bg-zinc-900 rounded-3xl flex items-center justify-center text-zinc-700 mb-8 overflow-hidden group">
                    <ShieldCheck size={40} className="group-hover:scale-110 transition-transform text-emerald-500/50" />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight mb-3">All Caught Up</h3>
                <p className="text-zinc-500 text-sm max-w-xs mx-auto leading-relaxed">
                  Your AI representation is currently operating within your defined behavior patterns. No pending reviews detected.
                </p>
              </Card>
            </motion.div>
          ) : (
            <div className="space-y-12 pb-20">
              <AnimatePresence initial={false}>
                {reviews.map((review) => {
                  const recipient = review.conversation?.participant1?.name || review.conversation?.participant2?.name || "Global Participant";
                  const time = new Date(review.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });
                  const confidenceLevel = String(review.confidenceLevel ?? "medium").toLowerCase();
                   
                  return (
                    <motion.div 
                      key={review.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <Card className="p-0 border-zinc-800 bg-zinc-900/30 overflow-hidden group hover:border-zinc-700 transition-all duration-300">
                        <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-900/50">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-100 font-bold border border-zinc-800 text-lg">
                                {recipient.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-base font-bold text-white">{recipient}</h4>
                              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">{time}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "font-bold text-[10px] px-3 py-1 border-2",
                                confidenceLevel === 'high' 
                                  ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-500" 
                                  : "border-amber-500/20 bg-amber-500/5 text-amber-500"
                              )}
                            >
                              {confidenceLevel.toUpperCase()} Confidence
                            </Badge>
                            <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl text-zinc-700 hover:text-white">
                              <MoreVertical size={18} />
                            </Button>
                          </div>
                        </div>

                        <div className="p-8">
                          {editingId === review.id ? (
                            <div className="space-y-6">
                              <div className="relative">
                                <textarea 
                                  className="w-full min-h-[160px] p-6 bg-[var(--bg-secondary)] border border-white/10 text-[var(--text-primary)] text-sm focus:ring-4 focus:ring-[rgba(99,102,241,0.12)] focus:border-[rgba(99,102,241,0.60)] outline-none transition-all rounded-2xl resize-none leading-relaxed placeholder:text-[var(--text-tertiary)]"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  placeholder="Type corrected version..."
                                  autoFocus
                                />
                                <div className="absolute top-4 right-4 text-indigo-300">
                                    <Edit3 size={18} />
                                </div>
                              </div>
                              <div className="flex items-center justify-end gap-3">
                                  <Button variant="ghost" onClick={() => setEditingId(null)} className="h-12 font-bold px-8 text-zinc-500 hover:text-white hover:bg-zinc-800">Discard</Button>
                                  <Button onClick={() => handleAction(review.id, "correct", editValue)} className="h-12 font-semibold px-10 shadow-glow">Commit Revision</Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-8">
                              <div className="p-6 rounded-2xl bg-zinc-950/50 border border-zinc-800/50 relative overflow-hidden group/text">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/text:opacity-40 transition-opacity">
                                  <Target size={60} />
                                </div>
                                <div className="flex gap-4 relative z-10">
                                  <div className="text-indigo-300 shrink-0 mt-1">
                                      <MessageSquare size={18} />
                                  </div>
                                  <p className="text-sm font-medium text-zinc-400 leading-relaxed italic">
                                    &ldquo;{review.content.replace(/^\(AI Representation( of [^)]+)?\)(\s*:)?\s*/i, '').trim()}&rdquo;
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <Button 
                                  variant="outline"
                                  className="h-12 border-emerald-500/20 bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all duration-300 font-bold group/btn"
                                  onClick={() => handleAction(review.id, "approve")}
                                >
                                  <Check size={16} className="mr-2 group-hover/btn:scale-125 transition-transform" />
                                  Approve
                                </Button>
                                
                                <Button 
                                  variant="outline"
                                  className="h-12 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 font-bold group/btn"
                                  onClick={() => handleStartEdit(review)}
                                  >
                                  <Edit3 size={16} className="mr-2 group-hover/btn:scale-125 transition-transform" />
                                  Edit Response
                                </Button>
                                
                                <Button 
                                  variant="outline"
                                  className="h-12 border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-50 hover:text-white transition-all duration-300 font-bold group/btn"
                                  onClick={() => handleAction(review.id, "reject")}
                                >
                                  <Eraser size={16} className="mr-2 group-hover/btn:scale-125 transition-transform" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
      <RightPanel className="hidden lg:block w-[400px] shrink-0 border-l border-zinc-900 bg-zinc-950/80 backdrop-blur-xl">
        <div className="space-y-10 py-8 px-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Activity size={16} className="text-indigo-300" />
              <h2 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Consistency Insights</h2>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed font-medium">Real-time metrics tracking your AI&apos;s alignment with your behavior patterns.</p>
          </div>
          
          <Card className="p-8 text-center bg-zinc-900/40 border-zinc-800/50 shadow-2xl">
            <div className="relative inline-flex items-center justify-center mb-6">
              <svg className="h-32 w-32 transform -rotate-90">
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-zinc-900" />
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray="364.4" strokeDashoffset={364.4 - (364.4 * alignmentScore / 100)} className="text-indigo-400 drop-shadow-[0_0_12px_rgba(99,102,241,0.35)] transition-all duration-1000 ease-out" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-bold text-white tabular-nums">{alignmentScore}%</span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Sync</span>
              </div>
            </div>
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-1">Behavior Accuracy</h3>
            <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-tighter">Based on your recent feedback</p>
          </Card>

          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2">Engagement History</h3>
            
            <div className="flex items-center justify-between p-5 bg-zinc-900/30 border border-zinc-800 rounded-2xl group transition-all">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-emerald-500 rounded-full group-hover:scale-125 transition-transform" />
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Approved</span>
              </div>
              <span className="text-sm font-bold text-white tabular-nums">{stats?.approved || 0}</span>
            </div>

            <div className="flex items-center justify-between p-5 bg-zinc-900/30 border border-zinc-800 rounded-2xl group transition-all">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-indigo-500 rounded-full group-hover:scale-125 transition-transform" />
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Corrected</span>
              </div>
              <span className="text-sm font-bold text-white tabular-nums">{stats?.corrected || 0}</span>
            </div>

            <div className="flex items-center justify-between p-5 bg-zinc-900/30 border border-zinc-800 rounded-2xl group transition-all">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-red-500 rounded-full group-hover:scale-125 transition-transform" />
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Rejected</span>
              </div>
              <span className="text-sm font-bold text-white tabular-nums">{stats?.rejected || 0}</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/15 flex gap-4">
            <div className="p-2 h-fit bg-indigo-500/10 rounded-xl text-indigo-300">
              <Zap size={16} />
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed font-semibold uppercase tracking-tighter">
              Revisions impact learning at a 2x rate compared to simple approvals.
            </p>
          </div>
        </div>
      </RightPanel>
    </div>
  );
}
