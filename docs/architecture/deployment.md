# Deployment Architecture

**Project:** Steno - Demand Letter Generator
**Document:** AWS Infrastructure, CI/CD, Monitoring, and Scaling
**Version:** 1.0
**Last Updated:** 2025-12-04

---

## Overview

This document specifies the complete deployment architecture including AWS infrastructure setup, CI/CD pipelines, monitoring strategies, scaling approaches, and cost optimization for the Demand Letter Generator.

---

## Table of Contents

1. [AWS Infrastructure](#aws-infrastructure)
2. [CI/CD Pipeline](#cicd-pipeline)
3. [Environment Strategy](#environment-strategy)
4. [Monitoring & Observability](#monitoring--observability)
5. [Scaling Strategy](#scaling-strategy)
6. [Cost Optimization](#cost-optimization)
7. [Disaster Recovery](#disaster-recovery)
8. [Deployment Procedures](#deployment-procedures)

---

## AWS Infrastructure

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        AWS US-East-1                            │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ CloudFront (CDN)                                          │  │
│  │ - Global edge locations                                   │  │
│  │ - TLS termination                                         │  │
│  │ - DDoS protection (AWS Shield)                            │  │
│  └────────────┬─────────────────────────────────────────────┘  │
│               │                                                 │
│               ▼                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ S3 (Static Assets)                                        │  │
│  │ - React frontend build                                    │  │
│  │ - Versioned objects                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Route 53 (DNS)                                            │  │
│  │ - Domain routing                                          │  │
│  │ - Health checks                                           │  │
│  └────────────┬─────────────────────────────────────────────┘  │
│               │                                                 │
│               ▼                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ API Gateway (REST)                                        │  │
│  │ - JWT authorizer                                          │  │
│  │ - Rate limiting                                           │  │
│  │ - Request validation                                      │  │
│  │ - WAF protection                                          │  │
│  └────────────┬─────────────────────────────────────────────┘  │
│               │                                                 │
│               ▼                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ VPC (10.0.0.0/16)                                         │  │
│  │                                                            │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │ Public Subnets (2 AZs)                              │  │  │
│  │  │ - NAT Gateways                                      │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                                                            │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │ Private Subnets (2 AZs)                             │  │  │
│  │  │                                                      │  │  │
│  │  │  ┌─────────────────────────────────────────────┐   │  │  │
│  │  │  │ Lambda Functions (Node.js + Python)         │   │  │  │
│  │  │  │ - Auth Service                               │   │  │  │
│  │  │  │ - Letter Service                             │   │  │  │
│  │  │  │ - AI Service                                 │   │  │  │
│  │  │  │ - Document Service                           │   │  │  │
│  │  │  │ - Export Service                             │   │  │  │
│  │  │  └─────────────────────────────────────────────┘   │  │  │
│  │  │           │                                          │  │  │
│  │  │           ▼                                          │  │  │
│  │  │  ┌─────────────────────────────────────────────┐   │  │  │
│  │  │  │ RDS Proxy                                    │   │  │  │
│  │  │  └─────────────────────────────────────────────┘   │  │  │
│  │  │           │                                          │  │  │
│  │  └───────────┼──────────────────────────────────────────┘  │  │
│  │              │                                              │  │
│  │              ▼                                              │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │ Database Subnets (2 AZs)                            │  │  │
│  │  │                                                      │  │  │
│  │  │  ┌─────────────────────────────────────────────┐   │  │  │
│  │  │  │ RDS PostgreSQL 15 (Multi-AZ)                │   │  │  │
│  │  │  │ - Primary: AZ-A                             │   │  │  │
│  │  │  │ - Standby: AZ-B                             │   │  │  │
│  │  │  │ - Encrypted (KMS)                           │   │  │  │
│  │  │  └─────────────────────────────────────────────┘   │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ S3 Buckets                                                │  │
│  │ - Documents (source uploads)                              │  │
│  │ - Exports (Word/PDF files)                                │  │
│  │ - Firm assets (logos, letterheads)                        │  │
│  │ - Encrypted (SSE-S3)                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Observability & Security                                  │  │
│  │ - CloudWatch (logs, metrics, alarms)                      │  │
│  │ - X-Ray (tracing)                                         │  │
│  │ - Secrets Manager (credentials, API keys)                 │  │
│  │ - IAM (roles and policies)                                │  │
│  │ - KMS (encryption keys)                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

         External Services (HTTPS)
         ┌───────────────┬───────────────┐
         ▼               ▼               ▼
  Anthropic API    AWS Bedrock     SendGrid
```

### Infrastructure as Code (Terraform)

**Directory Structure:**
```
terraform/
├── modules/
│   ├── api-gateway/
│   ├── lambda/
│   ├── rds/
│   ├── s3/
│   ├── cloudfront/
│   └── vpc/
├── environments/
│   ├── dev/
│   ├── staging/
│   └── production/
└── main.tf
```

**Main Configuration (Simplified):**
```hcl
# terraform/environments/production/main.tf

provider "aws" {
  region = "us-east-1"
}

# VPC
module "vpc" {
  source = "../../modules/vpc"

  vpc_cidr = "10.0.0.0/16"
  availability_zones = ["us-east-1a", "us-east-1b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets = ["10.0.101.0/24", "10.0.102.0/24"]
  database_subnets = ["10.0.201.0/24", "10.0.202.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = false # Highly available
}

# RDS PostgreSQL
module "rds" {
  source = "../../modules/rds"

  identifier = "steno-demand-letters-prod"
  engine_version = "15.5"
  instance_class = "db.t3.medium"
  allocated_storage = 100
  storage_encrypted = true
  multi_az = true

  vpc_id = module.vpc.vpc_id
  database_subnets = module.vpc.database_subnet_ids

  backup_retention_period = 30
  backup_window = "02:00-03:00"
  maintenance_window = "sun:03:00-sun:04:00"
}

# S3 Buckets
module "s3_frontend" {
  source = "../../modules/s3"

  bucket_name = "steno-demand-letters-frontend-prod"
  enable_versioning = true
  enable_encryption = true
}

module "s3_documents" {
  source = "../../modules/s3"

  bucket_name = "steno-demand-letters-documents-prod"
  enable_versioning = true
  enable_encryption = true
  lifecycle_rules = {
    archive_after_days = 90
    storage_class = "GLACIER"
  }
}

# Lambda Functions
module "lambda_auth" {
  source = "../../modules/lambda"

  function_name = "steno-auth-service-prod"
  runtime = "nodejs20.x"
  handler = "index.handler"
  memory_size = 512
  timeout = 30

  vpc_id = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnet_ids

  environment_variables = {
    DATABASE_URL = module.rds.connection_string
    JWT_SECRET_ARN = aws_secretsmanager_secret.jwt_secret.arn
  }
}

# API Gateway
module "api_gateway" {
  source = "../../modules/api-gateway"

  name = "steno-demand-letters-api-prod"
  stage_name = "v1"

  lambda_integrations = {
    "/auth/*" = module.lambda_auth.function_arn
    "/letters/*" = module.lambda_letters.function_arn
    # ... more routes
  }

  enable_waf = true
  throttle_burst_limit = 1000
  throttle_rate_limit = 500
}

# CloudFront Distribution
module "cloudfront" {
  source = "../../modules/cloudfront"

  origin_bucket = module.s3_frontend.bucket_regional_domain_name
  domain_names = ["app.stenodemandletters.com"]
  acm_certificate_arn = aws_acm_certificate.main.arn

  default_ttl = 86400  # 1 day
  max_ttl = 31536000   # 1 year
}
```

### AWS Free Tier Optimization (MVP)

**Eligible Services:**
- Lambda: 1M requests/month + 400,000 GB-seconds
- RDS: 750 hours/month of db.t3.micro (single-AZ)
- S3: 5 GB storage + 20,000 GET + 2,000 PUT
- CloudFront: 1 TB data transfer
- API Gateway: 1M REST API calls

**Cost-Optimized MVP Setup:**
- RDS: db.t3.micro (single-AZ initially) → ~$0-15/month
- Lambda: Optimize memory/runtime → ~$0-20/month
- S3: Intelligent tiering → ~$0-5/month
- Anthropic API: ~$200-400/month (not AWS)
- **Total Estimated: $300-500/month**

---

## CI/CD Pipeline

### GitHub Actions Workflow

**Directory Structure:**
```
.github/
└── workflows/
    ├── ci.yml              # Continuous Integration (test, lint)
    ├── deploy-staging.yml  # Deploy to staging
    └── deploy-production.yml # Deploy to production
```

### CI Workflow (ci.yml)

```yaml
name: CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci
        working-directory: ./frontend

      - name: Lint
        run: npm run lint
        working-directory: ./frontend

      - name: Type check
        run: npm run type-check
        working-directory: ./frontend

      - name: Run tests
        run: npm run test
        working-directory: ./frontend

      - name: Build
        run: npm run build
        working-directory: ./frontend

  test-backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci
        working-directory: ./backend

      - name: Lint
        run: npm run lint
        working-directory: ./backend

      - name: Run tests
        run: npm run test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
        working-directory: ./backend

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install Python dependencies
        run: pip install -r requirements.txt
        working-directory: ./backend/ai-service

      - name: Python tests
        run: pytest
        working-directory: ./backend/ai-service

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          severity: 'CRITICAL,HIGH'
```

### Deployment Workflow (deploy-production.yml)

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install and build
        run: |
          npm ci
          npm run build
        working-directory: ./frontend
        env:
          VITE_API_URL: https://api.stenodemandletters.com

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Deploy to S3
        run: |
          aws s3 sync ./frontend/dist s3://steno-demand-letters-frontend-prod \
            --delete \
            --cache-control "max-age=31536000"

      - name: Invalidate CloudFront cache
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"

  deploy-backend:
    runs-on: ubuntu-latest
    needs: [deploy-frontend]
    steps:
      - uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Install Serverless Framework
        run: npm install -g serverless

      - name: Deploy Lambda functions
        run: |
          cd backend
          npm ci
          serverless deploy --stage production
        env:
          DATABASE_URL: ${{ secrets.PROD_DATABASE_URL }}
          JWT_SECRET: ${{ secrets.PROD_JWT_SECRET }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}

      - name: Run database migrations
        run: |
          cd backend
          npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.PROD_DATABASE_URL }}

      - name: Health check
        run: |
          curl -f https://api.stenodemandletters.com/v1/health || exit 1

      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Production deployment completed'
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### Deployment Strategy

**Blue-Green Deployment (Lambda):**
- Deploy new Lambda version
- Gradually shift traffic (10% → 50% → 100%)
- Monitor error rates
- Automatic rollback if error rate > 1%

**Canary Deployment (P1):**
```yaml
# serverless.yml
functions:
  authService:
    handler: index.handler
    deploymentSettings:
      type: Canary10Percent5Minutes
      alias: Production
      alarms:
        - name: ErrorRateAlarm
```

---

## Environment Strategy

### Environments

| Environment | Purpose | AWS Account | Domain |
|-------------|---------|-------------|--------|
| **Development** | Local development | N/A (local Docker) | localhost:3000 |
| **Staging** | Pre-production testing | Shared AWS | staging.stenodemandletters.com |
| **Production** | Live customer environment | Dedicated AWS | app.stenodemandletters.com |

### Environment Configuration

**Environment Variables (via AWS Secrets Manager):**
```json
{
  "DATABASE_URL": "postgresql://...",
  "JWT_SECRET": "...",
  "ANTHROPIC_API_KEY": "...",
  "SENDGRID_API_KEY": "...",
  "AWS_S3_DOCUMENTS_BUCKET": "steno-documents-prod",
  "AWS_S3_EXPORTS_BUCKET": "steno-exports-prod",
  "ENVIRONMENT": "production"
}
```

**Secrets Rotation:**
- Database passwords: Every 90 days (automatic via Secrets Manager)
- API keys: Manual rotation, quarterly review
- JWT signing keys: Rotate on security incident

---

## Monitoring & Observability

### CloudWatch Dashboards

**Application Dashboard:**
- API request rate (requests/minute)
- API error rate (%)
- API latency (p50, p95, p99)
- Lambda concurrent executions
- Lambda error count
- RDS CPU utilization
- RDS database connections
- S3 request count

**Business Metrics Dashboard:**
- Letters generated per hour
- Active users (concurrent)
- Document uploads per hour
- AI refinements per hour
- Export count per hour

### CloudWatch Alarms

**Critical Alarms (PagerDuty):**
```yaml
Alarms:
  - Name: APIGateway5xxErrors
    Metric: 5XXError
    Threshold: > 5 errors in 5 minutes
    Action: PagerDuty alert + SNS notification

  - Name: RDSCPUHigh
    Metric: CPUUtilization
    Threshold: > 80% for 10 minutes
    Action: PagerDuty alert

  - Name: LambdaErrorRateHigh
    Metric: Errors
    Threshold: > 1% error rate
    Action: Auto-rollback + PagerDuty alert

  - Name: RDSStorageLow
    Metric: FreeStorageSpace
    Threshold: < 10 GB
    Action: SNS notification to DevOps
```

**Warning Alarms (Slack):**
- API latency > 2 seconds (p95)
- Lambda throttles detected
- S3 bucket size > 80% of allocated
- Unusual AI API spend (> 150% of average)

### AWS X-Ray Tracing

**Trace Sampling:**
- 100% of errors
- 10% of successful requests (production)
- 100% of requests (staging)

**Traced Operations:**
- API Gateway → Lambda
- Lambda → RDS (via Prisma)
- Lambda → S3
- Lambda → Anthropic API

### Logging Strategy

**Log Aggregation:**
- All Lambda logs to CloudWatch Logs
- Log groups: `/aws/lambda/{function-name}`
- Retention: 7 days (dev), 30 days (production)

**Structured Logging (JSON):**
```json
{
  "timestamp": "2025-12-04T15:30:00.000Z",
  "level": "info",
  "service": "auth-service",
  "traceId": "1-5f1a2b3c-...",
  "userId": "user-uuid",
  "firmId": "firm-uuid",
  "message": "User logged in successfully",
  "duration": 125
}
```

**Log Queries (CloudWatch Insights):**
```sql
-- Find all errors in last hour
fields @timestamp, @message, level, service, userId
| filter level = "error"
| sort @timestamp desc
| limit 100

-- Average API response time by endpoint
fields @timestamp, path, duration
| stats avg(duration) as avg_duration by path
| sort avg_duration desc
```

---

## Scaling Strategy

### Auto-Scaling Configuration

**Lambda:**
- Automatic scaling (AWS managed)
- Concurrent execution limit: 1000 (can request increase)
- Provisioned concurrency: 10 instances for critical paths (auth, letter generation)
- Reserved concurrency per function: No limit (shared pool)

**RDS:**
- Vertical scaling initially (db.t3.micro → t3.medium → t3.large)
- Read replicas (P1): Add for reporting queries
- Aurora Serverless (P2): Consider for elastic scaling

**API Gateway:**
- Throttle limits:
  - Burst: 1000 requests
  - Steady-state: 500 requests/second
- Can request limit increase from AWS

### Scaling Triggers

**Scale Up (Vertical):**
- RDS CPU > 70% for 1 hour → Increase instance size
- Lambda memory exhaustion → Increase memory allocation
- S3 request rate > 3500/second → Consider CloudFront caching

**Scale Out (Horizontal):**
- Read queries slow → Add RDS read replica
- High Lambda concurrency → Request limit increase
- Global users → Add CloudFront edge locations

### Performance Targets

| Metric | Target | Action if Exceeded |
|--------|--------|--------------------|
| API p95 latency | < 500ms | Optimize queries, add caching |
| Lambda cold start | < 1s | Increase provisioned concurrency |
| RDS connections | < 80 | Increase max connections, optimize pool |
| S3 GET latency | < 100ms | Enable Transfer Acceleration |

---

## Cost Optimization

### Cost Breakdown (Estimated Production - 1000 Active Users)

| Service | Monthly Cost | Notes |
|---------|--------------|-------|
| **RDS PostgreSQL** | $60-120 | db.t3.medium, Multi-AZ, 100GB |
| **Lambda** | $30-50 | Beyond free tier |
| **API Gateway** | $10-20 | HTTP API cheaper than REST |
| **S3 Storage** | $10-30 | 100-300 GB total |
| **CloudFront** | $20-40 | Data transfer out |
| **Secrets Manager** | $5 | 10 secrets |
| **CloudWatch** | $10-20 | Logs and metrics |
| **Data Transfer** | $10-30 | Inter-service and external |
| **Anthropic API** | $500-1000 | 5,000-10,000 letters/month |
| **Total AWS** | $155-310/month | |
| **Total with AI** | $655-1310/month | |

### Cost Optimization Strategies

1. **Right-Sizing:**
   - Start with smallest RDS instance (t3.micro)
   - Monitor utilization before scaling up
   - Use Lambda power tuning tool

2. **Storage Optimization:**
   - S3 Intelligent-Tiering for documents
   - Lifecycle policies: Archive to Glacier after 90 days
   - Delete exports after 30 days

3. **Compute Optimization:**
   - Optimize Lambda memory for cost/performance
   - Use HTTP API (cheaper than REST API)
   - Reduce Lambda package size

4. **Data Transfer:**
   - Use CloudFront to reduce origin requests
   - Enable S3 Transfer Acceleration only if needed
   - Keep Lambda in same region as RDS

5. **AI Cost Control:**
   - Optimize prompts to reduce token usage
   - Cache common AI responses (P1)
   - Monitor per-letter AI cost
   - Set budget alerts ($1000/month threshold)

### Cost Monitoring

**AWS Cost Explorer:**
- Daily cost tracking
- Cost by service
- Cost by tag (environment, project)

**Budget Alerts:**
- Warning: 80% of monthly budget ($800)
- Critical: 100% of monthly budget ($1000)
- Forecast exceeding: 120% of budget

---

## Disaster Recovery

### Backup Strategy

**RDS Automated Backups:**
- Daily backups at 2:00 AM UTC
- 30-day retention
- Point-in-time recovery enabled
- Cross-region backup (P1): Replicate to us-west-2

**S3 Versioning:**
- Enabled on all buckets
- Lifecycle: Delete old versions after 90 days

**Lambda Code:**
- Versioned in Git (GitHub)
- Serverless Framework maintains versions
- Can redeploy any version instantly

### Disaster Recovery Procedures

**Scenario 1: Lambda Function Failure**
- **Detection:** CloudWatch alarm triggers
- **Action:** Automatic rollback to previous version (via Lambda alias)
- **RTO:** < 5 minutes
- **RPO:** 0 (stateless)

**Scenario 2: RDS Database Failure (AZ)**
- **Detection:** RDS automatic failover
- **Action:** Automatic failover to standby (Multi-AZ)
- **RTO:** < 2 minutes
- **RPO:** 0 (synchronous replication)

**Scenario 3: S3 Data Loss**
- **Detection:** User report or monitoring
- **Action:** Restore from versioned object
- **RTO:** < 30 minutes
- **RPO:** Last version

**Scenario 4: Regional Outage (US-East-1)**
- **Detection:** Multiple service failures
- **Action:** Manual failover to DR region (P1)
- **RTO:** < 4 hours
- **RPO:** < 1 hour (database backup)

### DR Testing

- **Quarterly:** Restore database from backup
- **Semi-Annually:** Full DR drill (failover to DR region - P1)
- **Document:** DR procedures in runbook

---

## Deployment Procedures

### Pre-Deployment Checklist

- [ ] All tests passing (CI)
- [ ] Code review approved
- [ ] Database migration tested on staging
- [ ] Performance testing completed
- [ ] Security scan passed (Snyk, Trivy)
- [ ] Deployment runbook reviewed
- [ ] On-call engineer identified
- [ ] Rollback plan confirmed

### Deployment Steps

**1. Pre-Deployment (30 min before):**
```bash
# Verify staging health
curl https://api-staging.stenodemandletters.com/v1/health

# Create database backup
aws rds create-db-snapshot \
  --db-instance-identifier steno-prod \
  --db-snapshot-identifier manual-backup-$(date +%Y%m%d)

# Notify team
slack-notify "#deployments" "Production deployment starting in 30 min"
```

**2. Deployment (GitHub Actions):**
- Push to `main` branch triggers deploy-production workflow
- Frontend deployed to S3 + CloudFront invalidation
- Backend Lambda functions deployed via Serverless Framework
- Database migrations applied

**3. Post-Deployment (monitor for 1 hour):**
```bash
# Run smoke tests
npm run test:smoke:production

# Monitor error rates
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Errors \
  --start-time $(date -u -d '5 minutes ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Sum

# Check API health
watch -n 30 'curl -s https://api.stenodemandletters.com/v1/health | jq'
```

**4. Rollback (if needed):**
```bash
# Rollback Lambda
serverless rollback --stage production --timestamp <deployment-timestamp>

# Rollback database migration
npx prisma migrate resolve --rolled-back <migration-name>

# Revert frontend (previous S3 version)
aws s3 sync s3://steno-frontend-prod-backup s3://steno-frontend-prod --delete
aws cloudfront create-invalidation --distribution-id XXX --paths "/*"
```

### Maintenance Windows

**Scheduled Maintenance:**
- Sunday 2:00-4:00 AM UTC (low traffic)
- Advance notice: 7 days (email + in-app banner)
- Max frequency: Monthly

**Emergency Maintenance:**
- Security patches: Deploy immediately
- Critical bugs: Within 4 hours
- Communicate via status page

---

## Conclusion

The deployment architecture leverages AWS managed services to minimize operational overhead while ensuring high availability, security, and cost-effectiveness. The multi-AZ RDS deployment provides automatic failover, while Lambda's auto-scaling handles traffic spikes without manual intervention.

The CI/CD pipeline via GitHub Actions enables rapid, safe deployments with automatic rollback capabilities. Comprehensive monitoring via CloudWatch and X-Ray ensures issues are detected and resolved quickly.

**Key Strengths:**
- Fully automated CI/CD pipeline
- Infrastructure as Code (Terraform)
- Multi-AZ high availability
- Comprehensive monitoring and alerting
- Cost-optimized AWS usage
- Disaster recovery procedures

**Next Steps:**
1. Provision AWS infrastructure via Terraform
2. Configure GitHub Actions workflows
3. Set up monitoring dashboards and alarms
4. Conduct DR drill
5. Document runbooks for operations team

---

## Document Change History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-04 | Winston | Initial deployment architecture |
