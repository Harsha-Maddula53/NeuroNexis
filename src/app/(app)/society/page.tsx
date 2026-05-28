'use client';

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { RightPanel } from "@/components/layout/RightPanel";
import { 
  Search, 
  Filter, 
  MapPin, 
  User as UserIcon, 
  Globe, 
  Users, 
  MessageSquare,
  Sparkles,
  SearchX,
  TrendingUp,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface AIIdentity {
  id: string;
  aiName: string;
  aiAge: number;
  aiGender: string;
  location: string | null;
  owner: {
    id: string;
    name: string;
    image?: string;
  };
}

export default function SocietyDiscoveryPage() {
  const [identities, setIdentities] = useState<AIIdentity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchIdentities() {
      try {
        const res = await fetch("/api/society");
        if (res.ok) {
          const data = await res.json();
          setIdentities(data);
        }
      } catch (error) {
        console.error("Error fetching identities:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchIdentities();
  }, []);

  const filteredIdentities = identities.filter(ai => 
    ai.aiName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ai.location ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ai.owner?.name ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function handleConnect(ownerId: string) {
    if (pendingRequests.includes(ownerId)) return;
    setPendingRequests(prev => [...prev, ownerId]);

    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: ownerId }),
      });
      if (res.ok) {
        toast.success("Connection request sent!");
      } else {
        const errText = await res.text();
        toast.error(errText || "Failed to send request");
      }
    } catch (error) {
      console.error("Error connecting:", error);
      toast.error("Error sending connection request");
    } finally {
      setPendingRequests(prev => prev.filter(id => id !== ownerId));
    }
  }

  return (
    <div className="flex h-full w-full bg-[var(--bg-primary)] font-sans">
      {/* Main Content */}
      <div className="flex-1 px-8 py-10 lg:pr-[400px] overflow-y-auto scrollbar-none">
        <header className="mb-12">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="ai" className="px-3">
              Marketplace
            </Badge>
          </div>
          <h1 className="text-4xl font-bold text-[var(--text-primary)] tracking-tight">Discover</h1>
          <p className="text-[var(--text-secondary)] mt-2 text-sm max-w-xl">
            Explore and connect with users or their AI representations. See how others have shaped their digital twins.
          </p>
        </header>

        {/* Search & Filters */}
        <div className="flex items-center gap-4 mb-10">
          <div className="relative flex-1 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] group-focus-within:text-indigo-300 transition-colors" size={18} />
            <Input 
              placeholder="Search users or AI..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12"
            />
          </div>
          <Button variant="outline" className="h-12 px-5 gap-2">
            <Filter size={18} />
            <span className="hidden sm:inline">Filters</span>
          </Button>
        </div>

        {/* AI Grid */}
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-80 rounded-xl bg-zinc-900/50 animate-pulse border border-zinc-800" />
              ))}
            </div>
          ) : filteredIdentities.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center glass-panel rounded-2xl border-dashed"
            >
              <div className="h-14 w-14 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-600 mb-6">
                <SearchX size={28} />
              </div>
              <h3 className="text-lg font-semibold text-zinc-300 mb-2">No users found</h3>
              <p className="text-zinc-500 text-sm">Try searching for something else or broaden your filters.</p>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {filteredIdentities.map((ai) => (
                <Card 
                  key={ai.id} 
                  hoverable 
                  className="group flex flex-col p-6 h-full relative"
                >
                  <div className="absolute top-4 right-4">
                    <Badge variant="success" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                      Online
                    </Badge>
                  </div>
                  
                  <div className="flex flex-col items-center flex-1 mt-4">
                    <div className="relative mb-6">
                    <div className="h-20 w-20 rounded-2xl bg-white/5 flex items-center justify-center text-[var(--text-primary)] font-semibold text-3xl shadow-card border border-white/10 group-hover:border-[rgba(255,255,255,0.15)] transition-all">
                        {ai.aiName.charAt(0)}
                      </div>
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-indigo-500 rounded-lg flex items-center justify-center border-2 border-[var(--bg-primary)]">
                        <Sparkles size={10} className="text-white" />
                      </div>
                    </div>
                    
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-bold text-white mb-1">
                        {ai.aiName.replace(/\(AI Representation.*?\)/i, '').trim()}
                      </h3>
                      <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
                        ID: {ai.id.slice(0, 8)}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 w-full mb-6">
                      <div className="p-3 rounded-lg bg-zinc-950/50 border border-zinc-800/50">
                         <p className="text-[10px] font-semibold text-zinc-500 uppercase mb-1">Location</p>
                         <p className="text-xs font-medium text-zinc-300 truncate">{ai.location || "Unknown"}</p>
                       </div>
                      <div className="p-3 rounded-lg bg-zinc-950/50 border border-zinc-800/50">
                         <p className="text-[10px] font-semibold text-zinc-500 uppercase mb-1">Years Active</p>
                         <p className="text-xs font-medium text-zinc-300">{ai.aiAge}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-950/80 border border-zinc-800/50 w-full mb-auto group-hover:border-zinc-700 transition-colors">
                      <UserIcon size={14} className="text-zinc-500" />
                      <div className="min-w-0">
                        <p className="text-[9px] font-bold text-zinc-600 uppercase">Owner</p>
                        <p className="text-xs font-medium text-zinc-400 truncate">{ai.owner?.name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <Button 
                      fullWidth
                      variant={pendingRequests.includes(ai.owner.id) ? "outline" : "primary"}
                      onClick={() => handleConnect(ai.owner.id)}
                      disabled={pendingRequests.includes(ai.owner.id)}
                      className="h-11"
                    >
                      {pendingRequests.includes(ai.owner.id) ? "Request Sent" : "Connect"}
                    </Button>
                  </div>
                </Card>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dynamic Right Panel */}
      <RightPanel title="Insights" className="border-zinc-900">
        <SocietyStats />
      </RightPanel>
    </div>
  );
}

function SocietyStats() {
  const [stats, setStats] = useState({ activeAIs: 0, totalMessages: 0 });

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const data = await res.json();
          setStats(data.networkStats);
        }
      } catch (error) {}
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-10">
      <div className="grid gap-4">
        <Card className="p-6 bg-zinc-900/30 border-zinc-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-300">
              <Users size={18} />
            </div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Active Users</span>
          </div>
          <p className="text-4xl font-bold text-white">{stats.activeAIs}</p>
          <div className="flex items-center gap-1.5 mt-2 text-emerald-500">
            <TrendingUp size={14} />
            <span className="text-[11px] font-medium">+12% growth</span>
          </div>
        </Card>
        
        <Card className="p-6 bg-zinc-900/30 border-zinc-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <MessageSquare size={18} />
            </div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Messages Sent</span>
          </div>
          <p className="text-4xl font-bold text-white">{stats.totalMessages.toLocaleString()}</p>
          <div className="flex items-center gap-1.5 mt-2 text-indigo-400">
            <Activity size={14} />
            <span className="text-[11px] font-medium">Real-time sync</span>
          </div>
        </Card>
      </div>

      <div className="p-6 rounded-xl bg-gradient-to-br from-indigo-600/10 to-indigo-600/10 border border-indigo-500/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Sparkles size={48} className="text-indigo-300" />
        </div>
        
        <div className="relative z-10">
          <h3 className="text-sm font-bold text-white mb-2">Network Status</h3>
          <p className="text-zinc-400 text-xs leading-relaxed mb-6">
            The network is currently expanding. All AI sync protocols are stable across all regions.
          </p>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase">
              <span>Optimization</span>
              <span className="text-indigo-200">75%</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "75%" }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.35)]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
