'use client';

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { 
  ArrowRight, 
  ChevronLeft,
  User,
  Mail,
  Lock,
  Calendar,
  Users,
  ShieldCheck,
  AlertCircle,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const email = data.email as string;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match. Please try again.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const signInResponse = await signIn("credentials", {
          email,
          password: data.password as string,
          redirect: false,
        });

        if (signInResponse?.error) {
          setError("Account created, but sign in failed. Please login manually.");
          router.push("/login");
        } else {
          router.push("/setup/identity");
          router.refresh();
        }
      } else {
        const message = await response.text();
        setError(message || "An error occurred during registration. Please try again.");
      }
    } catch (err) {
      setError("Critical system error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] overflow-hidden p-6 font-sans py-20">
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

      <div className="w-full max-w-2xl relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center mb-10"
        >
          <Logo size="lg" showText={false} className="mb-6" />
          <h1 className="text-3xl font-semibold text-[var(--text-primary)] tracking-[-0.03em]">Create your account</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-2">Join thousands of others in NeuroNexis</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-8 md:p-10 shadow-card border-white/10 bg-[rgba(255,255,255,0.04)] backdrop-blur-md">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-[0.08em] ml-1">First name</label>
                  <div className="relative group">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] group-focus-within:text-indigo-300 transition-colors" />
                    <input 
                      name="firstName" 
                      placeholder="Jane" 
                      required 
                      disabled={isLoading}
                      className="w-full h-12 bg-[var(--bg-secondary)] border border-[rgba(255,255,255,0.10)] pl-11 pr-4 text-[15px] text-[var(--text-primary)] rounded-xl outline-none transition-all placeholder:text-[var(--text-tertiary)] focus:border-[rgba(99,102,241,0.60)] focus:ring-4 focus:ring-[rgba(99,102,241,0.12)]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-[0.08em] ml-1">Last name</label>
                  <div className="relative group">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] group-focus-within:text-indigo-300 transition-colors" />
                    <input 
                      name="lastName" 
                      placeholder="Doe" 
                      required 
                      disabled={isLoading}
                      className="w-full h-12 bg-[var(--bg-secondary)] border border-[rgba(255,255,255,0.10)] pl-11 pr-4 text-[15px] text-[var(--text-primary)] rounded-xl outline-none transition-all placeholder:text-[var(--text-tertiary)] focus:border-[rgba(99,102,241,0.60)] focus:ring-4 focus:ring-[rgba(99,102,241,0.12)]"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-[0.08em] ml-1">Email address</label>
                <div className="relative group">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] group-focus-within:text-indigo-300 transition-colors" />
                  <input 
                    name="email" 
                    type="email" 
                    placeholder="jane@example.com" 
                    required 
                    disabled={isLoading}
                    className="w-full h-12 bg-[var(--bg-secondary)] border border-[rgba(255,255,255,0.10)] pl-11 pr-4 text-[15px] text-[var(--text-primary)] rounded-xl outline-none transition-all placeholder:text-[var(--text-tertiary)] focus:border-[rgba(99,102,241,0.60)] focus:ring-4 focus:ring-[rgba(99,102,241,0.12)]"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-[0.08em] ml-1">Password</label>
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
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-[0.08em] ml-1">Confirm password</label>
                  <div className="relative group">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] group-focus-within:text-indigo-300 transition-colors" />
                    <input 
                      name="confirmPassword" 
                      type="password" 
                      placeholder="••••••••" 
                      required 
                      disabled={isLoading}
                      className="w-full h-12 bg-[var(--bg-secondary)] border border-[rgba(255,255,255,0.10)] pl-11 pr-4 text-[15px] text-[var(--text-primary)] rounded-xl outline-none transition-all placeholder:text-[var(--text-tertiary)] focus:border-[rgba(99,102,241,0.60)] focus:ring-4 focus:ring-[rgba(99,102,241,0.12)]"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-[0.08em] ml-1">Date of birth</label>
                  <div className="relative group">
                    <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] group-focus-within:text-indigo-300 transition-colors" />
                    <input 
                      name="dob" 
                      type="date" 
                      required 
                      disabled={isLoading}
                      className="w-full h-12 bg-[var(--bg-secondary)] border border-[rgba(255,255,255,0.10)] pl-11 pr-4 text-[15px] text-[var(--text-primary)] rounded-xl outline-none transition-all [color-scheme:dark] focus:border-[rgba(99,102,241,0.60)] focus:ring-4 focus:ring-[rgba(99,102,241,0.12)]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-[0.08em] ml-1">Gender</label>
                  <div className="relative group">
                    <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] group-focus-within:text-indigo-300 transition-colors" />
                    <select 
                      name="gender" 
                      className="w-full h-12 bg-[var(--bg-secondary)] border border-[rgba(255,255,255,0.10)] pl-11 pr-10 text-[15px] text-[var(--text-primary)] rounded-xl outline-none transition-all appearance-none focus:border-[rgba(99,102,241,0.60)] focus:ring-4 focus:ring-[rgba(99,102,241,0.12)]" 
                      defaultValue=""
                      required
                      disabled={isLoading}
                    >
                      <option value="" disabled>Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-tertiary)]">
                       <ChevronLeft size={16} className="-rotate-90" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-white/10 flex items-start gap-3">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    name="terms" 
                    className="peer h-5 w-5 bg-[rgba(255,255,255,0.04)] border border-white/10 rounded-md checked:bg-indigo-500 checked:border-indigo-500 outline-none transition-all appearance-none cursor-pointer" 
                    required 
                    disabled={isLoading}
                  />
                  <Check size={14} className="absolute text-white scale-0 peer-checked:scale-100 transition-transform pointer-events-none" />
                </div>
                <label htmlFor="terms" className="text-[12px] text-[var(--text-secondary)] font-medium leading-relaxed">
                  I agree to the <span className="text-indigo-300 hover:text-indigo-200 hover:underline cursor-pointer">Terms of Service</span> and <span className="text-indigo-300 hover:text-indigo-200 hover:underline cursor-pointer">Privacy Policy</span>. I confirm that I am at least 18 years of age.
                </label>
              </div>

              <Button 
                type="submit" 
                fullWidth
                disabled={isLoading}
                className="h-14 text-base font-semibold shadow-glow group mt-4"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Initializing...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Create Account</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-xs font-medium text-[var(--text-secondary)]">
                Already have an account?{" "}
                <Link href="/login" className="text-indigo-300 hover:text-indigo-200 font-semibold ml-1">
                  Sign in
                </Link>
              </p>
            </div>
          </Card>
        </motion.div>

        <div className="mt-10 flex items-center justify-center gap-6">
           <div className="flex items-center gap-2">
             <ShieldCheck size={14} className="text-[var(--text-tertiary)]" />
             <span className="text-[10px] font-medium text-[var(--text-tertiary)] tracking-[0.08em] uppercase">Encryption active</span>
           </div>
           <div className="h-1 w-1 bg-white/10 rounded-full" />
           <div className="flex items-center gap-2">
             <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
             <span className="text-[10px] font-medium text-[var(--text-tertiary)] tracking-[0.08em] uppercase">Safe & secure</span>
           </div>
        </div>
      </div>
    </div>
  );
}
