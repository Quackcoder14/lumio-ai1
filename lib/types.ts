export interface ParsedFile {
  name: string;
  type: "terraform" | "kubernetes" | "unknown";
  content: string;
  size: string;
}

export interface CostItem {
  resource: string;
  type: string;
  currentCost: number;
  optimizedCost: number;
  saving: number;
  savingPercent: number;
  recommendation: string;
  region: string;
}

export interface CostBreakdown {
  totalMonthlyCost: number;
  optimizedMonthlyCost: number;
  totalSavings: number;
  savingsPercent: number;
  items: CostItem[];
  currency: string;
}

export interface SecurityIssue {
  id: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  resource: string;
  file: string;
  line?: number;
  title: string;
  description: string;
  fix: string;
  cweId?: string;
  docUrl?: string;
  check_id: string;
}

export interface SecurityReport {
  score: number;
  totalIssues: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  issues: SecurityIssue[];
  passedChecks: number;
  failedChecks: number;
}

export interface AgentMessage {
  agent: "finops" | "security" | "coordinator";
  thinking: string[];
  recommendation: string;
  confidence: number;
}

export interface TerraformDiff {
  file: string;
  lines: Array<{
    type: "added" | "removed" | "context";
    content: string;
    lineNum?: number;
  }>;
  description: string;
}

export interface AnalysisResult {
  costBreakdown: CostBreakdown;
  securityReport: SecurityReport;
  agentMessages: AgentMessage[];
  diff: TerraformDiff[];
  architectureDiagram: string;
  confidenceScore: number;
  overallRecommendation: string;
  prSimulated?: boolean;
}

export type Step = 1 | 2 | 3 | 4 | 5;

export interface AppState {
  currentStep: Step;
  files: ParsedFile[];
  isSimulated: boolean;
  analysisResult: AnalysisResult | null;
  isLoading: boolean;
  loadingMessage: string;
}
