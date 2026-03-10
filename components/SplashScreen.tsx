"use client";

import { useEffect, useState } from "react";

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 1000);
    const t3 = setTimeout(() => setPhase(3), 1800);
    const t4 = setTimeout(() => setPhase(4), 2400);
    const t5 = setTimeout(() => onComplete(), 3600);
    return () => [t1,t2,t3,t4,t5].forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-aws-dark flex items-center justify-center overflow-hidden z-50">
      {/* Animated grid */}
      <div
        className="absolute inset-0 grid-bg opacity-30"
        style={{ transform: `scale(${phase >= 2 ? 1.05 : 1})`, transition: "transform 3s ease" }}
      />

      {/* Radial glow */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,153,0,0.12) 0%, rgba(255,153,0,0.04) 40%, transparent 70%)",
          transform: `scale(${phase >= 2 ? 1.5 : 0.5})`,
          transition: "transform 2s cubic-bezier(0.4,0,0.2,1)",
        }}
      />

      {/* Orbiting particles */}
      {phase >= 2 && [0,1,2,3,4,5].map(i => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-aws-orange"
          style={{
            animation: `orbit${i} ${2 + i * 0.3}s linear infinite`,
            top: "50%",
            left: "50%",
            transform: `rotate(${i * 60}deg) translateX(${120 + i * 15}px)`,
            opacity: 0.6 - i * 0.08,
          }}
        />
      ))}

      {/* Main content */}
      <div className="relative text-center">
        {/* Icon */}
        <div
          className="mb-6 mx-auto"
          style={{
            opacity: phase >= 1 ? 1 : 0,
            transform: `translateY(${phase >= 1 ? 0 : 30}px) scale(${phase >= 2 ? 1 : 0.8})`,
            transition: "all 0.8s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-aws-orange to-aws-orange-dark flex items-center justify-center orange-glow animate-pulse-orange">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M20 4L36 12V20C36 29.3 29 37.3 20 40C11 37.3 4 29.3 4 20V12L20 4Z" fill="rgba(0,0,0,0.3)" stroke="#000" strokeWidth="0.5"/>
              <path d="M20 8L32 14V20C32 27.2 26.8 33.7 20 36C13.2 33.7 8 27.2 8 20V14L20 8Z" fill="rgba(255,153,0,0.2)"/>
              <polygon points="20,11 24,21 20,19 16,21" fill="white" opacity="0.9"/>
              <polygon points="20,29 16,19 20,21 24,19" fill="white" opacity="0.6"/>
            </svg>
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            opacity: phase >= 2 ? 1 : 0,
            transform: `translateY(${phase >= 2 ? 0 : 20}px)`,
            transition: "all 0.8s cubic-bezier(0.4,0,0.2,1) 0.2s",
          }}
        >
          <h1
            className="text-7xl font-black tracking-tight mb-2 orange-glow-text"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              background: "linear-gradient(135deg, #FF9900 0%, #FFD700 50%, #FF9900 100%)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: phase >= 2 ? "shimmer 2s linear infinite" : "none",
            }}
          >
            LUMIO
          </h1>
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-aws-orange opacity-60" />
            <span className="text-aws-text-muted text-sm tracking-[0.4em] uppercase font-medium">AI</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-aws-orange opacity-60" />
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            opacity: phase >= 3 ? 1 : 0,
            transform: `translateY(${phase >= 3 ? 0 : 10}px)`,
            transition: "all 0.6s ease 0.1s",
          }}
        >
          <p className="text-aws-text-muted mt-4 text-base font-light tracking-wide">
            Cloud Intelligence Platform
          </p>
          <p className="text-aws-text-dim text-sm mt-1">
            Optimize. Secure. Automate.
          </p>
        </div>

        {/* Loading bar */}
        <div
          className="mt-8 mx-auto w-48"
          style={{
            opacity: phase >= 3 ? 1 : 0,
            transition: "opacity 0.5s ease",
          }}
        >
          <div className="h-0.5 bg-aws-border rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-aws-orange to-aws-orange-light rounded-full"
              style={{
                width: phase >= 4 ? "100%" : phase >= 3 ? "60%" : "0%",
                transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)",
              }}
            />
          </div>
          <p className="text-aws-text-dim text-xs mt-2 text-center">
            {phase >= 4 ? "Ready" : "Initializing..."}
          </p>
        </div>

        {/* Feature tags */}
        <div
          className="mt-6 flex gap-2 justify-center flex-wrap"
          style={{
            opacity: phase >= 4 ? 1 : 0,
            transition: "opacity 0.5s ease",
          }}
        >
          {["FinOps Agent", "Security Agent", "LangGraph", "MCP"].map((tag, i) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded border border-aws-border text-aws-text-dim"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>
    </div>
  );
}
