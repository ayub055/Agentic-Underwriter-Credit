import { createContext, useContext, useEffect, useState } from "react";

// Theme = visual language (modern indigo ↔ premium Kotak navy/crimson).
// Mode = light ↔ dark. Both are written to <html> as data-attributes so the
// CSS-variable token layer (src/index.css) re-skins every surface at once.

const ThemeContext = createContext(null);
const KEY = "cj-theme";

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "{}");
    return { theme: raw.theme ?? "modern", mode: raw.mode ?? "light" };
  } catch {
    return { theme: "modern", mode: "light" };
  }
}

export function ThemeProvider({ children }) {
  const [{ theme, mode }, setState] = useState(load);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.setAttribute("data-mode", mode);
    try {
      localStorage.setItem(KEY, JSON.stringify({ theme, mode }));
    } catch {
      /* private mode */
    }
  }, [theme, mode]);

  const setTheme = (next) =>
    // Premium leans cinematic → default it to dark the first time it's chosen;
    // the user can still flip the mode afterwards.
    setState((s) => ({ theme: next, mode: next === "premium" && s.theme !== "premium" ? "dark" : s.mode }));
  const setMode = (next) => setState((s) => ({ ...s, mode: next }));
  const toggleMode = () => setState((s) => ({ ...s, mode: s.mode === "dark" ? "light" : "dark" }));

  return (
    <ThemeContext.Provider value={{ theme, mode, setTheme, setMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
