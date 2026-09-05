import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0B0D12",
          soft: "#151821",
          muted: "#8A90A0",
          faint: "#3A3F4E",
        },
        paper: {
          DEFAULT: "#FAFAF7",
          soft: "#F2F1EC",
          card: "#FFFFFF",
        },
        signal: {
          p1: "#E14B4B",
          p2: "#E0A458",
          p3: "#8A90A0",
          accent: "#3B5BFF",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "-apple-system",
          "BlinkMacSystemFont",
          "Inter",
          "Segoe UI",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,13,18,0.04), 0 8px 24px rgba(11,13,18,0.04)",
        hero: "0 2px 4px rgba(11,13,18,0.06), 0 24px 48px rgba(11,13,18,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
