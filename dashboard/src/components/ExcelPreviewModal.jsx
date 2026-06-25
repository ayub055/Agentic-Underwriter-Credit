import { useEffect, useMemo, useState } from "react";
import { FileSpreadsheet, Download, X } from "lucide-react";
import { buildBranchExcel, downloadSheets } from "../lib/exportExcel.js";

// 0 → A, 25 → Z, 26 → AA … spreadsheet-style column labels.
function colLabel(i) {
  let s = "";
  i += 1;
  while (i > 0) {
    s = String.fromCharCode(65 + ((i - 1) % 26)) + s;
    i = Math.floor((i - 1) / 26);
  }
  return s;
}

function fmtCell(v) {
  if (v === null || v === undefined) return "";
  if (typeof v === "number")
    return Number.isInteger(v)
      ? v.toLocaleString()
      : v.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return String(v);
}

// On-screen preview of the .xlsx that ExportExcelButton would save. Renders the
// already-built sheets (one tab each) as an Excel-like grid; the header has the
// actual Download button. Used for both the Banking and Bureau analysers.
export default function ExcelPreviewModal({ open, branchId, onClose }) {
  const built = useMemo(
    () => (open && branchId ? buildBranchExcel(branchId) : null),
    [open, branchId]
  );
  const [active, setActive] = useState(0);

  // jump back to the first sheet whenever a different workbook opens
  useEffect(() => {
    setActive(0);
  }, [branchId, open]);

  // Esc closes the modal
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !built) return null;

  const sheets = built.sheets;
  const title = branchId === "banking" ? "Banking Analyser" : "Bureau Analyser";
  const sheet = sheets[active] || { name: "", aoa: [] };
  const ncols = sheet.aoa.reduce((m, r) => Math.max(m, r.length), 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-night/40 p-4 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        // modal lives inside the card's DOM subtree — don't let backdrop clicks
        // bubble up to the card / node selection handlers.
        e.stopPropagation();
        onClose();
      }}
      role="dialog"
      aria-label={`${title} Excel preview`}
    >
      <div
        className="flex h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-surface shadow-xl animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header — title + Download + close */}
        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-3.5">
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-success-50 text-success-700">
            <FileSpreadsheet className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-ink">{title} — Excel preview</div>
            <div className="truncate text-xs text-slate-500">
              {built.filename} · {sheets.length} sheet{sheets.length === 1 ? "" : "s"}
            </div>
          </div>
          <button
            onClick={() => downloadSheets(sheets, built.filename)}
            className="ml-auto inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-success-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-success-700"
          >
            <Download className="h-3.5 w-3.5" /> Download .xlsx
          </button>
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-ink"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* sheet tabs */}
        <div className="flex flex-shrink-0 gap-1 overflow-x-auto border-b border-slate-200 bg-slate-50 px-3 py-2">
          {sheets.map((s, i) => (
            <button
              key={s.name}
              onClick={() => setActive(i)}
              className={`whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium transition ${
                i === active ? "bg-success-600 text-white" : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>

        {/* spreadsheet grid */}
        <div className="flex-1 overflow-auto bg-white">
          <table className="border-collapse text-[12px]">
            <thead>
              <tr>
                <th className="sticky left-0 top-0 z-20 border border-slate-200 bg-slate-100" />
                {Array.from({ length: ncols }).map((_, c) => (
                  <th
                    key={c}
                    className="sticky top-0 z-10 min-w-[96px] border border-slate-200 bg-slate-100 px-2 py-1 text-center text-[10px] font-semibold text-slate-400"
                  >
                    {colLabel(c)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sheet.aoa.map((row, r) => (
                <tr key={r}>
                  <td className="sticky left-0 z-10 border border-slate-200 bg-slate-100 px-2 py-1 text-center text-[10px] font-semibold text-slate-400">
                    {r + 1}
                  </td>
                  {Array.from({ length: ncols }).map((_, c) => {
                    const v = row[c];
                    const num = typeof v === "number";
                    return (
                      <td
                        key={c}
                        className={`max-w-[360px] border border-slate-200 px-2 py-1 align-top ${
                          num ? "text-right tabular-nums text-ink" : "text-slate-700"
                        } ${r === 0 ? "font-semibold text-ink" : ""}`}
                      >
                        {fmtCell(v)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* footer */}
        <div className="flex-shrink-0 border-t border-slate-200 px-5 py-2 text-[11px] text-slate-400">
          Preview of the workbook that will be saved · press Esc to close
        </div>
      </div>
    </div>
  );
}
