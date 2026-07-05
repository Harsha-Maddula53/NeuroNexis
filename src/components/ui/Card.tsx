import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function Card({ children, className = '', onClick, hoverable = false }: CardProps) {
  return (
    <motion.div
      whileHover={hoverable ? { y: -2, borderColor: 'rgba(255, 255, 255, 0.15)' } : {}}
      onClick={onClick}
      className={cn(
        'bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius)] overflow-hidden transition-all duration-500 shadow-card backdrop-blur-xl',
        onClick || hoverable
          ? 'cursor-pointer hover:shadow-[0_8px_32px_rgba(0,0,0,0.5),_0_0_20px_rgba(239,68,68,0.15)] hover:border-[rgba(239,68,68,0.3)] hover:-translate-y-1'
          : '',
        className
      )}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('p-6 border-b border-white/10', className)}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('p-6', className)}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('p-6 border-t border-white/10 bg-[rgba(10,10,10,0.35)]', className)}>
      {children}
    </div>
  );
}
