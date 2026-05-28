'use client';

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useSession } from "next-auth/react";
import { 
  ChevronLeft, 
  Sparkles, 
  Send, 
  ShieldCheck, 
  Target,
  BrainCircuit,
  Settings,
  Zap,
  Info,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
};

export default function TrainingChatPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const isAiEnabled = session?.user?.aiEnabled;
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch("/api/ai/train");
        if (res.ok) {
          const data = await res.json();
          setConversationId(data.conversationId);
          if (data.messages && data.messages.length > 0) {
            setMessages(
              data.messages.map((m: any) => ({
                id: m.id,
                sender: m.sender,
                text: m.text,
                timestamp: new Date(m.timestamp),
              }))
            );
          } else {
            setMessages([
              {
                id: "welcome",
                sender: "ai",
                text: "Hello! I'm your AI twin. This is a private sandbox where you can train me. Send me a message, and I'll respond as I've been calibrated. You can then approve or correct my responses to help me learn.",
                timestamp: new Date(),
              },
            ]);
          }
        }
      } catch (err) {
        console.error("Error loading training history:", err);
      } finally {
        setIsLoadingHistory(false);
      }
    }
    loadHistory();
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !conversationId) return;

    const userText = inputValue.trim();

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    const fetchAIResponse = async () => {
      try {
        const res = await fetch("/api/ai/train", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId, userMessage: userText }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to get AI response");
        }

        // Initialize empty AI message
        const aiMsgId = (Date.now() + 1).toString();
        const aiMsg: Message = {
          id: aiMsgId,
          sender: 'ai',
          text: "",
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, aiMsg]);
        setIsTyping(false); // Hide dots once we start getting text

        const reader = res.body?.getReader();
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
      } catch (err: any) {
        console.error("Error fetching AI response:", err);
        const errorMsg: Message = {
          id: Date.now().toString(),
          sender: 'ai',
          text: `System error: ${err.message || "Failed to get AI response"}`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMsg]);
        setIsTyping(false);
      }
    };

    fetchAIResponse();
  };

  const handleDeploy = async () => {
    try {
      const res = await fetch("/api/ai/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force: true }),
      });
      if (res.ok) {
        router.push("/society");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoadingHistory) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-zinc-950 font-sans">
        <div className="h-12 w-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Loading sandbox...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-zinc-950 font-sans overflow-hidden">
      
      {/* Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[30%] h-[30%] bg-violet-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-indigo-600/5 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="h-20 flex items-center justify-between px-8 bg-zinc-900/50 border-b border-zinc-800 shrink-0 relative z-10 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <Link href="/setup/deploy">
            <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-full text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all">
              <ChevronLeft size={20} />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-12 w-12 rounded-2xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-600/20">
                <Sparkles size={24} />
              </div>
              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-zinc-950 shadow-sm"></div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight leading-tight">AI Training Sandbox</h2>
              <div className="flex items-center gap-3">
                <Badge variant="ai" className="text-[10px] px-2 py-0.5 font-bold">Calibration Active</Badge>
                <div className="flex items-center gap-1.5 text-zinc-500">
                  <ShieldCheck size={12} className="text-emerald-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Private Mode</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {!isAiEnabled ? (
            <Button onClick={handleDeploy} className="shadow-xl shadow-violet-600/10 font-bold px-6">
              Enable Public AI
            </Button>
          ) : (
            <Link href="/society">
              <Button variant="outline" className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 font-bold px-6">
                Back to Society
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-8 space-y-8 relative z-0 scroll-smooth">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex justify-center py-4">
            <div className="px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-violet-500 rounded-full animate-pulse" />
              Sandbox Session Started
            </div>
          </div>

          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-3`}>
                  
                  {/* Message Bubble */}
                  <div className="flex flex-col gap-1.5">
                    <div 
                      className={cn(
                        "px-6 py-4 text-sm leading-relaxed",
                        msg.sender === 'user' 
                          ? 'bg-violet-600 text-white rounded-3xl rounded-br-none shadow-xl shadow-violet-600/10 font-medium' 
                          : 'bg-zinc-900/80 border border-zinc-800 text-zinc-200 rounded-3xl rounded-bl-none backdrop-blur-sm shadow-xl'
                      )}
                    >
                      {msg.sender === 'ai' && (
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-zinc-800/50">
                           <Sparkles size={12} className="text-violet-500" />
                           <span className="text-[10px] font-bold text-violet-500 uppercase tracking-widest">AI Profile</span>
                        </div>
                      )}
                      <p>{msg.text}</p>
                    </div>
                    
                    {/* Timestamp */}
                    <div className={cn(
                      "text-[9px] font-bold text-zinc-600 px-2 flex items-center gap-2",
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    )}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {msg.sender === 'user' && <Check size={10} className="text-emerald-500" />}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isTyping && (
             <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
             >
               <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl rounded-bl-none px-6 py-4 shadow-xl backdrop-blur-sm flex items-center gap-1.5 h-[52px]">
                 <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                 <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                 <div className="w-1.5 h-1.5 bg-violet-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
               </div>
             </motion.div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </main>

      {/* Input Area */}
      <footer className="p-8 bg-zinc-950 border-t border-zinc-900 relative z-10">
        <form 
          onSubmit={handleSendMessage}
          className="max-w-4xl mx-auto relative group"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Test a conversation with your AI twin..."
            className="w-full h-16 bg-zinc-900 border border-zinc-800 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 text-white rounded-2xl pl-6 pr-20 text-sm transition-all outline-none placeholder:text-zinc-600 shadow-2xl"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button 
              type="submit" 
              className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center transition-all",
                !inputValue.trim() || isTyping || !conversationId
                  ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                  : "bg-violet-600 text-white shadow-lg shadow-violet-600/20 hover:scale-105 active:scale-95"
              )}
              disabled={!inputValue.trim() || isTyping || !conversationId}
            >
              <Send size={18} className={cn("transition-transform", inputValue.trim() && "rotate-12 translate-x-0.5")} />
            </button>
          </div>
        </form>
        
        <div className="max-w-4xl mx-auto mt-4 px-2 flex items-center justify-between">
          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest flex items-center gap-2">
            <Info size={12} />
            Messages are saved to your profile for continuous learning
          </p>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-tighter">API Stable</span>
             </div>
             <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 bg-violet-600 rounded-full" />
                <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-tighter">Core Synced</span>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
