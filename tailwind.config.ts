import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#000000",
          900: "#0A0A0B",
          800: "#16171A",
          700: "#1C1D21",
          600: "#26282D",
        },
        mint: {
          DEFAULT: "#A8E6B0",
          400: "#B8EFC0",
          500: "#8FE09B",
          600: "#6FCF7E",
        },
        coral: {
          DEFAULT: "#F26D6D",
          400: "#FF7B7B",
          500: "#F26D6D",
          600: "#E25555",
        },
        muted: {
          DEFAULT: "#8A8B8F",
          dim: "#5E6064",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "24px",
        pill: "9999px",
      },
      boxShadow: {
        glow: "0 0 24px rgba(168, 230, 176, 0.15)",
        sheet: "0 -8px 40px rgba(0,0,0,0.6)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
        shimmer: "shimmer 3s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
