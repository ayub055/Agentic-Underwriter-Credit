// Shared tone -> class maps for the backend view (light chrome + dark console).
// Unified accent system (same as the customer journey): indigo primary = done/
// brand, agent violet = actively working / LLM, success = pass, red = breach,
// caution = placeholder/warnings, progress blue = data/info.

export const dataTone = {
  ok: "text-success-700",
  info: "text-progress-600",
  amber: "text-caution-700",
  bad: "text-red-600 font-semibold",
};

export const consoleTone = {
  ok: "text-emerald-300",
  info: "text-sky-300",
  agent: "text-violet-300",
  warn: "text-amber-300",
  mock: "text-slate-500",
  placeholder: "text-amber-300/80",
  bad: "text-red-300",
};

export const agentTone = {
  ok: "text-success-700",
  info: "text-progress-600",
  agent: "text-agent-600",
  warn: "text-caution-700",
  mock: "text-slate-400",
  placeholder: "text-caution-700",
  bad: "text-red-600",
};

export const provPill = {
  real: "bg-success-50 text-success-700 border-success-200",
  derived: "bg-progress-50 text-progress-600 border-progress-200",
  mock: "bg-slate-100 text-slate-500 border-slate-200",
  placeholder: "bg-caution-50 text-caution-700 border-caution-200",
};
