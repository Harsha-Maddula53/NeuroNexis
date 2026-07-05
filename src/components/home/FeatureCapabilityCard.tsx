"use client";

import { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { SpotlightCard } from "./SpotlightCard";

type FeatureCapabilityCardProps = {
  icon: ReactNode;
  label: string;
  title: string;
  description: string;
  index: number;
};

export function FeatureCapabilityCard({
  icon,
  label,
  title,
  description,
  index,
}: FeatureCapabilityCardProps) {
  return (
    <SpotlightCard index={index} innerClassName="p-8">
      <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/10 bg-blue-500/5 text-blue-400 transition-all duration-500 group-hover:border-blue-400/40 group-hover:bg-blue-500/15 group-hover:text-blue-200 group-hover:shadow-[0_0_28px_rgba(59,130,246,0.35)] group-hover:scale-110">
        {icon}
      </div>
      <Badge
        variant="outline"
        className="mb-3 border-white/10 text-[11px] uppercase tracking-[0.08em] text-[var(--text-tertiary)] transition-colors duration-300 group-hover:border-blue-500/30 group-hover:text-blue-300/80"
      >
        {label}
      </Badge>
      <h4 className="mb-3 text-[20px] font-semibold tracking-tight text-[var(--text-primary)] transition-colors duration-300 group-hover:text-white">
        {title}
      </h4>
      <p className="text-[15px] leading-relaxed text-[var(--text-secondary)] transition-colors duration-300 group-hover:text-zinc-300">
        {description}
      </p>
    </SpotlightCard>
  );
}
