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
      <span className="w-36 flex-shrink-0 text-xs text-slate-500">{label}</span>
      <span className="text-sm font-semibold tabular-nums text-ink">{value}</span>
      {k && <Chip k={k} model={model} />}
    </div>
  );
}

function Card({ title, children, note }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-surface p-4">
      {title && <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">{title}</div>}
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

const TABS = [
  "Summary", "Applicant", "Employment", "Loan", "Financials",
  "Obligations", "Banking", "Verification", "Deviations", "PD",
];

export default function CamReport({ onClose }) {
  const m = camModel;
  const [tab, setTab] = useState("Summary");
  const t = m.obligations?.totals ?? {};
  const obs = m.obligations?.obligations ?? [];
  const bk = m.banking ?? {};

  // Charts from real captured data (honest empty state when sparse).
  const provVals = Object.values(m.provenance ?? {});
  const provTotal = provVals.length || 1;
  const provReal = provVals.filter((v) => v === "real").length;
  const expo = m.obligations?.monthly_exposure;
  const expoTotals = expo?.months?.map((_, i) =>
    Object.values(expo.series || {}).reduce((s, arr) => s + (arr?.[i] || 0), 0)
  );
  const cashflow = bk.monthly_cashflow ?? [];

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

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-night/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="mx-auto mt-6 flex h-[calc(100vh-3rem)] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-canvas shadow-2xl animate-fade-up"
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
            <button onClick={onClose} className="rounded-lg border border-slate-300 bg-surface p-1.5 text-slate-500 transition hover:bg-slate-50">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* tabs */}
        <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-surface px-4 py-2">
          {TABS.map((id) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                tab === id ? "bg-primary-600 text-white" : "text-slate-500 hover:bg-slate-100 hover:text-ink"
              }`}
            >
              {id}
            </button>
          ))}
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

        {/* body */}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === "Summary" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ["Requested", formatINR(m.application?.loan_amount_req)],
                  ["Offer", formatINR(m.loan?.offer_amount)],
                  ["CIBIL / TU", num(t.tu_score)],
                  ["Proposed FOIR", pct(m.loan?.foir_proposed)],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl border border-slate-200 bg-surface p-3">
                    <div className="text-[10px] uppercase tracking-wide text-slate-500">{k}</div>
                    <div className="mt-1 font-display text-lg font-extrabold tabular-nums text-ink">{v}</div>
                  </div>
                ))}
              </div>
              <Card title="Application">
                <Row label="Application No" value={m.application?.application_no ?? emDash} model={m} />
                <Row label="Channel" value={m.application?.channel ?? emDash} model={m} />
                <Row label="Location" value={[m.application?.location, m.application?.pincode].filter(Boolean).join(" · ") || emDash} model={m} />
                <Row label="Tenure (req)" value={`${num(m.application?.tenure_req)} months`} model={m} />
              </Card>
            </div>
          )}

          {tab === "Applicant" && (
            <Card title="Applicant Details">
              <Row label="Name" value={m.applicant?.name ?? emDash} k="applicant.name" model={m} />
              <Row label="Age" value={num(m.applicant?.age)} k="applicant.dob" model={m} />
              <Row label="Qualification" value={m.applicant?.qualification ?? emDash} k="applicant.qualification" model={m} />
              <Row label="Residence type" value={m.applicant?.residence_type ?? emDash} k="applicant.residence_type" model={m} />
              <Row label="Years at address" value={num(m.applicant?.years_at_address)} model={m} />
              <Row label="Address quality" value={m.applicant?.address_band ? `${m.applicant.address_band} · ${num(m.applicant.address_score)}/100` : emDash} k="address.score" model={m} />
              {m.applicant?.address_reasons?.length > 0 && (
                <div className="mt-2 text-xs text-slate-500">
                  Drivers: {m.applicant.address_reasons.map((r) => r.label).join(" · ")}
                </div>
              )}
            </Card>
          )}

          {tab === "Employment" && (
            <Card title="Employment Details">
              <Row label="Company" value={m.employment?.employer ?? emDash} k="employment.employer" model={m} />
              <Row label="Verified (EPFO)" value={yn(m.employment?.employment_verified)} k="intake.employment_verified" model={m} />
              <Row label="Stability" value={`${num(m.employment?.stability_months)} months`} k="employment.stability_months" model={m} />
              <Row label="Total experience" value={m.employment?.total_experience ?? emDash} model={m} />
            </Card>
          )}

          {tab === "Loan" && (
            <Card title="Loan Details (BRE Offer)">
              <Row label="Eligible amount" value={formatINR(m.loan?.offer_amount)} k="loan.offer_amount" model={m} />
              <Row label="Tenure" value={`${num(m.loan?.offer_tenure)} months`} k="loan.offer_tenure" model={m} />
              <Row label="Interest (IRR)" value={pct(m.loan?.offer_irr)} k="decision.offer_irr" model={m} />
              <Row label="EMI" value={formatINR(m.loan?.offer_emi)} k="decision.offer_emi" model={m} />
              <Row label="Processing fee" value={formatINR(m.loan?.processing_fee)} k="decision.processing_fee" model={m} />
              <Row label="Approved segment" value={m.loan?.approved_segment ?? emDash} model={m} />
            </Card>
          )}

          {tab === "Financials" && (
            <Card title="Applicant Financial Summary">
              <Row label="Declared income" value={formatINR(m.financial?.declared_income)} k="intake.declared_income" model={m} />
              <Row label="Salary detected" value={formatINR(m.financial?.salary_detected)} k="financial.salary_detected" model={m} />
              <Row label="Income used" value={`${formatINR(m.financial?.income_used)} · ${m.financial?.income_source ?? emDash}`} k="financial.income_used" model={m} />
              <Row label="Total obligation" value={formatINR(m.financial?.total_obligation)} k="financial.total_obligation" model={m} />
              <Row label="Existing FOIR" value={pct(m.financial?.foir_existing)} k="ml.foir_existing" model={m} />
              <Row label="Bureau exposure" value={formatINR(m.financial?.total_exposure)} k="financial.total_exposure" model={m} />
            </Card>
          )}

          {tab === "Obligations" && (
            <Card title="Obligation Table — Live Bureau Tradelines">
              {obs.length ? (
                <div className="overflow-x-auto">
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
                <div className="py-3 text-xs italic text-slate-500">No live tradelines returned by the bureau analyser.</div>
              )}
            </Card>
          )}

          {tab === "Banking" && (
            <div className="space-y-4">
              <Card title="Banking Summary">
                <Row label="Salary (avg)" value={formatINR(bk.salary?.avg_amount)} model={m} />
                <Row label="Salary credits" value={num(bk.salary?.frequency)} model={m} />
                <Row label="Account type" value={bk.account_quality?.account_type ?? emDash} model={m} />
                {bk.savings && <Row label="Net savings" value={formatINR(bk.savings.net_savings)} model={m} />}
              </Card>
              {bk.emis?.length > 0 && (
                <Card title="EMI debits detected">
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
              {cashflow.length > 0 && (
                <Card title="Monthly cashflow — net inflow/outflow">
                  <div className="flex h-20 items-end gap-1">
                    {cashflow.map((r, i) => {
                      const max = Math.max(...cashflow.map((x) => Math.abs(x.net || 0)), 1);
                      const h = (Math.abs(r.net || 0) / max) * 100;
                      const pos = (r.net || 0) >= 0;
                      return (
                        <div key={i} className="flex flex-1 flex-col items-center justify-end" title={`${r.month}: ${formatINR(r.net)}`}>
                          <div className={`w-full rounded-t ${pos ? "bg-success-500" : "bg-danger-500"}`} style={{ height: `${Math.max(h, 3)}%` }} />
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-1 flex justify-between text-[9px] tabular-nums text-slate-400">
                    <span>{cashflow[0].month}</span>
                    <span>{cashflow[cashflow.length - 1].month}</span>
                  </div>
                </Card>
              )}
              {bk.top_categories?.length > 0 && (
                <div className="text-xs text-slate-500">Top spend: {bk.top_categories.map((c) => `${c.category} (${formatINR(c.amount)})`).join(" · ")}</div>
              )}
            </div>
          )}

          {tab === "Verification" && (
            <Card title="Verification Summary">
              <table className="w-full text-sm">
                <tbody>
                  {(m.verification ?? []).map((v, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="py-2 text-left">{v.label}</td>
                      <td className="py-2 text-left text-xs text-slate-500">{v.detail ?? ""}</td>
                      <td className="py-2 text-right"><Pill ok={v.status} /></td>
                      <td className="py-2 text-right">{v.prov_key && <Chip k={v.prov_key} model={m} />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {tab === "Deviations" && (
            <Card title="Deviations & Policy Waterfall" note={`Policy: ${m.deviations?.policy_result ?? emDash} · Serviceable: ${yn(m.deviations?.serviceable)}`}>
              <table className="w-full text-sm">
                <tbody>
                  {(m.deviations?.layers ?? []).map((l, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="py-2 text-left font-medium">{l.layer}</td>
                      <td className="py-2 text-left text-xs text-slate-500">{l.detail ?? l.reason_code}</td>
                      <td className="py-2 text-right">
                        <span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${l.passed ? "border-success-200 bg-success-50 text-success-700" : "border-danger-200 bg-danger-50 text-danger-700"}`}>
                          {l.passed ? "PASS" : "BREACH"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {m.deviations?.breaches?.length > 0 && (
                <div className="mt-3 text-xs font-semibold text-danger-700">
                  Deviations triggered: {m.deviations.breaches.map((b) => `${b.layer} (${b.reason_code})`).join(" · ")}
                </div>
              )}
            </Card>
          )}

          {tab === "PD" && (
            <div className="space-y-4">
              <Card title="PD Sheet">
                <Row label="PD score" value={num(m.pd_sheet?.pd_score)} k="ml.pd_score" model={m} />
                <Row label="Risk band" value={`Band ${num(m.pd_sheet?.risk_band)} / 5`} k="ml.risk_band" model={m} />
                <Row label="Affluence segment" value={m.pd_sheet?.affluence_segment ?? emDash} k="pd_sheet.affluence_segment" model={m} />
                <Row label="Affluence value" value={formatINR(m.pd_sheet?.affluence_value)} k="pd_sheet.affluence_value" model={m} />
                <Row label="PD provenance" value={m.pd_sheet?.pd_provenance ?? emDash} model={m} />
              </Card>
              <Card title="Credit Manager">
                <Row label="Decisioned by" value={m.credit_manager?.decisioned_by ?? emDash} model={m} />
                <Row label="AI assisted" value={yn(m.credit_manager?.ai_assisted)} model={m} />
              </Card>
            </div>
          )}
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
