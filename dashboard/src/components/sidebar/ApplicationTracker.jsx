import StepperNode from "./StepperNode.jsx";

export default function ApplicationTracker({ steps }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Application Tracker
      </h2>
      <ol className="list-none">
        {steps.map((step, i) => (
          <StepperNode
            key={step.id}
            label={step.label}
            state={step.state}
            isLast={i === steps.length - 1}
          />
        ))}
      </ol>
    </div>
  );
}
