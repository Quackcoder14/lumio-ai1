"use client";

import { useState, useEffect } from "react";
import type { CostBreakdown, SecurityReport } from "@/lib/types";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface Props {
  costBreakdown: CostBreakdown;
  securityReport: SecurityReport;
  isSimulated: boolean;
  onContinue: () => void;
}

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "#FF4444",
  HIGH: "#FF9900",
  MEDIUM: "#FFD700",
  LOW: "#00E676",
};

export default function Step2Analysis({ costBreakdown, securityReport, isSimulated, onContinue }: Props) {
  const [activeTab, setActiveTab] = useState<"cost" | "security">("cost");
  const [animateIn, setAnimateIn] = useState(false);
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => setAnimateIn(true), 100);
  }, []);

  const pieData = [
    { name: "CRITICAL", value: securityReport.critical, color: "#FF4444" },
    { name: "HIGH", value: securityReport.high, color: "#FF9900" },
    { name: "MEDIUM", value: securityReport.medium, color: "#FFD700" },
    { name: "LOW", value: securityReport.low, color: "#00E676" },
  ].filter(d => d.value > 0);

  const barData = costBreakdown.items.slice(0, 6).map(item => ({
    name: item.resource.split(".")[1]?.substring(0, 12) || item.resource.substring(0, 12),
    current: item.currentCost,
    optimized: item.optimizedCost,
    saving: item.saving,
  }));

  const scoreColor = securityReport.score >= 70 ? "#00E676" : securityReport.score >= 40 ? "#FF9900" : "#FF4444";

  return (
    <div
      className="max-w-6xl mx-auto"
      style={{ opacity: animateIn ? 1 : 0, transform: animateIn ? "translateY(0)" : "translateY(20px)", transition: "all 0.6s ease" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-aws-green/10 border border-aws-green/20 text-aws-green text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-aws-green" />
              Scan Complete
            </span>
            {isSimulated && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-aws-dark-4 border border-aws-border text-aws-text-dim">
                Simulation Mode
              </span>
            )}
          </div>
          <h2 className="text-3xl font-black tracking-tight">Step 2: Scan Results</h2>
          <p className="text-aws-text-muted mt-1">Infracost + Checkov/tfsec ran in parallel via Redis queues</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Monthly Spend",
            value: `$${costBreakdown.totalMonthlyCost.toLocaleString()}`,
            sub: "Current",
            color: "#FF4444",
            icon: "💸"
          },
          {
            label: "Potential Savings",
            value: `$${costBreakdown.totalSavings.toLocaleString()}`,
            sub: `${costBreakdown.savingsPercent.toFixed(0)}% reduction`,
            color: "#00E676",
            icon: "💰"
          },
          {
            label: "Security Score",
            value: `${securityReport.score}/100`,
            sub: securityReport.score < 40 ? "Critical risk" : securityReport.score < 70 ? "Needs work" : "Good",
            color: scoreColor,
            icon: "🛡️"
          },
          {
            label: "Issues Found",
            value: securityReport.totalIssues.toString(),
            sub: `${securityReport.critical} critical`,
            color: "#FF9900",
            icon: "⚠️"
          },
        ].map((card) => (
          <div key={card.label} className="glass-card p-4 metric-card">
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs text-aws-text-muted uppercase tracking-wide">{card.label}</span>
              <span className="text-lg">{card.icon}</span>
            </div>
            <div className="text-2xl font-black mb-0.5" style={{ color: card.color }}>{card.value}</div>
            <div className="text-xs text-aws-text-dim">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-aws-border pb-2">
        {[
          { key: "cost", label: "💰 Cost Analysis", badge: `$${costBreakdown.totalSavings.toLocaleString()} savings` },
          { key: "security", label: "🛡️ Security Report", badge: `${securityReport.totalIssues} issues` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as "cost" | "security")}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border
              ${activeTab === tab.key ? "tab-active border-aws-orange/30" : "border-transparent text-aws-text-muted hover:text-aws-text hover:bg-aws-dark-4"}
            `}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? "bg-aws-orange/20 text-aws-orange" : "bg-aws-dark-4 text-aws-text-dim"}`}>
              {tab.badge}
            </span>
          </button>
        ))}
      </div>

      {/* Cost tab */}
      {activeTab === "cost" && (
        <div className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Cost Comparison — Before vs After Optimization</h3>
              <div className="flex gap-3 text-xs">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500/70 inline-block" />Current</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-aws-green/70 inline-block" />Optimized</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData} margin={{ top: 5, right: 20, bottom: 30, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: "#8892A4", fontSize: 10 }} angle={-30} textAnchor="end" />
                <YAxis tick={{ fill: "#8892A4", fontSize: 10 }} tickFormatter={v => `$${v}`} />
                <Tooltip
                  contentStyle={{ background: "#1A2035", border: "1px solid #2A3350", borderRadius: 8 }}
                  labelStyle={{ color: "#E8EAF0" }}
                  formatter={(val: number) => [`$${val.toFixed(2)}`, ""]}
                />
                <Bar dataKey="current" fill="#FF4444" fillOpacity={0.7} radius={[4,4,0,0]} />
                <Bar dataKey="optimized" fill="#00E676" fillOpacity={0.7} radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {costBreakdown.items.map((item, idx) => (
              <div key={idx} className="glass-card p-4 metric-card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium truncate">{item.resource}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400 flex-shrink-0">{item.type}</span>
                    </div>
                    <p className="text-xs text-aws-text-muted leading-relaxed">{item.recommendation}</p>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-aws-text-dim">Savings potential</span>
                        <span className="text-aws-green">{item.savingPercent}%</span>
                      </div>
                      <div className="h-1.5 bg-aws-dark-4 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-aws-green to-aws-teal rounded-full progress-bar-fill"
                          style={{ width: `${item.savingPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-aws-text-dim mb-0.5">
                      <span className="line-through text-red-400">${item.currentCost.toFixed(0)}</span>
                      <span className="mx-1">→</span>
                      <span className="text-aws-green">${item.optimizedCost.toFixed(0)}</span>
                    </div>
                    <div className="text-lg font-bold text-aws-green">-${item.saving.toFixed(0)}<span className="text-xs font-normal">/mo</span></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security tab */}
      {activeTab === "security" && (
        <div className="space-y-6">
          {/* Score + distribution */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card p-6 flex items-center gap-6">
              <div className="relative w-24 h-24 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#1E2535" strokeWidth="10" />
                  <circle
                    cx="50" cy="50" r="40" fill="none"
                    stroke={scoreColor}
                    strokeWidth="10"
                    strokeDasharray={`${securityReport.score * 2.51} 251`}
                    strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 6px ${scoreColor}80)` }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-xl font-black" style={{ color: scoreColor }}>{securityReport.score}</span>
                  <span className="text-[9px] text-aws-text-dim">/ 100</span>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Security Score</h3>
                <p className="text-aws-text-muted text-sm mb-2">
                  {securityReport.score < 40 ? "Critical vulnerabilities detected" : "Infrastructure needs hardening"}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: `${securityReport.passedChecks} passed`, color: "text-aws-green", bg: "bg-aws-green/10" },
                    { label: `${securityReport.failedChecks} failed`, color: "text-red-400", bg: "bg-red-500/10" },
                  ].map(b => (
                    <span key={b.label} className={`text-xs px-2 py-0.5 rounded ${b.bg} ${b.color}`}>{b.label}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4 text-sm">Issue Distribution</h3>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={100} height={100}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={25} outerRadius={45} dataKey="value" strokeWidth={0}>
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} fillOpacity={0.8} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 flex-1">
                  {pieData.map(d => (
                    <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: d.color }} />
                        <span className="text-xs text-aws-text-muted">{d.name}</span>
                      </div>
                      <span className="text-xs font-bold" style={{ color: d.color }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Issues list */}
          <div className="space-y-3">
            {securityReport.issues.map((issue) => (
              <div key={issue.id} className="glass-card overflow-hidden">
                <button
                  className="w-full p-4 text-left flex items-start gap-3 hover:bg-aws-dark-4/50 transition-colors"
                  onClick={() => setExpandedIssue(expandedIssue === issue.id ? null : issue.id)}
                >
                  <span className={`text-xs px-2 py-0.5 rounded font-bold flex-shrink-0 mt-0.5 badge-${issue.severity.toLowerCase()}`}>
                    {issue.severity}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-sm">{issue.title}</span>
                      <span className="text-xs text-aws-text-dim">{issue.check_id}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-aws-text-dim">
                      <span>📁 {issue.file}</span>
                      {issue.line && <span>Line {issue.line}</span>}
                      <span>🔗 {issue.resource}</span>
                    </div>
                  </div>
                  <span className="text-aws-text-dim text-xs flex-shrink-0 mt-0.5">
                    {expandedIssue === issue.id ? "▲" : "▼"}
                  </span>
                </button>

                {expandedIssue === issue.id && (
                  <div className="px-4 pb-4 border-t border-aws-border/50">
                    <div className="pt-3 space-y-3">
                      <div>
                        <span className="text-xs font-medium text-aws-text-muted uppercase tracking-wide">Description</span>
                        <p className="text-sm text-aws-text mt-1 leading-relaxed">{issue.description}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-aws-green uppercase tracking-wide">Recommended Fix</span>
                        <div className="mt-1 code-block text-xs">
                          {issue.fix}
                        </div>
                      </div>
                      <div className="flex gap-3 flex-wrap">
                        {issue.cweId && (
                          <span className="text-xs px-2 py-0.5 rounded bg-aws-dark-4 border border-aws-border text-aws-text-muted">
                            {issue.cweId}
                          </span>
                        )}
                        {issue.docUrl && (
                          <a href={issue.docUrl} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-aws-teal hover:underline" onClick={e => e.stopPropagation()}>
                            📖 AWS Documentation →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Continue */}
      <div className="flex justify-end mt-8">
        <button
          onClick={onContinue}
          className="px-6 py-3 bg-aws-orange hover:bg-aws-orange-dark text-black font-bold rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 orange-glow"
        >
          Proceed to Multi-Agent Reasoning
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
