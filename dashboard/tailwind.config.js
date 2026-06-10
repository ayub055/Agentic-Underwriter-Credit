/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Cool slate ink to match bank_report_v2 (--ink:#0f172a).
        ink: "#0f172a",
        // Brand accent: indigo (report --indigo:#6366f1 / --indigo-deep:#4338ca).
        primary: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          900: "#1e1b4b",
        },
        // Status — emerald / blue / amber (report --green / --amber + status chips).
        success: { 50: "#ecfdf5", 100: "#d1fae5", 200: "#a7f3d0", 500: "#10b981", 600: "#059669", 700: "#047857" },
        progress: { 50: "#eff6ff", 100: "#dbeafe", 200: "#bfdbfe", 400: "#60a5fa", 500: "#3b82f6", 600: "#2563eb" },
        caution: { 50: "#fffbeb", 100: "#fef3c7", 200: "#fde68a", 400: "#fbbf24", 500: "#f59e0b", 700: "#b45309" },
        // AI "agent" accent: a distinct violet/purple, separated from brand indigo.
        agent: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        slide: {
          "0%": { transform: "translateX(-110%)" },
          "100%": { transform: "translateX(360%)" },
        },
        flow: {
          "0%": { left: "0%", opacity: "0" },
          "15%": { opacity: "1" },
          "85%": { opacity: "1" },
          "100%": { left: "100%", opacity: "0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        pop: {
          "0%": { opacity: "0", transform: "scale(.6)" },
          "70%": { transform: "scale(1.08)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(124,58,237,.40)" },
          "100%": { boxShadow: "0 0 0 12px rgba(124,58,237,0)" },
        },
      },
      animation: {
        slide: "slide 1.6s ease-in-out infinite",
        flow: "flow 1.3s linear infinite",
        "fade-up": "fade-up .5s cubic-bezier(.16,1,.3,1) both",
        "fade-in": "fade-in .4s ease both",
        pop: "pop .35s cubic-bezier(.16,1,.3,1) both",
        shimmer: "shimmer 1.8s linear infinite",
        "pulse-ring": "pulse-ring 1.6s cubic-bezier(.4,0,.6,1) infinite",
      },
    },
  },
  plugins: [],
};
