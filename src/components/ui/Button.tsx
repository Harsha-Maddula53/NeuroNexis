import React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref' | 'children'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
}

export function Button({
  className = '',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium text-sm transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none rounded-md border relative overflow-hidden group';
  
  const variants = {
    primary:
      'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] hover:from-indigo-400 hover:to-purple-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.4),inset_0_1px_0_rgba(255,255,255,0.3)]',
    secondary:
      'bg-[rgba(255,255,255,0.03)] text-[var(--text-primary)] border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.1)] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]',
    outline:
      'bg-transparent text-[var(--text-primary)] border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.03)] hover:border-[rgba(255,255,255,0.15)]',
    danger:
      'bg-red-500 text-white border-transparent hover:bg-red-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]',
    ghost:
      'bg-transparent text-[var(--text-secondary)] border-transparent hover:bg-[rgba(255,255,255,0.03)] hover:text-[var(--text-primary)]',
    glass:
      'bg-[rgba(255,255,255,0.02)] backdrop-blur-md border-[rgba(255,255,255,0.05)] text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.1)] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]',
  };

  const sizes = {
    sm: 'h-9 px-3 text-[13px] rounded-md',
    md: 'h-10 px-5 text-[14px] rounded-md',
    lg: 'h-12 px-6 text-[15px] rounded-lg'
  };

  return (
    <motion.button 
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={cn(baseStyles, variants[variant], sizes[size], fullWidth ? 'w-full' : '', className)} 
      {...props}
      disabled={props.disabled || loading}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}
