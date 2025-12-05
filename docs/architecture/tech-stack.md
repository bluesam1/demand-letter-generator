# Technology Stack

**Project:** Steno - Demand Letter Generator
**Document:** Detailed Technology Choices & Rationale
**Version:** 1.0
**Last Updated:** 2025-12-04

---

## Overview

This document provides detailed specifications for all technology choices in the Demand Letter Generator, including specific versions, libraries, configuration recommendations, and rationale for each selection.

---

## Table of Contents

1. [Frontend Technologies](#frontend-technologies)
2. [Backend Technologies](#backend-technologies)
3. [Database & Storage](#database--storage)
4. [AI/ML Technologies](#aiml-technologies)
5. [Infrastructure & Cloud](#infrastructure--cloud)
6. [DevOps & Tooling](#devops--tooling)
7. [Security Technologies](#security-technologies)
8. [Third-Party Services](#third-party-services)

---

## Frontend Technologies

### Core Framework

**React 18.2+**
- **Version:** 18.2.0 or later
- **Rationale:**
  - Industry-standard framework with massive ecosystem
  - Concurrent rendering for improved performance
  - Strong TypeScript support
  - Large talent pool for hiring
  - Excellent documentation and community
- **Key Features Used:**
  - Hooks (useState, useEffect, useContext, useReducer)
  - Suspense for code splitting
  - Error boundaries for fault tolerance
  - Concurrent features for UI responsiveness

### State Management

**Redux Toolkit 2.0+**
- **Version:** 2.0.0 or later
- **Rationale:**
  - Simplified Redux with less boilerplate
  - Built-in best practices (Immer, Redux Thunk)
  - Excellent DevTools for debugging
  - Standardized patterns for team consistency
- **Use Cases:**
  - Global application state (user, firm)
  - Letter list and filtering
  - Template library
  - UI state (modals, notifications)

**Alternative: Zustand (Lightweight option)**
- **Version:** 4.4+ (if Redux is too heavy)
- **Rationale:** Simpler API, smaller bundle size

### Routing

**React Router 6.20+**
- **Version:** 6.20.0 or later
- **Rationale:**
  - De facto standard for React routing
  - Data-driven routing with loaders
  - Nested routes for complex layouts
  - Type-safe with TypeScript
- **Routes:**
  - `/` - Dashboard
  - `/letters/:id` - Letter editor
  - `/letters/new` - New letter wizard
  - `/templates` - Template management
  - `/settings` - Firm settings

### Rich Text Editor

**TipTap 2.1+**
- **Version:** 2.1.0 or later
- **Rationale:**
  - Built on ProseMirror (robust document model)
  - Extensible with custom nodes/marks
  - Excellent collaboration support (real-time editing)
  - TypeScript-first design
  - Better than Draft.js for legal documents
- **Extensions Used:**
  - Bold, Italic, Underline
  - Lists (bullet, numbered)
  - Headings (H1-H3)
  - Collaboration (Yjs integration for P1)
  - History (undo/redo)
  - Character count

**Alternative: Lexical (if TipTap insufficient)**
- **Rationale:** Meta's new editor, better performance

### UI Framework & Styling

**Tailwind CSS 3.4+**
- **Version:** 3.4.0 or later
- **Rationale:**
  - Utility-first CSS for rapid development
  - Small production bundle (unused classes purged)
  - Consistent design system
  - No CSS-in-JS runtime overhead
- **Configuration:**
  - Custom color palette (see UX design)
  - Custom typography scale
  - Responsive breakpoints (mobile, tablet, desktop)

**Headless UI 1.7+**
- **Version:** 1.7.0 or later (Tailwind Labs component library)
- **Rationale:**
  - Accessible components out of the box
  - Unstyled (style with Tailwind)
  - Modals, dropdowns, tabs, transitions
- **Components Used:**
  - Dialog (modals)
  - Listbox (dropdowns)
  - Popover (tooltips, popovers)
  - Tabs (settings, template builder)

### Form Management

**React Hook Form 7.48+**
- **Version:** 7.48.0 or later
- **Rationale:**
  - Excellent performance (uncontrolled inputs)
  - Minimal re-renders
  - Built-in validation
  - TypeScript support
- **Validation:**
  - Zod integration for schema validation
  - Async validation for server checks

**Zod 3.22+**
- **Version:** 3.22.0 or later
- **Rationale:**
  - Type-safe schema validation
  - Shared validation between frontend/backend
  - Excellent error messages

### HTTP Client

**Axios 1.6+**
- **Version:** 1.6.0 or later
- **Rationale:**
  - Interceptors for auth token injection
  - Request/response transformation
  - Automatic JSON parsing
  - Request cancellation
  - Better error handling than fetch
- **Configuration:**
  - Base URL from environment variables
  - JWT token interceptor
  - Retry logic for transient failures
  - Request timeout (30s default)

### File Upload

**React Dropzone 14.2+**
- **Version:** 14.2.0 or later
- **Rationale:**
  - Drag-and-drop file upload
  - File type and size validation
  - Multiple file support
  - Preview capability
  - Mobile-friendly

### Date Handling

**date-fns 3.0+**
- **Version:** 3.0.0 or later
- **Rationale:**
  - Modular (tree-shakeable)
  - Immutable and pure functions
  - Excellent TypeScript support
  - Smaller than Moment.js
  - No timezone complexity needed

### Build Tool

**Vite 5.0+**
- **Version:** 5.0.0 or later
- **Rationale:**
  - Extremely fast HMR (Hot Module Replacement)
  - Native ES modules in dev
  - Optimized production builds
  - Better than Create React App
  - Plugin ecosystem for React
- **Plugins:**
  - @vitejs/plugin-react
  - vite-plugin-pwa (for PWA features - P1)
  - vite-plugin-compression (gzip/brotli)

### TypeScript

**TypeScript 5.3+**
- **Version:** 5.3.0 or later
- **Rationale:**
  - Type safety reduces runtime errors
  - Better IDE support and autocomplete
  - Self-documenting code
  - Easier refactoring
  - Team productivity improvement
- **Configuration:**
  - Strict mode enabled
  - Path aliases for cleaner imports
  - Type checking in CI/CD

### Testing

**Vitest 1.0+**
- **Version:** 1.0.0 or later (unit tests)
- **Rationale:**
  - Vite-native (fast)
  - Jest-compatible API
  - Built-in coverage

**React Testing Library 14.1+**
- **Version:** 14.1.0 or later
- **Rationale:**
  - Best practices for React testing
  - Focus on user behavior, not implementation
  - Accessibility-first queries

**Playwright 1.40+**
- **Version:** 1.40.0 or later (E2E tests)
- **Rationale:**
  - Cross-browser testing
  - Excellent debugging tools
  - Auto-wait for elements
  - Better than Cypress for our use case

### Package Manager

**npm 10+**
- **Version:** 10.0.0 or later
- **Rationale:**
  - Comes with Node.js
  - Lockfile (package-lock.json)
  - Workspaces for monorepo (if needed)
- **Alternative:** pnpm (faster, more efficient)

---

## Backend Technologies

### Node.js Runtime

**Node.js 20.x LTS**
- **Version:** 20.10.0 or later
- **Rationale:**
  - Long-term support until 2026
  - AWS Lambda supports Node.js 20
  - Excellent performance
  - Native ES modules support
  - Compatible with latest npm packages
- **Use Cases:**
  - Authentication service
  - Letter CRUD operations
  - Template management
  - Document metadata service

### Python Runtime

**Python 3.11**
- **Version:** 3.11.7 or later
- **Rationale:**
  - AWS Lambda supports Python 3.11
  - Best for AI/ML workloads
  - Excellent library ecosystem (PyPDF2, Tesseract, LangChain)
  - Better performance than 3.10
- **Use Cases:**
  - Document processing (OCR)
  - AI service (Anthropic integration)
  - Export service (Word generation)

### Node.js Framework

**Express.js 4.18+**
- **Version:** 4.18.0 or later
- **Rationale:**
  - Minimal and flexible
  - Massive ecosystem of middleware
  - Team familiarity
  - Easy to deploy on Lambda (via serverless-http)
- **Middleware:**
  - express.json() - JSON body parsing
  - cors() - CORS handling
  - helmet() - Security headers
  - compression() - Response compression
  - express-rate-limit() - Rate limiting

**Alternative: Fastify (if performance critical)**
- **Rationale:** 2-3x faster than Express

### Python Framework

**FastAPI 0.108+**
- **Version:** 0.108.0 or later
- **Rationale:**
  - High performance (async)
  - Automatic API documentation (OpenAPI)
  - Type hints and validation (Pydantic)
  - Easy Lambda deployment (Mangum adapter)
- **Use Cases:**
  - AI service endpoints
  - Document processing endpoints
  - Export generation endpoints

### API Documentation

**OpenAPI 3.1 (Swagger)**
- **Rationale:**
  - Industry-standard API specification
  - Auto-generated from FastAPI
  - Interactive documentation (Swagger UI)
  - Client code generation

### Authentication

**jsonwebtoken (Node.js) 9.0+**
- **Version:** 9.0.0 or later
- **Rationale:**
  - JWT creation and verification
  - RS256 algorithm support
  - Claims validation
- **Configuration:**
  - RS256 (asymmetric keys)
  - 1-hour token expiration
  - Refresh token pattern (P1)

**bcrypt 5.1+**
- **Version:** 5.1.0 or later
- **Rationale:**
  - Industry-standard password hashing
  - Configurable work factor (10-12 rounds)
  - Resistant to timing attacks
- **Configuration:**
  - Salt rounds: 12 (good balance)

### Database Client (Node.js)

**Prisma 5.7+**
- **Version:** 5.7.0 or later
- **Rationale:**
  - Type-safe database client
  - Schema migrations
  - Excellent TypeScript support
  - Query builder prevents SQL injection
  - Connection pooling
- **Configuration:**
  - PostgreSQL datasource
  - Connection limit: 10 per Lambda
  - Use RDS Proxy for Lambda pooling

**Alternative: Knex.js + TypeORM**
- **Rationale:** More flexibility if Prisma insufficient

### Database Client (Python)

**psycopg3 3.1+**
- **Version:** 3.1.0 or later
- **Rationale:**
  - PostgreSQL adapter for Python
  - Async support
  - Connection pooling
  - Type-safe parameterized queries

**SQLAlchemy 2.0+** (if ORM needed)
- **Version:** 2.0.0 or later
- **Rationale:** ORM for complex queries

### Lambda Deployment

**Serverless Framework 3.38+**
- **Version:** 3.38.0 or later
- **Rationale:**
  - Simplified Lambda deployment
  - Multi-runtime support (Node, Python)
  - Environment variable management
  - API Gateway integration
  - CloudFormation under the hood
- **Plugins:**
  - serverless-offline (local development)
  - serverless-prune-plugin (version cleanup)
  - serverless-dotenv-plugin (environment variables)

**Alternative: AWS SAM or CDK**
- **Rationale:** More AWS-native, but steeper learning curve

### Validation & Schema

**Joi 17.11+** (Node.js)
- **Version:** 17.11.0 or later
- **Rationale:**
  - Request validation
  - Schema definition
  - Custom error messages

**Pydantic 2.5+** (Python)
- **Version:** 2.5.0 or later
- **Rationale:**
  - Data validation using type hints
  - Built into FastAPI
  - JSON schema generation

---

## Database & Storage

### Primary Database

**PostgreSQL 15**
- **Version:** 15.5 or later (AWS RDS)
- **Rationale:**
  - Robust relational database
  - ACID compliance for data integrity
  - Complex queries with JOINs
  - Row-level security for multi-tenancy
  - JSONB for flexible metadata
  - Full-text search capability
  - Mature and stable
- **Instance Type:**
  - MVP: db.t3.micro (Free Tier, 750 hours/month)
  - Production: db.t3.medium or larger
- **Configuration:**
  - Multi-AZ deployment for HA
  - Automated backups (30-day retention)
  - Point-in-time recovery enabled
  - Encryption at rest (AWS KMS)
  - Parameter group: default.postgres15

### Connection Pooling

**RDS Proxy**
- **Rationale:**
  - Manages Lambda connections efficiently
  - Reduces connection overhead
  - Automatic failover
  - IAM authentication support
- **Configuration:**
  - Max connections: 100
  - Idle timeout: 30 minutes

### Object Storage

**AWS S3**
- **Version:** Standard storage class
- **Rationale:**
  - Unlimited scalable storage
  - 99.999999999% durability
  - Integrated with AWS ecosystem
  - Lifecycle policies for cost optimization
  - Versioning for document history
- **Buckets:**
  - `steno-demand-letters-documents-{env}` - Uploaded source docs
  - `steno-demand-letters-exports-{env}` - Exported Word/PDF files
  - `steno-demand-letters-assets-{env}` - Firm logos, letterheads
- **Configuration:**
  - Server-side encryption (SSE-S3 or SSE-KMS)
  - Versioning enabled
  - Lifecycle: Move to Glacier after 90 days (exports)
  - Block public access enabled
  - CORS for pre-signed URL uploads

### Cache Layer (P1)

**Redis (Amazon ElastiCache)**
- **Version:** 7.0 or later
- **Rationale:**
  - Session storage for collaboration
  - Template caching
  - Rate limiting counters
  - Real-time presence data
- **Instance Type:** cache.t3.micro (MVP)
- **Configuration:**
  - Cluster mode disabled (simpler)
  - Single-AZ (cost optimization)
  - Automatic backups

---

## AI/ML Technologies

### Primary AI Service

**Anthropic Claude API**
- **Model:** Claude 3.5 Sonnet
- **Version:** Latest available via API
- **Rationale:**
  - Best-in-class language model
  - Excellent legal reasoning capability
  - Large context window (200K tokens)
  - Instruction following
  - No infrastructure management
  - Regular model improvements
- **Pricing:** $3/million input tokens, $15/million output tokens
- **Use Cases:**
  - Initial letter generation
  - AI refinement based on instructions
  - Content summarization
- **Configuration:**
  - Max tokens: 16,000 (output)
  - Temperature: 0.3 (consistent, less creative)
  - System prompts for legal tone

**Alternative Model: Claude 3 Opus**
- **When to Use:** Complex cases requiring deeper reasoning
- **Pricing:** $15/million input, $75/million output (5x more expensive)

### Fallback AI Service

**AWS Bedrock (Claude Models)**
- **Model:** Claude 3.5 Sonnet via Bedrock
- **Rationale:**
  - AWS-native (no external dependency)
  - Same models as Anthropic API
  - Integrated with AWS IAM
  - No API key management
  - Similar pricing
- **Use Cases:**
  - Fallback if Anthropic API unavailable
  - Regions where Anthropic not available
  - Enterprise customers requiring AWS-only

### AI Orchestration

**LangChain 0.1+** (Python)
- **Version:** 0.1.0 or later
- **Rationale:**
  - Prompt management and templates
  - Chain multiple AI calls
  - Document loading and chunking
  - Memory for conversation context
  - Structured output parsing
- **Components Used:**
  - ChatAnthropic wrapper
  - PromptTemplate for reusable prompts
  - Document loaders (PDF, DOCX, TXT)
  - Output parsers (JSON, structured)

### Document Processing

**PyPDF2 3.0+** (Python)
- **Version:** 3.0.0 or later
- **Rationale:**
  - PDF text extraction
  - Metadata reading
  - Pure Python (no dependencies)
- **Use Cases:**
  - Extract text from PDF documents
  - Read PDF metadata

**python-docx 1.1+** (Python)
- **Version:** 1.1.0 or later
- **Rationale:**
  - Read Word documents
  - Create Word documents (export)
  - Preserve formatting
- **Use Cases:**
  - Extract text from .docx
  - Generate .docx exports

**Tesseract OCR 5.3+** (Python: pytesseract)
- **Version:** 5.3.0 or later (pytesseract wrapper)
- **Rationale:**
  - Open-source OCR engine
  - Multi-language support
  - Good accuracy for printed text
- **Use Cases:**
  - Extract text from scanned PDFs
  - Extract text from images (JPG, PNG)
- **Configuration:**
  - Language: English (eng)
  - Page segmentation mode: Auto

**Pillow (PIL) 10.1+** (Python)
- **Version:** 10.1.0 or later
- **Rationale:**
  - Image processing for OCR prep
  - Image format conversion
  - Resize for optimization

---

## Infrastructure & Cloud

### Cloud Provider

**Amazon Web Services (AWS)**
- **Primary Region:** us-east-1 (N. Virginia)
- **DR Region:** us-west-2 (Oregon) - P1
- **Rationale:**
  - Most mature cloud platform
  - Comprehensive service portfolio
  - Free Tier for cost optimization
  - Steno may already have AWS account
  - US-based data centers (compliance)
  - Excellent Lambda and RDS support

### Compute

**AWS Lambda**
- **Node.js Runtime:** nodejs20.x
- **Python Runtime:** python3.11
- **Rationale:**
  - Serverless (no infrastructure management)
  - Auto-scaling (0 to thousands)
  - Pay-per-use pricing
  - 1M requests/month free tier
  - Event-driven architecture
- **Configuration:**
  - Memory: 512 MB (Node), 1024 MB (Python with ML libs)
  - Timeout: 30s (API), 5 minutes (document processing)
  - Concurrency: 1000 (default), can request increase
  - VPC: Yes (for RDS access)
  - Layers: Common dependencies (node_modules, Python libs)

**Lambda Layers:**
- `steno-node-dependencies` - Shared Node.js libraries
- `steno-python-dependencies` - Shared Python libraries (LangChain, PyPDF2, etc.)
- `tesseract-lambda` - Tesseract OCR binaries

### API Gateway

**AWS API Gateway (REST)**
- **Version:** v2 (HTTP API for lower cost)
- **Rationale:**
  - Managed API endpoints
  - Request validation
  - Throttling and rate limiting
  - CORS support
  - API key management (optional)
  - CloudWatch integration
- **Configuration:**
  - Regional endpoint (not edge-optimized initially)
  - Throttling: 1000 requests/second burst, 500 steady-state
  - JWT authorizer for authentication
  - Request/response transformations

**AWS API Gateway (WebSocket) - P1**
- **Use Case:** Real-time collaboration
- **Rationale:** Managed WebSocket connections for Lambda

### Content Delivery

**Amazon CloudFront**
- **Rationale:**
  - Global CDN for frontend assets
  - HTTPS everywhere
  - DDoS protection (AWS Shield Standard)
  - Origin access identity for S3
  - Custom domain support
- **Configuration:**
  - Origin: S3 bucket (frontend)
  - Price class: Use only US, Canada, Europe (cost optimization)
  - HTTPS only (redirect HTTP to HTTPS)
  - Compression: gzip, brotli
  - Cache behavior: Cache static assets (JS, CSS, images)

### DNS

**Amazon Route 53**
- **Rationale:**
  - AWS-integrated DNS
  - Health checks and failover
  - Alias records for CloudFront/API Gateway
- **Configuration:**
  - Hosted zone: stenodemandletters.com (example)
  - A record: www → CloudFront distribution
  - A record: api → API Gateway

### Secrets Management

**AWS Secrets Manager**
- **Rationale:**
  - Secure storage for API keys and credentials
  - Automatic rotation (RDS passwords)
  - Fine-grained IAM permissions
  - Audit logging (CloudTrail)
- **Secrets Stored:**
  - Database credentials (RDS)
  - Anthropic API key
  - SendGrid API key
  - JWT signing keys (RSA private key)

### IAM

**AWS Identity and Access Management**
- **Rationale:**
  - Role-based access for Lambda functions
  - Least privilege principle
  - Service-to-service authentication
- **Roles:**
  - `LambdaAuthServiceRole` - Database read, Secrets Manager read
  - `LambdaAIServiceRole` - S3 read, Secrets Manager read, Bedrock invoke
  - `LambdaDocumentServiceRole` - S3 read/write
  - `RDSProxyRole` - RDS connect

---

## DevOps & Tooling

### Version Control

**Git + GitHub**
- **Rationale:**
  - Industry standard
  - GitHub Actions for CI/CD
  - Pull request workflows
  - Branch protection rules
- **Branch Strategy:**
  - `main` - Production
  - `develop` - Integration
  - `feature/*` - Feature branches
  - `hotfix/*` - Emergency fixes

### CI/CD

**GitHub Actions**
- **Rationale:**
  - Integrated with GitHub
  - Free for public repos, generous free tier for private
  - Easy to configure (YAML)
  - Matrix builds for multi-runtime
- **Workflows:**
  - **Test:** Run tests on PR
  - **Build:** Build frontend and backend
  - **Deploy:** Deploy to AWS (staging/production)
  - **Security Scan:** Dependency vulnerability check

**Alternative: AWS CodePipeline**
- **Rationale:** If deeper AWS integration needed

### Infrastructure as Code

**Terraform 1.6+** or **AWS CDK 2.110+**
- **Recommendation:** Terraform
- **Rationale:**
  - Cloud-agnostic (multi-cloud if needed)
  - State management
  - Module reusability
  - Large community
- **Resources Managed:**
  - Lambda functions
  - API Gateway
  - RDS instance
  - S3 buckets
  - IAM roles
  - CloudFront distribution

**Alternative: AWS CDK**
- **Rationale:** TypeScript/Python-native, more expressive

### Monitoring

**Amazon CloudWatch**
- **Rationale:**
  - Native AWS monitoring
  - Lambda metrics out of the box
  - Custom metrics support
  - Logs aggregation
- **Metrics Monitored:**
  - Lambda invocations, errors, duration
  - API Gateway requests, latency, errors
  - RDS CPU, connections, IOPS
  - S3 requests
- **Alarms:**
  - Lambda error rate > 1%
  - API Gateway 5xx errors > 5%
  - RDS CPU > 80%
  - RDS storage < 20% free

**CloudWatch Logs**
- **Configuration:**
  - Log groups per Lambda function
  - Retention: 7 days (MVP), 30 days (production)
  - Centralized logging
  - Log Insights for queries

### Distributed Tracing

**AWS X-Ray**
- **Rationale:**
  - Trace requests across Lambda, API Gateway, RDS
  - Identify bottlenecks
  - Service maps
  - Built into AWS SDK
- **Configuration:**
  - Enabled on all Lambda functions
  - Tracing mode: Active
  - Sample 100% during MVP, 10% in production

### Error Tracking

**Sentry 7.90+**
- **Version:** 7.90.0 or later
- **Rationale:**
  - Frontend and backend error tracking
  - Source map support
  - User context and breadcrumbs
  - Alerting and notifications
- **Configuration:**
  - Frontend SDK: @sentry/react
  - Backend SDK: @sentry/node (Node), sentry-sdk (Python)
  - Sample rate: 100% errors, 10% transactions

### Code Quality

**ESLint 8.55+** (JavaScript/TypeScript)
- **Version:** 8.55.0 or later
- **Configuration:** Airbnb style guide + custom rules
- **Plugins:** eslint-plugin-react, @typescript-eslint

**Prettier 3.1+** (Code Formatting)
- **Version:** 3.1.0 or later
- **Configuration:** Integrated with ESLint

**Pylint 3.0+** (Python)
- **Version:** 3.0.0 or later
- **Configuration:** PEP 8 compliance

**Black 23.12+** (Python Formatting)
- **Version:** 23.12.0 or later

### Package Security

**npm audit** (Node.js)
- Run in CI/CD to detect vulnerabilities

**Snyk**
- **Rationale:** Dependency vulnerability scanning
- **Configuration:** GitHub integration, PR checks

---

## Security Technologies

### Web Application Firewall

**AWS WAF**
- **Rationale:**
  - Protect API Gateway from common attacks
  - Rate limiting per IP
  - SQL injection prevention
  - XSS prevention
- **Rules:**
  - AWS managed rule set (Core)
  - Rate-based rule (100 requests/5 min per IP)
  - Geo-blocking (if needed)

### DDoS Protection

**AWS Shield Standard**
- **Rationale:**
  - Free with AWS
  - Automatic protection for CloudFront, API Gateway
  - Layer 3/4 DDoS mitigation

### TLS/SSL Certificates

**AWS Certificate Manager (ACM)**
- **Rationale:**
  - Free SSL/TLS certificates
  - Automatic renewal
  - Integration with CloudFront, API Gateway
- **Configuration:**
  - TLS 1.3 only (no TLS 1.2 or older)
  - Strong cipher suites only

### Secret Scanning

**git-secrets**
- **Rationale:**
  - Prevent committing secrets to Git
  - Pre-commit hook
  - Scan existing history

---

## Third-Party Services

### Email Delivery

**SendGrid**
- **Plan:** Free tier (100 emails/day), then pay-as-you-go
- **Rationale:**
  - Reliable transactional email
  - Email templates
  - Delivery analytics
  - Easy API integration
- **Use Cases:**
  - User invitations
  - Password resets
  - Export notifications (P1)
  - Collaboration notifications (P1)

**Alternative: Amazon SES**
- **Rationale:** Cheaper, but less features

### Analytics (P1)

**PostHog** or **Mixpanel**
- **Rationale:**
  - Product analytics
  - User behavior tracking
  - Feature flags
  - A/B testing
- **Events Tracked:**
  - Letter created, generated, refined, exported
  - Template created, used
  - User invited, activated

---

## Development Tools

### IDEs

**Recommended:**
- Visual Studio Code (with extensions)
- WebStorm (JetBrains)

**VS Code Extensions:**
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Prisma
- AWS Toolkit
- Thunder Client (API testing)

### API Testing

**Postman** or **Insomnia**
- **Rationale:** API development and testing

### Local Development

**Docker 24+**
- **Rationale:**
  - Local PostgreSQL database
  - Redis (P1)
  - Consistent dev environment
- **Containers:**
  - postgres:15-alpine
  - redis:7-alpine (P1)

**docker-compose**
- **Configuration:**
  - PostgreSQL with seed data
  - Redis (P1)
  - LocalStack (mock AWS services - optional)

---

## Technology Trade-offs

### Key Trade-offs Made

**Serverless vs. Containers:**
- **Choice:** Serverless (Lambda)
- **Trade-off:** Cold start latency vs. operational simplicity
- **Mitigation:** Provisioned concurrency for critical paths

**PostgreSQL vs. DynamoDB:**
- **Choice:** PostgreSQL
- **Trade-off:** Vertical scaling limits vs. complex queries
- **Mitigation:** Read replicas for scaling (P1)

**React vs. Next.js:**
- **Choice:** React (SPA)
- **Trade-off:** No SSR for SEO vs. simpler architecture
- **Justification:** SEO not critical for internal legal tool

**REST vs. GraphQL:**
- **Choice:** REST
- **Trade-off:** Multiple requests vs. implementation complexity
- **Justification:** REST sufficient for use cases

---

## Technology Roadmap

### Phase 1 (MVP)
- Core stack as defined above
- Focus on functionality, not optimization

### Phase 2 (Post-MVP)
- Redis caching layer
- Read replicas for PostgreSQL
- Advanced monitoring (Datadog/New Relic)
- Performance optimization

### Phase 3 (Scale)
- Multi-region deployment
- CDN optimization
- Database sharding (if needed)
- Microservices refactoring (if monolith too large)

---

## Conclusion

The technology stack balances modern best practices with pragmatic choices suitable for a small-to-medium engineering team. The serverless-first approach minimizes operational overhead, while managed services (RDS, S3, CloudWatch) reduce complexity. TypeScript and type-safe tooling (Prisma, Zod) improve developer productivity and reduce bugs.

The stack is designed to evolve: start simple with proven technologies, add complexity (caching, read replicas, advanced monitoring) as usage grows and performance demands increase.

---

## Document Change History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-04 | Winston | Initial technology stack documentation |
