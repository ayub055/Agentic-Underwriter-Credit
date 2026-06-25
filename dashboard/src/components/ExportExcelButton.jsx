import { useState } from "react";
import { FileSpreadsheet } from "lucide-react";
import ExcelPreviewModal from "./ExcelPreviewModal.jsx";

// "Excel" — shown on the Banking/Bureau analyser cards everywhere they render.
// Click opens an on-screen preview of the workbook (one tab per report section);
// the Download button lives inside that modal.
export default function ExportExcelButton({ branchId, small = false }) {
  const [open, setOpen] = useState(false);

  const onClick = (e) => {
    e.stopPropagation();
    setOpen(true);
  };

  return (
    <>
      <button
        onClick={onClick}
        title="Preview & export as Excel (.xlsx)"
        className={
          small
            ? "inline-flex flex-shrink-0 items-center gap-1 rounded-md border border-success-200 bg-success-50 px-1.5 py-0.5 text-[10px] font-semibold text-success-700 transition hover:bg-success-100"
            : "inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-success-200 bg-success-50 px-2.5 py-1 text-xs font-semibold text-success-700 transition hover:bg-success-100"
        }
      >
        <FileSpreadsheet className={small ? "h-3 w-3" : "h-3.5 w-3.5"} />
        Excel
      </button>
      <ExcelPreviewModal open={open} branchId={branchId} onClose={() => setOpen(false)} />
    </>
  );
}
