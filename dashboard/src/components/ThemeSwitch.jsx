import { Moon, Sun, Sparkles } from "lucide-react";
import { useTheme } from "../lib/theme.jsx";

// Compact control for the nav: Modern ↔ Premium segmented + a light/dark toggle.
export default function ThemeSwitch() {
  const { theme, mode, setTheme, toggleMode } = useTheme();
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
        {[
          ["modern", "Modern"],
          ["premium", "Premium"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTheme(key)}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-micro font-semibold uppercase tracking-wide transition ${
              theme === key ? "bg-primary-600 text-white" : "text-slate-500 hover:text-ink"
            }`}
          >
            {key === "premium" && <Sparkles className="h-3 w-3" />}
            {label}
          </button>
        ))}
      </div>
      <button
        onClick={toggleMode}
        aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-surface text-slate-500 transition hover:text-ink"
      >
        {mode === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}
