"use client";

import { SpotlightCard } from "./SpotlightCard";

type HowItWorksStepCardProps = {
  step: string;
  title: string;
  description: string;
  index: number;
};

export function HowItWorksStepCard({
  step,
  title,
  description,
  index,
}: HowItWorksStepCardProps) {
  return (
    <SpotlightCard index={index} innerClassName="p-8">
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-blue-500/80 transition-colors duration-300 group-hover:text-blue-300">
        Step {step}
      </span>
      <h3 className="mt-4 text-xl font-semibold tracking-tight text-[var(--text-primary)] transition-colors duration-300 group-hover:text-white">
        {title}
      </h3>
      <p className="mt-3 text-[15px] leading-relaxed text-[var(--text-secondary)] transition-colors duration-300 group-hover:text-zinc-300">
        {description}
      </p>
    </SpotlightCard>
  );
}
