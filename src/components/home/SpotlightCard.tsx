"use client";

import { useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type SpotlightCardProps = {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  index?: number;
  lift?: boolean;
};

export function SpotlightCard({
  children,
  className,
  innerClassName,
  index = 0,
  lift = true,
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [hovered, setHovered] = useState(false);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      whileHover={lift ? { y: -6 } : undefined}
      className={cn("h-full", className)}
    >
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false);
          setPos({ x: 50, y: 50 });
        }}
        className={cn(
          "group relative h-full rounded-[var(--radius)] p-px overflow-hidden transition-shadow duration-500",
          hovered &&
            "shadow-[0_8px_40px_rgba(37,99,235,0.35),0_0_0_1px_rgba(59,130,246,0.25)]"
        )}
        style={{
          background: hovered
            ? `radial-gradient(520px circle at ${pos.x}% ${pos.y}%, rgba(59,130,246,0.55), rgba(0,0,0,0.9) 42%)`
            : "linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.45) 100%)",
        }}
      >
        <div
          className={cn(
            "relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius)-1px)] bg-[#030303] border border-white/[0.05] transition-colors duration-500",
            hovered && "border-blue-500/25 bg-[#050508]",
            innerClassName
          )}
        >
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-500"
            style={{
              opacity: hovered ? 1 : 0,
              background: `radial-gradient(380px circle at ${pos.x}% ${pos.y}%, rgba(37,99,235,0.22), transparent 50%)`,
            }}
          />
          <div
            className={cn(
              "pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-blue-600/30 blur-3xl transition-opacity duration-500",
              hovered ? "opacity-60" : "opacity-0"
            )}
          />
          <div
            className={cn(
              "pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/70 to-transparent transition-opacity duration-500",
              hovered ? "opacity-100" : "opacity-0"
            )}
          />
          <div className="relative z-10 flex h-full flex-col">{children}</div>
        </div>
      </div>
    </motion.div>
  );
}
