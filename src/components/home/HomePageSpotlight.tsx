"use client";

import { useState, type ReactNode } from "react";

type HomePageSpotlightProps = {
  children: ReactNode;
};

export function HomePageSpotlight({ children }: HomePageSpotlightProps) {
  const [pos, setPos] = useState({ x: -500, y: -500 });
  const [active, setActive] = useState(false);

  return (
    <div
      className="relative min-h-screen"
      onMouseMove={(e) => {
        setPos({ x: e.clientX, y: e.clientY });
        setActive(true);
      }}
      onMouseLeave={() => setActive(false)}
    >
      {/* Page-wide blue cursor glow */}
      <div
        className="pointer-events-none fixed inset-0 z-[1] transition-opacity duration-500"
        style={{
          opacity: active ? 1 : 0,
          background: `radial-gradient(700px circle at ${pos.x}px ${pos.y}px, rgba(37,99,235,0.14), transparent 48%)`,
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-[1] transition-opacity duration-500"
        style={{
          opacity: active ? 1 : 0,
          background: `radial-gradient(1100px circle at ${pos.x}px ${pos.y}px, rgba(59,130,246,0.07), transparent 52%)`,
        }}
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
