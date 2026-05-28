'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { 
  Dna, 
  User, 
  Globe, 
  Lock, 
  ChevronRight, 
  Fingerprint,
  Cpu,
  Zap,
  Activity,
  Phone,
  Shield,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function IdentitySetupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/ai/identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push("/setup/behavior");
      } else {
        console.error("Failed to save identity");
      }
    } catch (err) {
      console.error("Error saving identity:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const steps = [
    { id: 1, label: "Identity", active: true, completed: false },
    { id: 2, label: "Behavior", active: false, completed: false },
    { id: 3, label: "Deploy", active: false, completed: false },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] p-6 font-sans relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-glow-radial" />
        <div className="absolute inset-0 bg-dot-grid opacity-[0.55]" />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        
        {/* Progress Tracker */}
        <div className="mb-12 flex justify-between items-center px-4 relative max-w-md mx-auto">
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/10 -z-10" />
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center gap-3 bg-[var(--bg-primary)] px-2 rounded-full">
              <div className={cn(
                "h-8 w-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-300",
                step.active 
                  ? "bg-indigo-500 border-indigo-400 text-white shadow-glow scale-110" 
                  : step.completed 
                    ? "bg-emerald-500 border-emerald-400 text-white" 
                    : "bg-white/5 border-white/10 text-[var(--text-tertiary)]"
              )}>
                {step.completed ? <Check size={14} /> : step.id}
              </div>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-widest",
                step.active ? "text-indigo-200" : "text-[var(--text-tertiary)]"
              )}>{step.label}</span>
            </div>
          ))}
        </div>

        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-8 md:p-10 bg-[rgba(255,255,255,0.04)] border-white/10 shadow-card overflow-hidden relative backdrop-blur-md">
            <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/30" />
            
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <Badge variant="ai" className="mb-3">Step 1 of 3</Badge>
                <h1 className="text-3xl font-semibold text-[var(--text-primary)] tracking-tight">AI Identity</h1>
                <p className="text-[var(--text-secondary)] text-sm mt-2">Define how your AI representation appears to others.</p>
              </div>
            </header>

            <form onSubmit={onSubmit} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">AI Name</label>
                   <Input 
                    name="aiName" 
                    placeholder="e.g. My Digital Twin" 
                    required 
                    className="h-12 bg-zinc-950 border-zinc-800"
                  />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">AI Age</label>
                   <Input 
                    name="aiAge" 
                    type="number" 
                    min="18"
                    placeholder="25"
                    required 
                    className="h-12 bg-zinc-950 border-zinc-800"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Gender</label>
                   <div className="relative group">
                     <select 
                       name="aiGender" 
                      className="w-full h-12 bg-[var(--bg-secondary)] border border-white/10 p-3 px-4 text-[var(--text-primary)] text-sm rounded-xl focus:ring-4 focus:ring-[rgba(99,102,241,0.12)] focus:border-[rgba(99,102,241,0.60)] outline-none transition-all appearance-none" 
                       defaultValue=""
                       required
                     >
                       <option value="" disabled>Select gender</option>
                       <option value="male">Male</option>
                       <option value="female">Female</option>
                       <option value="non-binary">Non-binary</option>
                       <option value="fluid">Fluid</option>
                     </select>
                     <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                        <ChevronRight size={16} className="rotate-90" />
                     </div>
                   </div>
                </div>
                
                <div className="space-y-2">
                   <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Privacy</label>
                   <div className="relative group">
                    <select 
                      name="isPublic" 
                      className="w-full h-12 bg-[var(--bg-secondary)] border border-white/10 p-3 px-4 text-[var(--text-primary)] text-sm rounded-xl focus:ring-4 focus:ring-[rgba(99,102,241,0.12)] focus:border-[rgba(99,102,241,0.60)] outline-none transition-all appearance-none" 
                      required
                    >
                      <option value="true">Public / Discoverable</option>
                      <option value="false">Private / Invite Only</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                        <ChevronRight size={16} className="rotate-90" />
                    </div>
                   </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Location</label>
                   <Input 
                    name="location" 
                    placeholder="New York, NY" 
                    className="h-12 bg-zinc-950 border-zinc-800"
                  />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Phone Number</label>
                    <Input 
                      name="phoneNumber" 
                      type="tel" 
                      placeholder="+1 (555) 000-0000" 
                      className="h-12 bg-zinc-950 border-zinc-800"
                    />
                 </div>
              </div>

              <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/15 flex gap-4">
                <div className="p-2 h-fit bg-indigo-500/10 rounded-lg text-indigo-300">
                  <Shield size={18} />
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                  Your AI identity forms your main profile in the social marketplace. You can always refine these details later in your dashboard.
                </p>
              </div>

              <Button 
                type="submit" 
                fullWidth
                disabled={isLoading}
                className="h-14 font-semibold rounded-2xl shadow-glow group mt-4 font-sans"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Continue to Behavior</span>
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
