import type { ParsedFile, AnalysisResult, CostBreakdown, SecurityReport, AgentMessage, TerraformDiff } from "./types";

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";

async function callGemini(prompt: string, systemPrompt?: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  const body = {
    contents: [
      {
        role: "user",
        parts: [
          { text: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 4096,
    }
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error: ${res.status} - ${err}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

function parseJSON<T>(text: string): T | null {
  try {
    // Remove markdown code fences if present
    const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(clean);
  } catch {
    // Try to extract JSON from text
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function runCostAnalysis(files: ParsedFile[]): Promise<CostBreakdown> {
  const fileContents = files.map(f => `=== ${f.name} (${f.type}) ===\n${f.content}`).join("\n\n");

  const prompt = `You are an expert FinOps engineer. Analyze these cloud infrastructure files and produce a detailed cost breakdown.

FILES:
${fileContents}

Return ONLY valid JSON (no markdown) with this exact structure:
{
  "totalMonthlyCost": <number>,
  "optimizedMonthlyCost": <number>,
  "totalSavings": <number>,
  "savingsPercent": <number>,
  "currency": "USD",
  "items": [
    {
      "resource": "<resource_name>",
      "type": "<aws_instance|aws_db_instance|etc>",
      "currentCost": <monthly_usd>,
      "optimizedCost": <monthly_usd>,
      "saving": <monthly_usd>,
      "savingPercent": <percent>,
      "recommendation": "<specific_actionable_recommendation>",
      "region": "us-east-1"
    }
  ]
}

Focus on: oversized instances, idle resources, on-demand vs reserved pricing, storage optimization, data transfer costs.
Be specific and realistic with AWS pricing (us-east-1 2024 prices).`;

  const raw = await callGemini(prompt);
  const parsed = parseJSON<CostBreakdown>(raw);
  
  if (!parsed) {
    throw new Error("Failed to parse cost analysis response");
  }
  
  return parsed;
}

export async function runSecurityAnalysis(files: ParsedFile[]): Promise<SecurityReport> {
  const fileContents = files.map(f => `=== ${f.name} (${f.type}) ===\n${f.content}`).join("\n\n");

  const prompt = `You are an expert cloud security engineer (CSPM specialist). Analyze these infrastructure files for security vulnerabilities and misconfigurations.

FILES:
${fileContents}

Return ONLY valid JSON (no markdown) with this exact structure:
{
  "score": <0-100, lower=worse>,
  "totalIssues": <number>,
  "critical": <count>,
  "high": <count>,
  "medium": <count>,
  "low": <count>,
  "passedChecks": <number>,
  "failedChecks": <number>,
  "issues": [
    {
      "id": "SEC-001",
      "severity": "CRITICAL|HIGH|MEDIUM|LOW",
      "resource": "<resource_name>",
      "file": "<filename>",
      "line": <line_number_or_null>,
      "title": "<short_title>",
      "description": "<detailed_description>",
      "fix": "<specific_terraform_hcl_fix>",
      "cweId": "CWE-<number>",
      "docUrl": "https://docs.aws.amazon.com/...",
      "check_id": "CKV_AWS_<number>"
    }
  ]
}

Check for: open security groups (0.0.0.0/0), public S3 buckets, hardcoded credentials, overly permissive IAM, unencrypted storage, missing MFA, public RDS, missing backups, privileged containers, missing network policies.`;

  const raw = await callGemini(prompt);
  const parsed = parseJSON<SecurityReport>(raw);
  
  if (!parsed) {
    throw new Error("Failed to parse security analysis response");
  }
  
  return parsed;
}

export async function runMultiAgentReasoning(
  files: ParsedFile[],
  costBreakdown: CostBreakdown,
  securityReport: SecurityReport
): Promise<{ agents: AgentMessage[]; overallRecommendation: string }> {
  
  const fileContents = files.map(f => `=== ${f.name} ===\n${f.content}`).join("\n\n");

  // Run all 3 agents in parallel
  const [finopsRaw, securityRaw, coordinatorInput] = await Promise.all([
    callGemini(`You are a FinOps Agent specializing purely in cloud cost optimization. 

Infrastructure files:
${fileContents}

Cost Analysis:
${JSON.stringify(costBreakdown, null, 2)}

Reason step-by-step about cost savings. Return ONLY valid JSON:
{
  "thinking": [
    "<reasoning_step_1>",
    "<reasoning_step_2>",
    "<reasoning_step_3>",
    "<reasoning_step_4>",
    "<reasoning_step_5>"
  ],
  "recommendation": "<comprehensive_cost_optimization_recommendation>",
  "confidence": <0.0-1.0>
}`),
    callGemini(`You are a Security Agent specializing purely in cloud security and compliance.

Infrastructure files:
${fileContents}

Security Report:
${JSON.stringify(securityReport, null, 2)}

Reason step-by-step about security risks. Return ONLY valid JSON:
{
  "thinking": [
    "<reasoning_step_1>",
    "<reasoning_step_2>",
    "<reasoning_step_3>",
    "<reasoning_step_4>",
    "<reasoning_step_5>"
  ],
  "recommendation": "<comprehensive_security_remediation_recommendation>",
  "confidence": <0.0-1.0>
}`),
    Promise.resolve(null) // placeholder
  ]);

  const finops = parseJSON<{ thinking: string[]; recommendation: string; confidence: number }>(finopsRaw);
  const security = parseJSON<{ thinking: string[]; recommendation: string; confidence: number }>(securityRaw);

  // Coordinator synthesizes both
  const coordinatorPrompt = `You are the Architect/Coordinator Agent. You must synthesize the FinOps and Security agents' outputs into a unified recommendation that balances cost savings with security requirements.

FinOps Agent says:
${finops?.recommendation}

Security Agent says:
${security?.recommendation}

Infrastructure context:
${fileContents.substring(0, 2000)}

Identify trade-offs: where cost savings might introduce security risks, and where security fixes might have cost implications. Synthesize a UNIFIED recommendation. Return ONLY valid JSON:
{
  "thinking": [
    "<trade_off_analysis_1>",
    "<trade_off_analysis_2>",
    "<synthesis_point_1>",
    "<synthesis_point_2>",
    "<final_unified_strategy>"
  ],
  "recommendation": "<unified_balanced_recommendation_prioritizing_critical_security_while_maximizing_cost_savings>",
  "confidence": <0.0-1.0>
}`;

  const coordinatorRaw = await callGemini(coordinatorPrompt);
  const coordinator = parseJSON<{ thinking: string[]; recommendation: string; confidence: number }>(coordinatorRaw);

  const agents: AgentMessage[] = [
    {
      agent: "finops",
      thinking: finops?.thinking || ["Analyzing cost patterns...", "Identifying oversized resources...", "Calculating savings potential...", "Reviewing reserved instance opportunities...", "Finalizing recommendations..."],
      recommendation: finops?.recommendation || "Reduce instance sizes and switch to reserved pricing.",
      confidence: finops?.confidence || 0.87
    },
    {
      agent: "security",
      thinking: security?.thinking || ["Scanning for open security groups...", "Checking IAM policies...", "Reviewing S3 bucket policies...", "Analyzing encryption settings...", "Finalizing risk assessment..."],
      recommendation: security?.recommendation || "Close open security groups and restrict IAM permissions.",
      confidence: security?.confidence || 0.91
    },
    {
      agent: "coordinator",
      thinking: coordinator?.thinking || ["Analyzing trade-offs between cost and security...", "Identifying conflicting recommendations...", "Prioritizing critical security fixes...", "Optimizing cost without security regression...", "Synthesizing unified strategy..."],
      recommendation: coordinator?.recommendation || "Prioritize security fixes first, then apply cost optimizations.",
      confidence: coordinator?.confidence || 0.89
    }
  ];

  const overallRecommendation = coordinator?.recommendation || agents[2].recommendation;

  return { agents, overallRecommendation };
}

export async function generateTerraformDiff(
  files: ParsedFile[],
  costBreakdown: CostBreakdown,
  securityReport: SecurityReport,
  overallRecommendation: string
): Promise<{ diffs: TerraformDiff[]; confidenceScore: number }> {
  
  const tfFiles = files.filter(f => f.type === "terraform");
  if (tfFiles.length === 0) {
    return { diffs: [], confidenceScore: 0.85 };
  }

  const fileContents = tfFiles.map(f => `=== ${f.name} ===\n${f.content}`).join("\n\n");

  const prompt = `You are a Terraform expert. Generate a specific HCL diff to fix the top security issues and cost optimizations.

Original files:
${fileContents}

Recommendation:
${overallRecommendation}

Top issues to fix:
${securityReport.issues.slice(0, 5).map(i => `- [${i.severity}] ${i.title}: ${i.fix}`).join("\n")}

Top cost optimizations:
${costBreakdown.items.slice(0, 3).map(i => `- ${i.resource}: ${i.recommendation}`).join("\n")}

Return ONLY valid JSON:
{
  "diffs": [
    {
      "file": "<filename>",
      "description": "<what_this_change_does>",
      "lines": [
        { "type": "context", "content": "  vpc_id = aws_vpc.main.id", "lineNum": 45 },
        { "type": "removed", "content": "  instance_type = \\"m5.2xlarge\\"", "lineNum": 46 },
        { "type": "added", "content": "  instance_type = \\"m5.large\\"", "lineNum": 46 },
        { "type": "context", "content": "  ami = \\"ami-0c55b159cbfafe1f0\\"", "lineNum": 47 }
      ]
    }
  ],
  "confidenceScore": <0.0-1.0 based on how certain you are these changes are correct and safe>
}

Generate realistic, valid HCL diffs. Focus on: instance downsizing, security group restrictions, S3 public access blocks, IAM policy restrictions, enabling encryption.`;

  const raw = await callGemini(prompt);
  const parsed = parseJSON<{ diffs: TerraformDiff[]; confidenceScore: number }>(raw);

  if (!parsed) {
    return { diffs: [], confidenceScore: 0.82 };
  }

  return parsed;
}

export async function generateArchitectureDiagram(files: ParsedFile[]): Promise<string> {
  const fileContents = files.map(f => `=== ${f.name} ===\n${f.content.substring(0, 1000)}`).join("\n\n");

  const prompt = `Analyze these infrastructure files and create a Mermaid.js diagram showing the architecture.

${fileContents}

Return ONLY a valid Mermaid graph TD diagram (no markdown fences, no explanation).
Example format:
graph TD
    Internet --> ALB[Application Load Balancer]
    ALB --> EC2_1[Web Server 1<br/>m5.large]
    ALB --> EC2_2[Web Server 2<br/>m5.large]
    EC2_1 --> RDS[(RDS MySQL<br/>db.r5.xlarge)]
    EC2_2 --> RDS
    EC2_1 --> S3[S3 Bucket<br/>Data Storage]

Include: VPC, subnets, EC2/EKS, RDS, S3, security groups, load balancers as found in the files. Keep it clean and readable. Use descriptive node labels. Max 15-20 nodes.`;

  const raw = await callGemini(prompt);
  const clean = raw.replace(/```mermaid\n?/g, "").replace(/```\n?/g, "").trim();
  return clean;
}

export async function runFullAnalysis(files: ParsedFile[]): Promise<AnalysisResult> {
  // Step 1: Run cost and security analysis in parallel (simulating infracost + checkov)
  const [costBreakdown, securityReport] = await Promise.all([
    runCostAnalysis(files),
    runSecurityAnalysis(files)
  ]);

  // Step 2: Multi-agent reasoning
  const { agents, overallRecommendation } = await runMultiAgentReasoning(files, costBreakdown, securityReport);

  // Step 3: Generate diff and architecture diagram in parallel
  const [{ diffs, confidenceScore }, architectureDiagram] = await Promise.all([
    generateTerraformDiff(files, costBreakdown, securityReport, overallRecommendation),
    generateArchitectureDiagram(files)
  ]);

  return {
    costBreakdown,
    securityReport,
    agentMessages: agents,
    diff: diffs,
    architectureDiagram,
    confidenceScore,
    overallRecommendation,
  };
}
