import { Landmark } from "lucide-react";
import TrustBadge from "./TrustBadge.jsx";

export default function Header({ applicationId }) {
  return (
    <header className="mb-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
          <Landmark className="h-5 w-5" strokeWidth={2} />
        </div>
        <div>
          <div className="text-sm font-semibold tracking-tight text-ink">Kotak AI</div>
          <div className="text-xs text-slate-500">
            Application <span className="tabular-nums">{applicationId}</span>
          </div>
        </div>
      </div>
      <TrustBadge />
    </header>
  );
}
