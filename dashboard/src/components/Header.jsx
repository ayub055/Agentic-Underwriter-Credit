import TrustBadge from "./TrustBadge.jsx";
import BrandMark from "./BrandMark.jsx";

export default function Header({ applicationId }) {
  return (
    <header className="mb-6 flex items-center justify-between gap-4">
      <BrandMark size="md" subtitle={<>Application <span className="tabular-nums">{applicationId}</span></>} />
      <TrustBadge />
    </header>
  );
}
