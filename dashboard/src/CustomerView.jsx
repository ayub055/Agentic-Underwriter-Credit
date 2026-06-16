import { useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";
import JourneyExperience from "./journey/JourneyExperience.jsx";
import { caseFixtures } from "./data/caseFixtures.js";
import { mapCaseStateToView } from "./data/mapCaseState.js";
import realRunCaseState from "./data/realRun/caseState.json";

// "captured" replays the real pipeline run; the other two are synthetic
// fixtures kept to exercise the approved/review experiences.
const SCENARIOS = [
  { key: "captured", label: `Captured run · ${realRunCaseState.case_id}`, badge: "real data", cs: realRunCaseState },
  { key: "approved", label: "Approved", badge: "illustrative", cs: caseFixtures.approved },
  { key: "review", label: "Review", badge: "illustrative", cs: caseFixtures.review },
];

export default function CustomerView({ scenario = "captured", onScenarioChange }) {
  const active = SCENARIOS.find((s) => s.key === scenario) ?? SCENARIOS[0];
  const view = mapCaseStateToView(active.cs);
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  // Dead-end CTAs are demo boundaries, not bugs — say so instead of doing nothing.
  const boundary = (what) => () => {
    setToast(`Demo boundary — "${what}" hands off to the existing ${what} flow.`);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 3200);
  };
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <div>
      <ScenarioBar scenario={active.key} onChange={onScenarioChange} />
      <JourneyExperience
        key={active.key}
        view={view}
        onAcceptOffer={boundary("e-sign")}
        onEnablePush={boundary("notifications")}
        onViewDocs={boundary("document vault")}
        onChat={boundary("loan-expert chat")}
      />
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border border-slate-200 bg-surface/95 px-4 py-2.5 shadow-lg backdrop-blur animate-fade-up">
          <Info className="h-4 w-4 flex-shrink-0 text-progress-500" />
          <span className="text-xs font-medium text-slate-600">{toast}</span>
        </div>
      )}
    </div>
  );
}

function ScenarioBar({ scenario, onChange }) {
  return (
    <div className="border-b border-slate-200 bg-slate-100/90">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-3 px-4 py-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Scenario
        </span>
        <div className="flex flex-wrap gap-1 rounded-lg border border-slate-300 bg-surface p-1">
          {SCENARIOS.map((s) => (
            <button
              key={s.key}
              onClick={() => onChange?.(s.key)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition ${
                scenario === s.key ? "bg-primary-600 text-white" : "text-slate-500 hover:text-ink"
              }`}
            >
              {s.label}
              <span
                className={`rounded border px-1 py-px text-[9px] font-semibold uppercase ${
                  scenario === s.key
                    ? "border-white/40 text-white/90"
                    : s.badge === "real data"
                    ? "border-success-200 bg-success-50 text-success-700"
                    : "border-caution-200 bg-caution-50 text-caution-700"
                }`}
              >
                {s.badge}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
