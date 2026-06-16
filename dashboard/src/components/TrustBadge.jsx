import { ShieldCheck } from "lucide-react";

export default function TrustBadge() {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-surface px-3 py-1.5">
      <ShieldCheck className="h-3.5 w-3.5 text-primary-600" strokeWidth={2.2} />
      <span className="text-[11px] font-medium text-slate-500">
        Bank-grade 256-bit encryption
      </span>
    </div>
  );
}
