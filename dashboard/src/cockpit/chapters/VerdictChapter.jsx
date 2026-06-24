import VerdictCard from "../../backend/VerdictCard.jsx";
import ScalePanel from "../../backend/ScalePanel.jsx";

// Finale chapter 1 — the decision as a balance (clean credit vs failed
// affordability) plus the at-scale business framing. Same components that used
// to append on completion, now a chapter inside the fixed frame.
export default function VerdictChapter({ onSeeCustomer, onOpenCam }) {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-4">
      <VerdictCard onSeeCustomer={onSeeCustomer} onOpenCam={onOpenCam} />
      <ScalePanel />
    </div>
  );
}
