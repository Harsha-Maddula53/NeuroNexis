'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  return (
    <div className="grid grid-cols-[auto,1fr] h-screen overflow-hidden bg-background font-sans selection:bg-indigo-500/25">
      <Sidebar />
      <main className="relative overflow-y-auto overflow-x-hidden border-l border-white/10 bg-[var(--bg-primary)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
