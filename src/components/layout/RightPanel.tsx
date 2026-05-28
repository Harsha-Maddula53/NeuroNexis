'use client';

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface RightPanelProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

export function RightPanel({ children, className, title }: RightPanelProps) {
  return (
    <aside className={cn(
      "fixed right-0 top-0 bottom-0 w-[400px] hidden lg:flex flex-col z-10 transition-all duration-300 bg-[var(--bg-secondary)] border-l border-white/10",
      className
    )}>
      {title && (
        <header className="h-16 flex items-center px-8 border-b border-white/10 shrink-0 bg-[rgba(10,10,10,0.6)] backdrop-blur-md">
          <h2 className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-[0.08em]">{title}</h2>
        </header>
      )}
      <div className="flex-1 overflow-y-auto p-8 scrollbar-none">
        {children}
      </div>
    </aside>
  );
}
