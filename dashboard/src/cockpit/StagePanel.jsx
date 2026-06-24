import PhaseDetail from "../backend/PhaseDetail.jsx";
import BackendConsole from "../backend/BackendConsole.jsx";
import IntakeChecksCallout from "../backend/IntakeChecksCallout.jsx";
import TelePdCallout from "../backend/TelePdCallout.jsx";
import VerdictChapter from "./chapters/VerdictChapter.jsx";
import CustomerChapter from "./chapters/CustomerChapter.jsx";
import CamChapter from "./chapters/CamChapter.jsx";

// The one panel that swaps content in place as the cursor advances. The cockpit
// shell (top bar + rail) is fixed; only this panel's inner region scrolls — that
// is what eliminates the page "moving up and down".
export default function StagePanel({
  chapter,
  status,
  entries,
  dict,
  intakeOpen,
  intakeProgress,
  telePdOpen,
  telePdProgress,
  goTo,
  indices,
}) {
  const kind = chapter.chapterKind;

  // CAM memo fills the panel (it brings its own nav + scroll).
  if (kind === "cam") {
    return (
      <div key={chapter.id} className="h-full min-h-0 p-3 sm:p-4">
        <CamChapter />
      </div>
    );
  }

  // Verdict / customer payoff — centered, internally scrolling.
  if (kind === "verdict" || kind === "customer") {
    return (
      <div key={chapter.id} className="h-full min-h-0 overflow-y-auto p-4 sm:p-6 animate-fade-up">
        {kind === "verdict" ? (
          <VerdictChapter
            onSeeCustomer={() => goTo(indices.customer)}
            onOpenCam={() => goTo(indices.cam)}
          />
        ) : (
          <CustomerChapter onAdvance={() => goTo(indices.cam)} />
        )}
      </div>
    );
  }

  // Pipeline stage — detail (with inline ceremony) + live runtime console.
  return (
    <div
      key={chapter.id}
      className="grid h-full min-h-0 grid-cols-1 gap-4 p-3 sm:p-4 lg:grid-cols-[minmax(0,1fr)_352px]"
    >
      <div className="min-h-0 overflow-y-auto pr-0.5">
        {chapter.id === "intake" && intakeOpen && (
          <div className="mb-4 flex justify-center animate-fade-up">
            <IntakeChecksCallout progress={intakeProgress} />
          </div>
        )}
        {chapter.id === "telePd" && telePdOpen && (
          <div className="mb-4 flex justify-center animate-fade-up">
            <TelePdCallout progress={telePdProgress} />
          </div>
        )}
        <PhaseDetail phase={chapter} status={status} />
      </div>

      <aside className="hidden min-h-0 lg:block">
        <BackendConsole entries={entries} dict={dict} />
      </aside>
    </div>
  );
}
