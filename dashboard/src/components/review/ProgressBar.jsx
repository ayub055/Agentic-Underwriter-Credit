export default function ProgressBar() {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-progress-200/60">
      <div className="h-full w-2/5 rounded-full bg-progress-500 motion-safe:animate-slide" />
    </div>
  );
}
