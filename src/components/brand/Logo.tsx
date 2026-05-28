import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoSize = "sm" | "md" | "lg";

const sizes: Record<
  LogoSize,
  { mark: string; letter: string; word: string; gap: string }
> = {
  sm: { mark: "h-8 w-8", letter: "text-lg", word: "text-[15px]", gap: "gap-3" },
  md: { mark: "h-9 w-9", letter: "text-xl", word: "text-[15px]", gap: "gap-3" },
  lg: { mark: "h-16 w-16", letter: "text-3xl", word: "text-xl", gap: "gap-4" },
};

export function LogoMark({
  size = "sm",
  className,
}: {
  size?: LogoSize;
  className?: string;
}) {
  const s = sizes[size];

  return (
    <div
      className={cn(
        s.mark,
        "relative shrink-0 rounded-xl overflow-hidden",
        "bg-black border border-blue-500/45",
        "shadow-[0_0_18px_rgba(37,99,235,0.22),inset_0_1px_0_rgba(59,130,246,0.15)]",
        className
      )}
      aria-hidden
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/70 via-blue-500/25 to-transparent" />
      <div className="absolute bottom-0 right-0 h-[55%] w-[55%] bg-blue-500/25 blur-[6px]" />
      <div className="absolute top-0 left-0 h-full w-[42%] bg-black/90" />
      <span
        className={cn(
          "relative z-10 flex h-full w-full items-center justify-center font-bold leading-none text-blue-400",
          s.letter
        )}
      >
        N
      </span>
    </div>
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
        "font-semibold tracking-[-0.02em]",
        s.word,
        className
      )}
    >
      <span className="text-[var(--text-primary)]">Neuro</span>
      <span className="text-blue-400">Nexis</span>
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

  const wrapperClass = cn(
    "flex items-center group",
    s.gap,
    className
  );

  if (href) {
    return (
      <Link href={href} className={wrapperClass}>
        {content}
      </Link>
    );
  }

  return <div className={wrapperClass}>{content}</div>;
}
