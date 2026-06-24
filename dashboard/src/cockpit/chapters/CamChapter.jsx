import CamReport from "../../cam/CamReport.jsx";

// Finale chapter 3 — the auto-generated Credit Appraisal Memo, rendered inline
// inside the cockpit frame (no modal). Its own left-nav + content scroll within
// the panel, so the cockpit shell stays fixed.
export default function CamChapter() {
  return (
    <div className="h-full w-full">
      <CamReport inline />
    </div>
  );
}
