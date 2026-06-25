// Live, build-time extraction of the analyser reports' narration + figures.
//
// `virtual:report-data` is produced by the reportData() plugin in vite.config.js:
// at build (and on dev-server file change) it reads public/reports/*.html, runs
// the pure parsers in reportParse.js, and emits ONLY the small parsed objects —
// so the demo's after-run narration tracks the actual report files without
// bundling the multi-MB HTML. If a report is missing it parses to { ok:false }
// and callers fall back to their static defaults.

// eslint-disable-next-line import/no-unresolved
import { BANKING_REPORT, BUREAU_REPORT } from "virtual:report-data";
import { sentences } from "./reportParse.js";

export { BANKING_REPORT, BUREAU_REPORT };

export const bankingExcerpt = (n = 3) => sentences(BANKING_REPORT.summary, n);
export const bureauExcerpt = (n = 3) => sentences(BUREAU_REPORT.summary, n);
