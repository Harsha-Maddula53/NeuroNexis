"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { SpotlightCard } from "./SpotlightCard";

type HeroFloatingCardProps = {
  title: string;
  description: string;
  accent: "indigo" | "purple";
  initialRotate?: string;
  initialTranslate?: string;
  showAiBadge?: boolean;
  index: number;
};

const accentDot = {
  indigo: "bg-indigo-500/80 shadow-[0_0_14px_rgba(99,102,241,0.7)]",
  purple: "bg-purple-500/80 shadow-[0_0_14px_rgba(168,85,247,0.7)]",
};

export function HeroFloatingCard({
  title,
  description,
  accent,
  initialRotate = "rotate-0",
  initialTranslate = "",
  showAiBadge = false,
  index,
}: HeroFloatingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.12, duration: 0.7 }}
      className={cn("h-full", initialRotate, initialTranslate)}
    >
      <SpotlightCard index={index} innerClassName="p-8 md:p-10" lift>
        {showAiBadge ? (
          <div className="mb-6 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--text-tertiary)] transition-colors duration-300 group-hover:text-white">
              {title}
            </span>
            <Badge variant="ai">✦ AI</Badge>
          </div>
        ) : (
          <div className="mb-6 flex items-center gap-3">
            <span
              className={cn(
                "h-3 w-3 rounded-full transition-transform duration-500 group-hover:scale-125",
                accentDot[accent]
              )}
            />
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--text-tertiary)] transition-colors duration-300 group-hover:text-white">
              {title}
            </span>
          </div>
        )}
        <p className="text-[15px] leading-relaxed text-[var(--text-secondary)] transition-colors duration-300 group-hover:text-zinc-200">
          {description}
        </p>
      </SpotlightCard>
    </motion.div>
  );
}
