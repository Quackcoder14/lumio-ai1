export const SAMPLE_TF_MAIN = `# main.tf - Production Infrastructure
terraform {
  required_version = ">= 1.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket = "myapp-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
}

# ============================================
# EC2 Instances - Web Tier
# ============================================
resource "aws_instance" "web_server" {
  count         = 3
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "m5.2xlarge"  # OVERSIZED: avg CPU < 10%

  vpc_security_group_ids = [aws_security_group.web_sg.id]
  subnet_id              = aws_subnet.public[0].id
  
  tags = {
    Name        = "web-server-\${count.index}"
    Environment = "production"
    Team        = "platform"
  }
}

# ============================================
# RDS Database
# ============================================
resource "aws_db_instance" "main_db" {
  identifier        = "myapp-prod-db"
  engine            = "mysql"
  engine_version    = "8.0"
  instance_class    = "db.r5.4xlarge"  # OVERSIZED for load
  allocated_storage = 500
  
  username = "admin"
  password = "MyP@ssw0rd123!"  # SECURITY: hardcoded credential
  
  skip_final_snapshot    = true
  publicly_accessible    = true  # SECURITY: public RDS
  deletion_protection    = false
  multi_az               = false  # No HA
  backup_retention_period = 0    # SECURITY: no backups
  
  tags = {
    Name = "main-database"
  }
}

# ============================================
# S3 Buckets
# ============================================
resource "aws_s3_bucket" "data_bucket" {
  bucket = "myapp-prod-data-bucket-2024"
}

resource "aws_s3_bucket_public_access_block" "data_bucket" {
  bucket = aws_s3_bucket.data_bucket.id

  block_public_acls       = false  # SECURITY: public access allowed
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_versioning" "data_bucket" {
  bucket = aws_s3_bucket.data_bucket.id
  versioning_configuration {
    status = "Disabled"  # No versioning
  }
}

# ============================================
# Security Groups
# ============================================
resource "aws_security_group" "web_sg" {
  name        = "web-server-sg"
  description = "Security group for web servers"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # SECURITY: SSH open to world
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "db_sg" {
  name        = "database-sg"
  description = "Security group for databases"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # SECURITY: DB open to world
  }
}

# ============================================
# IAM Role - Overly Permissive
# ============================================
resource "aws_iam_role" "app_role" {
  name = "app-server-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "app_policy" {
  name = "app-policy"
  role = aws_iam_role.app_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["*"]           # SECURITY: wildcard permissions
      Resource = ["*"]
    }]
  })
}

# ============================================
# EKS Cluster
# ============================================
resource "aws_eks_cluster" "main" {
  name     = "myapp-prod-cluster"
  role_arn = aws_iam_role.eks_role.arn
  version  = "1.27"

  vpc_config {
    subnet_ids              = aws_subnet.private[*].id
    endpoint_public_access  = true
    endpoint_private_access = false
    public_access_cidrs     = ["0.0.0.0/0"]  # SECURITY: EKS API public
  }
}

resource "aws_eks_node_group" "main" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "main-nodes"
  node_role_arn   = aws_iam_role.node_role.arn
  subnet_ids      = aws_subnet.private[*].id
  instance_types  = ["m5.xlarge"]

  scaling_config {
    desired_size = 5
    max_size     = 10
    min_size     = 5  # Min = desired, no scale down
  }
}

# ============================================
# CloudWatch - No Alarms Configured
# ============================================
# Missing: No billing alarms, no security alarms

# ============================================
# VPC
# ============================================
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = { Name = "myapp-prod-vpc" }
}

resource "aws_subnet" "public" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.\${count.index}.0/24"
  availability_zone = "us-east-1a"
  map_public_ip_on_launch = true

  tags = { Name = "public-subnet-\${count.index}" }
}

resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.\${count.index + 10}.0/24"
  availability_zone = "us-east-1b"

  tags = { Name = "private-subnet-\${count.index}" }
}
`;

export const SAMPLE_TF_VARIABLES = `# variables.tf
variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name for resource tagging"
  type        = string
  default     = "myapp"
}

variable "db_password" {
  description = "Database password"
  type        = string
  default     = "MyP@ssw0rd123!"  # SECURITY: default hardcoded password
  sensitive   = true
}
`;

export const SAMPLE_K8S_DEPLOYMENT = `# deployment.yaml - Kubernetes Production Workloads
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-frontend
  namespace: production
  labels:
    app: web-frontend
    version: "2.4.1"
spec:
  replicas: 8  # COST: High replica count, low utilization
  selector:
    matchLabels:
      app: web-frontend
  template:
    metadata:
      labels:
        app: web-frontend
    spec:
      containers:
      - name: frontend
        image: myapp/frontend:2.4.1
        ports:
        - containerPort: 3000
        resources:
          requests:
            memory: "2Gi"    # COST: Over-provisioned
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
        env:
        - name: DATABASE_URL
          value: "mysql://admin:MyP@ssw0rd123!@db.internal/myapp"  # SECURITY: hardcoded secret
        - name: API_SECRET_KEY
          value: "sk-prod-abc123xyz789"  # SECURITY: exposed secret
        # SECURITY: No securityContext defined
        # SECURITY: Container running as root
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-backend
  namespace: production
spec:
  replicas: 6
  selector:
    matchLabels:
      app: api-backend
  template:
    metadata:
      labels:
        app: api-backend
    spec:
      containers:
      - name: backend
        image: myapp/backend:3.1.0
        ports:
        - containerPort: 8080
        resources:
          requests:
            memory: "4Gi"
            cpu: "2000m"
          limits:
            memory: "8Gi"
            cpu: "4000m"
        securityContext:
          privileged: true  # SECURITY: privileged container
          runAsRoot: true
---
apiVersion: v1
kind: Service
metadata:
  name: web-frontend-svc
  namespace: production
spec:
  type: LoadBalancer
  selector:
    app: web-frontend
  ports:
  - port: 80
    targetPort: 3000
---
# SECURITY: No NetworkPolicy defined - all pod-to-pod communication allowed
# COST: No HorizontalPodAutoscaler - fixed replica count
`;

export const SAMPLE_REPO_FILES = [
  { name: "main.tf", type: "terraform", content: SAMPLE_TF_MAIN, size: "4.2 KB" },
  { name: "variables.tf", type: "terraform", content: SAMPLE_TF_VARIABLES, size: "0.8 KB" },
  { name: "deployment.yaml", type: "kubernetes", content: SAMPLE_K8S_DEPLOYMENT, size: "2.1 KB" },
];
