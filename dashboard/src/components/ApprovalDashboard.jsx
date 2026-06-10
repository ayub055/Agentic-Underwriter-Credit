import Header from "./Header.jsx";
import Sidebar from "./sidebar/Sidebar.jsx";
import ApprovedCard from "./states/ApprovedCard.jsx";
import ReviewCard from "./states/ReviewCard.jsx";
import RejectedCard from "./states/RejectedCard.jsx";

const CARDS = {
  approved: ApprovedCard,
  review: ReviewCard,
  rejected: RejectedCard,
};

export default function ApprovalDashboard({ view, onAcceptOffer, onEnablePush, onViewDocs, onChat }) {
  const StateCard = CARDS[view.status] ?? ReviewCard;

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
      <Header applicationId={view.applicationId} />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <StateCard
            view={view}
            onAcceptOffer={onAcceptOffer}
            onEnablePush={onEnablePush}
            onViewDocs={onViewDocs}
          />
        </section>
        <aside className="lg:col-span-1">
          <Sidebar tracker={view.tracker} onChat={onChat} />
        </aside>
      </div>
    </main>
  );
}
