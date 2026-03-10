"use client";

import { useState, useEffect, useRef } from "react";
import type { AnalysisResult, ParsedFile } from "@/lib/types";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, Legend
} from "recharts";

interface Props {
  result: AnalysisResult;
  files: ParsedFile[];
  isSimulated: boolean;
  onReset: () => void;
}

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "#FF4444",
  HIGH: "#FF9900",
  MEDIUM: "#FFD700",
  LOW: "#00E676",
};

export default function Step5Dashboard({ result, files, isSimulated, onReset }: Props) {
  const [activeModule, setActiveModule] = useState<"overview" | "cost" | "security" | "diff" | "architecture">("overview");
  const [prPhase, setPrPhase] = useState<"idle" | "creating" | "created">("idle");
  const [mermaidRendered, setMermaidRendered] = useState(false);
  const mermaidRef = useRef<HTMLDivElement>(null);

  const { costBreakdown, securityReport, agentMessages, diff, architectureDiagram, confidenceScore } = result;

  useEffect(() => {
    if (activeModule === "architecture" && !mermaidRendered) {
      loadMermaid();
    }
  }, [activeModule]);

  const loadMermaid = async () => {
    try {
      const mermaid = (await import("mermaid")).default;
      mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        themeVariables: {
          primaryColor: "#1A2035",
          primaryTextColor: "#E8EAF0",
          primaryBorderColor: "#FF9900",
          lineColor: "#FF9900",
          secondaryColor: "#0D1117",
          tertiaryColor: "#161B29",
          background: "#0A0E1A",
          mainBkg: "#1A2035",
          nodeBorder: "#2A3350",
          clusterBkg: "#161B29",
          titleColor: "#E8EAF0",
          edgeLabelBackground: "#1A2035",
          fontSize: "13px",
        },
      });
      if (mermaidRef.current && architectureDiagram) {
        const id = "arch-diagram";
        const { svg } = await mermaid.render(id, architectureDiagram);
        mermaidRef.current.innerHTML = svg;
        setMermaidRendered(true);
      }
    } catch (e) {
      if (mermaidRef.current) {
        mermaidRef.current.innerHTML = `<div class="text-aws-text-muted text-sm p-4">Architecture diagram unavailable. View the Mermaid code below.</div>`;
      }
    }
  };

  const handleCreatePR = () => {
    setPrPhase("creating");
    setTimeout(() => setPrPhase("created"), 2500);
  };

  // Chart data
  const monthlySavingsData = [
    { month: "Now", spend: costBreakdown.totalMonthlyCost },
    { month: "Month 1", spend: costBreakdown.totalMonthlyCost * 0.75 },
    { month: "Month 2", spend: costBreakdown.totalMonthlyCost * 0.55 },
    { month: "Month 3", spend: costBreakdown.optimizedMonthlyCost * 1.05 },
    { month: "Month 4", spend: costBreakdown.optimizedMonthlyCost * 1.02 },
    { month: "Month 5", spend: costBreakdown.optimizedMonthlyCost },
  ];

  const securityRadarData = [
    { subject: "Network", A: securityReport.issues.filter(i => i.title.includes("Security Group") || i.title.includes("Port")).length === 0 ? 90 : 25 },
    { subject: "IAM", A: securityReport.issues.filter(i => i.title.includes("IAM")).length === 0 ? 85 : 15 },
    { subject: "Storage", A: securityReport.issues.filter(i => i.title.includes("S3") || i.title.includes("Bucket")).length === 0 ? 80 : 30 },
    { subject: "Database", A: securityReport.issues.filter(i => i.title.includes("RDS") || i.title.includes("DB")).length === 0 ? 85 : 20 },
    { subject: "Containers", A: securityReport.issues.filter(i => i.title.includes("Kubernetes") || i.title.includes("Container") || i.title.includes("privileged")).length === 0 ? 80 : 35 },
    { subject: "Secrets", A: securityReport.issues.filter(i => i.title.includes("hardcoded") || i.title.includes("Secret") || i.title.includes("Password")).length === 0 ? 90 : 20 },
  ];

  const issuesBySeverity = [
    { name: "Critical", value: securityReport.critical, color: "#FF4444" },
    { name: "High", value: securityReport.high, color: "#FF9900" },
    { name: "Medium", value: securityReport.medium, color: "#FFD700" },
    { name: "Low", value: securityReport.low, color: "#00E676" },
  ];

  const modules = [
    { key: "overview", label: "Overview", icon: "📊" },
    { key: "cost", label: "Cost Analysis", icon: "💰" },
    { key: "security", label: "Security", icon: "🛡️" },
    { key: "diff", label: "Code Diff", icon: "📝" },
    { key: "architecture", label: "Architecture", icon: "🏗️" },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-aws-orange/10 border border-aws-orange/20 text-aws-orange text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-aws-orange" />
              Analysis Complete
            </span>
            {isSimulated && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-aws-dark-4 border border-aws-border text-aws-text-dim">
                Simulation Mode
              </span>
            )}
          </div>
          <h2 className="text-3xl font-black tracking-tight">LUMIO AI Dashboard</h2>
          <p className="text-aws-text-muted mt-1">
            {files.length} file{files.length > 1 ? "s" : ""} analyzed • {securityReport.totalIssues} issues • ${costBreakdown.totalSavings.toLocaleString()}/mo savings potential
          </p>
        </div>

        {/* PR button */}
        <div>
          {prPhase === "idle" && (
            <button
              onClick={handleCreatePR}
              className="px-5 py-2.5 bg-aws-dark-3 hover:bg-aws-dark-4 border border-aws-border hover:border-aws-orange/40 text-sm font-medium rounded-xl transition-all flex items-center gap-2 group"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-aws-text-muted group-hover:text-aws-text">
                <path d="M18 21a3 3 0 100-6 3 3 0 000 6zm0-10a3 3 0 100-6 3 3 0 000 6zM6 21a3 3 0 100-6 3 3 0 000 6zm0-12V3m12 6v6M6 9v6"/>
              </svg>
              Create Pull Request
              <span className="text-xs px-1.5 py-0.5 rounded bg-aws-dark-4 text-aws-text-dim">GitHub</span>
            </button>
          )}
          {prPhase === "creating" && (
            <div className="px-5 py-2.5 bg-aws-dark-3 border border-aws-border text-sm rounded-xl flex items-center gap-2">
              <div className="w-4 h-4 spinner" />
              Creating PR on GitHub...
            </div>
          )}
          {prPhase === "created" && (
            <div className="px-5 py-2.5 bg-aws-green/10 border border-aws-green/30 text-sm rounded-xl flex items-center gap-2 text-aws-green animate-fade-in">
              <span>✓</span>
              PR #42 created — awaiting review
            </div>
          )}
        </div>
      </div>

      {/* Module tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {modules.map(mod => (
          <button
            key={mod.key}
            onClick={() => setActiveModule(mod.key as typeof activeModule)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all border
              ${activeModule === mod.key
                ? "bg-aws-orange/10 border-aws-orange/30 text-aws-orange"
                : "border-transparent text-aws-text-muted hover:text-aws-text hover:bg-aws-dark-4"
              }
            `}
          >
            <span>{mod.icon}</span>
            {mod.label}
          </button>
        ))}
      </div>

      {/* Overview module */}
      {activeModule === "overview" && (
        <div className="space-y-6 animate-fade-in">
          {/* KPI row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Annual Savings", value: `$${(costBreakdown.totalSavings * 12).toLocaleString()}`, sub: "if all fixes applied", color: "#00E676", icon: "💰" },
              { label: "Security Score", value: `${securityReport.score}/100`, sub: "after fixes: ~85/100", color: securityReport.score >= 70 ? "#00E676" : "#FF4444", icon: "🛡️" },
              { label: "AI Confidence", value: `${(confidenceScore * 100).toFixed(0)}%`, sub: "in recommendations", color: "#FF9900", icon: "🤖" },
              { label: "Critical Issues", value: securityReport.critical.toString(), sub: "need immediate action", color: "#FF4444", icon: "🚨" },
            ].map(card => (
              <div key={card.label} className="glass-card p-4 metric-card">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs text-aws-text-muted">{card.label}</span>
                  <span className="text-xl">{card.icon}</span>
                </div>
                <div className="text-3xl font-black mb-1" style={{ color: card.color }}>{card.value}</div>
                <div className="text-xs text-aws-text-dim">{card.sub}</div>
              </div>
            ))}
          </div>

          {/* Before/After comparison */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span>📉</span> Projected Spend Reduction
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={monthlySavingsData}>
                  <defs>
                    <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF9900" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FF9900" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: "#8892A4", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#8892A4", fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: "#1A2035", border: "1px solid #2A3350", borderRadius: 8 }}
                    formatter={(v: number) => [`$${v.toLocaleString()}`, "Monthly Spend"]}
                  />
                  <Area type="monotone" dataKey="spend" stroke="#FF9900" strokeWidth={2} fill="url(#spendGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span>🔐</span> Security Posture Radar
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={securityRadarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#8892A4", fontSize: 11 }} />
                  <Radar name="Score" dataKey="A" stroke="#FF9900" fill="#FF9900" fillOpacity={0.15} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Coordinator recommendation */}
          <div className="glass-card-bright p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🎯</span>
              <h3 className="font-bold">Coordinator Agent — Unified Action Plan</h3>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-aws-orange/20 text-aws-orange border border-aws-orange/30">
                Confidence: {(confidenceScore * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-aws-text leading-relaxed text-sm">{result.overallRecommendation}</p>
          </div>

          {/* Agent summaries */}
          <div className="grid md:grid-cols-3 gap-4">
            {agentMessages.map(agent => {
              const colors: Record<string, string> = { finops: "#00E676", security: "#FF4444", coordinator: "#FF9900" };
              const emojis: Record<string, string> = { finops: "💰", security: "🛡️", coordinator: "🏗️" };
              const names: Record<string, string> = { finops: "FinOps Agent", security: "Security Agent", coordinator: "Coordinator Agent" };
              return (
                <div key={agent.agent} className="glass-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span>{emojis[agent.agent]}</span>
                    <span className="font-medium text-sm">{names[agent.agent]}</span>
                    <span className="ml-auto text-xs font-bold" style={{ color: colors[agent.agent] }}>
                      {(agent.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-xs text-aws-text-muted leading-relaxed line-clamp-4">{agent.recommendation}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cost module */}
      {activeModule === "cost" && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="glass-card p-5 text-center metric-card">
              <div className="text-xs text-aws-text-muted mb-1">Current Monthly</div>
              <div className="text-3xl font-black text-red-400">${costBreakdown.totalMonthlyCost.toLocaleString()}</div>
              <div className="text-xs text-aws-text-dim mt-1">${(costBreakdown.totalMonthlyCost * 12).toLocaleString()} annually</div>
            </div>
            <div className="glass-card p-5 text-center metric-card">
              <div className="text-xs text-aws-text-muted mb-1">Optimized Monthly</div>
              <div className="text-3xl font-black text-aws-green">${costBreakdown.optimizedMonthlyCost.toLocaleString()}</div>
              <div className="text-xs text-aws-text-dim mt-1">${(costBreakdown.optimizedMonthlyCost * 12).toLocaleString()} annually</div>
            </div>
            <div className="glass-card p-5 text-center metric-card">
              <div className="text-xs text-aws-text-muted mb-1">Total Savings</div>
              <div className="text-3xl font-black text-aws-orange">${costBreakdown.totalSavings.toLocaleString()}</div>
              <div className="text-xs text-aws-green mt-1">↓ {costBreakdown.savingsPercent.toFixed(0)}% reduction</div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4">Resource Cost Breakdown</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={costBreakdown.items.map(i => ({
                name: i.resource.split(".")[1]?.slice(0, 14) || i.resource.slice(0, 14),
                current: i.currentCost,
                optimized: i.optimizedCost,
              }))} margin={{ top: 5, right: 20, bottom: 40, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fill: "#8892A4", fontSize: 10 }} angle={-35} textAnchor="end" />
                <YAxis tick={{ fill: "#8892A4", fontSize: 11 }} tickFormatter={v => `$${v}`} />
                <Tooltip
                  contentStyle={{ background: "#1A2035", border: "1px solid #2A3350", borderRadius: 8 }}
                  formatter={(v: number, name: string) => [`$${v.toFixed(2)}/mo`, name === "current" ? "Current" : "Optimized"]}
                />
                <Legend />
                <Bar dataKey="current" name="Current" fill="#FF4444" fillOpacity={0.7} radius={[4,4,0,0]} />
                <Bar dataKey="optimized" name="Optimized" fill="#00E676" fillOpacity={0.7} radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {costBreakdown.items.map((item, idx) => (
              <div key={idx} className="glass-card p-4 metric-card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{item.resource}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400">{item.type}</span>
                      <span className="text-xs text-aws-text-dim">{item.region}</span>
                    </div>
                    <p className="text-xs text-aws-text-muted leading-relaxed">{item.recommendation}</p>
                  </div>
                  <div className="text-right flex-shrink-0 min-w-24">
                    <div className="text-xs text-aws-text-dim mb-0.5">
                      <span className="text-red-400 line-through">${item.currentCost}/mo</span>
                    </div>
                    <div className="text-xs text-aws-green mb-1">${item.optimizedCost}/mo</div>
                    <div className="text-base font-black text-aws-orange">-${item.saving.toFixed(0)}</div>
                    <div className="text-xs text-aws-green">{item.savingPercent}% saved</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security module */}
      {activeModule === "security" && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4">Security Score</h3>
              <div className="flex items-center gap-6">
                <div className="relative w-28 h-28 flex-shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#1E2535" strokeWidth="10" />
                    <circle cx="50" cy="50" r="40" fill="none"
                      stroke={securityReport.score >= 70 ? "#00E676" : "#FF4444"}
                      strokeWidth="10"
                      strokeDasharray={`${securityReport.score * 2.51} 251`}
                      strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-2xl font-black" style={{ color: securityReport.score >= 70 ? "#00E676" : "#FF4444" }}>
                      {securityReport.score}
                    </span>
                    <span className="text-[10px] text-aws-text-dim">/100</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {issuesBySeverity.map(s => (
                    <div key={s.name} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ background: s.color }} />
                      <span className="text-sm text-aws-text-muted w-16">{s.name}</span>
                      <div className="flex-1 h-1.5 bg-aws-dark-4 rounded-full overflow-hidden w-16">
                        <div className="h-full rounded-full" style={{ width: `${(s.value / securityReport.totalIssues) * 100}%`, background: s.color }} />
                      </div>
                      <span className="text-sm font-bold" style={{ color: s.color }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4">Check Results</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-aws-green/5 border border-aws-green/15">
                  <div className="flex items-center gap-2">
                    <span className="text-aws-green font-bold text-lg">✓</span>
                    <span className="text-sm">Passed Checks</span>
                  </div>
                  <span className="text-2xl font-black text-aws-green">{securityReport.passedChecks}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/15">
                  <div className="flex items-center gap-2">
                    <span className="text-red-400 font-bold text-lg">✗</span>
                    <span className="text-sm">Failed Checks</span>
                  </div>
                  <span className="text-2xl font-black text-red-400">{securityReport.failedChecks}</span>
                </div>
                <div className="p-3 rounded-lg bg-aws-dark-4">
                  <div className="text-xs text-aws-text-muted mb-1">Pass Rate</div>
                  <div className="h-2 bg-aws-dark-3 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-aws-green rounded-full"
                      style={{ width: `${(securityReport.passedChecks / (securityReport.passedChecks + securityReport.failedChecks)) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-aws-text-dim mt-1">
                    {((securityReport.passedChecks / (securityReport.passedChecks + securityReport.failedChecks)) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {securityReport.issues.map((issue) => (
              <div key={issue.id} className="glass-card p-4 metric-card">
                <div className="flex items-start gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded font-bold flex-shrink-0 mt-0.5 badge-${issue.severity.toLowerCase()}`}>
                    {issue.severity}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{issue.title}</span>
                      <span className="text-xs text-aws-text-dim">{issue.check_id}</span>
                    </div>
                    <p className="text-xs text-aws-text-muted leading-relaxed mb-2">{issue.description}</p>
                    <div className="p-2 rounded bg-aws-dark-3 border border-aws-border text-xs font-mono text-aws-green">
                      Fix: {issue.fix}
                    </div>
                    <div className="flex gap-3 mt-2">
                      {issue.cweId && <span className="text-xs text-aws-text-dim">{issue.cweId}</span>}
                      {issue.docUrl && (
                        <a href={issue.docUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-aws-teal hover:underline">
                          📖 Docs →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Diff module */}
      {activeModule === "diff" && (
        <div className="space-y-6 animate-fade-in">
          {diff.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <p className="text-aws-text-muted">No Terraform files were found to generate diffs for.</p>
            </div>
          ) : (
            diff.map((d, idx) => (
              <div key={idx} className="glass-card overflow-hidden">
                <div className="flex items-center gap-3 p-4 border-b border-aws-border bg-aws-dark-3">
                  <span className="text-lg">{d.file.endsWith(".tf") ? "🏗️" : "☸️"}</span>
                  <span className="font-medium">{d.file}</span>
                  <span className="text-xs text-aws-text-muted flex-1">{d.description}</span>
                  <div className="flex gap-2 text-xs">
                    <span className="text-aws-green">+{d.lines.filter(l => l.type === "added").length}</span>
                    <span className="text-red-400">-{d.lines.filter(l => l.type === "removed").length}</span>
                  </div>
                </div>
                <div className="code-block rounded-none border-0">
                  {d.lines.map((line, li) => (
                    <span key={li} className={line.type === "added" ? "code-added" : line.type === "removed" ? "code-removed" : "code-neutral"}>
                      <span className="select-none mr-2 opacity-40">
                        {line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}
                      </span>
                      {line.lineNum && (
                        <span className="select-none mr-3 opacity-30 text-xs w-5 inline-block text-right">{line.lineNum}</span>
                      )}
                      {line.content}{"\n"}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Architecture module */}
      {activeModule === "architecture" && (
        <div className="space-y-6 animate-fade-in">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Infrastructure Architecture Diagram</h3>
              <span className="text-xs text-aws-text-dim">Generated with Mermaid.js</span>
            </div>
            <div ref={mermaidRef} className="min-h-64 flex items-center justify-center">
              {!mermaidRendered && (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 spinner" />
                  <span className="text-sm text-aws-text-muted">Rendering architecture diagram...</span>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-aws-text-muted">Mermaid Source</h4>
            </div>
            <div className="code-block text-xs overflow-x-auto max-h-48">
              {architectureDiagram}
            </div>
          </div>
        </div>
      )}

      {/* Footer actions */}
      <div className="mt-10 pt-8 border-t border-aws-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-aws-text-muted">
          Analysis powered by Gemini 2.0 Flash • LangGraph Agents • MCP Protocol
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              const data = JSON.stringify(result, null, 2);
              const blob = new Blob([data], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "lumio-analysis.json";
              a.click();
            }}
            className="px-4 py-2 text-sm border border-aws-border rounded-lg text-aws-text-muted hover:text-aws-text hover:border-aws-border-light transition-all"
          >
            ⬇ Export Report
          </button>
          <button
            onClick={onReset}
            className="px-4 py-2 text-sm bg-aws-orange hover:bg-aws-orange-dark text-black font-bold rounded-lg transition-all hover:scale-105"
          >
            ↺ New Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
