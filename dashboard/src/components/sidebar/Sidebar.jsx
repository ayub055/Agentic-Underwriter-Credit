import ApplicationTracker from "./ApplicationTracker.jsx";
import SupportWidget from "./SupportWidget.jsx";

export default function Sidebar({ tracker, onChat }) {
  return (
    <div className="flex flex-col gap-5">
      <ApplicationTracker steps={tracker} />
      <SupportWidget onChat={onChat} />
    </div>
  );
}
