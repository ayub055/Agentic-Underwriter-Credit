// Client-side .xlsx export for the Banking and Bureau analysers. Builds a real
// multi-sheet workbook with SheetJS, one tab per report section, from the data
// bundled with the captured run. No backend.
//
// Two stages, deliberately split so the UI can show a preview before saving:
//   buildBankingSheets() / buildBureauSheets()  →  { filename, sheets:[{name,aoa}] }
//   downloadSheets(sheets, filename)            →  XLSX.writeFile save prompt
// The modal renders the same `sheets` on screen; its Download button calls
// downloadSheets(). The legacy exportBanking/exportBureau/exportBranch helpers
// build-and-download in one call for any caller that wants the old behaviour.

import * as XLSX from "xlsx";
import bankingReport from "../data/realRun/bankingReport.json";
import camModel from "../data/realRun/camModel.json";
import caseState from "../data/realRun/caseState.json";

const r2 = (n) => (typeof n === "number" ? Math.round(n * 100) / 100 : n);
const yn = (v) => (v === null || v === undefined ? "—" : v ? "Yes" : "No");
const dash = (v) => (v === null || v === undefined || v === "" ? "—" : v);
const pctOf = (v) => (typeof v === "number" ? `${r2(v * 100)}%` : "—");

// aoa builders
const kvAoa = (title, pairs) => [[title], [], ["Field", "Value"], ...pairs];
const tableAoa = (title, headers, rows) => [[title], [], headers, ...rows];

function autoCols(aoa) {
  const w = [];
  aoa.forEach((row) =>
    row.forEach((c, i) => {
      const len = c === null || c === undefined ? 0 : String(c).length;
      w[i] = Math.min(70, Math.max(w[i] || 10, len + 2));
    })
  );
  return w.map((wch) => ({ wch }));
}

// sheets = [{ name, aoa }] — assemble the workbook and trigger the save prompt.
export function downloadSheets(sheets, filename) {
  const wb = XLSX.utils.book_new();
  sheets.forEach(({ name, aoa }) => {
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = autoCols(aoa);
    XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
  });
  XLSX.writeFile(wb, filename);
}

const caseId = caseState.case_id || "case";

// ── Banking: the 9 top-nav sections of the banking report as sheets ──────────
export function buildBankingSheets() {
  const b = bankingReport;
  const m = b.meta || {};
  const sal = b.salary || {};
  const aq = b.account_quality || {};
  const cf = b.monthly_cashflow || [];
  const emis = b.emis || [];
  const totIn = cf.reduce((s, x) => s + (x.inflow || 0), 0);
  const totOut = cf.reduce((s, x) => s + (x.outflow || 0), 0);

  const overview = kvAoa("Banking — Overview", [
    ["Customer", dash(m.prty_name)],
    ["Customer ID", dash(m.customer_id)],
    ["Analysis Period", dash(m.analysis_period)],
    ["Currency", dash(m.currency)],
    ["Transactions Analysed", dash(m.transaction_count)],
    [],
    ["Avg Monthly Salary", r2(sal.avg_amount)],
    ["Salary Credits (count)", dash(sal.frequency)],
    ["Latest Salary", dash(sal.latest_transaction?.amount)],
    ["Account Type", dash(aq.account_type)],
    ["Primary Score", dash(aq.primary_score)],
    ["Confidence", dash(aq.confidence)],
    ["Avg Monthly Debits", dash(aq.avg_monthly_debits)],
    [],
    ["Total Inflow (6m)", totIn],
    ["Total Outflow (6m)", totOut],
    ["Net (6m)", totIn - totOut],
  ]);

  const checks = b.checklist?.banking || [];
  const riskChecks = tableAoa(
    "Banking — Risk Checks",
    ["Check", "Triggered", "Severity", "Detail"],
    [
      ...checks.map((c) => [dash(c.label), yn(c.checked), dash(c.severity), dash(c.detail)]),
      [],
      ["Account-quality flags"],
      ["EMI debits visible", yn(aq.has_emi_debits)],
      ["Utility debits visible", yn(aq.has_utility_debits)],
      ["Rent visible", yn(aq.has_rent_visible)],
      ["Small-ticket txns", yn(aq.has_small_ticket_txns)],
      ["ATM debit %", pctOf(aq.atm_debit_pct)],
      ["Salary outflow within 3d %", pctOf(aq.salary_outflow_pct_3d)],
    ]
  );

  const summary = kvAoa("Banking — Summary", [
    ["Avg Monthly Salary", r2(sal.avg_amount)],
    ["Salary Narration", dash(sal.narration)],
    ["Latest Salary Amount", dash(sal.latest_transaction?.amount)],
    ["Latest Salary Date", dash(sal.latest_transaction?.date)],
    ["Account Type", dash(aq.account_type)],
    ["Primary Score", dash(aq.primary_score)],
    ["Confidence", dash(aq.confidence)],
    ["Observation", (aq.observations || []).join(" ") || "—"],
    ["Total Inflow (6m)", totIn],
    ["Total Outflow (6m)", totOut],
    ["Net Cashflow (6m)", totIn - totOut],
  ]);

  const cashflow = tableAoa(
    "Banking — Cashflow",
    ["Month", "Inflow", "Outflow", "Net"],
    [...cf.map((x) => [x.month, x.inflow, x.outflow, x.net]), ["Total", totIn, totOut, totIn - totOut]]
  );

  const cat = b.category_overview || {};
  const conc = b.merchant_features?.concentration || {};
  const analysis = [
    ["Banking — Analysis"],
    [],
    ["Category Spend Mix"],
    ["Category", "Amount"],
    ...Object.entries(cat).map(([k, v]) => [k, v]),
    [],
    ["Merchant Concentration"],
    ["Metric", "Value"],
    ["HHI", dash(conc.hhi)],
    ["Top-1 %", dash(conc.top_1_pct)],
    ["Top-3 %", dash(conc.top_3_pct)],
    ["Total Merchants", dash(conc.total_merchants)],
  ];

  const recRows = emis.map((e) => {
    const ds = e.dates || [];
    return [dash(e.name), e.amount, dash(e.frequency), ds[0] || "—", ds[ds.length - 1] || "—"];
  });
  const recurring = tableAoa(
    "Banking — Recurring Debits",
    ["Name", "Amount", "Frequency", "First Seen", "Last Seen"],
    !b.bills && !b.rent
      ? [...recRows, [], ["Note", "Recurring bills/rent not detected for this run"]]
      : recRows
  );

  const loans = tableAoa(
    "Banking — Loan Activity",
    ["Name", "EMI Amount", "Frequency", "Sample Narration"],
    emis.map((e) => [dash(e.name), e.amount, dash(e.frequency), dash(e.sample_transaction?.narration)])
  );

  const tm = b.top_merchants || [];
  const remitters = tableAoa(
    "Banking — Top Remitters",
    ["Merchant", "Type", "Count", "Total", "Avg", "Score"],
    tm.map((x) => [dash(x.name), dash(x.type), x.count, x.total, r2(x.avg), r2(x.score)])
  );

  const txRows = [];
  if (sal.latest_transaction)
    txRows.push(["Salary", sal.latest_transaction.date, sal.latest_transaction.amount, "C", sal.latest_transaction.narration]);
  emis.forEach((e) => {
    const s = e.sample_transaction;
    if (s) txRows.push(["EMI / Recurring", s.date, s.amount, s.direction || "D", s.narration || e.name]);
  });
  (b.events || []).forEach((ev) => txRows.push(["Event", ev.date, ev.amount, "—", ev.description]));
  const transactions = [
    ["Banking — Transactions (sample)"],
    [`Total analysed: ${m.transaction_count} · representative sample (source has no full ledger)`],
    [],
    ["Source", "Date", "Amount", "Dir", "Narration"],
    ...txRows,
  ];

  return {
    filename: `banking_report_${caseId}.xlsx`,
    sheets: [
      { name: "Overview", aoa: overview },
      { name: "Risk Checks", aoa: riskChecks },
      { name: "Summary", aoa: summary },
      { name: "Cashflow", aoa: cashflow },
      { name: "Analysis", aoa: analysis },
      { name: "Recurring", aoa: recurring },
      { name: "Loan Activity", aoa: loans },
      { name: "Top Remitters", aoa: remitters },
      { name: "Transactions", aoa: transactions },
    ],
  };
}

// ── Bureau: built from bundled data (CAM obligations + bureau summary) ────────
export function buildBureauSheets() {
  const o = camModel.obligations || {};
  const bs = caseState.branches?.bureau?.summary || {};

  const summary = kvAoa("Bureau — Summary", [
    ["CIBIL Score", dash(bs.cibil_score)],
    ["Bureau Persona", dash(bs.bureau_persona)],
    ["Risk Grade", dash(bs.bureau_risk_grade)],
    ["NPA Flag", yn(bs.npa_flag)],
    ["Total Exposure", dash(bs.total_exposure)],
    ["Max DPD (overall)", dash(bs.max_dpd_overall)],
    ["Max DPD (unsecured)", dash(bs.max_dpd_unsecured)],
    ["Enquiries", dash(bs.enq_count)],
  ]);

  const obs = o.obligations || [];
  const obligations = tableAoa(
    "Bureau — Obligations",
    [
      "Loan Type", "Secured", "Loans", "Live", "Closed", "Sanctioned", "Outstanding",
      "Overdue", "Max DPD", "Delinquent", "Utilization", "Avg Vintage (mo)",
      "Earliest", "Latest", "On-us Count", "On-us Outstanding",
    ],
    obs.map((x) => [
      dash(x.loan_type), yn(x.secured), x.loan_count, x.live_count, x.closed_count,
      x.total_sanctioned, x.total_outstanding, x.overdue_amount, dash(x.max_dpd),
      yn(x.delinquency_flag), x.utilization_ratio, x.avg_vintage_months,
      dash(x.earliest_opened), dash(x.latest_opened), x.on_us_count, x.on_us_outstanding,
    ])
  );

  const t = o.totals || {};
  const totals = kvAoa(
    "Bureau — Totals",
    Object.entries(t).map(([k, v]) => [k, typeof v === "boolean" ? yn(v) : dash(v)])
  );

  const me = o.monthly_exposure || {};
  const seriesKeys = Object.keys(me.series || {});
  const monthlyExp = tableAoa(
    "Bureau — Monthly Exposure",
    ["Month", ...seriesKeys, "Total"],
    (me.months || []).map((mo, i) => {
      const vals = seriesKeys.map((k) => (me.series[k] || [])[i] ?? 0);
      return [mo, ...vals, vals.reduce((s, v) => s + (v || 0), 0)];
    })
  );

  const narr = (o.narrative || "").match(/.{1,90}(\s|$)/g) || [];
  const narrative = [["Bureau — Narrative"], [], ...narr.map((line) => [line.trim()])];

  return {
    filename: `bureau_report_${caseId}.xlsx`,
    sheets: [
      { name: "Summary", aoa: summary },
      { name: "Obligations", aoa: obligations },
      { name: "Totals", aoa: totals },
      { name: "Monthly Exposure", aoa: monthlyExp },
      { name: "Narrative", aoa: narrative },
    ],
  };
}

// Build only — returns { filename, sheets } for the on-screen preview modal.
export function buildBranchExcel(branchId) {
  return branchId === "banking" ? buildBankingSheets() : buildBureauSheets();
}

// Build + download in one call (legacy direct-save behaviour).
export function exportBanking() {
  const { sheets, filename } = buildBankingSheets();
  downloadSheets(sheets, filename);
}

export function exportBureau() {
  const { sheets, filename } = buildBureauSheets();
  downloadSheets(sheets, filename);
}

export function exportBranch(branchId) {
  const { sheets, filename } = buildBranchExcel(branchId);
  downloadSheets(sheets, filename);
}
