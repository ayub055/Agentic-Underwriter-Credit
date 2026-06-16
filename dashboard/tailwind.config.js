/** @type {import('tailwindcss').Config} */

// Colors resolve through CSS variables (src/index.css) so the same utility
// classes (bg-primary-600, text-ink, bg-white, border-slate-200, …) re-skin
// across themes (modern/premium) and modes (light/dark). Channels are
// space-separated RGB so `<alpha-value>` opacity modifiers keep working.
const v = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

const ramp = (key, steps) =>
  Object.fromEntries(steps.map((s) => [s, v(`${key}-${s}`)]));

export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        canvas: v("canvas"),
        surface: v("surface"),
        ink: v("ink"),
        // `white` stays true #fff so text-white survives dark mode; `night` is an
        // always-dark constant for terminals, tooltips and overlays.
        night: "#0b1220",
        slate: ramp("slate", [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]),
        primary: ramp("primary", [50, 100, 200, 400, 500, 600, 700, 900]),
        success: ramp("success", [50, 100, 200, 500, 600, 700]),
        progress: ramp("progress", [50, 100, 200, 400, 500, 600]),
        caution: ramp("caution", [50, 100, 200, 400, 500, 700]),
        danger: ramp("danger", [50, 100, 200, 300, 500, 600, 700]),
        agent: ramp("agent", [50, 100, 200, 300, 400, 500, 600, 700]),
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Deliberate scale; micro floor raised to 10px for legibility.
        micro: ["0.625rem", { lineHeight: "0.875rem", letterSpacing: "0.04em" }], // 10px
        caption: ["0.6875rem", { lineHeight: "1rem" }], // 11px
        "title-sm": ["0.95rem", { lineHeight: "1.3rem", fontWeight: "600" }],
        title: ["1.125rem", { lineHeight: "1.55rem", letterSpacing: "-0.01em" }],
        h2: ["1.5rem", { lineHeight: "1.9rem", letterSpacing: "-0.015em" }],
        h1: ["2rem", { lineHeight: "2.4rem", letterSpacing: "-0.02em" }],
        display: ["2.75rem", { lineHeight: "3rem", letterSpacing: "-0.025em" }],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      boxShadow: {
        sm: "var(--elev-1)",
        DEFAULT: "var(--elev-1)",
        md: "var(--elev-2)",
        lg: "var(--elev-3)",
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
        scan: {
          "0%": { top: "0%", opacity: "0" },
          "15%": { opacity: "0.9" },
          "85%": { opacity: "0.9" },
          "100%": { top: "100%", opacity: "0" },
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
        scan: "scan 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
