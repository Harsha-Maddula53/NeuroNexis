import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "var(--bg-primary)",
        foreground: "var(--text-primary)",
        primary: {
          DEFAULT: "var(--brand-primary)",
          hover: "var(--brand-primary-hover)",
        },
        secondary: {
          DEFAULT: "var(--bg-secondary)",
        },
        card: {
          DEFAULT: "var(--card-bg)",
          border: "var(--card-border)",
        },
        ai: {
          bg: "var(--ai-msg-bg)",
          text: "var(--ai-msg-text)",
          border: "var(--ai-msg-border)",
        },
        border: "var(--border-color)",
        muted: "var(--text-secondary)",
        subtle: "var(--text-tertiary)",
        accent: {
          DEFAULT: "var(--accent-primary)",
          secondary: "var(--accent-secondary)",
        },
        danger: "var(--color-danger)",
        warning: "var(--color-warning)",
        success: "var(--color-success)",
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "Inter",
          "SF Pro Display",
          "system-ui",
          "ui-sans-serif",
          "sans-serif",
        ],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        btn: "0 1px 2px rgba(0,0,0,0.35)",
        card: "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        "card-hover":
          "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
        glow: "0 0 24px rgba(99,102,241,0.25)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-in": "slideIn 0.3s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        ".text-balance": { textWrap: "balance" },
        ".bg-dot-grid": {
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)",
          backgroundSize: "22px 22px",
        },
        ".bg-glow-radial": {
          backgroundImage:
            "radial-gradient(800px 400px at 50% 0%, rgba(99,102,241,0.14), transparent 65%), radial-gradient(600px 300px at 20% 10%, rgba(168,85,247,0.10), transparent 60%)",
        },
        ".grain-overlay": {
          position: "relative",
        },
        ".grain-overlay::before": {
          content: '""',
          position: "fixed",
          inset: "0",
          pointerEvents: "none",
          zIndex: "0",
          opacity: "0.035",
          mixBlendMode: "overlay",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E\")",
        },
      });
    }),
  ],
};

export default config;

