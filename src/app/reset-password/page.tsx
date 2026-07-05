"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Logo } from "@/components/brand/Logo";
import {
  ArrowRight,
  ChevronLeft,
  Lock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    if (!token) {
      setError("Invalid or missing reset link. Please request a new one.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!token && !success) {
    return (
      <Card className="p-8 shadow-card border-white/10 bg-[rgba(255,255,255,0.04)] backdrop-blur-md text-center space-y-6">
        <p className="text-sm text-[var(--text-secondary)]">
          This reset link is invalid or has expired.
        </p>
        <Link href="/forgot-password">
          <Button fullWidth>Request a new link</Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="p-8 shadow-card border-white/10 bg-[rgba(255,255,255,0.04)] backdrop-blur-md">
      {success ? (
        <div className="space-y-6 text-center">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 size={24} className="text-emerald-400" />
            </div>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Your password has been updated. Redirecting to sign in...
          </p>
          <Link href="/login">
            <Button fullWidth variant="secondary">
              Sign in now
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

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-[0.08em] ml-1">
                New password
              </label>
              <div className="relative group">
                <Lock
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] group-focus-within:text-indigo-300 transition-colors"
                />
                <input
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  disabled={isLoading}
                  className="w-full h-12 bg-[var(--bg-secondary)] border border-[rgba(255,255,255,0.10)] pl-11 pr-4 text-[15px] text-[var(--text-primary)] rounded-xl outline-none transition-all placeholder:text-[var(--text-tertiary)] focus:border-[rgba(99,102,241,0.60)] focus:ring-4 focus:ring-[rgba(99,102,241,0.12)]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-[0.08em] ml-1">
                Confirm password
              </label>
              <div className="relative group">
                <Lock
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] group-focus-within:text-indigo-300 transition-colors"
                />
                <input
                  name="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
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
                <span>Updating...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>Reset password</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </div>
            )}
          </Button>
        </form>
      )}
    </Card>
  );
}

export default function ResetPasswordPage() {
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
            Set new password
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-2 text-center">
            Choose a strong password for your account.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Suspense
            fallback={
              <Card className="p-8 border-white/10 bg-[rgba(255,255,255,0.04)]">
                <div className="h-32 flex items-center justify-center">
                  <div className="h-6 w-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
              </Card>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </motion.div>
      </div>
    </div>
  );
}
