'use client';

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { 
  ArrowRight, 
  ChevronLeft,
  Lock,
  Mail,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password. Please try again.");
      setIsLoading(false);
    } else {
      try {
        const identityRes = await fetch("/api/ai/identity");
        if (identityRes.ok) {
          const identityData = await identityRes.json();
          if (identityData && identityData.id) {
            router.push("/dashboard");
          } else {
            router.push("/setup/identity");
          }
        } else {
          router.push("/setup/identity");
        }
      } catch {
        router.push("/dashboard");
      }
      router.refresh();
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] overflow-hidden p-6 font-sans">
      {/* Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-glow-radial" />
        <div className="absolute inset-0 bg-dot-grid opacity-[0.55]" />
        <div className="absolute inset-x-0 top-0 h-[320px] bg-[radial-gradient(800px_260px_at_50%_0%,rgba(99,102,241,0.18),transparent_65%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-8 left-8 z-20"
      >
        <Link href="/">
          <Button variant="ghost" className="gap-2 group">
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to home
          </Button>
        </Link>
      </motion.div>

      <div className="w-full max-w-md relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center mb-10"
        >
          <Logo size="lg" showText={false} className="mb-6" />
          <h1 className="text-3xl font-semibold text-[var(--text-primary)] tracking-[-0.03em]">Welcome back</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-2">Sign in to your NeuroNexis account</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-8 shadow-card border-white/10 bg-[rgba(255,255,255,0.04)] backdrop-blur-md">
            <form onSubmit={onSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 rounded-xl text-xs font-semibold text-red-300 bg-red-500/5 border border-red-500/20 flex items-center gap-3 mb-2"
                  >
                     <AlertCircle size={16} className="shrink-0" />
                     {error}
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-[0.08em] ml-1">Email address</label>
                  <div className="relative group">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] group-focus-within:text-indigo-300 transition-colors" />
                    <input 
                      name="email" 
                      type="email" 
                      placeholder="name@example.com" 
                      required 
                      disabled={isLoading}
                      className="w-full h-12 bg-[var(--bg-secondary)] border border-[rgba(255,255,255,0.10)] pl-11 pr-4 text-[15px] text-[var(--text-primary)] rounded-xl outline-none transition-all placeholder:text-[var(--text-tertiary)] focus:border-[rgba(99,102,241,0.60)] focus:ring-4 focus:ring-[rgba(99,102,241,0.12)]"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-[0.08em]">Password</label>
                    <Link href="#" className="text-[11px] font-medium text-indigo-300/80 hover:text-indigo-200 transition-colors">Forgot password?</Link>
                  </div>
                  <div className="relative group">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] group-focus-within:text-indigo-300 transition-colors" />
                    <input 
                      name="password" 
                      type="password" 
                      placeholder="••••••••"
                      required 
                      disabled={isLoading}
                      className="w-full h-12 bg-[var(--bg-secondary)] border border-[rgba(255,255,255,0.10)] pl-11 pr-4 text-[15px] text-[var(--text-primary)] rounded-xl outline-none transition-all placeholder:text-[var(--text-tertiary)] focus:border-[rgba(99,102,241,0.60)] focus:ring-4 focus:ring-[rgba(99,102,241,0.12)]"
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                fullWidth
                disabled={isLoading}
                className="h-12 text-sm font-semibold shadow-glow group"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Sign In</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-xs font-medium text-[var(--text-secondary)]">
                New to NeuroNexis?{" "}
                <Link href="/register" className="text-indigo-300 hover:text-indigo-200 font-semibold ml-1">
                  Create an account
                </Link>
              </p>
            </div>
          </Card>
        </motion.div>

        <div className="mt-10 flex items-center justify-center gap-6">
           <div className="flex items-center gap-2">
             <ShieldCheck size={14} className="text-[var(--text-tertiary)]" />
             <span className="text-[10px] font-medium text-[var(--text-tertiary)] tracking-[0.08em] uppercase">Secure login</span>
           </div>
           <div className="h-1 w-1 bg-white/10 rounded-full" />
           <div className="flex items-center gap-2">
             <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
             <span className="text-[10px] font-medium text-[var(--text-tertiary)] tracking-[0.08em] uppercase">Server online</span>
           </div>
        </div>
      </div>
    </div>
  );
}
