import { useState } from "react";
import { Workflow, UserRound } from "lucide-react";
import BackendJourney from "./backend/BackendJourney.jsx";
import CustomerView from "./CustomerView.jsx";

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
    <div className="min-h-screen bg-[#f6f7fb] font-sans text-ink">
      <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600 text-white">
              <Workflow className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-ink">Kotak AI : Underwriting Agent</span>
          </div>
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
        </div>
      </nav>

      {appView === "backend" ? (
        <BackendJourney onSeeCustomer={seeCustomer} />
      ) : (
        <CustomerView scenario={scenario} onScenarioChange={setScenario} />
      )}
    </div>
  );
}
