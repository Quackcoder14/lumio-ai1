"use client";

import { useState, useCallback, useRef } from "react";
import type { ParsedFile } from "@/lib/types";
import { SAMPLE_REPO_FILES } from "@/lib/sampleData";

interface Props {
  onFilesReady: (files: ParsedFile[], isSimulated: boolean) => void;
}

export default function Step1FileInput({ onFilesReady }: Props) {
  const [mode, setMode] = useState<"none" | "repo" | "upload">("none");
  const [repoPhase, setRepoPhase] = useState<"idle" | "connecting" | "connected">("idle");
  const [selectedFile, setSelectedFile] = useState<ParsedFile | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<ParsedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showApiConfig, setShowApiConfig] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleConnectRepo = () => {
    setMode("repo");
    setRepoPhase("connecting");
    setTimeout(() => setRepoPhase("connected"), 2000);
  };

  const handleFileRead = async (file: File): Promise<ParsedFile> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const isTerraform = file.name.endsWith(".tf") || file.name.endsWith(".tfvars");
        const isKubernetes = file.name.endsWith(".yaml") || file.name.endsWith(".yml");
        resolve({
          name: file.name,
          type: isTerraform ? "terraform" : isKubernetes ? "kubernetes" : "unknown",
          content,
          size: `${(file.size / 1024).toFixed(1)} KB`,
        });
      };
      reader.readAsText(file);
    });
  };

  const handleFilesDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f =>
      f.name.endsWith(".tf") || f.name.endsWith(".yaml") || f.name.endsWith(".yml") || f.name.endsWith(".tfvars")
    );
    if (files.length === 0) return;
    const parsed = await Promise.all(files.map(handleFileRead));
    setUploadedFiles(prev => [...prev, ...parsed]);
    setMode("upload");
  }, []);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const parsed = await Promise.all(files.map(handleFileRead));
    setUploadedFiles(prev => [...prev, ...parsed]);
    setMode("upload");
  };

  const handleContinue = () => {
    if (mode === "repo") {
      onFilesReady(SAMPLE_REPO_FILES as ParsedFile[], true);
    } else if (mode === "upload" && uploadedFiles.length > 0) {
      onFilesReady(uploadedFiles, false);
    }
  };

  const filesToShow = mode === "repo" ? SAMPLE_REPO_FILES as ParsedFile[] : uploadedFiles;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10 animate-fade-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-aws-orange/10 border border-aws-orange/20 text-aws-orange text-xs font-medium mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-aws-orange animate-pulse" />
          Step 1 of 5 — Infrastructure Input
        </div>
        <h1 className="text-4xl font-black mb-3 tracking-tight">
          Connect Your Infrastructure
        </h1>
        <p className="text-aws-text-muted text-lg max-w-xl mx-auto">
          Upload Terraform or Kubernetes files, or connect your GitHub repository to begin analysis.
        </p>
      </div>

      {/* Input options */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* GitHub option */}
        <div
          className={`
            relative glass-card p-6 cursor-pointer transition-all duration-300 group
            ${mode === "repo" ? "border-aws-orange/50 orange-glow" : "hover:border-aws-border-light"}
          `}
          onClick={mode !== "repo" ? handleConnectRepo : undefined}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-aws-dark-4 flex items-center justify-center flex-shrink-0 group-hover:bg-aws-orange/10 transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-aws-text">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base mb-1">Connect GitHub Repository</h3>
              <p className="text-aws-text-muted text-sm">
                Auto-discover .tf and .yaml files from your repository
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["terraform/*.tf", "k8s/*.yaml", ".github/**"].map(t => (
                  <span key={t} className="text-xs px-2 py-0.5 rounded bg-aws-dark-4 text-aws-text-dim border border-aws-border">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {repoPhase === "connecting" && (
            <div className="mt-4 flex items-center gap-3 p-3 rounded-lg bg-aws-dark-4">
              <div className="w-4 h-4 spinner" />
              <span className="text-sm text-aws-text-muted">Connecting to GitHub...</span>
            </div>
          )}

          {repoPhase === "connected" && (
            <div className="mt-4 p-3 rounded-lg bg-aws-green/5 border border-aws-green/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-aws-green text-sm">✓ Connected:</span>
                <span className="text-aws-text text-sm font-medium">myorg/production-infra</span>
              </div>
              <div className="text-xs text-aws-text-dim">Branch: main • Last commit: 2h ago</div>
            </div>
          )}

          {mode === "repo" && repoPhase === "connected" && (
            <div className="absolute top-3 right-3">
              <span className="text-xs px-2 py-0.5 rounded-full bg-aws-orange/15 border border-aws-orange/30 text-aws-orange">
                Simulation Mode
              </span>
            </div>
          )}
        </div>

        {/* Upload option */}
        <div
          className={`
            relative glass-card p-6 cursor-pointer transition-all duration-300 border-2 border-dashed
            ${isDragging ? "border-aws-orange bg-aws-orange/5" : mode === "upload" ? "border-aws-orange/50" : "border-aws-border hover:border-aws-border-light"}
          `}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleFilesDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".tf,.tfvars,.yaml,.yml"
            className="hidden"
            onChange={handleFileInput}
          />

          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${isDragging ? "bg-aws-orange/20" : "bg-aws-dark-4"}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-aws-text">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base mb-1">Upload Infrastructure Files</h3>
              <p className="text-aws-text-muted text-sm">
                Drop .tf, .tfvars, .yaml, .yml files here
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {[".tf", ".tfvars", ".yaml", ".yml"].map(t => (
                  <span key={t} className="text-xs px-2 py-0.5 rounded bg-aws-dark-4 text-aws-text-dim border border-aws-border">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-aws-green/5 border border-aws-green/20">
              <span className="text-aws-green text-sm">✓ {uploadedFiles.length} file{uploadedFiles.length > 1 ? "s" : ""} uploaded</span>
            </div>
          )}
        </div>
      </div>

      {/* File browser */}
      {filesToShow.length > 0 && (
        <div className="glass-card p-6 mb-6 animate-fade-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-aws-text-muted uppercase tracking-wider">
              {mode === "repo" ? "Repository Files" : "Uploaded Files"}
            </h3>
            <span className="text-xs text-aws-text-dim">{filesToShow.length} file{filesToShow.length > 1 ? "s" : ""} ready</span>
          </div>
          <div className="grid md:grid-cols-3 gap-3 mb-4">
            {filesToShow.map((file) => (
              <button
                key={file.name}
                onClick={() => setSelectedFile(selectedFile?.name === file.name ? null : file)}
                className={`
                  p-3 rounded-lg border text-left transition-all
                  ${selectedFile?.name === file.name ? "border-aws-orange/50 bg-aws-orange/5" : "border-aws-border hover:border-aws-border-light bg-aws-dark-4"}
                `}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{file.type === "terraform" ? "🏗️" : "☸️"}</span>
                  <span className="text-sm font-medium truncate">{file.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${file.type === "terraform" ? "bg-purple-500/15 text-purple-400" : "bg-blue-500/15 text-blue-400"}`}>
                    {file.type}
                  </span>
                  <span className="text-xs text-aws-text-dim">{file.size}</span>
                </div>
              </button>
            ))}
          </div>

          {/* File content viewer */}
          {selectedFile && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-aws-text-muted">{selectedFile.name}</span>
                <button onClick={() => setSelectedFile(null)} className="text-xs text-aws-text-dim hover:text-aws-text">✕ Close</button>
              </div>
              <div className="code-block max-h-64 overflow-y-auto">
                {selectedFile.content.split("\n").map((line, i) => (
                  <span key={i} className="code-neutral">
                    <span className="select-none text-aws-text-dim mr-3 text-xs">{String(i + 1).padStart(3, " ")}</span>
                    {line}
                    {"\n"}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* API Key config */}
      {mode === "upload" && uploadedFiles.length > 0 && (
        <div className="glass-card p-4 mb-6 border-aws-orange/20">
          <button
            onClick={() => setShowApiConfig(!showApiConfig)}
            className="flex items-center gap-2 text-sm text-aws-text-muted hover:text-aws-text w-full"
          >
            <span>⚙️</span>
            <span>API Configuration {showApiConfig ? "▲" : "▼"}</span>
          </button>
          {showApiConfig && (
            <div className="mt-3">
              <label className="text-xs text-aws-text-muted block mb-1">Gemini API Key (for real analysis)</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  (window as any).__LUMIO_GEMINI_KEY = e.target.value;
                }}
                placeholder="AIza..."
                className="w-full bg-aws-dark-3 border border-aws-border rounded-lg px-3 py-2 text-sm text-aws-text focus:outline-none focus:border-aws-orange/50 font-mono"
              />
              <p className="text-xs text-aws-text-dim mt-1">
                Get your key at <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="text-aws-orange hover:underline">aistudio.google.com</a> (free tier available)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Continue button */}
      {(mode === "repo" && repoPhase === "connected") || (mode === "upload" && uploadedFiles.length > 0) ? (
        <div className="flex justify-center animate-fade-up">
          <button
            onClick={handleContinue}
            className="px-8 py-3.5 bg-aws-orange hover:bg-aws-orange-dark text-black font-bold rounded-xl transition-all duration-200 orange-glow hover:scale-105 active:scale-95 flex items-center gap-2.5 text-base"
          >
            <span>🚀</span>
            <span>Start Analysis</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      ) : null}

      {/* Info cards */}
      <div className="mt-12 grid md:grid-cols-3 gap-4">
        {[
          { icon: "🔒", title: "Privacy First", desc: "Files are processed client-side. Nothing is stored permanently." },
          { icon: "⚡", title: "Parallel Processing", desc: "Cost and security scans run simultaneously via queued jobs." },
          { icon: "🤖", title: "Multi-Agent AI", desc: "FinOps, Security, and Coordinator agents using LangGraph + MCP." },
        ].map(card => (
          <div key={card.title} className="glass-card p-4 text-center metric-card">
            <div className="text-2xl mb-2">{card.icon}</div>
            <h4 className="font-semibold text-sm mb-1">{card.title}</h4>
            <p className="text-aws-text-dim text-xs leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
