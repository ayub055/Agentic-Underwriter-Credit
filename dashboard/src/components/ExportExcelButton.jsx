import { useState } from "react";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { exportBranch } from "../lib/exportExcel.js";

// "Export as Excel" — shown on the Banking/Bureau analyser cards everywhere they
// render. Click builds the multi-sheet .xlsx client-side and prompts a download.
export default function ExportExcelButton({ branchId, small = false }) {
  const [busy, setBusy] = useState(false);
  const onClick = (e) => {
    e.stopPropagation();
    setBusy(true);
    // let the spinner paint before the (sync) workbook build + download
    setTimeout(() => {
      try {
        exportBranch(branchId);
      } finally {
        setBusy(false);
      }
    }, 0);
  };

  const Icon = busy ? Loader2 : FileSpreadsheet;
  return (
    <button
      onClick={onClick}
      title="Export as Excel (.xlsx)"
      className={
        small
          ? "inline-flex flex-shrink-0 items-center gap-1 rounded-md border border-success-200 bg-success-50 px-1.5 py-0.5 text-[10px] font-semibold text-success-700 transition hover:bg-success-100"
          : "inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-success-200 bg-success-50 px-2.5 py-1 text-xs font-semibold text-success-700 transition hover:bg-success-100"
      }
    >
      <Icon className={`${small ? "h-3 w-3" : "h-3.5 w-3.5"} ${busy ? "motion-safe:animate-spin" : ""}`} />
      Excel
    </button>
  );
}
