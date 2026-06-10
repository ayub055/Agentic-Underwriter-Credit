import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import Header from "../components/Header.jsx";
import SupportWidget from "../components/sidebar/SupportWidget.jsx";
import ApprovedCard from "../components/states/ApprovedCard.jsx";
import ReviewCard from "../components/states/ReviewCard.jsx";
import RejectedCard from "../components/states/RejectedCard.jsx";
import { buildScript } from "./agentScript.js";
import { useJourneyPlayback } from "./useJourneyPlayback.js";
import MomentRail from "./MomentRail.jsx";
import Narrator from "./Narrator.jsx";
import AnalysisCanvas from "./AnalysisCanvas.jsx";
import JourneySpine from "../components/JourneySpine.jsx";

// Narrative moment → shared journey-spine stage (the same spine the backend
// view shows, so both lenses read as one journey).
const SPINE_BY_MOMENT = [1, 2, 2, 5];
const OUTCOME_TONE = { approved: "success", review: "progress", rejected: "caution" };

const CARDS = {
  approved: ApprovedCard,
  review: ReviewCard,
  rejected: RejectedCard,
};

// One connected story: greeting -> the agent replays its analysis moment by
// moment -> the outcome lands as the narrative payoff, never as a cold screen.
export default function JourneyExperience({ view, onAcceptOffer, onEnablePush, onViewDocs, onChat }) {
  const script = useMemo(() => buildScript(view), [view]);
  // Bumping replay restarts the whole narrative — lets a presenter rerun the
  // customer story on stage without reloading.
  const [replay, setReplay] = useState(0);
  const { phase, moment, facts, skip } = useJourneyPlayback(script.moments, `${view.status}:${replay}`);
  const StateCard = CARDS[view.status] ?? ReviewCard;

  const narration =
    phase === "intro"
      ? script.greeting
      : phase === "working"
      ? script.moments[moment]?.narration
      : script.reveal.narration;

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
      <Header applicationId={view.applicationId} />

      <JourneySpine
        current={phase === "intro" ? 0 : phase === "working" ? SPINE_BY_MOMENT[moment] ?? 1 : 6}
        complete={phase === "reveal"}
        outcomeTone={OUTCOME_TONE[view.status] ?? "progress"}
        className="mt-4 px-1 opacity-80"
      />

      <MomentRail moments={script.moments} moment={moment} phase={phase} status={view.status} />

      <Narrator
        text={narration}
        thinking={phase !== "reveal"}
        nextAction={phase === "reveal" ? script.reveal.nextAction : null}
      />

      {phase !== "reveal" ? (
        <AnalysisCanvas
          moments={script.moments}
          phase={phase}
          moment={moment}
          facts={facts}
          onSkip={skip}
        />
      ) : (
        <>
        <div className="mt-3 flex justify-end">
          <button
            onClick={() => setReplay((r) => r + 1)}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-ink"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Replay journey
          </button>
        </div>
        <div className="mt-2 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <section className="animate-fade-up lg:col-span-2">
            <StateCard
              view={view}
              onAcceptOffer={onAcceptOffer}
              onEnablePush={onEnablePush}
              onViewDocs={onViewDocs}
            />
          </section>
          <aside className="animate-fade-up lg:col-span-1" style={{ animationDelay: "120ms" }}>
            <SupportWidget onChat={onChat} />
          </aside>
        </div>
        </>
      )}
    </main>
  );
}
