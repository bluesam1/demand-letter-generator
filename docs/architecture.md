# System Architecture: Demand Letter Generator

**Project:** Steno - Demand Letter Generator
**Version:** 1.0
**Last Updated:** 2025-12-04
**Architect:** Winston

---

## Executive Summary

The Demand Letter Generator is a cloud-native, AI-powered web application designed to automate the creation of demand letters for law firms. Built on AWS infrastructure with a React frontend and serverless backend, the system leverages Anthropic's Claude AI to transform source documents into professional, legally sound demand letters.

**Key Architectural Characteristics:**
- **Scalable:** Serverless architecture supporting 10,000+ firms
- **Secure:** End-to-end encryption with multi-tenant isolation
- **Performant:** < 2 minute letter generation, < 5 second API responses
- **Cost-Effective:** AWS Free Tier optimization for initial deployment
- **Resilient:** Multi-AZ deployment with automatic failover

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Principles](#architecture-principles)
3. [High-Level Architecture](#high-level-architecture)
4. [Component Architecture](#component-architecture)
5. [Technology Stack Summary](#technology-stack-summary)
6. [Security Architecture](#security-architecture)
7. [Integration Points](#integration-points)
8. [Detailed Documentation](#detailed-documentation)

---

## System Overview

### Purpose

The Demand Letter Generator streamlines the litigation process by automating the creation of demand letters from source documents. Attorneys upload case materials (medical records, police reports, etc.), select a template, and receive an AI-generated draft that can be refined and exported to Word format.

### Key Capabilities

1. **Document Processing:** Upload, OCR, and extract content from multiple file formats
2. **AI Generation:** Create structured demand letters using Anthropic Claude
3. **Template Management:** Firm-specific templates with variable placeholders
4. **Collaborative Editing:** Real-time multi-user editing with change tracking
5. **AI Refinement:** Natural language instructions to refine generated content
6. **Export:** Professional Word documents with firm branding

### User Workflow

```
Attorney → Upload Documents → Select Template → AI Generates Draft →
Edit & Refine → Real-time Collaboration → Finalize → Export to Word
```

---

## Architecture Principles

### 1. Cloud-Native First
Deploy entirely on AWS using managed services to minimize operational overhead and maximize scalability.

### 2. Security by Design
Implement defense-in-depth with encryption at rest and in transit, role-based access control, and multi-tenant isolation.

### 3. Serverless Where Possible
Utilize AWS Lambda for compute to reduce costs, improve scalability, and simplify operations.

### 4. API-Driven Architecture
Separate frontend and backend with well-defined REST APIs, enabling future mobile apps and integrations.

### 5. Data Sovereignty
Store all data in US-based AWS regions to comply with legal industry requirements.

### 6. Cost Optimization
Leverage AWS Free Tier, S3 storage tiering, and Lambda cost controls to minimize infrastructure costs.

### 7. Observability
Comprehensive logging, monitoring, and alerting across all system components.

### 8. Progressive Enhancement
Build core functionality first, enhance with real-time features progressively.

---

## High-Level Architecture

### System Context Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        External Systems                         │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ Anthropic    │  │ AWS Bedrock  │  │   SendGrid   │        │
│  │  Claude API  │  │   (Backup)   │  │    (Email)   │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ HTTPS/TLS 1.3
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AWS Cloud Platform                         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              Frontend (CloudFront + S3)                  │  │
│  │  React SPA │ Static Assets │ CDN Distribution            │  │
│  └─────────────────────────────────────────────────────────┘  │
│                              ▲                                  │
│                              │ REST API (HTTPS)                │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │         API Gateway + Lambda (Backend Services)          │  │
│  │  Node.js │ Python │ Authentication │ Business Logic      │  │
│  └─────────────────────────────────────────────────────────┘  │
│       │                    │                    │              │
│       ▼                    ▼                    ▼              │
│  ┌──────────┐  ┌──────────────────┐  ┌──────────────┐       │
│  │   RDS    │  │   S3 Storage     │  │  WebSocket   │       │
│  │PostgreSQL│  │ (Documents/Files)│  │ API Gateway  │       │
│  │ (Multi-AZ│  │  Encrypted       │  │(Collab - P1) │       │
│  └──────────┘  └──────────────────┘  └──────────────┘       │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │       Observability & Operations                         │  │
│  │  CloudWatch │ X-Ray │ Secrets Manager │ IAM             │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ HTTPS
                              ▼
                    ┌──────────────────┐
                    │  Users (Browser) │
                    │ Attorneys/Staff  │
                    └──────────────────┘
```

### Architecture Layers

**Presentation Layer (Frontend)**
- React SPA hosted on S3
- CloudFront CDN for global delivery
- Client-side routing and state management
- Responsive design for desktop/tablet

**API Layer (Gateway)**
- AWS API Gateway for REST endpoints
- Request validation and throttling
- JWT authentication and authorization
- CORS configuration for web clients

**Business Logic Layer (Backend)**
- AWS Lambda functions (Node.js + Python)
- Stateless compute for auto-scaling
- Separate functions for distinct domains
- Event-driven processing

**Data Layer (Storage)**
- PostgreSQL on RDS for structured data
- S3 for document and file storage
- Multi-AZ deployment for high availability
- Automated backups and point-in-time recovery

**AI/ML Layer (Integration)**
- Anthropic Claude API (primary)
- AWS Bedrock (fallback/alternative)
- Prompt engineering and model selection
- Token management and cost optimization

---

## Component Architecture

### Frontend Components

**Core Application (React)**
- Dashboard: Letter list and management
- Letter Editor: Rich text editing with formatting
- Document Upload: Drag-and-drop with progress
- Template Manager: CRUD for firm templates
- Settings: Firm and user configuration

**State Management**
- Redux/Context API for global state
- Local state for component-specific data
- Optimistic UI updates for responsiveness

**UI Component Library**
- Custom design system (see UX docs)
- Reusable components (buttons, forms, cards)
- Accessibility-compliant (WCAG 2.1 AA)

### Backend Services

**Authentication Service (Node.js)**
- JWT token generation and validation
- Password hashing with bcrypt
- Session management
- Role-based access control

**Letter Service (Node.js)**
- CRUD operations for demand letters
- Status management (Draft → Finalized)
- Version history tracking
- Collaboration coordination

**AI Service (Python)**
- Document processing and OCR
- AI prompt construction
- Anthropic API integration
- Response parsing and validation

**Template Service (Node.js)**
- Template CRUD operations
- Variable placeholder management
- Template versioning
- Firm-specific template isolation

**Document Service (Node.js)**
- File upload to S3
- Document metadata management
- Processing status tracking
- Secure download URLs (pre-signed)

**Export Service (Python)**
- Word document generation (.docx)
- PDF export (P1 feature)
- Formatting preservation
- Letterhead integration

### Database Schema

**Core Tables:**
- Firm: Law firm accounts
- User: Attorneys, paralegals, admins
- DemandLetter: Letter documents and metadata
- Template: Firm-specific templates
- SourceDocument: Uploaded files and extracted text
- LetterVersion: Version history
- Collaboration: Real-time editing changes
- AIRefinement: AI processing requests
- Export: Export history

See [docs/architecture/data-model.md](architecture/data-model.md) for detailed schema.

---

## Technology Stack Summary

### Frontend
- **Framework:** React 18+ with Hooks
- **State Management:** Redux Toolkit / Context API
- **Routing:** React Router v6
- **UI Framework:** Custom design system (Tailwind CSS)
- **Rich Text Editor:** TipTap or Draft.js
- **HTTP Client:** Axios with interceptors
- **Build Tool:** Vite
- **Package Manager:** npm

### Backend
- **Runtime:** Node.js 20.x LTS (Lambda)
- **Python Runtime:** Python 3.11 (Lambda)
- **API Framework:** Express.js (Node.js)
- **API Gateway:** AWS API Gateway (REST)
- **WebSocket:** AWS API Gateway WebSocket (P1)

### Database & Storage
- **Primary Database:** PostgreSQL 15 (AWS RDS)
- **Object Storage:** AWS S3 with encryption
- **Cache:** Redis (ElastiCache) - P1
- **Document Store:** S3 with lifecycle policies

### AI/ML
- **Primary AI:** Anthropic Claude 3.5 Sonnet via API
- **Fallback:** AWS Bedrock (Claude models)
- **Document Processing:** Tesseract OCR, PyPDF2
- **NLP Libraries:** LangChain (Python)

### Infrastructure
- **Cloud Provider:** AWS (US-East-1 primary, US-West-2 DR)
- **Compute:** AWS Lambda (serverless)
- **CDN:** CloudFront
- **DNS:** Route 53
- **Secrets:** AWS Secrets Manager
- **IAM:** AWS IAM for service authentication

### DevOps & Monitoring
- **CI/CD:** GitHub Actions / AWS CodePipeline
- **IaC:** Terraform or AWS CDK
- **Monitoring:** CloudWatch + CloudWatch Logs
- **Tracing:** AWS X-Ray
- **Alerting:** CloudWatch Alarms + SNS
- **Logging:** Centralized in CloudWatch Logs

### Security
- **Authentication:** JWT with RS256
- **Encryption:** TLS 1.3 (transit), AES-256 (rest)
- **Secrets Management:** AWS Secrets Manager
- **WAF:** AWS WAF (API Gateway)
- **DDoS Protection:** AWS Shield Standard

See [docs/architecture/tech-stack.md](architecture/tech-stack.md) for detailed versions and rationale.

---

## Security Architecture

### Defense in Depth

**Layer 1: Network Security**
- VPC with private subnets for RDS
- Security groups restricting access
- AWS WAF rules for common attacks
- DDoS protection via AWS Shield

**Layer 2: Application Security**
- JWT-based authentication
- Role-based authorization (RBAC)
- Input validation and sanitization
- SQL injection prevention (parameterized queries)
- XSS protection (content security policy)

**Layer 3: Data Security**
- Encryption at rest (AES-256)
- Encryption in transit (TLS 1.3)
- Database encryption (RDS)
- S3 bucket encryption (SSE-S3/SSE-KMS)
- Password hashing (bcrypt with salt)

**Layer 4: Multi-Tenancy Isolation**
- Row-level security in PostgreSQL
- Firm-specific data filtering at API layer
- S3 bucket policies for firm isolation
- No cross-firm data access

**Layer 5: Compliance & Audit**
- Audit logging for all actions
- CloudTrail for AWS API calls
- Immutable audit logs
- GDPR compliance measures
- Attorney-client privilege protection

### Authentication & Authorization Flow

```
User Login → API Gateway → Lambda Auth Function →
Validate Credentials → Generate JWT (RS256) →
Return Token to Client → Store in HttpOnly Cookie →

Subsequent Requests:
Client sends JWT → API Gateway Authorizer → Validate Token →
Extract User/Firm ID → Authorize Request → Execute Lambda →
Row-Level Security Filter → Return Firm-Specific Data
```

### Data Privacy

- **Firm Isolation:** All queries filtered by firm_id
- **User Permissions:** Role-based access (Admin, Attorney, Paralegal)
- **Data Encryption:** All PII and sensitive data encrypted
- **Right to Deletion:** GDPR-compliant data deletion
- **Data Residency:** US-only data storage

See [docs/architecture/security.md](architecture/security.md) for comprehensive security documentation.

---

## Integration Points

### External System Integrations

**Anthropic Claude API**
- **Purpose:** AI-powered letter generation and refinement
- **Protocol:** REST API over HTTPS
- **Authentication:** API key (stored in Secrets Manager)
- **Rate Limits:** Monitor and implement backoff
- **Fallback:** AWS Bedrock with Claude models
- **Cost Management:** Token counting and budget alerts

**AWS Bedrock (Fallback)**
- **Purpose:** Alternative AI service if Anthropic unavailable
- **Protocol:** AWS SDK (boto3)
- **Authentication:** IAM role-based
- **Models:** Claude 3.5 Sonnet/Opus
- **Benefits:** AWS-integrated, no external dependency

**SendGrid (Email Delivery)**
- **Purpose:** Transactional emails (invites, notifications, exports)
- **Protocol:** REST API / SMTP
- **Authentication:** API key
- **Use Cases:**
  - User invitations
  - Password resets
  - Export delivery (P1)
  - Collaboration notifications (P1)

### Internal Service Communication

**Inter-Lambda Communication**
- **Pattern:** Event-driven via SNS/SQS (async) or direct invocation (sync)
- **Authentication:** IAM role-based
- **Data Format:** JSON payloads
- **Error Handling:** Dead letter queues for failed async operations

**Database Access**
- **Connection Pooling:** RDS Proxy for Lambda connection management
- **Credentials:** Secrets Manager rotation
- **Read Replicas:** For heavy read operations (P1)
- **Transactions:** ACID compliance for critical operations

**S3 Integration**
- **Pre-signed URLs:** Secure file upload/download
- **Lifecycle Policies:** Archive old exports after 30 days
- **Event Notifications:** Trigger Lambda on file upload
- **Cross-Region Replication:** DR backup (P1)

### Future Integrations (Out of Scope for MVP)

- Practice management software (Clio, MyCase)
- Document management systems
- E-signature services (DocuSign)
- Calendar/scheduling systems
- Case management platforms

See [docs/architecture/api-design.md](architecture/api-design.md) for API specifications.

---

## Detailed Documentation

This architecture overview is supplemented by detailed documentation in the `docs/architecture/` directory:

1. **[tech-stack.md](architecture/tech-stack.md)**
   Detailed technology choices, versions, library selections, and rationale

2. **[data-model.md](architecture/data-model.md)**
   Complete database schema, relationships, indexes, and data model design

3. **[api-design.md](architecture/api-design.md)**
   REST API endpoints, request/response formats, authentication, error handling

4. **[deployment.md](architecture/deployment.md)**
   AWS infrastructure, CI/CD pipeline, monitoring, scaling strategies, cost optimization

5. **[security.md](architecture/security.md)**
   Authentication, authorization, encryption, compliance, audit logging, threat model

6. **[realtime.md](architecture/realtime.md)**
   WebSocket architecture for real-time collaboration (P1 feature)

---

## Architecture Decisions

### Key Technical Decisions

**Decision 1: Serverless (Lambda) vs. Container-Based (ECS/EKS)**
- **Choice:** Serverless (AWS Lambda)
- **Rationale:**
  - Lower operational overhead (no server management)
  - Auto-scaling built-in (0 to thousands of concurrent executions)
  - Pay-per-use pricing (cost-effective for variable load)
  - Faster iteration and deployment
  - AWS Free Tier includes 1M Lambda requests/month
- **Trade-offs:** Cold start latency (mitigated with provisioned concurrency for critical paths)

**Decision 2: PostgreSQL vs. DynamoDB**
- **Choice:** PostgreSQL (AWS RDS)
- **Rationale:**
  - Complex relational data model with foreign keys
  - ACID transactions required for data integrity
  - Rich querying with JOINs and aggregations
  - Team familiarity with SQL
  - Row-level security for multi-tenancy
- **Trade-offs:** Vertical scaling limits (acceptable for 10K firms), requires connection pooling for Lambda

**Decision 3: Anthropic API vs. Self-Hosted LLM**
- **Choice:** Anthropic Claude API (primary), AWS Bedrock (fallback)
- **Rationale:**
  - Best-in-class language model for legal content
  - No infrastructure management or ML expertise required
  - Regular model improvements without re-training
  - Cost-effective for expected volume
  - AWS Bedrock provides AWS-native fallback
- **Trade-offs:** External dependency (mitigated with fallback), per-token pricing

**Decision 4: Monorepo vs. Multi-Repo**
- **Choice:** Monorepo
- **Rationale:**
  - Easier code sharing between frontend and backend
  - Simplified CI/CD pipeline
  - Atomic commits across services
  - Better developer experience
- **Trade-offs:** Larger repository size (acceptable for team size)

**Decision 5: REST vs. GraphQL**
- **Choice:** REST API
- **Rationale:**
  - Simpler for team to implement and maintain
  - Better caching with HTTP
  - Less client complexity
  - Sufficient for use cases (not complex data fetching)
- **Trade-offs:** Multiple API calls for related data (acceptable with proper design)

---

## Performance Targets

### Response Time Targets

| Operation | Target | Measured At |
|-----------|--------|-------------|
| Page Load | < 2s | First contentful paint |
| API Request | < 500ms | 95th percentile |
| Document Upload | < 30s | Per file (25MB) |
| Letter Generation | < 2 min | End-to-end |
| AI Refinement | < 30s | Single operation |
| Export to Word | < 10s | Document generation |
| Real-time Sync | < 500ms | Collaboration updates |

### Scalability Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Concurrent Users | 100+ per firm | Lambda auto-scaling |
| Total Firms | 10,000+ | Multi-tenant architecture |
| Letters/Month | 50,000+ | Sustainable throughput |
| Database Size | 1M+ letters | With archival strategy |
| Storage | 10TB+ | S3 with lifecycle policies |

### Availability & Reliability

- **Uptime SLA:** 99.5% (MVP), 99.9% (GA)
- **Recovery Time Objective (RTO):** < 1 hour
- **Recovery Point Objective (RPO):** < 15 minutes
- **Data Durability:** 99.999999999% (S3 standard)
- **Backup Frequency:** Daily automated backups

---

## Cost Optimization Strategy

### AWS Free Tier Utilization

**Lambda:** 1M requests/month + 400,000 GB-seconds compute
**RDS:** 750 hours/month of db.t3.micro (PostgreSQL)
**S3:** 5 GB storage + 20,000 GET requests + 2,000 PUT requests
**CloudFront:** 1 TB data transfer out
**API Gateway:** 1M REST API calls/month

**Estimated MVP Costs (Beyond Free Tier):**
- RDS PostgreSQL (db.t3.medium): ~$60/month
- Lambda (excess usage): ~$20/month
- S3 storage (100 GB): ~$2.30/month
- Anthropic API (5,000 letters/month): ~$200-400/month
- **Total: ~$300-500/month for MVP**

### Cost Control Measures

1. **Right-Sizing:** Start with smallest instance sizes, scale based on metrics
2. **Storage Tiering:** Move old documents to S3 Glacier after 90 days
3. **Lambda Optimization:** Minimize cold starts, optimize memory allocation
4. **AI Token Management:** Prompt optimization to reduce token usage
5. **Reserved Capacity:** Purchase RDS reserved instances after usage stabilizes (P1)
6. **CloudWatch Cost Alerts:** Budget alerts at $400, $600, $800/month

See [docs/architecture/deployment.md](architecture/deployment.md) for detailed cost analysis.

---

## Disaster Recovery & Business Continuity

### Backup Strategy

**Database (RDS):**
- Automated daily backups (30-day retention)
- Point-in-time recovery enabled
- Cross-region backup replication (P1)
- Quarterly restore testing

**Documents (S3):**
- Versioning enabled
- Cross-region replication (P1)
- Object lock for compliance (P1)
- Lifecycle policies for cost optimization

**Application Code:**
- Version control (Git)
- CI/CD pipeline with rollback
- Infrastructure as Code (Terraform/CDK)

### Disaster Recovery Plan

**Scenario 1: Availability Zone Failure**
- **Impact:** Minimal (Multi-AZ RDS, Lambda in multiple AZs)
- **Action:** Automatic failover by AWS
- **RTO:** < 5 minutes

**Scenario 2: Regional Outage**
- **Impact:** Service disruption (single-region deployment initially)
- **Action:** Manual failover to DR region (P1)
- **RTO:** < 4 hours
- **RPO:** < 1 hour

**Scenario 3: Data Corruption**
- **Impact:** Partial data loss
- **Action:** Restore from point-in-time backup
- **RTO:** < 2 hours
- **RPO:** < 15 minutes

See [docs/architecture/deployment.md](architecture/deployment.md) for comprehensive DR procedures.

---

## Future Architecture Evolution

### Phase 2 Enhancements (P1 Features)

1. **Real-Time Collaboration**
   - WebSocket API Gateway for live editing
   - Operational transformation for conflict resolution
   - Presence detection and cursor tracking
   - See [docs/architecture/realtime.md](architecture/realtime.md)

2. **Advanced Caching**
   - Redis (ElastiCache) for session data
   - Template caching for faster generation
   - API response caching

3. **Improved Performance**
   - RDS read replicas for reporting queries
   - CDN caching optimization
   - Lambda provisioned concurrency for critical paths

4. **Enhanced Monitoring**
   - Custom dashboards (Datadog/New Relic)
   - User behavior analytics
   - AI quality metrics

### Phase 3 Enhancements (P2+ Features)

1. **Multi-Region Deployment**
   - Active-active architecture for global users
   - Data replication and consistency
   - Region-based routing

2. **Advanced Integrations**
   - Practice management systems (Clio, MyCase)
   - Document management systems
   - E-signature services

3. **Mobile Applications**
   - Native iOS/Android apps
   - Offline capabilities
   - Push notifications

4. **Enterprise Features**
   - SSO integration (SAML, OAuth)
   - Advanced RBAC
   - Custom security policies
   - White-label solutions

---

## Conclusion

The Demand Letter Generator architecture balances pragmatism with scalability, leveraging AWS managed services to minimize operational overhead while ensuring security, performance, and cost-effectiveness. The serverless-first approach enables rapid iteration and automatic scaling, while the multi-tenant PostgreSQL design provides the relational integrity required for complex legal workflows.

By integrating Anthropic's Claude AI, the system delivers transformative productivity gains for attorneys while maintaining the flexibility to refine and customize output. The architecture is designed to evolve progressively, starting with core MVP features and expanding to real-time collaboration, advanced integrations, and global deployment as the product matures.

**Architecture Status:** Ready for implementation
**Next Steps:** Review detailed architecture documents and begin infrastructure provisioning

---

## Document Change History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-04 | Winston | Initial architecture documentation |

---

## Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Owner | Steno Leadership | | |
| Technical Architect | Winston | ✓ | 2025-12-04 |
| Engineering Lead | | | |
| Security Lead | | | |
| DevOps Lead | | | |
