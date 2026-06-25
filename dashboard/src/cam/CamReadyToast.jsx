import { useEffect, useState } from "react";
import { FolderDown, X } from "lucide-react";

// Slides up + pulses once when the journey completes — the automatic prompt that
// makes the user aware everything is exportable. Its primary action scrolls to
// the Downloads & exports panel; CAM preview stays one click away. Auto-dismisses
// after ~10s (the Export Center + VerdictCard remain the durable entry points).
export default function CamReadyToast({ caseId, onViewExports, onPreview }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShow(false), 10000);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  const viewExports = () => {
    onViewExports?.();
    setShow(false);
  };

  return (
    <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 animate-fade-up">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-surface px-4 py-3 shadow-xl animate-pulse-ring">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success-600 text-white">
          <FolderDown className="h-4 w-4" />
        </div>
        <div className="mr-1">
          <div className="text-sm font-semibold text-ink">Reports ready to download</div>
          <div className="text-[11px] text-slate-500">{caseId} · Excel, full reports &amp; CAM</div>
        </div>
        <button
          onClick={viewExports}
          className="rounded-lg bg-success-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-success-700"
        >
          View downloads
        </button>
        <button
          onClick={onPreview}
          className="rounded-lg border border-slate-300 bg-surface px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
        >
          Preview CAM
        </button>
        <button onClick={() => setShow(false)} className="rounded-md p-1 text-slate-400 transition hover:text-slate-600">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
