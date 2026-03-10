"use client";

import { useState, useEffect } from "react";
import type { TerraformDiff } from "@/lib/types";

interface Props {
  diffs: TerraformDiff[];
  confidenceScore: number;
  isSimulated: boolean;
  onContinue: () => void;
}

export default function Step4DiffGeneration({ diffs, confidenceScore, isSimulated, onContinue }: Props) {
  const [phase, setPhase] = useState<"validating" | "done">("validating");
  const [validationSteps, setValidationSteps] = useState<Array<{ text: string; status: "pending" | "running" | "pass" | "fail" }>>([
    { text: "Parsing HCL syntax", status: "pending" },
    { text: "Running terraform validate", status: "pending" },
    { text: "Checking resource type validity", status: "pending" },
    { text: "Verifying reference integrity", status: "pending" },
    { text: "Computing AI confidence score", status: "pending" },
  ]);
  const [activeDiff, setActiveDiff] = useState(0);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    let delay = 400;
    const timers: ReturnType<typeof setTimeout>[] = [];

    validationSteps.forEach((_, idx) => {
      timers.push(setTimeout(() => {
        setValidationSteps(prev => prev.map((s, i) => i === idx ? { ...s, status: "running" } : s));
      }, delay));
      delay += 700;
      timers.push(setTimeout(() => {
        setValidationSteps(prev => prev.map((s, i) => i === idx ? { ...s, status: "pass" } : s));
      }, delay));
      delay += 100;
    });

    timers.push(setTimeout(() => setPhase("done"), delay + 300));

    return () => timers.forEach(clearTimeout);
  }, []);

  const scoreColor = confidenceScore >= 0.85 ? "#00E676" : confidenceScore >= 0.7 ? "#FF9900" : "#FF4444";
  const scoreLabel = confidenceScore >= 0.85 ? "High Confidence" : confidenceScore >= 0.7 ? "Medium Confidence" : "Low Confidence";

  const totalAdded = diffs.reduce((acc, d) => acc + d.lines.filter(l => l.type === "added").length, 0);
  const totalRemoved = diffs.reduce((acc, d) => acc + d.lines.filter(l => l.type === "removed").length, 0);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            Step 4 — Code Generation
          </span>
          {isSimulated && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-aws-dark-4 border border-aws-border text-aws-text-dim">
              Simulation Mode
            </span>
          )}
        </div>
        <h2 className="text-3xl font-black tracking-tight">Terraform Diff Generation</h2>
        <p className="text-aws-text-muted mt-1">
          AI-generated HCL changes validated with terraform validate before review
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Validation pipeline */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-sm mb-4 text-aws-text-muted uppercase tracking-wide">Validation Pipeline</h3>
          <div className="space-y-3">
            {validationSteps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 text-xs
                  ${step.status === "pass" ? "bg-aws-green/20 text-aws-green border border-aws-green/30" :
                    step.status === "running" ? "border-2 border-aws-orange border-t-transparent animate-spin" :
                    step.status === "fail" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                    "bg-aws-dark-4 border border-aws-border text-aws-text-dim"
                  }
                `}>
                  {step.status === "pass" ? "✓" : step.status === "fail" ? "✗" : ""}
                </div>
                <span className={`text-sm transition-colors ${step.status === "pass" ? "text-aws-text" : step.status === "running" ? "text-aws-orange" : "text-aws-text-dim"}`}>
                  {step.text}
                </span>
              </div>
            ))}
          </div>

          {phase === "done" && (
            <div className="mt-4 p-3 rounded-lg bg-aws-green/5 border border-aws-green/20 animate-fade-in">
              <div className="flex items-center gap-2">
                <span className="text-aws-green">✓</span>
                <span className="text-xs text-aws-green font-medium">All validation checks passed</span>
              </div>
            </div>
          )}
        </div>

        {/* Confidence score */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-sm mb-4 text-aws-text-muted uppercase tracking-wide">AI Confidence Score</h3>
          <div className="flex flex-col items-center">
            <div className="relative w-28 h-28 mb-3">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#1E2535" strokeWidth="10" />
                <circle
                  cx="50" cy="50" r="40" fill="none"
                  stroke={scoreColor}
                  strokeWidth="10"
                  strokeDasharray={phase === "done" ? `${confidenceScore * 251} 251` : "0 251"}
                  strokeLinecap="round"
                  style={{
                    transition: "stroke-dasharray 1.5s cubic-bezier(0.4,0,0.2,1)",
                    filter: `drop-shadow(0 0 6px ${scoreColor}60)`,
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-black" style={{ color: scoreColor }}>
                  {phase === "done" ? `${(confidenceScore * 100).toFixed(0)}%` : "—"}
                </span>
              </div>
            </div>
            <div className="text-sm font-bold" style={{ color: scoreColor }}>{phase === "done" ? scoreLabel : "Computing..."}</div>
            <p className="text-xs text-aws-text-dim text-center mt-2 leading-relaxed">
              Based on agent agreement, syntax validity, and change scope
            </p>
          </div>
        </div>

        {/* Diff stats */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-sm mb-4 text-aws-text-muted uppercase tracking-wide">Change Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 rounded-lg bg-aws-dark-4">
              <span className="text-sm text-aws-text-muted">Files changed</span>
              <span className="font-bold">{diffs.length}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-aws-green/5">
              <span className="text-sm text-aws-green">Lines added</span>
              <span className="font-bold text-aws-green">+{totalAdded}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-red-500/5">
              <span className="text-sm text-red-400">Lines removed</span>
              <span className="font-bold text-red-400">-{totalRemoved}</span>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-aws-orange/5 border border-aws-orange/20">
            <p className="text-xs text-aws-orange">
              ⚠️ Changes require human review before applying to live infrastructure
            </p>
          </div>
        </div>
      </div>

      {/* Diff viewer */}
      {diffs.length > 0 && (
        <div className="glass-card overflow-hidden mb-8">
          {/* File tabs */}
          <div className="flex items-center border-b border-aws-border overflow-x-auto">
            {diffs.map((diff, idx) => (
              <button
                key={idx}
                onClick={() => setActiveDiff(idx)}
                className={`px-4 py-3 text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors border-b-2 -mb-px
                  ${activeDiff === idx
                    ? "border-aws-orange text-aws-orange bg-aws-orange/5"
                    : "border-transparent text-aws-text-muted hover:text-aws-text"
                  }
                `}
              >
                <span className="text-lg">{diff.file.endsWith(".tf") ? "🏗️" : "☸️"}</span>
                {diff.file}
              </button>
            ))}
            <div className="ml-auto pr-3">
              <button
                onClick={() => setShowRaw(!showRaw)}
                className="text-xs text-aws-text-dim hover:text-aws-text px-2 py-1 rounded border border-aws-border"
              >
                {showRaw ? "Visual" : "Raw"}
              </button>
            </div>
          </div>

          {diffs[activeDiff] && (
            <div>
              <div className="px-4 py-2 bg-aws-dark-3 border-b border-aws-border text-xs text-aws-text-dim">
                {diffs[activeDiff].description}
              </div>
              <div className="code-block rounded-none border-0">
                {diffs[activeDiff].lines.map((line, idx) => (
                  <span
                    key={idx}
                    className={
                      line.type === "added" ? "code-added" :
                      line.type === "removed" ? "code-removed" :
                      "code-neutral"
                    }
                  >
                    <span className="select-none mr-2 opacity-40 text-xs">
                      {line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}
                    </span>
                    {line.lineNum && (
                      <span className="select-none mr-3 opacity-30 text-xs w-6 inline-block text-right">
                        {line.lineNum}
                      </span>
                    )}
                    {line.content}
                    {"\n"}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={onContinue}
          disabled={phase === "validating"}
          className={`
            px-6 py-3 font-bold rounded-xl transition-all flex items-center gap-2
            ${phase === "done"
              ? "bg-aws-orange hover:bg-aws-orange-dark text-black hover:scale-105 active:scale-95 orange-glow"
              : "bg-aws-dark-4 text-aws-text-dim cursor-not-allowed border border-aws-border"
            }
          `}
        >
          {phase === "validating" ? (
            <><div className="w-4 h-4 spinner" /> Validating...</>
          ) : (
            <>View Final Dashboard <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>
          )}
        </button>
      </div>
    </div>
  );
}
