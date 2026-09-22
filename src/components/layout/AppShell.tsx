'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return (
    <div className="flex h-[100dvh] overflow-hidden bg-background font-sans selection:bg-indigo-500/25">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar Wrapper */}
      <div className={cn(
        "absolute md:static top-0 left-0 h-full z-50 transition-transform duration-300 ease-in-out",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <Sidebar onMobileClose={() => setIsMobileMenuOpen(false)} />
      </div>

      <main className="flex-1 relative overflow-y-auto overflow-x-hidden border-l border-white/10 bg-[var(--bg-primary)] flex flex-col min-w-0">
        {/* Mobile Header (Hidden on Chat because Chat has its own mobile header) */}
        {!pathname.startsWith('/chat') && (
          <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-[var(--bg-secondary)] shrink-0 sticky top-0 z-30">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-lg hover:bg-white/5 text-[var(--text-secondary)]"
            >
              <Menu size={24} />
            </button>
            <span className="font-semibold text-[var(--text-primary)]">NeuroNexis</span>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
        )}
        
        {children}
      </main>
    </div>
  );
}
