'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { 
  Rocket, 
  Brain, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Globe, 
  MessageSquare, 
  LayoutDashboard,
  Terminal,
  Cpu,
  Fingerprint,
  Radio,
  Sparkles,
  Check,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DeployChoicePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  async function onDeploy() {
    setIsLoading('deploy');
    try {
      const res = await fetch("/api/ai/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force: true }),
      });

      if (res.ok) {
        router.push("/society");
      } else {
        console.error("Failed to deploy AI");
      }
    } catch (err) {
      console.error("Error deploying AI:", err);
    } finally {
      setIsLoading(null);
    }
  }

  function onTrain() {
    setIsLoading('train');
    router.push("/training");
  }

  const steps = [
    { id: 1, label: "Identity", active: false, completed: true },
    { id: 2, label: "Behavior", active: false, completed: true },
    { id: 3, label: "Deploy", active: true, completed: false },
  ];

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] overflow-hidden p-6 py-20 font-sans">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-glow-radial" />
        <div className="absolute inset-0 bg-dot-grid opacity-[0.55]" />
      </div>

      <div className="w-full max-w-5xl relative z-10">
        
        {/* Progress Tracker */}
        <div className="mb-20 flex justify-between items-center px-4 relative max-w-md mx-auto">
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-10">
            <div className="h-16 w-16 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-glow text-white">
              <Sparkles size={32} />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-[var(--text-primary)] mb-6 tracking-tight">
            Ready to <span className="text-indigo-300">launch.</span>
          </h1>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed font-medium">
            Your AI profile is now ready to represent you in NeuroNexis. Choose how you want to start.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Deploy Option */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-8 h-full flex flex-col group transition-all duration-500">
              <div className="h-14 w-14 bg-indigo-500 rounded-xl flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform shadow-glow">
                <Rocket size={28} />
              </div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">Launch to Market</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-10 leading-relaxed flex-grow">
                Make your AI public in the Society discovery marketplace. It will start interacting and learning from the community immediately.
              </p>
              <Button 
                onClick={onDeploy}
                disabled={isLoading !== null}
                fullWidth
                className="h-14 font-semibold text-base shadow-glow group"
              >
                {isLoading === 'deploy' ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Launching...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Go Live Now</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
            </Card>
          </motion.div>

          {/* Train Option */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-8 h-full flex flex-col group transition-all duration-500">
              <div className="h-14 w-14 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-[var(--text-tertiary)] mb-8 group-hover:scale-110 transition-transform group-hover:text-[var(--text-primary)]">
                <Target size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Personal Training</h3>
              <p className="text-sm text-zinc-500 mb-10 leading-relaxed flex-grow">
                Enter an interactive sandbox to test and refine your AI&apos;s response patterns in a private environment before going public.
              </p>
              <Button 
                variant="outline"
                onClick={onTrain}
                disabled={isLoading !== null}
                fullWidth
                className="h-14 font-bold text-base border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 group"
              >
                {isLoading === 'train' ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-zinc-400 border-t-zinc-100 rounded-full animate-spin" />
                    <span>Preparing...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Start Training</span>
                    <MessageSquare size={18} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
            </Card>
          </motion.div>

        </div>

        {/* Skip to Dashboard Option */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 flex justify-center"
        >
          <button 
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 hover:text-zinc-400 uppercase tracking-[0.2em] transition-colors p-4 group"
          >
            <LayoutDashboard size={14} className="group-hover:rotate-12 transition-transform" />
            <span>Skip to Dashboard</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
