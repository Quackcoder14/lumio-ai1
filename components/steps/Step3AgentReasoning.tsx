"use client";

import { useState, useEffect } from "react";
import type { AgentMessage } from "@/lib/types";

interface Props {
  agents: AgentMessage[];
  isSimulated: boolean;
  onContinue: () => void;
}

const AGENT_CONFIG = {
  finops: {
    name: "FinOps Agent",
    role: "Cost Optimization Specialist",
    emoji: "💰",
    color: "#00E676",
    bgColor: "rgba(0, 230, 118, 0.08)",
    borderColor: "rgba(0, 230, 118, 0.25)",
    tool: "Infracost MCP + AWS Pricing API",
  },
  security: {
    name: "Security Agent",
    role: "Cloud Security Engineer",
    emoji: "🛡️",
    color: "#FF4444",
    bgColor: "rgba(255, 68, 68, 0.08)",
    borderColor: "rgba(255, 68, 68, 0.25)",
    tool: "Checkov MCP + CVE Database",
  },
  coordinator: {
    name: "Architect Agent",
    role: "Coordinator & Trade-off Resolver",
    emoji: "🏗️",
    color: "#FF9900",
    bgColor: "rgba(255, 153, 0, 0.08)",
    borderColor: "rgba(255, 153, 0, 0.25)",
    tool: "LangGraph Orchestrator",
  },
};

export default function Step3AgentReasoning({ agents, isSimulated, onContinue }: Props) {
  const [visibleThoughts, setVisibleThoughts] = useState<Record<string, number>>({ finops: 0, security: 0, coordinator: 0 });
  const [activeAgent, setActiveAgent] = useState<string>("finops");
  const [phase, setPhase] = useState<"running" | "done">("running");

  useEffect(() => {
    let delay = 0;
    const updates: Array<() => void> = [];

    // Animate thoughts appearing
    agents.forEach((agent) => {
      agent.thinking.forEach((_, idx) => {
        const agentKey = agent.agent;
        delay += 400;
        updates.push(() => {
          setVisibleThoughts(prev => ({ ...prev, [agentKey]: idx + 1 }));
          setActiveAgent(agentKey);
        });
      });
      delay += 300;
    });

    const timers: ReturnType<typeof setTimeout>[] = [];
    let currentDelay = 500;
    updates.forEach(fn => {
      timers.push(setTimeout(fn, currentDelay));
      currentDelay += 500;
    });

    timers.push(setTimeout(() => setPhase("done"), currentDelay + 200));

    return () => timers.forEach(clearTimeout);
  }, [agents]);

  const coordinator = agents.find(a => a.agent === "coordinator");

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-aws-teal/10 border border-aws-teal/20 text-aws-teal text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-aws-teal animate-pulse" />
            {phase === "running" ? "Multi-Agent Reasoning Active" : "Reasoning Complete"}
          </span>
          {isSimulated && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-aws-dark-4 border border-aws-border text-aws-text-dim">
              Simulation Mode
            </span>
          )}
        </div>
        <h2 className="text-3xl font-black tracking-tight">Step 3: Multi-Agent AI Reasoning</h2>
        <p className="text-aws-text-muted mt-1">
          LangGraph orchestrates specialized agents communicating via MCP protocols
        </p>
      </div>

      {/* LangGraph flow visualization */}
      <div className="glass-card p-4 mb-8 overflow-x-auto">
        <div className="flex items-center gap-3 min-w-max">
          <div className="flex flex-col items-center gap-1">
            <div className="px-3 py-1.5 rounded-lg bg-aws-dark-4 border border-aws-border text-xs text-aws-text-muted text-center">
              Infracost JSON
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-aws-dark-4 border border-aws-border text-xs text-aws-text-muted text-center">
              Checkov JSON
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="h-px w-8 bg-aws-green/50" />
            <div className="h-px w-8 bg-red-400/50" />
          </div>

          <div className="flex flex-col gap-2">
            <AgentNodeBadge agent="finops" config={AGENT_CONFIG.finops} active={activeAgent === "finops"} done={visibleThoughts.finops > 0} />
            <AgentNodeBadge agent="security" config={AGENT_CONFIG.security} active={activeAgent === "security"} done={visibleThoughts.security > 0} />
          </div>

          <div className="flex flex-col gap-2">
            <div className="h-px w-8 bg-aws-border" />
            <div className="h-px w-8 bg-aws-border" />
          </div>

          <AgentNodeBadge agent="coordinator" config={AGENT_CONFIG.coordinator} active={activeAgent === "coordinator"} done={visibleThoughts.coordinator > 0} large />

          <div className="h-px w-8 bg-aws-orange/50" />

          <div className="px-3 py-2 rounded-lg bg-aws-orange/10 border border-aws-orange/30 text-xs text-aws-orange text-center font-medium">
            Unified<br/>Recommendation
          </div>
        </div>

        <p className="text-xs text-aws-text-dim mt-2 text-center">
          LangGraph state machine with MCP tool calls — parallel execution → coordinator synthesis
        </p>
      </div>

      {/* Agent reasoning panels */}
      <div className="grid md:grid-cols-3 gap-5 mb-8">
        {agents.map((agent) => {
          const config = AGENT_CONFIG[agent.agent];
          const shown = visibleThoughts[agent.agent];
          const isActive = activeAgent === agent.agent && phase === "running";

          return (
            <div
              key={agent.agent}
              className="glass-card overflow-hidden"
              style={{
                borderColor: shown > 0 ? config.borderColor : undefined,
                boxShadow: isActive ? `0 0 20px ${config.color}20` : undefined,
              }}
            >
              <div className="p-4 border-b border-aws-border" style={{ background: shown > 0 ? config.bgColor : undefined }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{config.emoji}</span>
                  <div>
                    <div className="font-bold text-sm">{config.name}</div>
                    <div className="text-xs text-aws-text-dim">{config.role}</div>
                  </div>
                  {isActive && (
                    <div className="ml-auto w-4 h-4 spinner" />
                  )}
                  {shown >= agent.thinking.length && (
                    <div className="ml-auto text-xs" style={{ color: config.color }}>✓ Done</div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-aws-text-dim">Tool:</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-aws-dark-3 border border-aws-border text-aws-text-muted font-mono">
                    {config.tool}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-2 min-h-40">
                {agent.thinking.slice(0, shown).map((thought, idx) => (
                  <div
                    key={idx}
                    className="text-xs text-aws-text-muted leading-relaxed animate-slide-right p-2 rounded-lg bg-aws-dark-4/50"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    {thought}
                  </div>
                ))}

                {shown < agent.thinking.length && phase === "running" && shown > 0 && (
                  <div className="flex gap-1">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-aws-text-dim animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                )}

                {shown >= agent.thinking.length && (
                  <div className="mt-3 pt-3 border-t border-aws-border">
                    <div className="text-xs font-medium mb-1" style={{ color: config.color }}>Confidence</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-aws-dark-4 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full progress-bar-fill"
                          style={{ width: `${agent.confidence * 100}%`, background: config.color }}
                        />
                      </div>
                      <span className="text-xs font-bold" style={{ color: config.color }}>
                        {(agent.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Coordinator output */}
      {coordinator && visibleThoughts.coordinator >= coordinator.thinking.length && (
        <div className="glass-card-bright p-6 mb-8 animate-fade-up">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🎯</span>
            <h3 className="font-bold">Unified Recommendation — Coordinator Output</h3>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-aws-orange/20 border border-aws-orange/30 text-aws-orange">
              Confidence: {(coordinator.confidence * 100).toFixed(0)}%
            </span>
          </div>
          <p className="text-aws-text leading-relaxed text-sm">
            {coordinator.recommendation}
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={onContinue}
          disabled={phase === "running"}
          className={`
            px-6 py-3 font-bold rounded-xl transition-all flex items-center gap-2
            ${phase === "done"
              ? "bg-aws-orange hover:bg-aws-orange-dark text-black hover:scale-105 active:scale-95 orange-glow"
              : "bg-aws-dark-4 text-aws-text-dim cursor-not-allowed border border-aws-border"
            }
          `}
        >
          {phase === "running" ? (
            <>
              <div className="w-4 h-4 spinner" />
              Agents Reasoning...
            </>
          ) : (
            <>
              Generate Terraform Diff
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function AgentNodeBadge({
  agent, config, active, done, large
}: {
  agent: string;
  config: typeof AGENT_CONFIG.finops;
  active: boolean;
  done: boolean;
  large?: boolean;
}) {
  return (
    <div
      className={`
        ${large ? "px-4 py-3" : "px-3 py-2"} rounded-lg border text-center transition-all duration-300
        ${active ? "scale-105" : ""}
      `}
      style={{
        background: done ? config.bgColor : "rgba(30,37,60,0.8)",
        borderColor: done ? config.borderColor : "rgba(42,51,80,0.8)",
        boxShadow: active ? `0 0 12px ${config.color}30` : "none",
      }}
    >
      <div className="text-lg leading-none">{config.emoji}</div>
      <div className="text-[10px] mt-1 font-medium" style={{ color: done ? config.color : "#8892A4" }}>
        {config.name.split(" ")[0]}
      </div>
    </div>
  );
}
