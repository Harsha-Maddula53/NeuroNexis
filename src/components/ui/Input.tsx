import React, { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ className = '', label, ...props }: InputProps) {
  return (
    <div className="w-full text-sans">
      {label && (
        <label className="block text-[11px] font-medium text-[var(--text-tertiary)] mb-2 ml-1 uppercase tracking-[0.08em]">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full bg-[var(--bg-secondary)] border border-[rgba(255,255,255,0.10)] rounded-md h-10 px-4 text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none focus:border-[rgba(99,102,241,0.60)] focus:ring-4 focus:ring-[rgba(99,102,241,0.12)]',
          className
        )}
        {...props}
      />
    </div>
  );
}
