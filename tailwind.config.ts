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
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
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
        // iOS system colors (used for semantic tinting — green=success, red=error, etc.)
        ios: {
          blue: "#007AFF",
          green: "#34C759",
          red: "#FF3B30",
          orange: "#FF9500",
          yellow: "#FFCC00",
          indigo: "#5856D6",
          pink: "#FF2D55",
          purple: "#AF52DE",
          teal: "#30B0C7",
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
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        // Softer, iOS-like shadows
        "ios-sm": "0 1px 2px rgba(0,0,0,0.04)",
        ios: "0 2px 6px rgba(0,0,0,0.05)",
        "ios-lg": "0 8px 20px rgba(0,0,0,0.08)",
      },
      fontSize: {
        // iOS typography scale
        "ios-caption": ["11px", { lineHeight: "13px" }],
        "ios-footnote": ["13px", { lineHeight: "18px" }],
        "ios-body": ["15px", { lineHeight: "20px" }],
        "ios-callout": ["16px", { lineHeight: "21px" }],
        "ios-headline": ["17px", { lineHeight: "22px", letterSpacing: "-0.02em" }],
        "ios-title3": ["20px", { lineHeight: "25px", letterSpacing: "-0.02em" }],
        "ios-title2": ["22px", { lineHeight: "28px", letterSpacing: "-0.022em" }],
        "ios-title1": ["28px", { lineHeight: "34px", letterSpacing: "-0.024em" }],
        "ios-large": ["34px", { lineHeight: "41px", letterSpacing: "-0.026em" }],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
