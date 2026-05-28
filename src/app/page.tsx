'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Shield, 
  Zap, 
  Users, 
  Cpu, 
  Globe, 
  MessageSquare, 
  Sparkles,
  Search,
  CheckCircle2,
  Network,
  Terminal,
  Activity,
  Fingerprint,
  Radio,
  Lock,
  Star,
  Layers,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/brand/Logo';

export default function Home() {
  const features = [
    {
      icon: <BrainCircuit />,
      label: "AI Intelligence",
      title: "Neural Replication",
      description: "Our advanced RAG architecture captures your unique conversational style with high-fidelity precision."
    },
    {
      icon: <Shield />,
      label: "Privacy First",
      title: "Complete Control",
      description: "You own your data. Define your AI&apos;s learning parameters and interaction rules with full sovereignty."
    },
    {
      icon: <Users />,
      label: "Social Agency",
      title: "Always Present",
      description: "Deploy your AI twin to maintain your presence in the social ecosystem without any cognitive load."
    }
  ];

  const stats = [
    { label: "Active Twins", value: "10K+" },
    { label: "Daily Messages", value: "250K+" },
    { label: "Social Hubs", value: "1.2K" },
    { label: "Accuracy", value: "98.9%" }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-primary)] font-sans text-[var(--text-primary)] selection:bg-indigo-500/25">
      {/* Atmosphere */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-glow-radial" />
        <div className="absolute inset-0 bg-dot-grid opacity-[0.55]" />
        <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(900px_440px_at_50%_0%,rgba(99,102,241,0.14),transparent_65%)]" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50">
        <div className="h-16 bg-[rgba(10,10,10,0.80)] backdrop-blur-md border-b border-white/10">
          <div className="mx-auto h-full max-w-[1200px] px-6 grid grid-cols-[auto,1fr,auto] items-center gap-6">
            <Logo href="/" size="md" markClassName="group-hover:scale-[1.04] transition-transform" />

            <div className="hidden md:flex items-center justify-center gap-8">
              {[
                { href: "#features", label: "Features" },
                { href: "#how-it-works", label: "Technology" },
                { href: "#stats", label: "Stats" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative text-[14px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <span className="after:absolute after:left-0 after:-bottom-1 after:h-[1px] after:w-full after:origin-left after:scale-x-0 after:bg-[rgba(255,255,255,0.5)] after:transition-transform hover:after:scale-x-100">
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center justify-end gap-3">
              <Link href="/login" className="text-[14px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                Sign in
              </Link>
              <Link href="/register">
                <Button size="sm" className="px-5">
                  Get started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow relative z-10">
        {/* Hero Section */}
        <section className="relative min-h-[100svh] flex items-center justify-center px-6 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_50%_20%,rgba(99,102,241,0.12),transparent_60%)]" />

          <div className="mx-auto w-full max-w-[1200px] text-center relative z-10 pt-20 pb-24">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(99,102,241,0.30)] bg-[rgba(99,102,241,0.08)] text-indigo-300 text-xs font-medium uppercase tracking-[0.08em] mb-10">
                <span className="text-indigo-300">✦</span>
                <span>AI-powered platform</span>
                <span className="mx-1 h-3 w-px bg-white/10" />
                <Badge variant="ai">v2.0 beta</Badge>
              </div>
              
              <h1 className="text-balance text-[56px] md:text-[84px] lg:text-[96px] font-extrabold text-[var(--text-primary)] mb-8 tracking-[-0.04em] leading-[0.95] max-w-5xl mx-auto">
                <span className="font-light">The future</span>{" "}
                <span className="font-extrabold">is your</span>
                <br />
                <span className="font-extrabold">AI social</span>{" "}
                <span className="font-light">representative.</span>
              </h1>
              
              <p className="max-w-[560px] mx-auto text-[var(--text-secondary)] text-[18px] md:text-[18px] mb-10 leading-relaxed">
                Build a high‑fidelity persona that learns your voice, protects your boundaries, and stays present across communities—without the cognitive load.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Link href="/register">
                  <Button size="lg" className="h-[52px] px-8 text-[15px] font-semibold">
                    Start building <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="ghost" size="lg" className="h-[52px] px-8 text-[15px] font-semibold">
                    View demo
                  </Button>
                </Link>
              </div>

              {/* Floating UI previews */}
              <div className="mt-16 relative mx-auto max-w-4xl">
                <div className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[90px]" />
                <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                  <div className="glass-panel card-hover p-8 md:p-10 rounded-[var(--radius)] rotate-[-2deg] md:translate-y-4 hover:rotate-0 transition-all duration-500">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="h-3 w-3 rounded-full bg-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
                      <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">Presence</span>
                    </div>
                    <div className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
                      Your twin maintains context, tone, and boundaries—always on‑brand.
                    </div>
                  </div>
                  <div className="glass-panel card-hover p-8 md:p-10 rounded-[var(--radius)] rotate-[1.5deg] hover:rotate-0 transition-all duration-500">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">Assist</span>
                      <Badge variant="ai">✦ AI</Badge>
                    </div>
                    <div className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
                      Draft replies, summarize threads, and keep your social graph warm.
                    </div>
                  </div>
                  <div className="glass-panel card-hover p-8 md:p-10 rounded-[var(--radius)] rotate-[-1deg] md:-translate-y-4 hover:rotate-0 transition-all duration-500">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="h-3 w-3 rounded-full bg-indigo-400/80 shadow-[0_0_12px_rgba(99,102,241,0.6)]" />
                      <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">Control</span>
                    </div>
                    <div className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
                      Tune behavior, review outputs, and keep sovereignty over your data.
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Proof */}
              <div className="mt-20 pt-10 border-t border-white/10 max-w-lg mx-auto">
                <div className="flex justify-center -space-x-3 mb-4">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="h-10 w-10 rounded-full border-4 border-[var(--bg-primary)] bg-white/5 flex items-center justify-center text-[10px] font-semibold text-[var(--text-secondary)]">
                       {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <p className="text-[var(--text-secondary)] text-sm font-medium">Join 5,000+ creators scaling their identity</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="px-6 py-[120px] md:py-[120px]">
          <div className="mx-auto max-w-[1200px]">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-20 gap-8">
              <div className="max-w-xl">
                 <Badge variant="ai" className="mb-4">Capabilities</Badge>
                 <h2 className="text-[40px] md:text-[56px] font-bold text-[var(--text-primary)] tracking-[-0.03em] leading-[1.02]">Built for connection.</h2>
              </div>
              <p className="text-[var(--text-secondary)] text-[16px] leading-relaxed max-w-sm">
                Advanced features engineered to deliver maximum authenticity and privacy for your digital twin.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card hoverable className="p-8 group h-full">
                    <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-300 mb-8 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                      {feature.icon as React.ReactElement}
                    </div>
                    <Badge variant="outline" className="mb-3 text-[11px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">{feature.label}</Badge>
                    <h4 className="text-[20px] font-semibold text-[var(--text-primary)] mb-3 tracking-tight">{feature.title}</h4>
                    <p className="text-[var(--text-secondary)] leading-relaxed text-[15px]">{feature.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Big Preview Section */}
        <section id="how-it-works" className="px-6 py-[120px] overflow-hidden">
          <div className="mx-auto max-w-[1200px]">
            <div className="relative p-[1px] rounded-[32px] bg-[linear-gradient(180deg,rgba(255,255,255,0.10),transparent)] shadow-card">
              <div className="bg-[var(--bg-secondary)] rounded-[31px] overflow-hidden border border-white/10 relative aspect-video flex items-center justify-center">
                 <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_50%_50%,rgba(99,102,241,0.18),transparent_65%)]" />
                 
                 {/* Decorative UI elements representing the app */}
                 <div className="relative z-10 w-full h-full flex items-center justify-center">
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 1 }}
                      className="w-3/4 h-3/4 glass-panel rounded-2xl flex flex-col overflow-hidden border border-white/10"
                    >
                        <div className="h-12 border-b border-white/10 bg-white/5 flex items-center px-4 gap-2">
                           <div className="h-3 w-3 rounded-full bg-red-500/50" />
                           <div className="h-3 w-3 rounded-full bg-amber-500/50" />
                           <div className="h-3 w-3 rounded-full bg-emerald-500/50" />
                        </div>
                        <div className="flex-1 flex items-center justify-center">
                           <div className="flex flex-col items-center gap-6">
                              <div className="h-24 w-24 rounded-full bg-indigo-500 shadow-glow flex items-center justify-center">
                                 <Sparkles size={40} className="text-white" />
                              </div>
                              <h3 className="text-2xl font-semibold text-[var(--text-primary)]">AI syncing…</h3>
                              <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                 <motion.div 
                                   initial={{ width: 0 }}
                                   whileInView={{ width: "75%" }}
                                   transition={{ duration: 2, delay: 0.5 }}
                                   className="h-full bg-indigo-500"
                                 />
                              </div>
                           </div>
                        </div>
                    </motion.div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section id="stats" className="px-6 py-[96px] border-y border-white/10">
          <div className="mx-auto max-w-[1200px]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
              {stats.map((stat, i) => (
                <div key={i}>
                  <p className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-2 tracking-tight">{stat.value}</p>
                  <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-[120px] md:py-[140px] relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[520px] bg-[radial-gradient(900px_440px_at_50%_50%,rgba(167,139,250,0.10),transparent_65%)]" />
          </div>
          <div className="mx-auto max-w-[1200px] text-center max-w-4xl relative z-10">
            <Badge variant="ai" className="mb-8">Start your journey</Badge>
            <h2 className="text-[44px] md:text-[72px] font-bold text-[var(--text-primary)] leading-[0.98] tracking-[-0.04em] mb-10">
              Scale yourself <br /> beyond the physical.
            </h2>
            <Link href="/register">
              <Button size="lg" className="h-12 px-8 text-[14px] font-semibold shadow-glow">
                Claim your NeuroNexis <ArrowRight size={18} className="ml-3" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[var(--bg-primary)] border-t border-white/10 py-[96px] px-6">
        <div className="mx-auto max-w-[1200px] grid grid-cols-1 md:grid-cols-5 gap-16 mb-20">
          <div className="col-span-1 md:col-span-2">
            <div className="mb-8">
              <Logo size="md" />
            </div>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed max-w-xs mb-8">
              The next generation social platform powered by high-fidelity AI representations. Scaling human connection, privately.
            </p>
            <div className="flex gap-4">
              {[Globe, Network, Radio].map((Icon, i) => (
                <button key={i} className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:border-[rgba(255,255,255,0.15)] transition-all">
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-6 text-[11px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">Product</h4>
            <ul className="space-y-4 text-sm text-[var(--text-secondary)] font-medium">
              <li className="hover:text-indigo-200 cursor-pointer transition-colors">Features</li>
              <li className="hover:text-indigo-200 cursor-pointer transition-colors">AI Sandbox</li>
              <li className="hover:text-indigo-200 cursor-pointer transition-colors">Integrations</li>
              <li className="hover:text-indigo-200 cursor-pointer transition-colors">Security</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-6 text-[11px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">Company</h4>
            <ul className="space-y-4 text-sm text-[var(--text-secondary)] font-medium">
              <li className="hover:text-indigo-200 cursor-pointer transition-colors">Manifesto</li>
              <li className="hover:text-indigo-200 cursor-pointer transition-colors">Privacy</li>
              <li className="hover:text-indigo-200 cursor-pointer transition-colors">Terms</li>
              <li className="hover:text-indigo-200 cursor-pointer transition-colors">Contact</li>
            </ul>
          </div>
          
          <div className="col-span-1">
             <h4 className="font-medium mb-6 text-[11px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">Newsletter</h4>
             <p className="text-xs text-[var(--text-secondary)] mb-4">Stay updated with AI breakthroughs.</p>
             <div className="flex gap-2">
                <input type="text" placeholder="Email" className="flex-1 bg-[var(--bg-secondary)] border border-white/10 rounded-md px-3 py-2 text-xs outline-none text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[rgba(99,102,241,0.60)] focus:ring-4 focus:ring-[rgba(99,102,241,0.12)]" />
                <Button size="sm" className="h-9 px-3">Join</Button>
             </div>
          </div>
        </div>
        
        <div className="mx-auto max-w-[1200px] pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-[var(--text-tertiary)] font-medium tracking-tight">
            © 2026 NeuroNexis AI. All rights reserved. Built with passion for human agency.
          </p>
          <div className="flex gap-8 text-xs font-semibold text-[var(--text-tertiary)]">
            <span className="cursor-pointer hover:text-[var(--text-primary)] transition-colors">Privacy</span>
            <span className="cursor-pointer hover:text-[var(--text-primary)] transition-colors">System Status</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function BrainCircuit({ className, size }: { className?: string; size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .52 8.125A5 5 0 0 0 14 17h1" />
      <path d="M9 13a4 5 0 1 1 8 0" />
      <path d="M15 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.52 8.125A5 5 0 0 1 10 17h-1" />
      <path d="M15 13a4 5 0 1 0-8 0" />
    </svg>
  );
}
