'use client';

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { RightPanel } from "@/components/layout/RightPanel";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { 
  Send, 
  ArrowLeft, 
  MoreHorizontal, 
  Info, 
  User, 
  Clock, 
  Check,
  Edit2,
  Trash2,
  Shield,
  Zap,
  Sparkles,
  Bot,
  Activity,
  ChevronRight,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";

type ConfidenceLevel = "High" | "Medium" | "Low";

function normalizeConfidence(value: unknown): ConfidenceLevel {
  const normalized = String(value ?? "").toLowerCase();
  if (normalized === "high") return "High";
  if (normalized === "low") return "Low";
  return "Medium";
}

function confidenceToPercent(level: ConfidenceLevel): number {
  if (level === "High") return 95;
  if (level === "Low") return 55;
  return 75;
}

export default function ChatPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;
  
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleBlock = async () => {
    if (!recipient?.id || !confirm("Are you sure you want to block this user?")) return;
    setIsBlocking(true);
    try {
      await fetch('/api/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockedId: recipient.id })
      });
      alert("User blocked.");
      router.push('/dashboard');
    } catch(e) {
      alert("Failed to block user");
    } finally {
      setIsBlocking(false);
    }
  };

  const handleReport = async () => {
    if (!recipient?.id) return;
    const reason = prompt("Why are you reporting this user?");
    if (!reason) return;
    try {
      await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportedId: recipient.id, reason })
      });
      alert("User reported to moderators.");
    } catch(e) {
      alert("Failed to report user");
    }
  };

  const fetchMessages = useCallback(async (silent = false) => {
    try {
      const res = await fetch(`/api/chat?conversationId=${conversationId}`);
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map((m: any) => ({
          id: m.id,
          sender: m.senderId === userId ? 'me' : 'them',
          text: m.content,
          time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isAi: m.isAi,
          confidenceLevel: normalizeConfidence(m.confidenceLevel),
        }));
        setMessages(formatted);
        
        // If the last message is from 'me', we assume AI might be responding
        if (formatted.length > 0 && formatted[formatted.length - 1].sender === 'me') {
           setIsAiResponding(true);
        } else {
           setIsAiResponding(false);
        }
      }
    } catch (err) {
      if (!silent) console.error("Failed to fetch messages:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [conversationId, userId]);

  // Initial fetch and polling
  useEffect(() => {
    if (session?.user && conversationId) {
      fetchMessages();
      const interval = setInterval(() => fetchMessages(true), 1500); // Snappy polling
      return () => clearInterval(interval);
    }
  }, [conversationId, fetchMessages, session]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const text = inputValue.trim();
    setInputValue("");

    // Optimistic update
    const tempId = Date.now().toString();
    setMessages(prev => [...prev, {
      id: tempId,
      sender: "me",
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAi: false
    }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, content: text }),
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => "Failed to send message");
        console.error(errorText);
        alert(errorText || "Failed to send message");
        // Revert optimistic update
        setMessages(prev => prev.filter(m => m.id !== tempId));
      } else {
        const data = await res.json();
        
        if (data.triggerAi && data.recipientId) {
          const fetchAIResponse = async () => {
            try {
              const aiRes = await fetch("/api/ai/respond", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ conversationId, recipientId: data.recipientId }),
              });

              if (!aiRes.ok) {
                throw new Error("Failed to get AI response");
              }

              const aiMsgId = (Date.now() + 1).toString();
              setMessages(prev => [...prev, {
                id: aiMsgId,
                sender: "them",
                text: "",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isAi: true,
                confidenceLevel: "Medium"
              }]);
              setIsAiResponding(false); 

              const reader = aiRes.body?.getReader();
              const decoder = new TextDecoder();
              let accumulatedText = "";

              if (reader) {
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;

                  const chunk = decoder.decode(value, { stream: true });
                  accumulatedText += chunk;

                  setMessages(prev => 
                    prev.map(m => m.id === aiMsgId ? { ...m, text: accumulatedText } : m)
                  );
                }
              }
              
              fetchMessages(true);
            } catch (err) {
              console.error("Error streaming AI response:", err);
              setIsAiResponding(false);
            }
          };

          fetchAIResponse();
        } else {
          fetchMessages(true);
        }
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any>(null);

  // Fetch conversations list
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch("/api/conversations");
        if (res.ok) {
          const data = await res.json();
          setConversations(data);
          const current = data.find((c: any) => c.id === conversationId);
          if (current) setActiveConversation(current);
        }
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
      }
    };
    if (session?.user) fetchConversations();
  }, [session, conversationId]);

  const recipient = activeConversation?.participant1Id === userId 
    ? activeConversation?.participant2 
    : activeConversation?.participant1;

  const [isAiInsightsOpen, setIsAiInsightsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-[var(--bg-primary)] font-sans">
      
      {/* Left Sidebar (Conversations) */}
      <div className={cn(
        "w-[320px] border-r border-white/10 flex flex-col bg-[var(--bg-primary)] shrink-0 overflow-hidden transition-all duration-300 absolute xl:static h-full z-40",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0"
      )}>
        <div className="p-6 border-b border-white/10 bg-[rgba(10,10,10,0.6)] backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Chats</h2>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] group-focus-within:text-indigo-300" size={14} />
            <input 
              type="text" 
              placeholder="Search chats..." 
              className="w-full pl-9 pr-4 py-2 bg-[var(--bg-secondary)] border border-white/10 text-[var(--text-primary)] text-xs rounded-lg focus:outline-none focus:border-[rgba(99,102,241,0.60)] focus:ring-4 focus:ring-[rgba(99,102,241,0.12)] transition-all placeholder:text-[var(--text-tertiary)]"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-none">
          {conversations.map((conv) => {
             const otherUser = conv.participant1Id === userId ? conv.participant2 : conv.participant1;
             const isActive = conv.id === conversationId;
             
             return (
              <Link 
                href={`/chat/${conv.id}`} 
                key={conv.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl transition-all duration-200 border border-transparent",
                  isActive 
                    ? "bg-indigo-500/10 border-indigo-500/20 shadow-[0_0_0_1px_rgba(99,102,241,0.10)]" 
                    : "hover:bg-white/5 hover:border-white/10"
                )}
              >
                <div className="relative shrink-0">
                   <div className={cn(
                     "h-10 w-10 rounded-full flex items-center justify-center text-white font-bold border",
                     isActive ? "bg-indigo-500 border-indigo-500" : "bg-white/5 border-white/10 text-[var(--text-tertiary)]"
                   )}>
                      {otherUser?.name?.charAt(0)}
                   </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h3 className={cn(
                      "text-sm font-semibold truncate",
                      isActive ? "text-white" : "text-zinc-400"
                    )}>{otherUser?.name}</h3>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-medium">
                     Active now
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 xl:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pr-[400px] bg-[var(--bg-primary)] relative z-20 h-[100dvh]">
        
        {/* Chat Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-[rgba(10,10,10,0.70)] backdrop-blur-md border-b border-white/10 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-2 sm:gap-4">
             <button 
              onClick={() => setIsSidebarOpen(true)}
              className="xl:hidden p-2 rounded-lg hover:bg-white/5 text-[var(--text-secondary)]"
             >
               <MoreHorizontal size={20} />
             </button>
             
             <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[var(--text-primary)] font-semibold">
                 {recipient?.name?.charAt(0) || "?"}
               </div>
               <div>
                 <h2 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight leading-none mb-1">{recipient?.name || "Loading..."}</h2>
                 <div className="flex items-center gap-1.5 px-0.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-semibold text-emerald-500/80 uppercase tracking-wider">
                       Active
                    </span>
                 </div>
               </div>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsAiInsightsOpen(true)}
              className="hidden sm:flex h-9 gap-2"
            >
              <Zap size={14} className="text-indigo-300" />
              <span className="text-[11px] font-bold uppercase tracking-wider">AI Insights</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleReport} className="text-orange-400 hover:text-orange-300 hover:bg-orange-400/10 hidden sm:flex h-9 gap-2">
              <Shield size={14} />
              <span className="text-[11px] font-bold uppercase tracking-wider">Report</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleBlock} disabled={isBlocking} className="text-red-400 hover:text-red-300 hover:bg-red-400/10 hidden sm:flex h-9 gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Block</span>
            </Button>
            <Button variant="ghost" size="sm" className="sm:hidden h-9 w-9 p-0 text-[var(--text-tertiary)]">
              <MoreHorizontal size={20} />
            </Button>
          </div>
        </header>

        {/* Message Thread */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-none">
          <div className="flex justify-center mb-8">
            <Badge variant="outline" className="bg-white/5 px-4 py-1 gap-2 border-white/10">
              <Shield size={12} className="text-indigo-300" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Encrypted Connection
              </span>
            </Badge>
          </div>

          <AnimatePresence mode="popLayout">
            {messages.map((msg, idx) => {
              const isMe = msg.sender === 'me';
              
              return (
                <motion.div 
                  key={msg.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex flex-col group",
                    isMe ? "items-end" : "items-start"
                  )}
                >
                  <div className={cn(
                    "flex max-w-[80%] gap-3 items-end",
                    isMe ? "flex-row-reverse" : "flex-row"
                  )}>
                    <div className={cn(
                      "flex flex-col gap-1.5",
                      isMe ? "items-end" : "items-start"
                    )}>
                      {msg.isAi && (
                        <div className="flex items-center gap-2 mb-0.5 ml-1">
                          <Badge variant="ai" className="h-5">
                             AI Representation
                          </Badge>
                           <div className={cn(
                              "text-[9px] font-bold uppercase tracking-wider",
                              msg.confidenceLevel === "High" ? "text-emerald-500/80" : "text-amber-500/80"
                           )}>
                             {confidenceToPercent(msg.confidenceLevel)}% Confidence
                           </div>
                         </div>
                       )}
                      
                      <div className={cn(
                        "px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap relative",
                        isMe 
                          ? "bg-indigo-500 text-white rounded-br-none shadow-glow" 
                          : msg.isAi 
                            ? "bg-[rgba(255,255,255,0.04)] border border-white/10 text-[var(--text-primary)] rounded-bl-none" 
                            : "bg-white/5 border border-white/10 text-[var(--text-primary)] rounded-bl-none"
                      )}>
                        {msg.text}
                      </div>
                      
                      {msg.isAi && (
                         <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-emerald-400 transition-colors" title="Approve">
                               <Check size={14} />
                            </button>
                            <button className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-amber-400 transition-colors" title="Correct">
                               <Edit2 size={14} />
                            </button>
                            <button className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-red-400 transition-colors" title="Reject">
                               <Trash2 size={14} />
                            </button>
                         </div>
                      )}
                      
                      <span className="text-[10px] font-medium text-zinc-600 px-1 mt-0.5">
                        {msg.time}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {isAiResponding && (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="flex justify-start"
             >
               <div className="flex flex-col gap-1.5 items-start">
                  <div className="flex items-center gap-2 mb-0.5 ml-1">
                    <Badge variant="ai" className="h-5 opacity-50">
                       AI is thinking...
                    </Badge>
                  </div>
                  <div className="bg-[rgba(255,255,255,0.04)] border border-white/10 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1.5">
                    <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
               </div>
             </motion.div>
          )}

          <div ref={messagesEndRef} />
        </main>

        {/* Input Footer */}
        <footer className="p-4 sm:p-6 bg-[rgba(10,10,10,0.65)] backdrop-blur-md border-t border-white/10 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-center gap-2 sm:gap-4">
            <div className="flex-1 relative group bg-[var(--bg-secondary)] rounded-xl p-1 transition-all border border-white/10 focus-within:border-[rgba(99,102,241,0.60)] focus-within:ring-4 focus-within:ring-[rgba(99,102,241,0.12)]">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a message..."
                className="w-full bg-transparent outline-none py-3 px-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                 <button type="button" className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                    <Sparkles size={16} />
                 </button>
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={!inputValue.trim()}
              className="h-12 w-12 p-0 rounded-xl shadow-glow"
            >
              <Send size={18} />
            </Button>
          </form>
        </footer>
      </div>

      {/* Right Panel (Profile & Insights) */}
      <RightPanel title="Profile Details" className="bg-[var(--bg-secondary)] border-l border-white/10">
        <div className="flex flex-col items-center text-center mt-6 mb-10">
            <div className="relative mb-6 group">
               <div className="h-28 w-28 rounded-3xl bg-white/5 flex items-center justify-center text-[var(--text-primary)] font-semibold text-4xl shadow-card border border-white/10 group-hover:border-[rgba(255,255,255,0.15)] transition-all overflow-hidden">
                  {recipient?.name?.charAt(0)}
               </div>
               <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-indigo-500 rounded-xl flex items-center justify-center border-4 border-[var(--bg-secondary)] shadow-glow">
                  <Star size={14} className="text-white" />
               </div>
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-1">{recipient?.name || "Loading..."}</h2>
            <p className="text-xs text-indigo-200/90 font-medium uppercase tracking-[0.08em]">{recipient?.behaviorProfile?.profession || "Member"}</p>
        </div>

        <div className="space-y-6">
           <Card className="p-5 bg-zinc-900/30 border-zinc-800">
             <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
               <Activity size={14} className="text-indigo-300" />
               Live Status
             </h3>
             <div className="space-y-3">
               <div className="flex justify-between items-center text-xs">
                 <span className="text-zinc-500">Connection</span>
                 <span className="text-emerald-500 font-semibold">Healthy</span>
               </div>
               <div className="flex justify-between items-center text-xs">
                 <span className="text-zinc-500">Last Active</span>
                 <span className="text-zinc-300">Just now</span>
               </div>
             </div>
           </Card>

           {recipient?.behaviorProfile && (
             <Card className="p-5 bg-zinc-900/30 border-zinc-800 overflow-hidden relative">
               <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-5 flex items-center gap-2">
                 <Zap size={14} className="text-amber-400" />
                 Behavior Profile
               </h3>
               <div className="space-y-5">
                 <div className="space-y-2">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Communication Tone</span>
                    <div className="text-xs font-medium text-zinc-200 bg-zinc-950/50 border border-zinc-800 p-3 rounded-lg flex items-start gap-2">
                      <span className="text-indigo-300 font-bold text-lg leading-none">&ldquo;</span>
                      <span className="italic">{recipient.behaviorProfile.tone}</span>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-3">
                    <div className="bg-zinc-950/50 border border-zinc-800/80 p-3 rounded-lg">
                       <span className="text-[9px] text-zinc-600 font-bold block mb-1 uppercase">Humor</span>
                       <span className="text-xs font-bold text-zinc-100">{recipient.behaviorProfile.humorLevel}</span>
                    </div>
                    <div className="bg-zinc-950/50 border border-zinc-800/80 p-3 rounded-lg">
                       <span className="text-[9px] text-zinc-600 font-bold block mb-1 uppercase">Social Style</span>
                       <span className="text-xs font-bold text-zinc-100">{recipient.behaviorProfile.emotionalSensitivity}</span>
                    </div>
                 </div>
               </div>
             </Card>
           )}
           
           <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-3">
              <Shield size={18} className="text-indigo-300" />
              <div>
                <p className="text-xs font-semibold text-indigo-200">Secure thread</p>
                <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">End-to-end encrypted messaging</p>
              </div>
           </div>
        </div>
      </RightPanel>

      {/* AI Insights Modal */}
      <AnimatePresence>
        {isAiInsightsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAiInsightsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <Badge variant="primary" className="mb-3">AI Intelligence</Badge>
                    <h2 className="text-2xl font-bold text-white tracking-tight">How it works</h2>
                    <p className="text-zinc-500 text-sm mt-1">Understanding the response logic for this conversation.</p>
                  </div>
                  <button 
                    onClick={() => setIsAiInsightsOpen(false)}
                    className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-zinc-900 text-zinc-500 hover:text-white transition-colors"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4 bg-zinc-900/50">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Accuracy Rate</p>
                      <p className="text-2xl font-bold text-emerald-400">98.4%</p>
                    </Card>
                    <Card className="p-4 bg-zinc-900/50">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Sync Quality</p>
                      <p className="text-2xl font-bold text-indigo-300">High</p>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">AI Inference Model</h3>
                    <p className="text-xs text-zinc-500 leading-relaxed bg-zinc-900/30 border border-zinc-800 p-4 rounded-xl italic">
                      &ldquo;The AI twin analyzes your communication patterns, behavioral data, and past interactions to generate responses that match your unique personality. It uses a blend of memory retrieval and tone synthesis to stay consistent.&rdquo;
                    </p>
                  </div>

                  <div className="flex items-center gap-3 py-3 border-t border-zinc-900 mt-6 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Processing active
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Star({ className, size }: { className?: string; size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="white" 
      stroke="white" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
