"use client";

import type { Step } from "@/lib/types";

const STEPS = [
  { num: 1, label: "Files" },
  { num: 2, label: "Scan" },
  { num: 3, label: "Agents" },
  { num: 4, label: "Diff" },
  { num: 5, label: "Dashboard" },
];

export default function StepIndicator({ currentStep }: { currentStep: Step }) {
  return (
    <div className="flex items-center gap-1 hidden sm:flex">
      {STEPS.map((step, idx) => {
        const done = currentStep > step.num;
        const active = currentStep === step.num;
        return (
          <div key={step.num} className="flex items-center">
            <div className="flex items-center gap-1.5">
              <div
                className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                  transition-all duration-300
                  ${done ? "bg-aws-orange text-black" : active ? "bg-aws-orange/20 border border-aws-orange text-aws-orange" : "bg-aws-dark-4 border border-aws-border text-aws-text-dim"}
                `}
              >
                {done ? "✓" : step.num}
              </div>
              <span className={`text-xs font-medium transition-colors ${active ? "text-aws-orange" : done ? "text-aws-text-muted" : "text-aws-text-dim"}`}>
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`w-4 h-px mx-1.5 transition-all duration-500 ${done ? "bg-aws-orange" : "bg-aws-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
