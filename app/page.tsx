"use client";

import { useState, useEffect } from "react";
import SplashScreen from "@/components/SplashScreen";
import StepIndicator from "@/components/StepIndicator";
import Step1FileInput from "@/components/steps/Step1FileInput";
import Step2Analysis from "@/components/steps/Step2Analysis";
import Step3AgentReasoning from "@/components/steps/Step3AgentReasoning";
import Step4DiffGeneration from "@/components/steps/Step4DiffGeneration";
import Step5Dashboard from "@/components/steps/Step5Dashboard";
import type { AppState, ParsedFile, AnalysisResult, Step } from "@/lib/types";
import { SIMULATED_RESULT } from "@/lib/simulatedResult";
import { runFullAnalysis } from "@/lib/analysis";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [state, setState] = useState<AppState>({
    currentStep: 1,
    files: [],
    isSimulated: false,
    analysisResult: null,
    isLoading: false,
    loadingMessage: "",
  });

  const goToStep = (step: Step) => {
    setState(prev => ({ ...prev, currentStep: step }));
  };

  const handleFilesReady = (files: ParsedFile[], isSimulated: boolean) => {
    setState(prev => ({
      ...prev,
      files,
      isSimulated,
      currentStep: 2,
    }));
  };

  const handleAnalysisComplete = () => {
    setState(prev => ({ ...prev, currentStep: 3 }));
  };

  const handleAgentsComplete = () => {
    setState(prev => ({ ...prev, currentStep: 4 }));
  };

  const handleDiffComplete = () => {
    setState(prev => ({ ...prev, currentStep: 5 }));
  };

  const handleFullAnalysis = async (files: ParsedFile[], isSimulated: boolean) => {
    setState(prev => ({
      ...prev,
      files,
      isSimulated,
      currentStep: 2,
      isLoading: true,
      loadingMessage: "Initializing parallel scan engines...",
    }));

    try {
      if (isSimulated) {
        // Simulate delays for better UX
        await new Promise(r => setTimeout(r, 1500));
        setState(prev => ({ ...prev, loadingMessage: "Running Infracost analysis..." }));
        await new Promise(r => setTimeout(r, 1200));
        setState(prev => ({ ...prev, loadingMessage: "Running Checkov security scan..." }));
        await new Promise(r => setTimeout(r, 1200));
        setState(prev => ({ ...prev, currentStep: 3, loadingMessage: "FinOps Agent reasoning..." }));
        await new Promise(r => setTimeout(r, 1000));
        setState(prev => ({ ...prev, loadingMessage: "Security Agent reasoning..." }));
        await new Promise(r => setTimeout(r, 1000));
        setState(prev => ({ ...prev, loadingMessage: "Coordinator synthesizing..." }));
        await new Promise(r => setTimeout(r, 1000));
        setState(prev => ({ ...prev, currentStep: 4, loadingMessage: "Generating Terraform diff..." }));
        await new Promise(r => setTimeout(r, 1000));
        setState(prev => ({
          ...prev,
          currentStep: 5,
          isLoading: false,
          analysisResult: SIMULATED_RESULT,
        }));
      } else {
        // Real API calls
        const apiKey = (window as any).__LUMIO_GEMINI_KEY;
        if (!apiKey) {
          throw new Error("Please configure your Gemini API key first");
        }
        (process.env as any).NEXT_PUBLIC_GEMINI_API_KEY = apiKey;
        
        setState(prev => ({ ...prev, loadingMessage: "Running cost analysis with Infracost..." }));
        await new Promise(r => setTimeout(r, 500));
        
        const result = await runFullAnalysis(files);
        
        setState(prev => ({
          ...prev,
          currentStep: 5,
          isLoading: false,
          analysisResult: result,
        }));
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        loadingMessage: "",
      }));
      alert(`Analysis failed: ${error instanceof Error ? error.message : "Unknown error"}. Check your API key configuration.`);
    }
  };

  const handleReset = () => {
    setState({
      currentStep: 1,
      files: [],
      isSimulated: false,
      analysisResult: null,
      isLoading: false,
      loadingMessage: "",
    });
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen bg-aws-dark grid-bg relative">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-aws-orange opacity-[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-aws-teal opacity-[0.03] rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-aws-dark-2/90 backdrop-blur-xl border-b border-aws-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aws-orange to-aws-orange-dark flex items-center justify-center text-sm font-bold text-black">
              L
            </div>
            <span className="font-display font-bold text-lg tracking-tight">
              <span className="gradient-text-orange">LUMIO</span>
              <span className="text-aws-text-muted ml-1 font-normal text-sm">AI</span>
            </span>
          </div>

          <StepIndicator currentStep={state.currentStep} />

          <div className="flex items-center gap-2">
            {state.currentStep > 1 && (
              <button
                onClick={handleReset}
                className="text-xs text-aws-text-muted hover:text-aws-text px-3 py-1.5 rounded-lg border border-aws-border hover:border-aws-border-light transition-all"
              >
                ↺ New Analysis
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {state.isLoading && (
          <div className="fixed inset-0 bg-aws-dark/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="glass-card-bright p-8 max-w-md w-full mx-4 text-center">
              <div className="w-16 h-16 spinner mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">LUMIO AI Processing</h3>
              <p className="text-aws-text-muted text-sm">{state.loadingMessage}</p>
              <div className="mt-4 flex gap-1 justify-center">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-aws-orange animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {state.currentStep === 1 && (
          <Step1FileInput onFilesReady={handleFullAnalysis} />
        )}

        {state.currentStep === 2 && state.analysisResult && (
          <Step2Analysis
            costBreakdown={state.analysisResult.costBreakdown}
            securityReport={state.analysisResult.securityReport}
            isSimulated={state.isSimulated}
            onContinue={handleAnalysisComplete}
          />
        )}

        {state.currentStep === 3 && state.analysisResult && (
          <Step3AgentReasoning
            agents={state.analysisResult.agentMessages}
            isSimulated={state.isSimulated}
            onContinue={handleAgentsComplete}
          />
        )}

        {state.currentStep === 4 && state.analysisResult && (
          <Step4DiffGeneration
            diffs={state.analysisResult.diff}
            confidenceScore={state.analysisResult.confidenceScore}
            isSimulated={state.isSimulated}
            onContinue={handleDiffComplete}
          />
        )}

        {state.currentStep === 5 && state.analysisResult && (
          <Step5Dashboard
            result={state.analysisResult}
            files={state.files}
            isSimulated={state.isSimulated}
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  );
}
