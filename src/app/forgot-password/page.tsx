"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Logo } from "@/components/brand/Logo";
import {
  ArrowRight,
  ChevronLeft,
  Mail,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setDevResetUrl(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setSubmitted(true);
      if (data.devResetUrl) {
        setDevResetUrl(data.devResetUrl);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] overflow-hidden p-6 font-sans">
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
        <Link href="/login">
          <Button variant="ghost" className="gap-2 group">
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to login
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
          <h1 className="text-3xl font-semibold text-[var(--text-primary)] tracking-[-0.03em]">
            Forgot password?
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-2 text-center max-w-xs">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-8 shadow-card border-white/10 bg-[rgba(255,255,255,0.04)] backdrop-blur-md">
            {submitted ? (
              <div className="space-y-6 text-center">
                <div className="flex justify-center">
                  <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 size={24} className="text-emerald-400" />
                  </div>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  If an account exists for that email, we sent password reset instructions.
                  Check your inbox and spam folder.
                </p>
                {devResetUrl && (
                  <div className="p-4 rounded-xl text-left text-xs bg-indigo-500/5 border border-indigo-500/20 space-y-2">
                    <p className="font-semibold text-indigo-300">Development only</p>
                    <p className="text-[var(--text-secondary)]">
                      Email is not configured. Use this link to reset:
                    </p>
                    <Link
                      href={devResetUrl}
                      className="block text-indigo-300 hover:text-indigo-200 break-all underline"
                    >
                      {devResetUrl}
                    </Link>
                  </div>
                )}
                <Link href="/login">
                  <Button fullWidth variant="secondary">
                    Return to sign in
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-6">
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 rounded-xl text-xs font-semibold text-red-300 bg-red-500/5 border border-red-500/20 flex items-center gap-3"
                    >
                      <AlertCircle size={16} className="shrink-0" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-[0.08em] ml-1">
                    Email address
                  </label>
                  <div className="relative group">
                    <Mail
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] group-focus-within:text-indigo-300 transition-colors"
                    />
                    <input
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      disabled={isLoading}
                      className="w-full h-12 bg-[var(--bg-secondary)] border border-[rgba(255,255,255,0.10)] pl-11 pr-4 text-[15px] text-[var(--text-primary)] rounded-xl outline-none transition-all placeholder:text-[var(--text-tertiary)] focus:border-[rgba(99,102,241,0.60)] focus:ring-4 focus:ring-[rgba(99,102,241,0.12)]"
                    />
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
                      <span>Sending...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>Send reset link</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </Button>
              </form>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
