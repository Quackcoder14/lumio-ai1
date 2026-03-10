import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        aws: {
          orange: "#FF9900",
          "orange-dark": "#E8870A",
          "orange-light": "#FFB347",
          dark: "#0A0E1A",
          "dark-2": "#0D1117",
          "dark-3": "#161B29",
          "dark-4": "#1E2535",
          "dark-5": "#252D42",
          surface: "#1A2035",
          border: "#2A3350",
          "border-light": "#354060",
          text: "#E8EAF0",
          "text-muted": "#8892A4",
          "text-dim": "#5A6478",
          teal: "#00D4FF",
          green: "#00E676",
          red: "#FF4444",
          yellow: "#FFD700",
        },
      },
      fontFamily: {
        sans: ["'Amazon Ember'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
        display: ["'Space Grotesk'", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease forwards",
        "fade-in": "fadeIn 0.5s ease forwards",
        "pulse-orange": "pulseOrange 2s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
        scan: "scan 3s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "slide-right": "slideRight 0.4s ease forwards",
        "count-up": "countUp 0.3s ease forwards",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        pulseOrange: {
          "0%, 100%": { boxShadow: "0 0 10px #FF990040" },
          "50%": { boxShadow: "0 0 30px #FF990080, 0 0 60px #FF990030" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        glowPulse: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        slideRight: {
          "0%": { opacity: "0", transform: "translateX(-10px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        countUp: {
          "0%": { opacity: "0", transform: "scale(0.8)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "grid-pattern":
          "linear-gradient(rgba(255,153,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,153,0,0.05) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "60px 60px",
      },
    },
  },
  plugins: [],
};

export default config;
