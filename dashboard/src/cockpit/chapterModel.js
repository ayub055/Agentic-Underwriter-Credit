// The single-page "cockpit" runs one playback cursor over a unified list of
// CHAPTERS: the real pipeline PHASES (the hero) followed by three finale
// chapters (verdict, customer payoff, CAM memo). Both the left rail and the
// center stage panel switch on the same ordered list, so nothing ever appends
// to the page — chapters swap in place.

import {
  FileText,
  Inbox,
  GitFork,
  Cpu,
  Scale,
  Phone,
  Calculator,
  Stamp,
  BellRing,
  Scale as ScaleIcon,
  UserRound,
  ClipboardCheck,
} from "lucide-react";
import { PHASES, META, VIZ, buildTimeline } from "../backend/phaseModel.js";

export { PHASES, META, VIZ };

// Finale chapters — the payoff that used to append below the page on completion.
// They now live in the same frame as seekable chapters.
const FINALE = [
  {
    id: "verdict",
    phase: "Verdict",
    title: "The Decision",
    subtitle: "Clean credit · failed affordability — the run's whole tension",
    chapterKind: "verdict",
    presenterNote:
      "The decision as a balance: pristine credit on one side, an EMI the customer can't carry on the other.",
  },
  {
    id: "customer",
    phase: "Customer",
    title: "What the customer sees",
    subtitle: "The same decision, delivered to the applicant",
    chapterKind: "customer",
    presenterNote:
      "The applicant never sees the machinery — just a clear, kind answer and a path to a loan that fits.",
  },
  {
    id: "cam",
    phase: "Credit Memo",
    title: "Credit Appraisal Memo",
    subtitle: "Auto-generated · field-level provenance · audit-ready",
    chapterKind: "cam",
    presenterNote:
      "Every case ships a full credit memo with field-by-field provenance — zero manual documentation.",
  },
];

// Icon per chapter id, mirroring the execution-graph nodes.
export const CHAPTER_ICON = {
  form: FileText,
  intake: Inbox,
  layer2: GitFork,
  ml: Cpu,
  policy: Scale,
  telePd: Phone,
  decision: Calculator,
  finalize: Stamp,
  notify: BellRing,
  verdict: ScaleIcon,
  customer: UserRound,
  cam: ClipboardCheck,
};

// First N chapters map 1:1 to the pipeline PHASES (so chapterIndex === phaseIndex
// for the pipeline); the finale chapters follow.
export const CHAPTERS = [
  ...PHASES.map((p, i) => ({ ...p, chapterKind: "stage", phaseIndex: i, chapterIndex: i })),
  ...FINALE.map((f, i) => ({
    ...f,
    phaseIndex: null,
    chapterIndex: PHASES.length + i,
  })),
];

export const PIPELINE_COUNT = PHASES.length;

// Extend the pipeline timeline with the finale chapters so they are seekable
// cursor positions too. Each finale chapter gets a start, a few dwell "beat"
// steps (so autoplay lingers long enough to read it), and a done — keeping the
// single-cursor model from usePlayback intact.
const FINALE_BEATS = 5;

export function buildJourneyTimeline() {
  const steps = buildTimeline(PHASES).map((s) => ({ ...s, chapterIndex: s.phaseIndex }));
  FINALE.forEach((_, i) => {
    const ci = PHASES.length + i;
    steps.push({ kind: "start", chapterIndex: ci });
    for (let k = 0; k < FINALE_BEATS; k++) steps.push({ kind: "beat", chapterIndex: ci });
    steps.push({ kind: "done", chapterIndex: ci });
  });
  return steps;
}
