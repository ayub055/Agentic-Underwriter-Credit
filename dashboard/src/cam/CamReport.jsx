import { useState } from "react";
import { X, Download, ExternalLink, FileText } from "lucide-react";
import camModel from "../data/realRun/camModel.json";
import { formatINR, emDash } from "../lib/format.js";
import { provPill } from "../lib/tones.js";
import Sparkline from "../journey/Sparkline.jsx";

const PROV_SEG = {
  real: "bg-success-500",
  derived: "bg-progress-500",
  mock: "bg-slate-400",
  placeholder: "bg-caution-500",
};

// The canonical, print-ready artifact finalize wrote into the audit pack and
// capture copied into public/reports. Preview renders camModel natively; the PDF
// action opens this file (its @media print CSS makes the browser export clean A4).
const CAM_URL = `${import.meta.env.BASE_URL}reports/cam_report.html`;

const pct = (frac) => (frac === null || frac === undefined ? emDash : `${(frac * 100).toFixed(2)}%`);
const num = (v) => (v === null || v === undefined ? emDash : String(v));
const yn = (v) => (v === null || v === undefined ? emDash : v ? "Yes" : "No");
const monthLabel = (ym) => {
  if (!ym) return emDash;
  const [y, m] = String(ym).split("-");
  const names = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return m ? `${names[+m] ?? m} '${(y ?? "").slice(2)}` : ym;
};

function Chip({ k, model }) {
  const p = model.provenance?.[k];
  if (!p) return null;
  return (
    <span className={`ml-1 rounded border px-1.5 py-px text-[9px] font-bold uppercase tracking-wide ${provPill[p] ?? provPill.placeholder}`}>
      {p}
    </span>
  );
}

function Row({ label, value, k, model }) {
  return (
    <div className="flex items-baseline gap-2 border-b border-dashed border-slate-100 py-1.5">
      <span className="w-44 flex-shrink-0 text-xs text-slate-500">{label}</span>
      <span className="text-sm font-semibold tabular-nums text-ink">{value}</span>
      {k && <Chip k={k} model={model} />}
    </div>
  );
}

function Card({ title, children, note, chipKey, model }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-surface p-4">
      {title && (
        <div className="mb-2 flex items-center text-xs font-bold uppercase tracking-wide text-slate-500">
          {title}
          {chipKey && <Chip k={chipKey} model={model} />}
        </div>
      )}
      {children}
      {note && <div className="mt-2 text-xs text-slate-500">{note}</div>}
    </div>
  );
}

function Pill({ ok }) {
  const cls = ok === null || ok === undefined
    ? "border-slate-200 bg-slate-100 text-slate-500"
    : ok
      ? "border-success-200 bg-success-50 text-success-700"
      : "border-danger-200 bg-danger-50 text-danger-700";
  return <span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${cls}`}>{yn(ok)}</span>;
}

function Empty({ children }) {
  return <div className="py-3 text-xs italic text-slate-500">{children}</div>;
}

// The 12 CAM sections, vertical on the left, one shown at a time.
const SECTIONS = [
  { id: "general", n: 1, label: "General Detail" },
  { id: "applicant", n: 2, label: "Applicant Detail" },
  { id: "loan", n: 3, label: "Loan Details" },
  { id: "financials", n: 4, label: "Financial Summary" },
  { id: "obligation", n: 5, label: "Obligation" },
  { id: "banking", n: 6, label: "Banking Summary" },
  { id: "verification", n: 7, label: "Verification" },
  { id: "deviation", n: 8, label: "Deviation" },
  { id: "credit_condition", n: 9, label: "Credit Condition" },
  { id: "loan_amount", n: 10, label: "Loan Amount" },
  { id: "credit_manager", n: 11, label: "Credit Manager" },
  { id: "pd", n: 12, label: "PD Sheet Remarks" },
];

export default function CamReport({ onClose, inline = false }) {
  const m = camModel;
  const [active, setActive] = useState("general");
  const t = m.obligations?.totals ?? {};
  const obs = m.obligations?.obligations ?? [];
  const bk = m.banking ?? {};

  const provVals = Object.values(m.provenance ?? {});
  const provTotal = provVals.length || 1;
  const provReal = provVals.filter((v) => v === "real").length;
  const expo = m.obligations?.monthly_exposure;
  const expoTotals = expo?.months?.map((_, i) =>
    Object.values(expo.series || {}).reduce((s, arr) => s + (arr?.[i] || 0), 0)
  );

  const openCam = (print) => {
    const w = window.open(CAM_URL, "_blank", "noopener");
    if (print && w) w.addEventListener("load", () => w.print());
  };

  const verdictCls = {
    APPROVED: "bg-success-50 text-success-700 border-success-200",
    DECLINED: "bg-danger-50 text-danger-700 border-danger-200",
    MANUAL_REVIEW: "bg-caution-50 text-caution-700 border-caution-200",
    INSUFFICIENT_DATA: "bg-caution-50 text-caution-700 border-caution-200",
  }[m.meta?.outcome] ?? "bg-slate-100 text-slate-600 border-slate-200";

  const cur = SECTIONS.find((s) => s.id === active);

  return (
    <div
      className={inline ? "contents" : "fixed inset-0 z-50 flex flex-col bg-night/60 backdrop-blur-sm"}
      onClick={inline ? undefined : onClose}
    >
      <div
        className={
          inline
            ? "flex h-full w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-surface shadow-sm"
            : "mx-auto mt-6 flex h-[calc(100vh-3rem)] w-full max-w-6xl flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-canvas shadow-2xl animate-fade-up"
        }
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-surface px-5 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600 text-white">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <div className="font-display text-title-sm font-semibold text-ink">Credit Appraisal Memo</div>
              <div className="text-[11px] text-slate-500">
                {m.application?.product} · {m.meta?.case_id} · customer {m.meta?.customer_id}
              </div>
            </div>
            <span className={`ml-2 rounded-full border px-2.5 py-0.5 text-xs font-bold ${verdictCls}`}>
              {m.meta?.outcome}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => openCam(true)} className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-700">
              <Download className="h-3.5 w-3.5" /> PDF
            </button>
            <button onClick={() => openCam(false)} className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-surface px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50">
              <ExternalLink className="h-3.5 w-3.5" /> Tab
            </button>
            {!inline && (
              <button onClick={onClose} className="rounded-lg border border-slate-300 bg-surface p-1.5 text-slate-500 transition hover:bg-slate-50">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* provenance coverage — always visible, the anti-vaporware proof */}
        <div className="flex items-center gap-2 border-b border-slate-200 bg-surface px-5 py-1.5">
          <span className="text-[10px] uppercase tracking-wide text-slate-400">Provenance</span>
          <span className="flex h-2 w-40 overflow-hidden rounded-full bg-slate-200" title="field provenance coverage">
            {["real", "derived", "mock", "placeholder"].map((p) => {
              const c = provVals.filter((v) => v === p).length;
              return c ? <span key={p} className={PROV_SEG[p]} style={{ width: `${(c / provTotal) * 100}%` }} /> : null;
            })}
          </span>
          <span className="text-[10px] font-semibold tabular-nums text-success-700">
            {Math.round((provReal / provTotal) * 100)}% real
          </span>
          <span className="ml-auto text-[10px] text-slate-400">{provTotal} fields tagged</span>
        </div>

        {/* split: vertical section nav (left) + single section content (right) */}
        <div className="flex min-h-0 flex-1">
          {/* left nav */}
          <nav className="w-56 flex-shrink-0 overflow-y-auto border-r border-slate-200 bg-surface py-2">
            {SECTIONS.map((s) => {
              const on = s.id === active;
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={`flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm transition ${
                    on ? "bg-primary-50 font-semibold text-primary-700" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-[10px] font-bold ${
                    on ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    {s.n}
                  </span>
                  {s.label}
                </button>
              );
            })}
          </nav>

          {/* content pane */}
          <div className="min-w-0 flex-1 overflow-y-auto p-5">
            <div className="mb-3 flex items-baseline gap-2">
              <h2 className="font-display text-title-sm font-semibold text-ink">
                {cur?.n}. {cur?.label}
              </h2>
            </div>

            {active === "general" && (
              <Card title="General Detail" model={m}>
                <Row label="Applicant Name" value={m.applicant?.name ?? emDash} k="applicant.name" model={m} />
                <Row label="Lead Reference" value={m.application?.lead_reference ?? emDash} k="application.lead_reference" model={m} />
                <Row label="City / Location" value={[m.application?.location, m.application?.pincode].filter(Boolean).join(" · ") || emDash} model={m} />
                <Row label="Sub-Source" value={m.application?.sub_source ?? emDash} k="application.sub_source" model={m} />
                <Row label="Product" value={m.application?.product ?? emDash} model={m} />
                <Row label="Type of Loan" value={m.application?.loan_type ?? emDash} k="application.loan_type" model={m} />
                <Row label="Loan Amount Applied" value={formatINR(m.application?.loan_amount_req)} k="intake.loan_amount_req" model={m} />
                <Row label="Existing Kotak Customer" value={yn(m.application?.existing_kotak_customer)} k="application.existing_kotak_customer" model={m} />
                <Row label="Tenure Applied" value={`${num(m.application?.tenure_req)} months`} model={m} />
                <Row label="Purpose of Loan" value={m.application?.purpose_of_loan ?? emDash} k="application.purpose_of_loan" model={m} />
                <Row label="Scheme" value={m.application?.scheme ?? emDash} k="application.scheme" model={m} />
                <Row label="Sub-Scheme" value={m.application?.sub_scheme ?? emDash} k="application.sub_scheme" model={m} />
                <Row label="Application Date" value={m.application?.date ?? emDash} model={m} />
                <Row label="DMA Name" value={m.application?.dma_name ?? emDash} k="application.dma_name" model={m} />
              </Card>
            )}

            {active === "applicant" && (
              <div className="space-y-4">
                <Card title="2.1 · Applicant Detail" model={m}>
                  <Row label="Name" value={m.applicant?.name ?? emDash} k="applicant.name" model={m} />
                  <Row label="Gender" value={m.applicant?.gender ?? emDash} k="applicant.gender" model={m} />
                  <Row label="PAN" value={m.applicant?.pan ?? emDash} k="applicant.pan" model={m} />
                  <Row label="Kotak CRN" value={m.applicant?.crn ?? emDash} k="applicant.crn" model={m} />
                  <Row label="Salary A/c No." value={m.applicant?.salary_account_no ?? emDash} k="applicant.salary_account_no" model={m} />
                  <Row label="Age" value={num(m.applicant?.age)} k="applicant.dob" model={m} />
                  <Row label="Marital Status" value={m.applicant?.marital_status ?? emDash} k="applicant.marital_status" model={m} />
                  <Row label="Residence Type" value={m.applicant?.residence_type ?? emDash} k="applicant.residence_type" model={m} />
                  <Row label="Qualification" value={m.applicant?.qualification ?? emDash} k="applicant.qualification" model={m} />
                  <Row label="Color Band" value={m.applicant?.color_band ?? emDash} k="applicant.color_band" model={m} />
                  <Row label="Is Salary Account" value={yn(m.applicant?.salary_account_flag)} k="applicant.salary_account_flag" model={m} />
                  <Row label="Salary = Disbursement A/c" value={yn(m.applicant?.salary_disb_same)} k="applicant.salary_disb_same" model={m} />
                </Card>
                <Card title="2.2 · Applicant Employment Detail" model={m}>
                  <Row label="Name of Employment" value={m.employment?.employer ?? emDash} k="employment.employer" model={m} />
                  <Row label="Designation" value={m.employment?.designation ?? emDash} k="employment.designation" model={m} />
                  <Row label="Company Category" value={m.employment?.category ?? emDash} k="employment.category" model={m} />
                  <Row label="Years in Current Company" value={m.employment?.years_in_current_company ?? emDash} k="employment.years_in_current_company" model={m} />
                  <Row label="Total Work Experience" value={m.employment?.total_experience ?? emDash} model={m} />
                  <Row label="Income Band" value={m.employment?.income_band ?? emDash} k="employment.income_band" model={m} />
                </Card>
              </div>
            )}

            {active === "loan" && <LoanColumns m={m} />}

            {active === "financials" && (
              <div className="space-y-4">
                <Card title="Applicant Financial Summary" model={m}>
                  <Row label="Net Salary" value={formatINR(m.financial?.net_salary)} k="financial.net_salary" model={m} />
                  <Row label="Current Fixed Obligation" value={formatINR(m.financial?.current_fixed_obligation)} k="financial.current_fixed_obligation" model={m} />
                  {(m.financial?.obligation_months?.length
                    ? m.financial.obligation_months
                    : ["Month 1", "Month 2", "Month 3", "Month 4"]
                  ).map((mon, i) => (
                    <Row
                      key={i}
                      label={`Obligation · ${monthLabel(mon) === emDash ? mon : monthLabel(mon)}`}
                      value={formatINR(m.financial?.monthly_obligation?.[i])}
                      k="financial.monthly_obligation"
                      model={m}
                    />
                  ))}
                  <Row label="FCU Trigger" value={yn(m.financial?.fcu_trigger)} k="financial.fcu_trigger" model={m} />
                  <Row label="Max Serviceable EMI" value={formatINR(m.financial?.max_serviceable_emi)} k="financial.max_serviceable_emi" model={m} />
                </Card>
                <Card title="Supporting figures" model={m}>
                  <Row label="Declared Income" value={formatINR(m.financial?.declared_income)} k="intake.declared_income" model={m} />
                  <Row label="Income Used" value={`${formatINR(m.financial?.income_used)} · ${m.financial?.income_source ?? emDash}`} k="financial.income_used" model={m} />
                  <Row label="Existing FOIR" value={pct(m.financial?.foir_existing)} k="ml.foir_existing" model={m} />
                  <Row label="Bureau Exposure" value={formatINR(m.financial?.total_exposure)} k="financial.total_exposure" model={m} />
                </Card>
              </div>
            )}

            {active === "obligation" && (
              <Card title="Obligation" chipKey="obligations" model={m}>
                {m.existing_loans?.length > 0 && (
                  <div className="mb-4">
                    <div className="mb-2 flex items-center text-xs font-bold uppercase tracking-wide text-slate-500">
                      Application-declared loans
                      <Chip k="existing_loans" model={m} />
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-[10px] uppercase tracking-wide text-slate-500">
                            <th className="py-2 text-left">Lender</th><th className="text-left">Type</th>
                            <th className="text-right">Sanctioned</th><th className="text-right">Outstanding</th>
                            <th className="text-right">EMI</th><th className="text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="tabular-nums">
                          {m.existing_loans.map((l, i) => (
                            <tr key={i} className="border-t border-slate-100">
                              <td className="py-2 text-left font-medium">{l.lender ?? emDash}</td>
                              <td className="text-left">{l.loan_type ?? emDash}</td>
                              <td className="text-right">{formatINR(l.sanctioned)}</td>
                              <td className="text-right">{formatINR(l.outstanding)}</td>
                              <td className="text-right">{formatINR(l.emi)}</td>
                              <td className="text-right">
                                <span className={`rounded px-1.5 py-px text-[10px] ${l.bt_flag ? "bg-caution-50 text-caution-700" : "bg-success-50 text-success-700"}`}>
                                  {l.status ?? (l.bt_flag ? "Consider BT" : "Considered")}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      Balance-transferred EMIs are netted out of proposed FOIR — the BT clears those loans at disbursal.
                    </div>
                  </div>
                )}
                {obs.length ? (
                  <div className="overflow-x-auto">
                    {m.existing_loans?.length > 0 && (
                      <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Live bureau tradelines</div>
                    )}
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-[10px] uppercase tracking-wide text-slate-500">
                          <th className="py-2 text-left">Loan type</th><th className="text-left">Sec?</th>
                          <th className="text-right">Live/Total</th><th className="text-right">Sanctioned</th>
                          <th className="text-right">Outstanding</th><th className="text-right">Overdue</th>
                          <th className="text-right">Max DPD</th><th className="text-right">Util</th>
                        </tr>
                      </thead>
                      <tbody className="tabular-nums">
                        {obs.map((o, i) => (
                          <tr key={i} className="border-t border-slate-100">
                            <td className="py-2 text-left font-medium">{o.loan_type}</td>
                            <td className="text-left"><span className={`rounded px-1.5 py-px text-[10px] ${o.secured ? "bg-success-50 text-success-700" : "bg-caution-50 text-caution-700"}`}>{o.secured ? "Sec" : "Uns"}</span></td>
                            <td className="text-right">{num(o.live_count)}/{num(o.loan_count)}</td>
                            <td className="text-right">{formatINR(o.total_sanctioned)}</td>
                            <td className="text-right">{formatINR(o.total_outstanding)}</td>
                            <td className="text-right">{formatINR(o.overdue_amount)}</td>
                            <td className="text-right">{num(o.max_dpd)}</td>
                            <td className="text-right">
                              {o.utilization_ratio != null ? (
                                <span className="inline-flex items-center justify-end gap-1.5">
                                  <span className="h-1.5 w-10 overflow-hidden rounded bg-slate-200">
                                    <span className="block h-full rounded bg-primary-500" style={{ width: `${Math.min(o.utilization_ratio * 100, 100)}%` }} />
                                  </span>
                                  <span className="text-[10px] tabular-nums text-slate-500">{Math.round(o.utilization_ratio * 100)}%</span>
                                </span>
                              ) : (
                                emDash
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-slate-200 font-bold">
                          <td className="py-2 text-left">Total · {num(t.total_tradelines)} TLs</td><td />
                          <td className="text-right">{num(t.live_tradelines)}/{num(t.total_tradelines)}</td>
                          <td className="text-right">{formatINR(t.total_sanctioned)}</td>
                          <td className="text-right">{formatINR(t.total_outstanding)}</td>
                          <td /><td className="text-right">{num(t.max_dpd)}</td><td />
                        </tr>
                      </tfoot>
                    </table>
                    <div className="mt-2 text-xs text-slate-500">
                      Delinquency on file: {yn(t.has_delinquency)} · On-us outstanding: {formatINR(t.on_us_total_outstanding)}
                    </div>
                    {expoTotals?.length > 1 && (
                      <div className="mt-4">
                        <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-wide text-slate-400">
                          <span>Total exposure · {expo.months[0]} → {expo.months[expo.months.length - 1]}</span>
                          <span className="tabular-nums text-slate-500">{formatINR(expoTotals[expoTotals.length - 1])}</span>
                        </div>
                        <div className="h-12">
                          <Sparkline values={expoTotals} className="stroke-primary-500" fillClassName="fill-primary-500/10" />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Empty>No live tradelines returned by the bureau analyser.</Empty>
                )}
              </Card>
            )}

            {active === "banking" && <BankingMatrix m={m} bk={bk} />}

            {active === "verification" && (
              <Card title="Verification Summary" model={m}>
                <table className="w-full text-sm">
                  <tbody>
                    {(m.verification ?? []).map((v, i) => (
                      <tr key={i} className="border-b border-slate-100">
                        <td className="py-2 text-left font-medium">{v.label}</td>
                        <td className="py-2 text-left text-xs text-slate-500">{v.detail ?? ""}</td>
                        <td className="py-2 text-right"><Pill ok={v.status} /></td>
                        <td className="py-2 text-right">{v.prov_key && <Chip k={v.prov_key} model={m} />}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}

            {active === "deviation" && (
              <Card title="Deviation" note={`Policy: ${m.deviations?.policy_result ?? emDash} · Serviceable: ${yn(m.deviations?.serviceable)}`} model={m}>
                {m.deviations?.rows?.length ? (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-[10px] uppercase tracking-wide text-slate-500">
                        <th className="py-2 text-left">Deviation Type</th>
                        <th className="text-left">Applicant Type</th>
                        <th className="text-left">Rule Description</th>
                        <th className="text-left">Credit Approval Level</th>
                        <th className="text-left">System Decision</th>
                      </tr>
                    </thead>
                    <tbody>
                      {m.deviations.rows.map((d, i) => (
                        <tr key={i} className="border-t border-slate-100 align-top">
                          <td className="py-2 text-left font-medium">{d.deviation_type ?? emDash}</td>
                          <td className="text-left">{d.applicant_type ?? emDash}</td>
                          <td className="text-left text-slate-500">{d.rule_description ?? emDash}</td>
                          <td className="text-left">{d.credit_approval_level ?? emDash}</td>
                          <td className="text-left">
                            <span className="rounded-full border border-danger-200 bg-danger-50 px-2 py-0.5 text-[10px] font-bold text-danger-700">
                              {d.system_decision ?? emDash}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <Empty>No deviations triggered — all policy layers passed.</Empty>
                )}
              </Card>
            )}

            {active === "credit_condition" && (
              <Card title="Credit Condition" chipKey="credit_conditions" model={m}>
                {m.credit_conditions?.length ? (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-[10px] uppercase tracking-wide text-slate-500">
                        <th className="py-2 text-left">Applicant Type</th>
                        <th className="text-left">Credit Condition For</th>
                        <th className="text-left">Credit Condition Name</th>
                        <th className="text-left">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {m.credit_conditions.map((c, i) => (
                        <tr key={i} className="border-t border-slate-100 align-top">
                          <td className="py-2 text-left font-medium">{c.applicant_type ?? emDash}</td>
                          <td className="text-left">{c.condition_for ?? emDash}</td>
                          <td className="text-left">{c.condition_name ?? emDash}</td>
                          <td className="text-left text-slate-500">{c.remarks ?? emDash}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <Empty>No credit conditions attached to this case.</Empty>
                )}
              </Card>
            )}

            {active === "loan_amount" && (
              <Card title="Loan Amount" model={m}>
                <Row label="Final Loan Amt Approved" value={formatINR(m.loan_amount?.final_amount)} k="loan_amount.final_amount" model={m} />
                <Row label="Final Tenor Approved" value={m.loan_amount?.final_tenor ? `${num(m.loan_amount.final_tenor)} months` : emDash} model={m} />
                <Row label="Rejection Reason" value={m.loan_amount?.rejection_reason ?? emDash} k="loan_amount.rejection_reason" model={m} />
                <Row label="Reject Date & Time" value={m.loan_amount?.reject_datetime ?? emDash} model={m} />
              </Card>
            )}

            {active === "credit_manager" && (
              <Card title="Credit Manager Details" note={
                m.credit_manager?.model_versions
                  ? `Model versions: ${Object.entries(m.credit_manager.model_versions).map(([k, v]) => `${k}=${v}`).join(" · ")}`
                  : undefined
              } model={m}>
                <Row label="Decisioned By" value={m.credit_manager?.decisioned_by ?? emDash} model={m} />
                <Row label="AI Assisted" value={yn(m.credit_manager?.ai_assisted)} model={m} />
                <Row label="Decision Date" value={m.credit_manager?.decision_date ?? emDash} k="credit_manager.decision_date" model={m} />
                <Row label="Reviewed By" value={m.credit_manager?.reviewed_by ?? emDash} k="credit_manager.reviewed_by" model={m} />
                <Row label="Approved By" value={m.credit_manager?.approved_by ?? emDash} k="credit_manager.approved_by" model={m} />
                <Row label="Remarks" value={m.credit_manager?.remarks ?? emDash} k="credit_manager.remarks" model={m} />
              </Card>
            )}

            {active === "pd" && (
              <Card title="PD Sheet Remarks" note={
                m.pd_sheet?.policy_features && Object.keys(m.pd_sheet.policy_features).length
                  ? `Policy features: ${Object.entries(m.pd_sheet.policy_features).map(([k, v]) => `${k}=${v}`).join(" · ")}`
                  : undefined
              } model={m}>
                <Row label="Remarks" value={m.pd_sheet?.remarks ?? emDash} k="pd_sheet.remarks" model={m} />
                <Row label="PD Score" value={num(m.pd_sheet?.pd_score)} k="ml.pd_score" model={m} />
                <Row label="Risk Band" value={m.pd_sheet?.risk_band != null ? `Band ${num(m.pd_sheet.risk_band)} / 5` : emDash} k="ml.risk_band" model={m} />
                <Row label="Affluence Segment" value={m.pd_sheet?.affluence_segment ?? emDash} k="pd_sheet.affluence_segment" model={m} />
                <Row label="Affluence Value" value={formatINR(m.pd_sheet?.affluence_value)} k="pd_sheet.affluence_value" model={m} />
                <Row label="PD Provenance" value={m.pd_sheet?.pd_provenance ?? emDash} model={m} />

                {m.pd_sheet?.tele_pd?.questions?.length > 0 && (
                  <div className="mt-4 border-t border-slate-200 pt-3">
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Tele PD
                      <Chip k="pd_sheet.tele_pd" model={m} />
                      <span className="font-medium normal-case tracking-normal text-slate-400">
                        {m.pd_sheet.tele_pd.officer ?? emDash}
                        {m.pd_sheet.tele_pd.conducted_at ? ` · ${m.pd_sheet.tele_pd.conducted_at}` : ""}
                        {m.pd_sheet.tele_pd.ctc_document ? ` · CTC document: ${m.pd_sheet.tele_pd.ctc_document}` : ""}
                      </span>
                    </div>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-[10px] uppercase tracking-wide text-slate-500">
                          <th className="w-[44%] py-2 text-left">Question</th>
                          <th className="text-left">Answer</th>
                        </tr>
                      </thead>
                      <tbody>
                        {m.pd_sheet.tele_pd.questions.map((q, i) => (
                          <tr key={q.id ?? i} className="border-t border-slate-100 align-top">
                            <td className="py-2 pr-3 text-left text-slate-500">
                              {q.q ?? emDash}
                              {q.note && <span className="italic text-slate-400"> · {q.note}</span>}
                            </td>
                            <td className="py-2 text-left font-medium text-ink">{q.answer ?? emDash}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {m.pd_sheet.tele_pd.deviation_reasons?.length > 0 && (
                      <div className="mt-3 rounded-lg border border-caution-200/70 bg-caution-50/40 p-3">
                        <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-caution-700">
                          Reasons for deviations · folded into Decision
                        </div>
                        <ul className="space-y-1">
                          {m.pd_sheet.tele_pd.deviation_reasons.map((d, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs text-slate-700">
                              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-caution-500" /> {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>

        {/* legend */}
        <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 bg-surface px-5 py-2 text-[11px] text-slate-500">
          {Object.entries({ real: "analyser output", derived: "computed", mock: "stand-in", placeholder: "not real yet" }).map(([k, label]) => (
            <span key={k} className="flex items-center gap-1">
              <span className={`rounded border px-1.5 py-px text-[9px] font-bold uppercase ${provPill[k]}`}>{k}</span>{label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Section 3 — three-column loan table (System Approval / Applied / Sanctioned).
function LoanColumns({ m }) {
  const l = m.loan ?? {};
  const cols = [
    { key: "system_approval", label: "System Approval", prov: "loan.system_approval" },
    { key: "applied", label: "Applied", prov: "loan.applied" },
    { key: "sanctioned", label: "Sanctioned", prov: "loan.sanctioned" },
  ];
  const rows = [
    { label: "Loan Amount", f: (c) => formatINR(c.amount) },
    { label: "Tenure", f: (c) => (c.tenure != null ? `${c.tenure} mo` : emDash) },
    { label: "Interest Rate", f: (c) => pct(c.irr) },
    { label: "EMI", f: (c) => formatINR(c.emi) },
    { label: "FOIR", f: (c) => pct(c.foir) },
    { label: "Unsecured FOIR", f: (c) => pct(c.unsecured_foir) },
    { label: "Multiplier", f: (c) => (c.multiplier != null ? `${c.multiplier}x` : emDash) },
  ];
  return (
    <Card title="Loan Application / Details" model={m}>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[10px] uppercase tracking-wide text-slate-500">
            <th className="py-2 text-left" />
            {cols.map((c) => (
              <th key={c.key} className="px-2 py-2 text-right">
                {c.label}
                <Chip k={c.prov} model={m} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-slate-100">
              <td className="py-2 text-left text-xs text-slate-500">{r.label}</td>
              {cols.map((c) => (
                <td key={c.key} className="px-2 py-2 text-right font-semibold text-ink">
                  {r.f(l[c.key] ?? {})}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

// Section 6 — Banking Summary: Feature x Month matrix.
function BankingMatrix({ m, bk }) {
  const mat = m.banking_matrix ?? {};
  const months = mat.months ?? [];
  const rows = mat.rows ?? [];
  const fmtCell = (feature, v) => {
    if (v === null || v === undefined) return emDash;
    if (/count/i.test(feature)) return num(v);
    if (typeof v === "number") return formatINR(v);
    return String(v);
  };
  const sal = bk?.salary ?? {};
  const aq = bk?.account_quality ?? {};
  return (
    <div className="space-y-4">
      <Card title="Banking Summary" chipKey="banking" model={m}>
        <Row label="Salary (avg)" value={formatINR(sal.avg_amount)} model={m} />
        <Row label="Salary credits" value={sal.frequency != null ? `${num(sal.frequency)} months` : emDash} model={m} />
        {sal.narration && <Row label="Latest salary" value={sal.narration} model={m} />}
        <Row label="Account type" value={aq.account_type ? `${aq.account_type}${aq.confidence ? ` · ${aq.confidence} confidence` : ""}` : emDash} model={m} />
        {aq.primary_score != null && <Row label="Primary-account score" value={`${num(aq.primary_score)} / 100`} model={m} />}
        {aq.avg_monthly_debits != null && <Row label="Avg debits / month" value={num(aq.avg_monthly_debits)} model={m} />}
        {bk?.savings?.net_savings != null && <Row label="Net savings" value={formatINR(bk.savings.net_savings)} model={m} />}
        {bk?.top_categories?.length > 0 && (
          <div className="mt-2 text-xs text-slate-500">
            Top spend: {bk.top_categories.map((c) => `${c.category} (${formatINR(c.amount)})`).join(" · ")}
          </div>
        )}
        {aq.observations?.length > 0 && (
          <div className="mt-1 text-xs italic text-slate-500">{aq.observations.join(" ")}</div>
        )}
      </Card>
      <Card title="Monthly Banking Matrix" chipKey="banking" model={m}>
        {months.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[10px] uppercase tracking-wide text-slate-500">
                  <th className="py-2 text-left">Feature</th>
                  {months.map((mo, i) => (
                    <th key={i} className="px-2 py-2 text-right">{monthLabel(mo)}</th>
                  ))}
                  <th className="px-2 text-right">Src</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {rows.map((r, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="py-2 text-left font-medium">{r.feature}</td>
                    {months.map((_, j) => (
                      <td key={j} className="px-2 py-2 text-right">{fmtCell(r.feature, r.values?.[j])}</td>
                    ))}
                    <td className="px-2 text-right">
                      {r.prov && (
                        <span className={`rounded border px-1 py-px text-[9px] font-bold uppercase ${provPill[r.prov] ?? provPill.placeholder}`}>
                          {r.prov === "real" ? "R" : "—"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>Banking analyser produced no monthly summary for this case.</Empty>
        )}
      </Card>
      {bk?.emis?.length > 0 && (
        <Card title="EMI debits detected" model={m}>
          <table className="w-full text-xs tabular-nums">
            <thead><tr className="text-[10px] uppercase tracking-wide text-slate-500"><th className="py-1 text-left">Reference</th><th className="text-right">Avg</th><th className="text-right">Count</th></tr></thead>
            <tbody>
              {bk.emis.map((e, i) => (
                <tr key={i} className="border-t border-slate-100"><td className="py-1.5 text-left">{e.name}</td><td className="text-right">{formatINR(e.amount)}</td><td className="text-right">{num(e.frequency)}</td></tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      {bk?.customer_review && (
        <Card title="Banking Analyser Summary" chipKey="banking" model={m}>
          <p className="whitespace-pre-line text-xs leading-relaxed text-slate-600">{bk.customer_review}</p>
        </Card>
      )}
    </div>
  );
}
