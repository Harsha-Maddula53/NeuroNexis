'use client';

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { 
  Zap, 
  Brain, 
  ShieldCheck, 
  Settings2, 
  Activity, 
  Cpu,
  Lock,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function BehaviorEditorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/user/behavior");
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (error) {
        console.error("Error fetching behavior profile:", error);
      } finally {
        setIsFetching(false);
      }
    }
    fetchProfile();
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/user/behavior", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        // Success feedback handled by parent or toast
        console.log("Profile updated successfully");
      } else {
        console.error("Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating behavior profile:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isFetching) return (
    <div className="flex items-center justify-center h-full bg-[var(--bg-primary)] font-sans">
      <div className="text-[11px] text-[var(--text-tertiary)] uppercase tracking-[0.08em] animate-pulse">Syncing neural parameters...</div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto w-full bg-[var(--bg-primary)] font-sans scrollbar-hide">
      <div className="mx-auto max-w-[1200px] p-6 md:p-10 pb-32">
        
        <header className="mb-16 border-b border-white/10 pb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 mb-4"
          >
            <Brain size={14} className="text-indigo-300" />
            <span className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-[0.08em]">AI Settings</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[44px] md:text-[56px] font-bold text-[var(--text-primary)] tracking-[-0.03em] leading-[1.02]"
          >
            Behavior Model
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[var(--text-secondary)] mt-4 text-sm leading-relaxed max-w-2xl"
          >
            Configure your AI's personality, conversational style, and personal information.
          </motion.p>
        </header>

        <form onSubmit={onSubmit} className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Main Configuration Bento */}
            <div className="md:col-span-2 space-y-12">
              <section className="bg-[var(--card-bg)] border border-white/10 p-8 rounded-2xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-10">
                   <div className="flex items-center gap-3">
                     <span className="text-[11px] font-medium text-indigo-200 border border-indigo-500/30 px-3 py-1 rounded-full">01</span>
                     <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-[0.08em]">Core Identity</h2>
                   </div>
                </div>
                
                <div className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-[0.08em]">Profession</label>
                      <input 
                        name="profession" 
                        defaultValue={profile?.profession || ""} 
                        placeholder="E.g. Software Engineer, Student..."
                        className="w-full bg-[var(--bg-secondary)] border border-white/10 p-4 text-[var(--text-primary)] text-[15px] focus:border-[rgba(99,102,241,0.60)] focus:ring-4 focus:ring-[rgba(99,102,241,0.12)] outline-none transition-all rounded-xl placeholder:text-[var(--text-tertiary)]"
                        required 
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-[0.08em]">Languages</label>
                      <input 
                        name="languages" 
                        defaultValue={profile?.languages || ""} 
                        placeholder="E.g. English, Spanish..."
                        className="w-full bg-[var(--bg-secondary)] border border-white/10 p-4 text-[var(--text-primary)] text-[15px] focus:border-[rgba(99,102,241,0.60)] focus:ring-4 focus:ring-[rgba(99,102,241,0.12)] outline-none transition-all rounded-xl placeholder:text-[var(--text-tertiary)]"
                        required 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Conversation Tone</label>
                      <div className="relative">
                        <select name="tone" className="w-full bg-[var(--bg-secondary)] border border-white/10 p-4 text-[var(--text-primary)] text-[15px] focus:border-[rgba(99,102,241,0.60)] focus:ring-4 focus:ring-[rgba(99,102,241,0.12)] outline-none transition-all rounded-xl appearance-none" defaultValue={profile?.tone || "Professional"}>
                          <option value="Casual">Casual and Relaxed</option>
                          <option value="Formal">Formal and Polished</option>
                          <option value="Professional">Professional and Direct</option>
                          <option value="Friendly">Friendly and Enthusiastic</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-700">▼</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Emotional Sensitivity</label>
                      <div className="relative">
                        <select name="emotionalSensitivity" className="w-full bg-[var(--bg-secondary)] border border-white/10 p-4 text-[var(--text-primary)] text-[15px] focus:border-[rgba(99,102,241,0.60)] focus:ring-4 focus:ring-[rgba(99,102,241,0.12)] outline-none transition-all rounded-xl appearance-none" defaultValue={profile?.emotionalSensitivity || "Medium"}>
                          <option value="Low">Low Sensitivity</option>
                          <option value="Medium">Medium Sensitivity</option>
                          <option value="High">High Sensitivity</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-700">▼</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-zinc-900 border-2 border-zinc-800 p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center justify-between mb-10">
                   <div className="flex items-center gap-3">
                     <span className="text-[10px] font-mono font-black text-blue-500 border border-blue-500/30 px-2 py-0.5">02</span>
                     <h2 className="text-sm font-mono font-black text-zinc-100 uppercase tracking-widest">Beliefs & Opinions</h2>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">How to handle disagreements</label>
                    <div className="relative">
                      <select name="disagreementStyle" className="w-full bg-zinc-950 border-2 border-zinc-800 p-4 text-zinc-100 font-mono text-xs focus:border-blue-500/50 outline-none transition-all rounded-none appearance-none" defaultValue={profile?.disagreementStyle || "Diplomatic"}>
                        <option value="Assertive">Assertive (Direct)</option>
                        <option value="Diplomatic">Diplomatic (Polite)</option>
                        <option value="Avoidant">Avoidant (Agreeable)</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-700">▼</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">AI Identity Disclosure</label>
                    <div className="relative">
                      <select name="identityTransparency" className="w-full bg-zinc-950 border-2 border-zinc-800 p-4 text-zinc-100 font-mono text-xs focus:border-blue-500/50 outline-none transition-all rounded-none appearance-none" defaultValue={profile?.identityTransparency || "Often"}>
                        <option value="Always">Always mention being an AI</option>
                        <option value="Often">Often mention being an AI</option>
                        <option value="Rarely">Rarely mention being an AI</option>
                        <option value="Never">Never mention being an AI</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-700">▼</div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Side Actions Bento */}
            <div className="space-y-8">
              <div className="bg-zinc-900 border-2 border-zinc-800 p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-3 mb-8">
                  <Activity size={16} className="text-zinc-500" />
                  <h3 className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-widest">System Status</h3>
                </div>
                <div className="space-y-4">
                   {[
                     { label: "Memory Sync", value: "94.2%", status: "OK" },
                     { label: "Latency", value: "142ms", status: "Stable" },
                     { label: "Persona Stability", value: "99.8%", status: "Safe" }
                   ].map((stat, i) => (
                     <div key={i} className="flex justify-between items-center bg-zinc-950 border border-zinc-800 p-4">
                        <span className="text-[9px] font-mono text-zinc-600 uppercase font-black">{stat.label}</span>
                        <div className="text-right">
                          <p className="text-[10px] font-mono text-zinc-100 font-black leading-none mb-1">{stat.value}</p>
                          <p className={cn("text-[7px] font-mono font-black uppercase tracking-widest", stat.status === 'OK' ? 'text-green-500' : 'text-blue-500')}>{stat.status}</p>
                        </div>
                     </div>
                   ))}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className={cn(
                  "w-full h-20 border-2 font-mono font-black text-xs uppercase tracking-widest transition-all relative overflow-hidden group",
                  isLoading 
                    ? "bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed" 
                    : "bg-indigo-500 border-indigo-400 text-white shadow-glow active:translate-y-[1px] hover:bg-indigo-600"
                )}
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                   {isLoading ? (
                     <>
                       <div className="h-2 w-2 bg-zinc-500 rounded-full animate-ping" />
                       Saving Profile...
                     </>
                   ) : (
                     <>
                       <Cpu size={16} />
                       Save AI Profile
                     </>
                   )}
                </div>
              </button>

              <div className="bg-zinc-900/50 border-2 border-dashed border-zinc-800 p-6">
                <div className="flex items-center gap-3 mb-4 text-zinc-600">
                  <Lock size={12} />
                   <span className="text-[8px] font-mono font-black uppercase tracking-widest">Security Note</span>
                </div>
                <p className="text-[8px] font-mono text-zinc-700 leading-relaxed uppercase">
                  All behavioral updates are securely saved and synced across the network in real-time. Your personal settings are protected.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Extension Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12">
             <section className="bg-zinc-900 border-2 border-zinc-800 p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-3 mb-10">
                   <span className="text-[10px] font-mono font-black text-green-500 border border-green-500/30 px-2 py-0.5">03</span>
                   <h2 className="text-sm font-mono font-black text-zinc-100 uppercase tracking-widest">Conversation Style</h2>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Humor Level</label>
                    <select name="humorLevel" className="w-full bg-zinc-950 border-2 border-zinc-800 p-4 text-zinc-100 font-mono text-xs focus:border-green-500/50 outline-none transition-all rounded-none appearance-none" defaultValue={profile?.humorLevel || "Moderate"}>
                      <option value="None">No Humor</option>
                      <option value="Light">Light Humor</option>
                      <option value="Moderate">Moderate Humor</option>
                      <option value="Frequent">Very Humorous</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Response Length</label>
                    <select name="responseLength" className="w-full bg-zinc-950 border-2 border-zinc-800 p-4 text-zinc-100 font-mono text-xs focus:border-green-500/50 outline-none transition-all rounded-none appearance-none" defaultValue={profile?.responseLength || "Medium"}>
                      <option value="Short">Short</option>
                      <option value="Medium">Medium</option>
                      <option value="Detailed">Long and Detailed</option>
                    </select>
                  </div>
                </div>
             </section>

             <section className="bg-zinc-900 border-2 border-zinc-800 p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-3 mb-10">
                   <span className="text-[10px] font-mono font-black text-orange-500 border border-orange-500/30 px-2 py-0.5">04</span>
                   <h2 className="text-sm font-mono font-black text-zinc-100 uppercase tracking-widest">Personal Information</h2>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Marital Status</label>
                  <select name="maritalStatus" className="w-full bg-zinc-950 border-2 border-zinc-800 p-4 text-zinc-100 font-mono text-xs focus:border-orange-500/50 outline-none transition-all rounded-none appearance-none" defaultValue={profile?.maritalStatus || "Single"}>
                    <option value="Single">Single</option>
                    <option value="In a relationship">In a Relationship</option>
                    <option value="Married">Married</option>
                    <option value="It's complicated">It's complicated</option>
                  </select>
                </div>
             </section>
          </div>
        </form>
      </div>
    </div>
  );
}
