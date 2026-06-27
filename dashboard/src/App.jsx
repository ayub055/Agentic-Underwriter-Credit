import { useState } from "react";
import { Workflow, UserRound, MonitorPlay, Share2 } from "lucide-react";
import BackendJourney from "./backend/BackendJourney.jsx";
import CustomerView from "./CustomerView.jsx";
import Cockpit from "./Cockpit.jsx";
import FlowDemo from "./FlowDemo.jsx";
import { ThemeProvider } from "./lib/theme.jsx";
import BrandMark from "./components/BrandMark.jsx";
import ThemeSwitch from "./components/ThemeSwitch.jsx";

const VIEWS = [
  { key: "backend", label: "Backend · Credit Journey", icon: Workflow },
  { key: "customer", label: "Customer · Journey", icon: UserRound },
  { key: "cockpit", label: "Single-page Demo", icon: MonitorPlay },
  { key: "flow", label: "Flow Demo", icon: Share2 },
];

// Initial tab from the URL hash so the demo views are deep-linkable:
//   #at=<n> → Flow Demo, #ch=<n> → Single-page cockpit.
function initialView() {
  const h = typeof window !== "undefined" ? window.location.hash : "";
  if (/(\bflow\b|at=)/.test(h)) return "flow";
  if (/(\bcockpit\b|ch=)/.test(h)) return "cockpit";
  return "backend";
}

export default function App() {
  const [appView, setAppView] = useState(initialView);
  const [scenario, setScenario] = useState("captured");

  // Backend completion CTA: jump to the customer lens of the same captured case.
  const seeCustomer = () => {
    setScenario("captured");
    setAppView("customer");
  };

  // The single-page cockpit owns the full screen (its own top bar) — render it
  // standalone, with a way back to the classic tabbed views.
  if (appView === "cockpit") {
    return (
      <ThemeProvider>
        <Cockpit onExit={() => setAppView("backend")} />
      </ThemeProvider>
    );
  }

  if (appView === "flow") {
    return (
      <ThemeProvider>
        <FlowDemo onExit={() => setAppView("backend")} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-canvas font-sans text-ink">
        <nav className="sticky top-0 z-30 border-b border-slate-200 bg-surface/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
            <BrandMark size="sm" subtitle="Underwriting Agent" />
            <div className="flex items-center gap-2">
              <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
                {VIEWS.map((v) => {
                  const Icon = v.icon;
                  return (
                    <button
                      key={v.key}
                      onClick={() => setAppView(v.key)}
                      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                        appView === v.key ? "bg-primary-600 text-white" : "text-slate-500 hover:text-ink"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{v.label}</span>
                    </button>
                  );
                })}
              </div>
              <ThemeSwitch />
            </div>
          </div>
        </nav>

        {appView === "backend" ? (
          <BackendJourney onSeeCustomer={seeCustomer} />
        ) : (
          <CustomerView scenario={scenario} onScenarioChange={setScenario} />
        )}
      </div>
    </ThemeProvider>
  );
}
