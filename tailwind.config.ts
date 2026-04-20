import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1024px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        "border-strong": "hsl(var(--border-strong))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        "background-2": "hsl(var(--background-2))",
        foreground: "hsl(var(--foreground))",
        elevated: "hsl(var(--elevated))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // iOS system colors. Keep a single source of truth for semantic tinting.
        ios: {
          blue: "#007AFF",
          blueDeep: "#0A84FF",
          green: "#34C759",
          mint: "#00C7BE",
          red: "#FF3B30",
          orange: "#FF9500",
          yellow: "#FFCC00",
          indigo: "#5856D6",
          pink: "#FF2D55",
          purple: "#AF52DE",
          teal: "#30B0C7",
          brown: "#AC8E68",
          gray: "#8E8E93",
          gray2: "#AEAEB2",
          gray3: "#C7C7CC",
          gray4: "#D1D1D6",
          gray5: "#E5E5EA",
          gray6: "#F2F2F7",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        // Refined shadow stack — softer, more layered.
        "ios-sm":  "0 1px 2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.04)",
        ios:       "0 2px 6px rgba(15,23,42,0.05), 0 1px 2px rgba(15,23,42,0.04)",
        "ios-lg":  "0 10px 30px rgba(15,23,42,0.10), 0 4px 10px rgba(15,23,42,0.04)",
        // Semantic shadows used by components.
        surface:   "0 1px 2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.03)",
        elevated:  "0 18px 40px rgba(15,23,42,0.12), 0 4px 12px rgba(15,23,42,0.06)",
        tile:      "0 6px 18px rgba(15,23,42,0.14), inset 0 1px 0 rgba(255,255,255,0.18)",
        hero:      "0 20px 45px rgba(15,23,42,0.18), 0 6px 14px rgba(15,23,42,0.08)",
        // Colored glow for primary CTAs.
        "tint-blue":   "0 8px 22px rgba(0,122,255,0.30)",
        "tint-purple": "0 8px 22px rgba(175,82,222,0.30)",
        "tint-orange": "0 8px 22px rgba(255,149,0,0.28)",
        "tint-green":  "0 8px 22px rgba(52,199,89,0.28)",
      },
      backgroundImage: {
        // Apple Music-style gradient palettes (two-stop, soft).
        "grad-blue":   "linear-gradient(135deg, #0A84FF 0%, #5E5CE6 100%)",
        "grad-purple": "linear-gradient(135deg, #AF52DE 0%, #FF375F 100%)",
        "grad-orange": "linear-gradient(135deg, #FF9500 0%, #FF2D55 100%)",
        "grad-green":  "linear-gradient(135deg, #30D158 0%, #00C7BE 100%)",
        "grad-sunset": "linear-gradient(135deg, #FF5E3A 0%, #FF375F 50%, #AF52DE 100%)",
        "grad-ocean":  "linear-gradient(135deg, #32ADE6 0%, #0A84FF 100%)",
        "grad-mono":   "linear-gradient(135deg, #1d1d1f 0%, #3c3c43 100%)",
        "grad-ink":    "linear-gradient(160deg, #111113 0%, #232327 60%, #111113 100%)",
      },
      fontSize: {
        // iOS HIG typography scale.
        "ios-caption": ["11px", { lineHeight: "14px", letterSpacing: "0" }],
        "ios-footnote": ["13px", { lineHeight: "18px" }],
        "ios-body": ["15px", { lineHeight: "21px" }],
        "ios-callout": ["16px", { lineHeight: "22px" }],
        "ios-headline": ["17px", { lineHeight: "22px", letterSpacing: "-0.022em" }],
        "ios-title3": ["20px", { lineHeight: "26px", letterSpacing: "-0.024em" }],
        "ios-title2": ["22px", { lineHeight: "28px", letterSpacing: "-0.024em" }],
        "ios-title1": ["28px", { lineHeight: "34px", letterSpacing: "-0.026em" }],
        "ios-large": ["34px", { lineHeight: "41px", letterSpacing: "-0.028em" }],
        "ios-display": ["44px", { lineHeight: "50px", letterSpacing: "-0.032em" }],
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 320ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "scale-in": "scale-in 220ms cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
