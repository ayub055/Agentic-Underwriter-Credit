import { useState } from "react";
import JourneyExperience from "./journey/JourneyExperience.jsx";
import { caseFixtures } from "./data/caseFixtures.js";
import { mapCaseStateToView } from "./data/mapCaseState.js";

const STATES = [
  { key: "approved", label: "Approved" },
  { key: "review", label: "Review" },
  { key: "rejected", label: "Rejected" },
];

const noop = () => {};

export default function CustomerView() {
  const [status, setStatus] = useState("approved");
  const view = mapCaseStateToView(caseFixtures[status]);

  return (
    <div>
      <DevToggle status={status} onChange={setStatus} />
      <JourneyExperience
        view={view}
        onAcceptOffer={noop}
        onEnablePush={noop}
        onViewDocs={noop}
        onChat={noop}
      />
    </div>
  );
}

function DevToggle({ status, onChange }) {
  return (
    <div className="border-b border-slate-200 bg-slate-100/90">
      <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Dev · API status
        </span>
        <div className="flex gap-1 rounded-lg border border-slate-300 bg-white p-1">
          {STATES.map((s) => (
            <button
              key={s.key}
              onClick={() => onChange(s.key)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                status === s.key ? "bg-primary-600 text-white" : "text-slate-500 hover:text-ink"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
