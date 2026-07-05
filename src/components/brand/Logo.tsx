"use client";

import Link from "next/link";
import { useId } from "react";
import { cn } from "@/lib/utils";

type LogoSize = "sm" | "md" | "lg";

const sizes: Record<LogoSize, { mark: number; word: string; gap: string }> = {
  sm: { mark: 32, word: "text-[15px]", gap: "gap-3" },
  md: { mark: 36, word: "text-[15px]", gap: "gap-3" },
  lg: { mark: 64, word: "text-xl", gap: "gap-4" },
};

/**
 * Icon mark — one diagonal gradient (white top-left → blue bottom-right) on all
 * strokes, matching the blue reference. Structure from the B&W reference:
 * full left leg, fading diagonal, shorter right leg.
 */
export function LogoMark({
  size = "sm",
  className,
}: {
  size?: LogoSize;
  className?: string;
}) {
  const s = sizes[size];
  const uid = useId().replace(/:/g, "");
  const nGrad = `n-grad-${uid}`;

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      width={s.mark}
      height={s.mark}
      aria-hidden
    >
      <defs>
        <linearGradient
          id={nGrad}
          x1="28"
          y1="24"
          x2="68"
          y2="76"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="38%" stopColor="#F0F9FF" />
          <stop offset="62%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="48" fill="#000000" />
      <circle
        cx="50"
        cy="50"
        r="48"
        fill="none"
        stroke="#1E3A8A"
        strokeWidth="1.25"
        strokeOpacity="0.55"
      />

      <g
        stroke={`url(#${nGrad})`}
        strokeWidth="8"
        strokeLinecap="square"
        strokeLinejoin="miter"
        fill="none"
      >
        {/* Left leg — reads white→blue via shared gradient */}
        <path d="M 31 27 V 73" />
        {/* Diagonal — white at top-left, blue at bottom-right */}
        <path d="M 31 27 L 62 73" />
        {/* Right leg — shorter; mostly blue zone */}
        <path d="M 62 73 V 41" />
      </g>
    </svg>
  );
}

export function LogoWordmark({
  size = "sm",
  className,
}: {
  size?: LogoSize;
  className?: string;
}) {
  const s = sizes[size];

  return (
    <span
      className={cn(
        "inline-flex items-baseline font-semibold tracking-[-0.02em] whitespace-nowrap",
        s.word,
        className
      )}
    >
      <span className="text-white">Neuro</span>
      <span
        className="bg-clip-text text-transparent"
        style={{
          backgroundImage:
            "linear-gradient(90deg, #FFFFFF 0%, #FFFFFF 8%, #BFDBFE 30%, #3B82F6 65%, #2563EB 100%)",
        }}
      >
        Nexis
      </span>
    </span>
  );
}

type LogoProps = {
  size?: LogoSize;
  showText?: boolean;
  href?: string;
  className?: string;
  markClassName?: string;
};

export function Logo({
  size = "sm",
  showText = true,
  href,
  className,
  markClassName,
}: LogoProps) {
  const s = sizes[size];

  const content = (
    <>
      <LogoMark size={size} className={markClassName} />
      {showText && <LogoWordmark size={size} />}
    </>
  );

  const wrapperClass = cn("flex items-center group", s.gap, className);

  if (href) {
    return (
      <Link href={href} className={wrapperClass}>
        {content}
      </Link>
    );
  }

  return <div className={wrapperClass}>{content}</div>;
}
