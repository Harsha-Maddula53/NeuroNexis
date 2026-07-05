'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { 
  BrainCircuit, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Settings,
  Activity,
  Cpu,
  BarChart3,
  Dna,
  Terminal,
  ChevronRight,
  MessageSquare,
  Heart,
  Briefcase,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function BehaviorSetupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/ai/behavior", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push("/setup/deploy");
      } else {
        console.error("Failed to save behavior");
      }
    } catch (err) {
      console.error("Error saving behavior:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const steps = [
    { id: 1, label: "Identity", active: false, completed: true },
    { id: 2, label: "Behavior", active: true, completed: false },
    { id: 3, label: "Deploy", active: false, completed: false },
  ];

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] overflow-hidden p-6 py-20 font-sans">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-glow-radial" />
        <div className="absolute inset-0 bg-dot-grid opacity-[0.55]" />
      </div>

      <div className="w-full max-w-3xl relative z-10">
        
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
           initial={{ opacity: 0, scale: 0.98 }}
           animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="p-8 md:p-10 bg-[rgba(255,255,255,0.04)] border-white/10 shadow-card relative overflow-hidden backdrop-blur-md">
             <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/30" />
             
             <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                   <Badge variant="ai" className="mb-3">Step 2 of 3</Badge>
                   <h1 className="text-3xl font-semibold text-[var(--text-primary)] tracking-tight">Personality & Behavior</h1>
                   <p className="text-[var(--text-secondary)] text-sm mt-1">Calibrate how your AI responds and interacts.</p>
                </div>
             </header>

             <form onSubmit={onSubmit} className="space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Profession</label>
                   <Input 
                    name="profession" 
                    placeholder="e.g. Software Engineer" 
                    required 
                    className="h-12 bg-zinc-950 border-zinc-800"
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Languages</label>
                   <Input 
                    name="languages" 
                    placeholder="e.g. English, Spanish" 
                    required 
                    className="h-12 bg-zinc-950 border-zinc-800"
                   />
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Communication Tone</label>
                    <div className="relative group">
                     <select name="tone" className="w-full h-12 bg-[var(--bg-secondary)] border border-white/10 p-3 px-4 text-[var(--text-primary)] text-sm rounded-xl focus:ring-4 focus:ring-[rgba(99,102,241,0.12)] focus:border-[rgba(99,102,241,0.60)] outline-none transition-all appearance-none" defaultValue="" required>
                       <option value="" disabled>Select tone</option>
                       <option value="Casual">Casual & Relaxed</option>
                       <option value="Formal">Formal & Analytical</option>
                       <option value="Professional">Professional & Direct</option>
                       <option value="Friendly">Friendly & Warm</option>
                     </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                        <ChevronRight size={16} className="rotate-90" />
                    </div>
                   </div>
                 </div>
                 <div className="space-y-2">
                   <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Sense of Humor</label>
                    <div className="relative group">
                     <select name="humorLevel" className="w-full h-12 bg-[var(--bg-secondary)] border border-white/10 p-3 px-4 text-[var(--text-primary)] text-sm rounded-xl focus:ring-4 focus:ring-[rgba(99,102,241,0.12)] focus:border-[rgba(99,102,241,0.60)] outline-none transition-all appearance-none" defaultValue="" required>
                       <option value="" disabled>Select level</option>
                       <option value="None">None / Serious</option>
                       <option value="Light">Subtle / Sarcastic</option>
                       <option value="Moderate">Balanced / Wittty</option>
                      <option value="Frequent">High / Playful</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                        <ChevronRight size={16} className="rotate-90" />
                    </div>
                   </div>
                 </div>
               </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Response Length</label>
                    <div className="relative group">
                     <select name="responseLength" className="w-full h-12 bg-[var(--bg-secondary)] border border-white/10 p-3 px-4 text-[var(--text-primary)] text-sm rounded-xl focus:ring-4 focus:ring-[rgba(99,102,241,0.12)] focus:border-[rgba(99,102,241,0.60)] outline-none transition-all appearance-none" defaultValue="" required>
                       <option value="" disabled>Select length</option>
                       <option value="Short">Concise & Brief</option>
                       <option value="Medium">Standard & Balanced</option>
                       <option value="Detailed">Expansive & Detailed</option>
                     </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                        <ChevronRight size={16} className="rotate-90" />
                    </div>
                   </div>
                 </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Emotional Intelligence</label>
                    <div className="relative group">
                     <select name="emotionalSensitivity" className="w-full h-12 bg-[var(--bg-secondary)] border border-white/10 p-3 px-4 text-[var(--text-primary)] text-sm rounded-xl focus:ring-4 focus:ring-[rgba(99,102,241,0.12)] focus:border-[rgba(99,102,241,0.60)] outline-none transition-all appearance-none" defaultValue="" required>
                       <option value="" disabled>Select sensitivity</option>
                       <option value="Low">Low / Purely Logical</option>
                       <option value="Medium">Medium / Balanced</option>
                       <option value="High">High / Resonant</option>
                     </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                        <ChevronRight size={16} className="rotate-90" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Disagreement Style</label>
                    <div className="relative group">
                     <select name="disagreementStyle" className="w-full h-12 bg-[var(--bg-secondary)] border border-white/10 p-3 px-4 text-[var(--text-primary)] text-sm rounded-xl focus:ring-4 focus:ring-[rgba(99,102,241,0.12)] focus:border-[rgba(99,102,241,0.60)] outline-none transition-all appearance-none" defaultValue="" required>
                       <option value="" disabled>Select style</option>
                       <option value="Diplomatic">Diplomatic</option>
                       <option value="Assertive">Assertive</option>
                       <option value="Avoidant">Avoidant</option>
                     </select>
                     <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                         <ChevronRight size={16} className="rotate-90" />
                     </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Identity Transparency</label>
                    <div className="relative group">
                     <select name="identityTransparency" className="w-full h-12 bg-[var(--bg-secondary)] border border-white/10 p-3 px-4 text-[var(--text-primary)] text-sm rounded-xl focus:ring-4 focus:ring-[rgba(99,102,241,0.12)] focus:border-[rgba(99,102,241,0.60)] outline-none transition-all appearance-none" defaultValue="" required>
                       <option value="" disabled>Select level</option>
                       <option value="Always">Always disclose</option>
                       <option value="Often">Often disclose</option>
                       <option value="Rarely">Rarely disclose</option>
                       <option value="Never">Never disclose</option>
                     </select>
                     <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                         <ChevronRight size={16} className="rotate-90" />
                     </div>
                    </div>
                  </div>
                </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Personal Ambition</label>
                   <Input 
                    name="ambition" 
                    placeholder="e.g. Constant Growth" 
                    required 
                    className="h-12 bg-zinc-950 border-zinc-800"
                   />
                 </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Relationship Status</label>
                    <div className="relative group">
                     <select name="maritalStatus" className="w-full h-12 bg-[var(--bg-secondary)] border border-white/10 p-3 px-4 text-[var(--text-primary)] text-sm rounded-xl focus:ring-4 focus:ring-[rgba(99,102,241,0.12)] focus:border-[rgba(99,102,241,0.60)] outline-none transition-all appearance-none" defaultValue="" required>
                       <option value="" disabled>Select status</option>
                       <option value="Single">Single</option>
                       <option value="In a relationship">In a relationship</option>
                       <option value="Married">Married</option>
                      <option value="It&apos;s complicated">It&apos;s complicated</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                        <ChevronRight size={16} className="rotate-90" />
                    </div>
                   </div>
                 </div>
               </div>

               <div className="p-6 rounded-xl bg-indigo-500/5 border border-indigo-500/15 flex gap-4">
                 <div className="p-2 h-fit bg-indigo-500/10 rounded-lg text-indigo-300">
                    <BrainCircuit size={18} />
                 </div>
                 <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                    These calibration settings will seed your AI&apos;s initial interaction patterns. You can fine-tune these via feedback loops later.
                 </p>
               </div>

               <Button 
                 type="submit" 
                 fullWidth
                 disabled={isLoading}
                className="h-14 font-semibold rounded-2xl shadow-glow group mt-4 font-sans"
               >
                 <div className="flex items-center justify-center gap-2 relative z-10">
                   {isLoading ? (
                     <>
                        <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Calibrating...</span>
                     </>
                   ) : (
                     <>
                       <span>Finalize Behavior</span>
                       <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                     </>
                   )}
                 </div>
               </Button>
             </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
