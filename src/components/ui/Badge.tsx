import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline' | 'ai';
  className?: string;
}

export function Badge({ children, variant = 'primary', className = '' }: BadgeProps) {
  const variants = {
    primary: 'bg-[rgba(99,102,241,0.08)] text-indigo-300 border-[rgba(99,102,241,0.2)]',
    secondary: 'bg-[rgba(255,255,255,0.03)] text-[var(--text-secondary)] border-[rgba(255,255,255,0.08)]',
    success: 'bg-[rgba(16,185,129,0.08)] text-emerald-400 border-[rgba(16,185,129,0.2)]',
    warning: 'bg-[rgba(245,158,11,0.08)] text-amber-400 border-[rgba(245,158,11,0.2)]',
    error: 'bg-[rgba(239,68,68,0.08)] text-red-400 border-[rgba(239,68,68,0.2)]',
    outline: 'bg-transparent text-[var(--text-secondary)] border-[rgba(255,255,255,0.1)]',
    ai: 'bg-[rgba(99,102,241,0.08)] text-indigo-300 border-[rgba(99,102,241,0.25)]',
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-[0.08em] border transition-colors',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
