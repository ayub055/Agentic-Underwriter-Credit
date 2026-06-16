import { useState } from "react";
import { Workflow, UserRound } from "lucide-react";
import BackendJourney from "./backend/BackendJourney.jsx";
import CustomerView from "./CustomerView.jsx";
import { ThemeProvider } from "./lib/theme.jsx";
import BrandMark from "./components/BrandMark.jsx";
import ThemeSwitch from "./components/ThemeSwitch.jsx";

const VIEWS = [
  { key: "backend", label: "Backend · Agentic Journey", icon: Workflow },
  { key: "customer", label: "Customer · Journey", icon: UserRound },
];

export default function App() {
  const [appView, setAppView] = useState("backend");
  const [scenario, setScenario] = useState("captured");

  // Backend completion CTA: jump to the customer lens of the same captured case.
  const seeCustomer = () => {
    setScenario("captured");
    setAppView("customer");
  };

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
