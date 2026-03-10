import type { AnalysisResult } from "./types";

export const SIMULATED_RESULT: AnalysisResult = {
  costBreakdown: {
    totalMonthlyCost: 8742.50,
    optimizedMonthlyCost: 3891.20,
    totalSavings: 4851.30,
    savingsPercent: 55.5,
    currency: "USD",
    items: [
      {
        resource: "aws_instance.web_server (x3)",
        type: "aws_instance",
        currentCost: 1320.00,
        optimizedCost: 330.00,
        saving: 990.00,
        savingPercent: 75,
        recommendation: "Downsize from m5.2xlarge ($440/mo each) to m5.large ($110/mo each). CPU utilization is <10%. Switch to 1-year Reserved Instance for additional 40% savings.",
        region: "us-east-1"
      },
      {
        resource: "aws_db_instance.main_db",
        type: "aws_db_instance",
        currentCost: 2890.00,
        optimizedCost: 720.00,
        saving: 2170.00,
        savingPercent: 75,
        recommendation: "Downsize from db.r5.4xlarge to db.r5.xlarge. Enable Multi-AZ for HA. Use Aurora Serverless v2 for variable workloads. Reduce storage from 500GB to 200GB.",
        region: "us-east-1"
      },
      {
        resource: "aws_eks_node_group.main",
        type: "aws_eks_node_group",
        currentCost: 1650.00,
        optimizedCost: 800.00,
        saving: 850.00,
        savingPercent: 52,
        recommendation: "Use Spot instances for 60-70% of node group (save 70% vs on-demand). Implement HPA and cluster autoscaler. Reduce min_size from 5 to 2.",
        region: "us-east-1"
      },
      {
        resource: "aws_s3_bucket.data_bucket",
        type: "aws_s3_bucket",
        currentCost: 320.00,
        optimizedCost: 180.00,
        saving: 140.00,
        savingPercent: 44,
        recommendation: "Enable S3 Intelligent-Tiering for automatic cost optimization. Set lifecycle rules to move objects to Glacier after 90 days.",
        region: "us-east-1"
      },
      {
        resource: "aws_instance.web_server — Data Transfer",
        type: "data_transfer",
        currentCost: 680.00,
        optimizedCost: 320.00,
        saving: 360.00,
        savingPercent: 53,
        recommendation: "Use CloudFront CDN to reduce EC2 data transfer costs. Cache static assets at edge locations.",
        region: "us-east-1"
      },
      {
        resource: "EKS Control Plane",
        type: "aws_eks_cluster",
        currentCost: 147.00,
        optimizedCost: 147.00,
        saving: 0,
        savingPercent: 0,
        recommendation: "EKS control plane cost is fixed. No optimization possible here.",
        region: "us-east-1"
      },
      {
        resource: "CloudWatch Logs & Metrics",
        type: "aws_cloudwatch",
        currentCost: 185.50,
        optimizedCost: 74.20,
        saving: 111.30,
        savingPercent: 60,
        recommendation: "Set log retention policies (30 days for dev, 90 for prod). Use metric filters to reduce custom metrics.",
        region: "us-east-1"
      },
      {
        resource: "NAT Gateway",
        type: "aws_nat_gateway",
        currentCost: 550.00,
        optimizedCost: 320.00,
        saving: 230.00,
        savingPercent: 42,
        recommendation: "Use VPC Gateway Endpoints for S3/DynamoDB traffic (free). Review NAT gateway data processing — consider PrivateLink.",
        region: "us-east-1"
      }
    ]
  },
  securityReport: {
    score: 28,
    totalIssues: 14,
    critical: 4,
    high: 5,
    medium: 3,
    low: 2,
    passedChecks: 12,
    failedChecks: 14,
    issues: [
      {
        id: "SEC-001",
        severity: "CRITICAL",
        resource: "aws_security_group.web_sg",
        file: "main.tf",
        line: 68,
        title: "SSH Port 22 Open to World (0.0.0.0/0)",
        description: "Security group allows SSH access from any IP address. This exposes your servers to brute force attacks, credential stuffing, and unauthorized access from the entire internet.",
        fix: "Restrict SSH to specific bastion host IPs or use AWS Systems Manager Session Manager instead of direct SSH.",
        cweId: "CWE-284",
        docUrl: "https://docs.aws.amazon.com/vpc/latest/userguide/VPC_SecurityGroups.html",
        check_id: "CKV_AWS_25"
      },
      {
        id: "SEC-002",
        severity: "CRITICAL",
        resource: "aws_db_instance.main_db",
        file: "main.tf",
        line: 42,
        title: "Hardcoded Database Password in Terraform",
        description: "Database password 'MyP@ssw0rd123!' is hardcoded directly in the Terraform configuration. This will be stored in plain text in the state file and version control.",
        fix: "Use AWS Secrets Manager or SSM Parameter Store. Reference via: password = data.aws_secretsmanager_secret_version.db_password.secret_string",
        cweId: "CWE-798",
        docUrl: "https://docs.aws.amazon.com/secretsmanager/latest/userguide/integrating_how-services-use-SecretsManager.html",
        check_id: "CKV_SECRET_6"
      },
      {
        id: "SEC-003",
        severity: "CRITICAL",
        resource: "aws_db_instance.main_db",
        file: "main.tf",
        line: 44,
        title: "RDS Instance Publicly Accessible",
        description: "The RDS database is publicly accessible (publicly_accessible = true). Combined with the open security group, this exposes your database directly to the internet.",
        fix: "Set publicly_accessible = false and place RDS in private subnets. Access via VPC internally.",
        cweId: "CWE-306",
        docUrl: "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_VPC.WorkingWithRDSInstanceinaVPC.html",
        check_id: "CKV_AWS_17"
      },
      {
        id: "SEC-004",
        severity: "CRITICAL",
        resource: "aws_iam_role_policy.app_policy",
        file: "main.tf",
        line: 118,
        title: "IAM Policy with Wildcard Action and Resource (*)",
        description: "IAM policy grants Action: ['*'] on Resource: ['*']. This gives the application full admin access to your entire AWS account, violating the principle of least privilege.",
        fix: "Replace with specific actions: [\"s3:GetObject\", \"s3:PutObject\"] and specific resource ARNs.",
        cweId: "CWE-269",
        docUrl: "https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html#grant-least-privilege",
        check_id: "CKV_AWS_40"
      },
      {
        id: "SEC-005",
        severity: "HIGH",
        resource: "aws_s3_bucket.data_bucket",
        file: "main.tf",
        line: 55,
        title: "S3 Bucket Public Access Not Blocked",
        description: "All four S3 public access block settings are disabled. The bucket could be made public via bucket policy or ACLs, exposing potentially sensitive data.",
        fix: "Set all four block_public_* settings to true unless the bucket is intentionally a public CDN.",
        cweId: "CWE-200",
        docUrl: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html",
        check_id: "CKV_AWS_53"
      },
      {
        id: "SEC-006",
        severity: "HIGH",
        resource: "aws_security_group.db_sg",
        file: "main.tf",
        line: 95,
        title: "Database Port 3306 Open to World",
        description: "MySQL port 3306 is exposed to 0.0.0.0/0. Any actor on the internet can attempt to connect to your database directly.",
        fix: "Restrict to application security group CIDR: cidr_blocks = [\"10.0.0.0/16\"] or use security group reference.",
        cweId: "CWE-284",
        docUrl: "https://docs.aws.amazon.com/vpc/latest/userguide/VPC_SecurityGroups.html",
        check_id: "CKV_AWS_25"
      },
      {
        id: "SEC-007",
        severity: "HIGH",
        resource: "aws_db_instance.main_db",
        file: "main.tf",
        line: 46,
        title: "RDS Automated Backups Disabled",
        description: "backup_retention_period = 0 disables automated backups entirely. In a data loss or corruption event, you have no recovery point.",
        fix: "Set backup_retention_period = 7 (minimum) or 30 for production workloads.",
        cweId: "CWE-693",
        docUrl: "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithAutomatedBackups.html",
        check_id: "CKV_AWS_8"
      },
      {
        id: "SEC-008",
        severity: "HIGH",
        resource: "aws_eks_cluster.main",
        file: "main.tf",
        line: 128,
        title: "EKS API Server Public Access Unrestricted",
        description: "EKS API endpoint is publicly accessible with public_access_cidrs = [\"0.0.0.0/0\"]. The Kubernetes API is exposed to the entire internet.",
        fix: "Restrict to your office/VPN IPs: public_access_cidrs = [\"203.0.113.0/24\"] or disable public access entirely.",
        cweId: "CWE-284",
        docUrl: "https://docs.aws.amazon.com/eks/latest/userguide/cluster-endpoint.html",
        check_id: "CKV_AWS_58"
      },
      {
        id: "SEC-009",
        severity: "HIGH",
        resource: "web-frontend (k8s)",
        file: "deployment.yaml",
        line: 32,
        title: "Kubernetes Secret Exposed as Plain Text Environment Variable",
        description: "API_SECRET_KEY and DATABASE_URL with credentials are set as plain text environment variables, visible in pod specs, logs, and to anyone with kubectl access.",
        fix: "Use Kubernetes Secrets: envFrom: - secretRef: name: app-secrets and seal with Sealed Secrets or External Secrets Operator.",
        cweId: "CWE-312",
        docUrl: "https://kubernetes.io/docs/concepts/configuration/secret/",
        check_id: "CKV_K8S_35"
      },
      {
        id: "SEC-010",
        severity: "MEDIUM",
        resource: "aws_s3_bucket_versioning.data_bucket",
        file: "main.tf",
        line: 62,
        title: "S3 Bucket Versioning Disabled",
        description: "Versioning is disabled, meaning accidentally deleted or overwritten objects cannot be recovered.",
        fix: "Set status = \"Enabled\" in versioning_configuration block.",
        cweId: "CWE-693",
        docUrl: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html",
        check_id: "CKV_AWS_52"
      },
      {
        id: "SEC-011",
        severity: "MEDIUM",
        resource: "api-backend (k8s)",
        file: "deployment.yaml",
        line: 68,
        title: "Container Running as Privileged",
        description: "securityContext.privileged = true gives the container near-root access to the host node. A container escape could compromise the entire Kubernetes node.",
        fix: "Remove privileged: true. Set runAsNonRoot: true, runAsUser: 1000, allowPrivilegeEscalation: false.",
        cweId: "CWE-250",
        docUrl: "https://kubernetes.io/docs/concepts/security/pod-security-standards/",
        check_id: "CKV_K8S_16"
      },
      {
        id: "SEC-012",
        severity: "MEDIUM",
        resource: "aws_db_instance.main_db",
        file: "main.tf",
        line: 45,
        title: "RDS Deletion Protection Disabled",
        description: "deletion_protection = false allows the database to be destroyed without additional confirmation, risking accidental data loss.",
        fix: "Set deletion_protection = true for production databases.",
        cweId: "CWE-693",
        docUrl: "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_DeleteInstance.html",
        check_id: "CKV_AWS_293"
      },
      {
        id: "SEC-013",
        severity: "LOW",
        resource: "aws_eks_cluster.main",
        file: "main.tf",
        line: 125,
        title: "EKS Cluster Using Older Kubernetes Version",
        description: "Kubernetes 1.27 has reached end-of-support. Running unsupported versions means no security patches for critical CVEs.",
        fix: "Upgrade to Kubernetes 1.30+. Run: aws eks update-cluster-version --name myapp-prod-cluster --kubernetes-version 1.30",
        cweId: "CWE-1104",
        docUrl: "https://docs.aws.amazon.com/eks/latest/userguide/kubernetes-versions.html",
        check_id: "CKV_AWS_339"
      },
      {
        id: "SEC-014",
        severity: "LOW",
        resource: "deployment.yaml",
        file: "deployment.yaml",
        line: null,
        title: "No Kubernetes NetworkPolicy Defined",
        description: "Without NetworkPolicy, all pods can communicate with each other freely. A compromised pod can reach any other service in the cluster.",
        fix: "Define NetworkPolicy resources with specific podSelector and ingress/egress rules for each deployment.",
        cweId: "CWE-923",
        docUrl: "https://kubernetes.io/docs/concepts/services-networking/network-policies/",
        check_id: "CKV_K8S_7"
      }
    ]
  },
  agentMessages: [
    {
      agent: "finops",
      thinking: [
        "📊 Analyzing EC2 instances: 3x m5.2xlarge running at <10% CPU utilization is textbook over-provisioning. AWS Cost Explorer confirms these could handle current load on m5.large.",
        "💾 RDS db.r5.4xlarge at $2890/month is the biggest waste. Database query analysis shows peak connections under 50 — db.r5.xlarge handles this with room to spare.",
        "🔄 EKS node group has min_size = desired_size = 5, preventing any scale-down. Cluster Autoscaler + HPA would allow scaling to 2 nodes during off-peak hours (nights/weekends).",
        "💰 Spot instance opportunity: EKS workloads with stateless containers are ideal Spot candidates. 60% Spot + 40% On-Demand mix saves ~$600/month with negligible availability impact.",
        "📈 Total identified savings: $4,851/month (55.5%). Recommend immediate action on EC2 and RDS — these alone save $3,160/month with minimal risk."
      ],
      recommendation: "Immediate actions: (1) Downsize 3x m5.2xlarge → m5.large ($990/mo saved), purchase 1-yr Reserved Instances for additional 40% off. (2) Downsize RDS db.r5.4xlarge → db.r5.xlarge with Aurora Serverless v2 consideration ($2,170/mo saved). (3) Add cluster autoscaler + HPA to EKS, add 60% Spot instances ($850/mo saved). (4) Enable S3 Intelligent-Tiering and lifecycle policies ($140/mo saved). Total: $4,851/month savings, $58,212 annually.",
      confidence: 0.91
    },
    {
      agent: "security",
      thinking: [
        "🚨 CRITICAL: SSH port 22 open to 0.0.0.0/0. This is actively scanned by botnets. Combined with the hardcoded credentials in variables.tf, a successful brute-force means full server compromise.",
        "🔐 CRITICAL: IAM policy with Action: ['*'] Resource: ['*'] is the most dangerous configuration possible. This application server has the same permissions as the AWS root account. One SSRF vulnerability = full account takeover.",
        "💥 CRITICAL: RDS is publicly_accessible = true AND has open security group on 3306. The database is directly reachable from the internet with hardcoded credentials — this is essentially an open database.",
        "📦 Kubernetes deployments have hardcoded secrets as environment variables. These appear in pod manifests, logs, and are accessible to anyone with kubectl describe pod access.",
        "🛡️ Priority matrix: Fix IAM wildcards first (account-level risk), then close security groups (network exposure), then RDS public access (data exposure), then Kubernetes secrets (credential exposure)."
      ],
      recommendation: "Priority 1 (Fix within 24hrs): Restrict IAM policy to least-privilege, close SSH to 0.0.0.0/0, set RDS publicly_accessible=false. Priority 2 (Fix within 1 week): Move DB credentials to Secrets Manager, enable S3 public access blocks, restrict EKS API endpoint. Priority 3 (Fix within 1 month): Enable RDS backups and deletion protection, fix Kubernetes privileged containers, add NetworkPolicy, upgrade EKS to 1.30+. Security score improvement: 28/100 → 82/100 after all fixes.",
      confidence: 0.94
    },
    {
      agent: "coordinator",
      thinking: [
        "⚖️ TRADE-OFF: FinOps recommends RDS downsize immediately. Security requires enabling Multi-AZ + backups. These together actually save money vs current setup — net positive on both dimensions.",
        "⚖️ TRADE-OFF: FinOps recommends Spot instances for EKS. Security requires container security policies. These are independent — both can be applied simultaneously without conflict.",
        "✅ SYNERGY: Moving RDS to private subnet (security fix) + using PrivateLink for access (architectural improvement) eliminates NAT Gateway charges for DB traffic — security fix also saves money.",
        "✅ SYNERGY: Replacing hardcoded credentials with Secrets Manager (security fix) + using IAM authentication for RDS (security improvement) eliminates password rotation costs and reduces operational overhead.",
        "🎯 UNIFIED STRATEGY: Apply security fixes in parallel with rightsizing. Start with IAM and security groups (zero cost, immediate risk reduction), then rightsize EC2/RDS (saves $3,160/month), then optimize EKS with Spot + security hardening (saves $850/month additional)."
      ],
      recommendation: "Unified 3-phase plan: PHASE 1 (Week 1, Zero Cost): Fix IAM wildcard permissions, close SSH/DB security groups, block S3 public access, set RDS publicly_accessible=false — these are pure security wins with no cost/performance impact. PHASE 2 (Week 2-3, High ROI): Downsize EC2 (m5.2xlarge→m5.large) and RDS (db.r5.4xlarge→db.r5.xlarge), enable backups and deletion protection — saves $3,160/month. PHASE 3 (Month 2): EKS optimization with Spot instances + cluster autoscaler + security hardening — saves additional $850/month. Final state: Security score 28→85, Monthly savings $4,851, Zero security regressions from cost changes.",
      confidence: 0.89
    }
  ],
  diff: [
    {
      file: "main.tf",
      description: "Fix critical security issues: IAM least-privilege, close security groups, secure RDS",
      lines: [
        { type: "context", content: "resource \"aws_instance\" \"web_server\" {", lineNum: 15 },
        { type: "context", content: "  count         = 3", lineNum: 16 },
        { type: "removed", content: "  instance_type = \"m5.2xlarge\"  # OVERSIZED: avg CPU < 10%", lineNum: 17 },
        { type: "added", content: "  instance_type = \"m5.large\"  # Rightsized: 87.5% cost reduction", lineNum: 17 },
        { type: "context", content: "  ami           = \"ami-0c55b159cbfafe1f0\"", lineNum: 18 },
        { type: "context", content: "", lineNum: 19 },
        { type: "context", content: "resource \"aws_db_instance\" \"main_db\" {", lineNum: 28 },
        { type: "removed", content: "  instance_class    = \"db.r5.4xlarge\"", lineNum: 31 },
        { type: "added", content: "  instance_class    = \"db.r5.xlarge\"  # 75% cost reduction", lineNum: 31 },
        { type: "removed", content: "  password = \"MyP@ssw0rd123!\"  # SECURITY: hardcoded credential", lineNum: 33 },
        { type: "added", content: "  password = data.aws_secretsmanager_secret_version.db_pass.secret_string", lineNum: 33 },
        { type: "removed", content: "  skip_final_snapshot    = true", lineNum: 34 },
        { type: "added", content: "  skip_final_snapshot    = false", lineNum: 34 },
        { type: "removed", content: "  publicly_accessible    = true  # SECURITY: public RDS", lineNum: 35 },
        { type: "added", content: "  publicly_accessible    = false", lineNum: 35 },
        { type: "removed", content: "  deletion_protection    = false", lineNum: 36 },
        { type: "added", content: "  deletion_protection    = true", lineNum: 36 },
        { type: "removed", content: "  multi_az               = false  # No HA", lineNum: 37 },
        { type: "added", content: "  multi_az               = true", lineNum: 37 },
        { type: "removed", content: "  backup_retention_period = 0    # SECURITY: no backups", lineNum: 38 },
        { type: "added", content: "  backup_retention_period = 7", lineNum: 38 },
        { type: "context", content: "", lineNum: 39 },
        { type: "context", content: "resource \"aws_security_group\" \"web_sg\" {", lineNum: 60 },
        { type: "removed", content: "  ingress {", lineNum: 63 },
        { type: "removed", content: "    from_port   = 22", lineNum: 64 },
        { type: "removed", content: "    to_port     = 22", lineNum: 65 },
        { type: "removed", content: "    protocol    = \"tcp\"", lineNum: 66 },
        { type: "removed", content: "    cidr_blocks = [\"0.0.0.0/0\"]  # SECURITY: SSH open to world", lineNum: 67 },
        { type: "removed", content: "  }", lineNum: 68 },
        { type: "added", content: "  # SSH removed: use AWS Systems Manager Session Manager instead", lineNum: 63 },
        { type: "context", content: "", lineNum: 69 },
        { type: "context", content: "resource \"aws_iam_role_policy\" \"app_policy\" {", lineNum: 108 },
        { type: "removed", content: "    Statement = [{", lineNum: 115 },
        { type: "removed", content: "      Effect   = \"Allow\"", lineNum: 116 },
        { type: "removed", content: "      Action   = [\"*\"]           # SECURITY: wildcard permissions", lineNum: 117 },
        { type: "removed", content: "      Resource = [\"*\"]", lineNum: 118 },
        { type: "removed", content: "    }]", lineNum: 119 },
        { type: "added", content: "    Statement = [", lineNum: 115 },
        { type: "added", content: "      {", lineNum: 116 },
        { type: "added", content: "        Effect   = \"Allow\"", lineNum: 117 },
        { type: "added", content: "        Action   = [\"s3:GetObject\", \"s3:PutObject\", \"s3:DeleteObject\"]", lineNum: 118 },
        { type: "added", content: "        Resource = [\"${aws_s3_bucket.data_bucket.arn}/*\"]", lineNum: 119 },
        { type: "added", content: "      },", lineNum: 120 },
        { type: "added", content: "      {", lineNum: 121 },
        { type: "added", content: "        Effect   = \"Allow\"", lineNum: 122 },
        { type: "added", content: "        Action   = [\"secretsmanager:GetSecretValue\"]", lineNum: 123 },
        { type: "added", content: "        Resource = [\"arn:aws:secretsmanager:us-east-1:*:secret:myapp/*\"]", lineNum: 124 },
        { type: "added", content: "      }", lineNum: 125 },
        { type: "added", content: "    ]", lineNum: 126 },
      ]
    },
    {
      file: "deployment.yaml",
      description: "Fix Kubernetes security: remove privileged containers, use Secrets, add security context",
      lines: [
        { type: "context", content: "        - name: frontend", lineNum: 20 },
        { type: "removed", content: "        env:", lineNum: 28 },
        { type: "removed", content: "        - name: DATABASE_URL", lineNum: 29 },
        { type: "removed", content: "          value: \"mysql://admin:MyP@ssw0rd123!@db.internal/myapp\"", lineNum: 30 },
        { type: "removed", content: "        - name: API_SECRET_KEY", lineNum: 31 },
        { type: "removed", content: "          value: \"sk-prod-abc123xyz789\"", lineNum: 32 },
        { type: "added", content: "        envFrom:", lineNum: 28 },
        { type: "added", content: "        - secretRef:", lineNum: 29 },
        { type: "added", content: "            name: app-secrets", lineNum: 30 },
        { type: "added", content: "        securityContext:", lineNum: 31 },
        { type: "added", content: "          runAsNonRoot: true", lineNum: 32 },
        { type: "added", content: "          runAsUser: 1000", lineNum: 33 },
        { type: "added", content: "          allowPrivilegeEscalation: false", lineNum: 34 },
        { type: "added", content: "          readOnlyRootFilesystem: true", lineNum: 35 },
        { type: "context", content: "---", lineNum: 55 },
        { type: "context", content: "spec:", lineNum: 60 },
        { type: "removed", content: "        securityContext:", lineNum: 65 },
        { type: "removed", content: "          privileged: true  # SECURITY: privileged container", lineNum: 66 },
        { type: "removed", content: "          runAsRoot: true", lineNum: 67 },
        { type: "added", content: "        securityContext:", lineNum: 65 },
        { type: "added", content: "          privileged: false", lineNum: 66 },
        { type: "added", content: "          runAsNonRoot: true", lineNum: 67 },
        { type: "added", content: "          runAsUser: 1000", lineNum: 68 },
        { type: "added", content: "          allowPrivilegeEscalation: false", lineNum: 69 },
        { type: "added", content: "          capabilities:", lineNum: 70 },
        { type: "added", content: "            drop: [\"ALL\"]", lineNum: 71 },
      ]
    }
  ],
  architectureDiagram: `graph TD
    Internet(("🌐 Internet")) --> CF["☁️ CloudFront CDN<br/><small>Edge Cache</small>"]
    CF --> ALB["⚖️ Application Load Balancer<br/><small>us-east-1</small>"]
    
    ALB --> EC2_1["🖥️ Web Server 1<br/><small>m5.large → m5.large</small>"]
    ALB --> EC2_2["🖥️ Web Server 2<br/><small>m5.large</small>"]
    ALB --> EC2_3["🖥️ Web Server 3<br/><small>m5.large</small>"]
    
    EC2_1 --> RDS[("🗄️ RDS MySQL<br/><small>db.r5.xlarge<br/>Multi-AZ</small>")]
    EC2_2 --> RDS
    EC2_3 --> RDS
    
    EC2_1 --> S3["🪣 S3 Bucket<br/><small>Data Storage<br/>Intelligent-Tiering</small>"]
    
    Internet --> EKS_ALB["⚖️ EKS Load Balancer"]
    EKS_ALB --> EKS["☸️ EKS Cluster<br/><small>5x m5.xlarge nodes</small>"]
    EKS --> POD1["📦 Frontend Pods<br/><small>8 replicas</small>"]
    EKS --> POD2["📦 Backend Pods<br/><small>6 replicas</small>"]
    
    POD2 --> RDS
    POD2 --> S3
    
    EC2_1 -.->|"🔐 VPC"| VPC_NOTE["🏠 VPC: 10.0.0.0/16<br/><small>Public + Private Subnets</small>"]
    
    SM["🔑 Secrets Manager"] -.-> EC2_1
    SM -.-> POD1
    SM -.-> POD2
    
    style Internet fill:#1a2035,stroke:#FF9900,color:#E8EAF0
    style RDS fill:#1a2035,stroke:#FF4444,color:#E8EAF0
    style S3 fill:#1a2035,stroke:#FF9900,color:#E8EAF0
    style EKS fill:#1a2035,stroke:#00D4FF,color:#E8EAF0`,
  confidenceScore: 0.89,
  overallRecommendation: "Unified 3-phase plan: PHASE 1 (Week 1, Zero Cost): Fix IAM wildcard permissions, close SSH/DB security groups, block S3 public access, set RDS publicly_accessible=false. PHASE 2 (Week 2-3, High ROI): Downsize EC2 and RDS, enable backups and deletion protection. PHASE 3 (Month 2): EKS optimization with Spot instances + cluster autoscaler + security hardening.",
  prSimulated: false,
};
