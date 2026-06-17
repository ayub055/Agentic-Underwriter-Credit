import {
  BadgeCheck,
  Briefcase,
  Check,
  CheckCircle2,
  Fingerprint,
  Layers,
  Link2,
  Loader2,
  Mail,
  MapPinned,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

// Compact intake-verification callout, anchored above the Intake node. One check
// is spotlighted (verifying) at a time; as each completes it drops into the list
// box below. Pace synced to the intake stage's playback progress (0..1).
const CHECKS = [
  { id: "karza", label: "PAN · Karza", icon: ShieldCheck },
  { id: "kyc", label: "KYC", icon: BadgeCheck },
  { id: "aadhaar", label: "Aadhaar", icon: Fingerprint },
  { id: "pan_aadhaar", label: "PAN–Aadhaar", icon: Link2 },
  { id: "email", label: "Email", icon: Mail },
  { id: "mobile", label: "Mobile OTP", icon: Smartphone },
  { id: "dedupe", label: "De-dupe", icon: Layers },
  { id: "neg_address", label: "Negative address", icon: ShieldAlert },
  { id: "employment", label: "Employment", icon: Briefcase },
  { id: "address", label: "Address", icon: MapPinned },
];

export default function IntakeChecksCallout({ progress = 0 }) {
  const total = CHECKS.length;
  const done = Math.min(Math.floor(Math.max(progress, 0) * total), total);
  const current = done < total ? CHECKS[done] : null;
  const CurIcon = current?.icon;
  const completed = CHECKS.slice(0, done);

  return (
    <div className="w-72 rounded-xl border border-slate-200 bg-surface p-3 shadow-xl">
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute h-full w-full rounded-full bg-agent-500 motion-safe:animate-ping" />
          <span className="relative h-1.5 w-1.5 rounded-full bg-agent-600" />
        </span>
        Intake · verifying
        <span className="ml-auto tabular-nums text-slate-400">
          {done}/{total}
        </span>
      </div>

      {/* focal: the check currently being verified */}
      <div className="flex items-center gap-2 rounded-lg bg-agent-50/70 px-2 py-1.5">
        {current ? (
          <div key={current.id} className="flex items-center gap-2 animate-fade-up">
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-surface text-agent-600 ring-1 ring-agent-200">
              <CurIcon className="h-4 w-4" strokeWidth={2} />
            </span>
            <div className="leading-tight">
              <div className="text-xs font-semibold text-ink">{current.label}</div>
              <div className="flex items-center gap-1 text-[10px] text-agent-600">
                <Loader2 className="h-3 w-3 motion-safe:animate-spin" strokeWidth={2.5} /> Verifying…
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-success-700 animate-fade-up">
            <CheckCircle2 className="h-4 w-4" strokeWidth={2.2} />
            <span className="text-xs font-semibold">All checks passed</span>
          </div>
        )}
      </div>

      {/* the box: completed checks accumulate here */}
      <div className="mt-2 flex max-h-20 flex-wrap content-start gap-1 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50/60 p-1.5">
        {completed.length === 0 ? (
          <span className="text-[10px] italic text-slate-400">verified checks collect here…</span>
        ) : (
          completed.map((c) => (
            <span
              key={c.id}
              className="flex items-center gap-1 rounded-full border border-success-200 bg-success-50 px-1.5 py-px text-[10px] font-medium text-success-700 animate-fade-up"
            >
              {c.label}
              <Check className="h-2.5 w-2.5" strokeWidth={3} />
            </span>
          ))
        )}
      </div>
    </div>
  );
}
