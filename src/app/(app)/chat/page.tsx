'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  Search, 
  UserPlus, 
  Clock, 
  ChevronRight,
  Sparkles,
  MessageCircle,
  MoreVertical,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

export default function ChatIndexPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch("/api/conversations");
        if (res.ok) {
          const data = await res.json();
          setConversations(data);
        }
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
      } finally {
        setLoading(false);
      }
    };
    if (session?.user) fetchConversations();
  }, [session]);

  const filteredConversations = conversations.filter(conv => {
    const otherUser = conv.participant1Id === userId ? conv.participant2 : conv.participant1;
    return otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex h-full w-full bg-[var(--bg-primary)] font-sans">
      {/* Left Conversations List */}
      <div className="w-full md:w-[380px] border-r border-white/10 flex flex-col bg-[var(--bg-primary)] shrink-0 overflow-hidden z-10">
        <header className="p-6 border-b border-white/10 bg-[rgba(10,10,10,0.6)] backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">Chats</h1>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
              <Plus size={18} />
            </Button>
          </div>
          
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] group-focus-within:text-indigo-300 transition-colors" size={16} />
            <Input 
              placeholder="Search conversations..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-none">
          {loading ? (
             <div className="p-4 space-y-4">
               {[1,2,3,4,5].map(i => (
                 <div key={i} className="flex gap-4 items-center p-3 rounded-xl bg-zinc-900/20 animate-pulse">
                    <div className="h-10 w-10 rounded-full bg-zinc-800" />
                    <div className="flex-1 space-y-2">
                       <div className="h-2.5 w-1/2 bg-zinc-800 rounded-full" />
                       <div className="h-2 w-1/4 bg-zinc-800 rounded-full" />
                    </div>
                 </div>
               ))}
             </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center mt-10">
              <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-[var(--text-tertiary)]">
                 <MessageSquare size={24} />
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">No chats found</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-6">
                Start a new conversation from the discovery network.
              </p>
              <Link href="/society">
                <Button variant="primary" size="sm" className="w-full">
                  Find People
                </Button>
              </Link>
            </div>
          ) : (
              <AnimatePresence>
              {filteredConversations.map((conv) => {
                 const otherUser = conv.participant1Id === userId ? conv.participant2 : conv.participant1;
                 return (
                   <motion.div
                    key={conv.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: -0 }}
                   >
                    <Link 
                      href={`/chat/${conv.id}`} 
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group hover:bg-white/5 border border-transparent hover:border-white/10",
                      )}
                    >
                      <div className="relative shrink-0">
                         <div className="h-11 w-11 rounded-full bg-white/5 flex items-center justify-center text-[var(--text-primary)] font-semibold border border-white/10">
                            {otherUser?.name?.charAt(0)}
                         </div>
                         <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 border-2 border-[var(--bg-primary)] bg-emerald-500 rounded-full" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate">{otherUser?.name}</h3>
                          <span className="text-[10px] text-[var(--text-tertiary)] font-medium whitespace-nowrap">
                            {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">
                           Active now
                        </p>
                      </div>
                    </Link>
                   </motion.div>
                 );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Main Empty State */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-[var(--bg-primary)] p-12 relative">
        <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_50%_50%,rgba(99,102,241,0.10),transparent_65%)]" />
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md text-center relative z-10"
        >
          <div className="mb-8 relative inline-block">
             <div className="h-24 w-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-300 shadow-card relative overflow-hidden group">
               <div className="absolute inset-x-0 bottom-0 h-1 bg-indigo-500" />
               <MessageSquare size={40} />
             </div>
             <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-indigo-500 flex items-center justify-center border-4 border-[var(--bg-primary)]">
                <Sparkles size={12} className="text-white" />
             </div>
          </div>
          <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-3 tracking-tight">Your inbox</h2>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-8">
            Select a conversation to start messaging. All chats are private and secure.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-[0.08em]">
             <Activity className="text-emerald-500 animate-pulse" size={14} />
             System Online
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Activity({ className, size }: { className?: string; size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
