import { useEffect, useState } from "react";
import { FileText, Download, X } from "lucide-react";

const CAM_URL = `${import.meta.env.BASE_URL}reports/cam_report.html`;

// Slides up + pulses once when the journey completes. Auto-dismisses after ~9s;
// the persistent "Open CAM" button on the VerdictCard is the durable entry point.
export default function CamReadyToast({ caseId, onPreview }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShow(false), 9000);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  const downloadPdf = () => {
    const w = window.open(CAM_URL, "_blank", "noopener");
    if (w) w.addEventListener("load", () => w.print());
  };

  return (
    <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 animate-fade-up">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-surface px-4 py-3 shadow-xl animate-pulse-ring">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
          <FileText className="h-4 w-4" />
        </div>
        <div className="mr-1">
          <div className="text-sm font-semibold text-ink">CAM ready</div>
          <div className="text-[11px] text-slate-500">{caseId}</div>
        </div>
        <button onClick={onPreview} className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-700">
          Preview
        </button>
        <button onClick={downloadPdf} className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-surface px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50">
          <Download className="h-3.5 w-3.5" /> PDF
        </button>
        <button onClick={() => setShow(false)} className="rounded-md p-1 text-slate-400 transition hover:text-slate-600">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
