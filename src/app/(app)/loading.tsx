"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function AppLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 p-12">
      <div className="relative w-72 mb-12">
        {/* Technical Frame */}
        <div className="absolute -inset-4 border border-zinc-900 border-dashed opacity-50" />
        
        {/* Progress Bar Container */}
        <div className="h-1 bg-zinc-900 border border-zinc-800 overflow-hidden relative">
          <motion.div 
            initial={{ left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="absolute h-full w-1/3 bg-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.5)]"
          />
        </div>
        
        {/* Corners */}
        <div className="absolute -top-6 -left-6 h-2 w-2 border-t-2 border-l-2 border-zinc-800" />
        <div className="absolute -top-6 -right-6 h-2 w-2 border-t-2 border-r-2 border-zinc-800" />
        <div className="absolute -bottom-6 -left-6 h-2 w-2 border-b-2 border-l-2 border-zinc-800" />
        <div className="absolute -bottom-6 -right-6 h-2 w-2 border-b-2 border-r-2 border-zinc-800" />
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 bg-purple-500 rounded-full animate-pulse" />
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-zinc-500 font-mono font-black uppercase tracking-[0.4em] text-[10px]"
          >
            Establishing_Neural_Link
          </motion.p>
        </div>
        
        <div className="font-mono text-[8px] text-zinc-800 uppercase tracking-widest flex gap-4">
          <span>SECURE_AUTH::OK</span>
          <span>SYNC_VEC::ACTIVE</span>
          <span>MESH::SYNCED</span>
        </div>
      </div>
    </div>
  );
}
