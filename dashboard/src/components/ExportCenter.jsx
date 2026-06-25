import { useState } from "react";
import { FileSpreadsheet, FileText, FolderDown, Download, ExternalLink } from "lucide-react";
import ExcelPreviewModal from "./ExcelPreviewModal.jsx";

const BASE = import.meta.env.BASE_URL;

const TONE = {
  success: "bg-success-50 text-success-700",
  primary: "bg-primary-50 text-primary-700",
};

function ActionButton({ label, icon: Icon, primary, onClick }) {
  return (
    <button
      onClick={onClick}
      className={
        primary
          ? "inline-flex items-center gap-1.5 rounded-lg bg-success-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-success-700"
          : "inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-surface px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
      }
    >
      {Icon && <Icon className="h-3.5 w-3.5" />} {label}
    </button>
  );
}

// Single consolidated "everything you can download" panel, shown once the run
// completes. Excel rows open the on-screen preview modal (with a Download button
// inside); the HTML reports + CAM open/print directly.
export default function ExportCenter({ id, onOpenCam }) {
  const [excelBranch, setExcelBranch] = useState(null); // "banking" | "bureau" | null

  const openReport = (path) => window.open(`${BASE}${path}`, "_blank", "noopener");
  const printReport = (path) => {
    const w = window.open(`${BASE}${path}`, "_blank", "noopener");
    if (w) w.addEventListener("load", () => w.print());
  };

  const items = [
    {
      key: "banking-xlsx",
      icon: FileSpreadsheet,
      tone: "success",
      title: "Banking Analyser — Excel",
      sub: "9 sheets · cashflow, risk checks, merchants, transactions",
      actions: [{ label: "Preview & download", icon: FileSpreadsheet, primary: true, onClick: () => setExcelBranch("banking") }],
    },
    {
      key: "bureau-xlsx",
      icon: FileSpreadsheet,
      tone: "success",
      title: "Bureau Analyser — Excel",
      sub: "5 sheets · obligations, exposure, summary, narrative",
      actions: [{ label: "Preview & download", icon: FileSpreadsheet, primary: true, onClick: () => setExcelBranch("bureau") }],
    },
    {
      key: "banking-html",
      icon: FileText,
      tone: "primary",
      title: "Banking full report",
      sub: "Interactive HTML analyser report",
      actions: [{ label: "Open", icon: ExternalLink, onClick: () => openReport("reports/banking_agent_report.html") }],
    },
    {
      key: "bureau-html",
      icon: FileText,
      tone: "primary",
      title: "Bureau full report",
      sub: "Interactive HTML analyser report",
      actions: [{ label: "Open", icon: ExternalLink, onClick: () => openReport("reports/bureau_agent_report.html") }],
    },
    {
      key: "cam",
      icon: FileText,
      tone: "primary",
      title: "Credit Approval Memo (CAM)",
      sub: "Consolidated underwriting memo",
      actions: [
        { label: "Preview", icon: ExternalLink, primary: true, onClick: onOpenCam },
        { label: "PDF", icon: Download, onClick: () => printReport("reports/cam_report.html") },
      ],
    },
  ];

  return (
    <section
      id={id}
      className="scroll-mt-20 rounded-2xl border border-success-200 bg-surface p-5 shadow-sm animate-fade-up"
    >
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-success-600 text-white">
          <FolderDown className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-ink">Downloads &amp; exports</h2>
          <p className="text-[11px] text-slate-500">
            Everything from this run you can export — {items.length} artifacts ready
          </p>
        </div>
      </div>

      <ul className="divide-y divide-slate-100">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <li key={it.key} className="flex flex-wrap items-center gap-3 py-3">
              <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${TONE[it.tone]}`}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-ink">{it.title}</div>
                <div className="truncate text-[11px] text-slate-500">{it.sub}</div>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                {it.actions.map((a) => (
                  <ActionButton key={a.label} {...a} />
                ))}
              </div>
            </li>
          );
        })}
      </ul>

      <ExcelPreviewModal
        open={!!excelBranch}
        branchId={excelBranch}
        onClose={() => setExcelBranch(null)}
      />
    </section>
  );
}
