// Single source for the semantic tone system, shared by both views.
//
//   primary  (indigo)  brand · completed
//   agent    (violet)  AI actively working · LLM output
//   success  (emerald) pass · verified
//   danger   (red)     hard gate breach — backend truth only
//   caution  (amber)   warnings · placeholder provenance · customer-facing
//                      "not approved" (deliberate empathy downgrade)
//   progress (blue)    data · info · human review
//
// The same keys (ok/info/agent/caution/danger/mock/placeholder) work across
// every map below.

export const dataTone = {
  ok: "text-success-700",
  info: "text-progress-600",
  caution: "text-caution-700",
  danger: "text-danger-600 font-semibold",
};

export const consoleTone = {
  ok: "text-emerald-300",
  info: "text-sky-300",
  agent: "text-violet-300",
  caution: "text-amber-300",
  mock: "text-slate-500",
  placeholder: "text-amber-300/80",
  danger: "text-danger-300",
};

export const agentTone = {
  ok: "text-success-700",
  info: "text-progress-600",
  agent: "text-agent-600",
  caution: "text-caution-700",
  mock: "text-slate-400",
  placeholder: "text-caution-700",
  danger: "text-danger-600",
};

export const provPill = {
  real: "bg-success-50 text-success-700 border-success-200",
  derived: "bg-progress-50 text-progress-600 border-progress-200",
  mock: "bg-slate-100 text-slate-500 border-slate-200",
  placeholder: "bg-caution-50 text-caution-700 border-caution-200",
  illustrative: "bg-caution-50 text-caution-700 border-caution-200",
};
