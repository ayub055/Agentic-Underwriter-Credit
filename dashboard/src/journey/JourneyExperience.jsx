import { useMemo } from "react";
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

const CARDS = {
  approved: ApprovedCard,
  review: ReviewCard,
  rejected: RejectedCard,
};

// One connected story: greeting -> the agent replays its analysis moment by
// moment -> the outcome lands as the narrative payoff, never as a cold screen.
export default function JourneyExperience({ view, onAcceptOffer, onEnablePush, onViewDocs, onChat }) {
  const script = useMemo(() => buildScript(view), [view]);
  const { phase, moment, facts, skip } = useJourneyPlayback(script.moments, view.status);
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
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
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
      )}
    </main>
  );
}
