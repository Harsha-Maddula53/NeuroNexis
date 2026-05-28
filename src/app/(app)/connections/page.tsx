'use client';

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { 
  Users, 
  Send, 
  UserPlus, 
  X, 
  Check, 
  Clock, 
  ShieldCheck,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  UserCheck,
  UserMinus,
  Search,
  MoreVertical
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ConnectionsPage() {
  const [incoming, setIncoming] = useState<any[]>([]);
  const [outgoing, setOutgoing] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConnections = async () => {
    try {
      const res = await fetch("/api/connections");
      if (res.ok) {
        const data = await res.json();
        setIncoming(data.incoming);
        setOutgoing(data.outgoing);
      }
    } catch (err) {
      console.error("Fetch connections error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleUpdateStatus = async (connectionId: string, status: string) => {
    try {
      const res = await fetch("/api/connections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId, status }),
      });

      if (res.ok) {
        fetchConnections();
      }
    } catch (err) {
      console.error("Update status error:", err);
    }
  };

  if (isLoading) return (
    <div className="flex-1 bg-[var(--bg-primary)] flex flex-col items-center justify-center font-sans">
       <div className="h-12 w-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
       <p className="text-[var(--text-tertiary)] font-medium uppercase tracking-[0.08em] text-[10px]">Loading connections...</p>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto w-full bg-[var(--bg-primary)] font-sans scrollbar-hide">
      <div className="mx-auto max-w-[1200px] p-6 md:p-10 pb-32">
        
        <header className="mb-14 border-b border-white/10 pb-12">
          <div className="flex items-center gap-3 mb-4">
             <Badge variant="ai" className="font-bold">
               <Sparkles size={12} className="mr-2" />
               Society
             </Badge>
          </div>
          <h1 className="text-[44px] md:text-[56px] font-bold text-[var(--text-primary)] tracking-[-0.03em] leading-[1.02]">Connections</h1>
          <p className="text-[var(--text-secondary)] mt-4 text-sm font-medium max-w-2xl leading-relaxed">
            Manage your network of synchronized identities. Review incoming requests from other users or monitor your pending connection attempts.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Incoming Requests */}
          <section>
             <div className="flex items-center justify-between mb-8 px-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-300 border border-indigo-500/15">
                    <ArrowDownLeft size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">Incoming requests</h2>
                    <p className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-[0.08em]">Awaiting authorization</p>
                  </div>
                </div>
                {incoming.length > 0 && (
                   <Badge className="bg-indigo-500 text-white font-semibold h-7 px-3 text-[11px] border-none shadow-glow">{incoming.length}</Badge>
                )}
             </div>

             {incoming.length === 0 ? (
               <Card className="py-20 text-center bg-zinc-900/10 border-zinc-800/50 flex flex-col items-center">
                 <div className="h-16 w-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-zinc-700 mb-6 group">
                   <UserCheck size={24} className="group-hover:scale-110 transition-transform opacity-30" />
                 </div>
                 <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest px-8">No Awaiting Requests</p>
               </Card>
             ) : (
               <div className="space-y-4">
                 <AnimatePresence initial={false}>
                   {incoming.map(req => (
                     <motion.div 
                       key={req.id} 
                       initial={{ opacity: 0, scale: 0.98 }}
                       animate={{ opacity: 1, scale: 1 }}
                       layout
                     >
                       <Card hoverable className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 group">
                         <div className="flex items-center gap-4">
                           <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center text-[var(--text-primary)] font-semibold text-xl border border-white/10 shadow-card transition-all group-hover:border-[rgba(255,255,255,0.15)]">
                             {req.requester.name.charAt(0)}
                           </div>
                           <div>
                             <h3 className="text-base font-semibold text-[var(--text-primary)] leading-tight">{req.requester.name}</h3>
                             <div className="flex items-center gap-2 mt-1">
                                <Clock size={12} className="text-[var(--text-tertiary)]" />
                                <span className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-[0.08em]">
                                  Sent {new Date(req.createdAt).toLocaleDateString([], { month: 'short', day: '2-digit' })}
                                </span>
                             </div>
                           </div>
                         </div>
                         <div className="flex items-center gap-3">
                           <Button 
                             variant="ghost" 
                             className="flex-1 sm:flex-none h-11 px-6 font-bold text-xs text-zinc-500 hover:text-red-400 hover:bg-red-400/5" 
                             onClick={() => handleUpdateStatus(req.id, "declined")}
                           >
                             Decline
                           </Button>
                           <Button 
                            className="flex-1 sm:flex-none h-11 px-8 font-semibold text-xs shadow-glow" 
                             onClick={() => handleUpdateStatus(req.id, "accepted")}
                           >
                             Accept
                           </Button>
                         </div>
                       </Card>
                     </motion.div>
                   ))}
                 </AnimatePresence>
               </div>
             )}
          </section>

          {/* Outgoing Requests */}
          <section>
             <div className="flex items-center justify-between mb-8 px-2">
                <div className="flex items-center gap-3">
                   <div className="h-10 w-10 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-500 border border-zinc-800">
                    <ArrowUpRight size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-zinc-400 tracking-tight">Sent Requests</h2>
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Active Signals</p>
                  </div>
                </div>
                {outgoing.length > 0 && (
                  <Badge variant="outline" className="border-zinc-800 text-zinc-500 font-bold h-7 px-3 text-[11px]">{outgoing.length}</Badge>
                )}
             </div>

             {outgoing.length === 0 ? (
               <Card className="py-20 text-center bg-zinc-900/5 border-zinc-900 flex flex-col items-center">
                  <div className="h-16 w-16 bg-zinc-900/50 rounded-2xl flex items-center justify-center text-zinc-800 mb-6 group">
                   <Send size={24} className="group-hover:scale-110 transition-transform opacity-20" />
                 </div>
                 <p className="text-sm font-bold text-zinc-700 uppercase tracking-widest px-8">No Active Signals</p>
               </Card>
             ) : (
               <div className="space-y-4">
                 <AnimatePresence initial={false}>
                   {outgoing.map(req => (
                     <motion.div 
                       key={req.id}
                       initial={{ opacity: 0, scale: 0.98 }}
                       animate={{ opacity: 1, scale: 1 }}
                       layout
                     >
                       <Card className="bg-zinc-950/30 border-zinc-900 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-zinc-800 group transition-all duration-300">
                         <div className="flex items-center gap-4">
                           <div className="h-14 w-14 rounded-2xl bg-zinc-900/50 flex items-center justify-center text-zinc-500 font-bold text-xl border border-zinc-900 transition-all group-hover:border-zinc-800">
                             {req.receiver.name.charAt(0)}
                           </div>
                           <div>
                             <h3 className="text-base font-bold text-zinc-400 leading-tight group-hover:text-zinc-200 transition-colors">{req.receiver.name}</h3>
                             <div className="flex items-center gap-3 mt-1.5">
                               <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">Pending Sync</span>
                               <div className="h-1 w-1 bg-zinc-800 rounded-full" />
                              <span className="text-[10px] font-semibold text-indigo-300/60 uppercase tracking-[0.08em]">
                                 {req.status}
                               </span>
                             </div>
                           </div>
                         </div>
                         <Button 
                           variant="ghost"
                           className="w-full sm:w-auto h-11 px-6 font-bold text-xs text-zinc-600 hover:text-red-400 hover:bg-red-400/5" 
                           onClick={() => handleUpdateStatus(req.id, "cancelled")}
                         >
                           <UserMinus size={16} className="mr-2" />
                           Cancel
                         </Button>
                       </Card>
                     </motion.div>
                   ))}
                 </AnimatePresence>
               </div>
             )}
          </section>
          
        </div>
      </div>
    </div>
  );
}
