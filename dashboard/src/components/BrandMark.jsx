import { Landmark } from "lucide-react";

// One Kotak AI lockup reused across the nav, the customer header, and the CAM —
// so the product reads as a single brand instead of three.
const SIZES = {
  sm: { box: "h-7 w-7 rounded-md", icon: "h-4 w-4", title: "text-title-sm" },
  md: { box: "h-9 w-9 rounded-lg", icon: "h-5 w-5", title: "text-title-sm" },
};

export default function BrandMark({ size = "md", subtitle, className = "" }) {
  const s = SIZES[size] ?? SIZES.md;
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className={`flex flex-shrink-0 items-center justify-center bg-primary-600 text-white ${s.box}`}>
        <Landmark className={s.icon} strokeWidth={2} />
      </div>
      <div className="leading-tight">
        <div className={`font-display font-semibold tracking-tight text-ink ${s.title}`}>Kotak AI</div>
        {subtitle && <div className="text-caption text-slate-500">{subtitle}</div>}
      </div>
    </div>
  );
}
