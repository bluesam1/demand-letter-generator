# Security Architecture

**Project:** Steno - Demand Letter Generator
**Document:** Security, Authentication, Authorization, and Compliance
**Version:** 1.0
**Last Updated:** 2025-12-04

---

## Overview

This document details the comprehensive security architecture for the Demand Letter Generator, including authentication, authorization, encryption, compliance measures, and threat mitigation strategies.

---

## Table of Contents

1. [Security Principles](#security-principles)
2. [Authentication & Authorization](#authentication--authorization)
3. [Data Encryption](#data-encryption)
4. [Network Security](#network-security)
5. [Application Security](#application-security)
6. [Multi-Tenant Isolation](#multi-tenant-isolation)
7. [Compliance](#compliance)
8. [Threat Model & Mitigation](#threat-model--mitigation)
9. [Security Monitoring](#security-monitoring)
10. [Incident Response](#incident-response)

---

## Security Principles

### 1. Defense in Depth
Multiple layers of security controls to protect against threats.

### 2. Least Privilege
Users and services granted minimum permissions necessary.

### 3. Zero Trust
Verify every request, never assume trust based on network location.

### 4. Encryption Everywhere
Data encrypted at rest and in transit.

### 5. Security by Design
Security integrated from the start, not added later.

### 6. Audit Everything
Comprehensive logging of all security-relevant actions.

---

## Authentication & Authorization

### Authentication Flow

```
1. User Login Request
   ↓
2. API Gateway → Lambda (Auth Service)
   ↓
3. Validate Credentials (bcrypt comparison)
   ↓
4. Query User + Firm from PostgreSQL
   ↓
5. Generate JWT Token (RS256)
   ↓
6. Return Token to Client
   ↓
7. Client Stores Token (HttpOnly Cookie + Memory)
   ↓
8. Subsequent Requests Include Token
   ↓
9. API Gateway JWT Authorizer Validates
   ↓
10. Extract User/Firm Context → Lambda
```

### JWT Implementation

**Algorithm:** RS256 (RSA with SHA-256)

**Token Structure:**
```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user-uuid",
    "email": "attorney@lawfirm.com",
    "firmId": "firm-uuid",
    "role": "Attorney",
    "iat": 1701388800,
    "exp": 1701392400
  },
  "signature": "..."
}
```

**Token Lifecycle:**
- **Expiration:** 1 hour
- **Refresh:** Via refresh token (P1)
- **Revocation:** Blacklist in Redis (P1)
- **Storage:** HttpOnly cookie (CSRF-protected) + memory

**JWT Secrets:**
- **Private Key:** RSA 2048-bit, stored in AWS Secrets Manager
- **Public Key:** Distributed to API Gateway authorizer
- **Rotation:** Every 6 months or on security incident

### Authorization (RBAC)

**Roles:**

| Role | Permissions |
|------|-------------|
| **Admin** | Full access to firm data, manage users, manage templates, firm settings |
| **Attorney** | Create/edit letters, use templates (read-only), upload documents, export |
| **Paralegal** | Create/edit letters (limited), upload documents, view templates |

**Permission Matrix:**

| Resource | Admin | Attorney | Paralegal |
|----------|-------|----------|-----------|
| Create Letter | ✓ | ✓ | ✓ |
| Edit Own Letter | ✓ | ✓ | ✓ |
| Edit Others' Letter | ✓ | ✓ | ✗ |
| Delete Letter | ✓ | ✓ (own) | ✗ |
| Finalize Letter | ✓ | ✓ | ✗ |
| Create Template | ✓ | ✗ | ✗ |
| Edit Template | ✓ | ✗ | ✗ |
| Invite User | ✓ | ✗ | ✗ |
| View Firm Settings | ✓ | ✓ (read) | ✗ |
| Modify Firm Settings | ✓ | ✗ | ✗ |

**Implementation:**

```typescript
// middleware/authorize.ts
export function authorize(requiredRole: Role) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userRole = req.user.role;
    const firmId = req.user.firmId;

    // Check role
    if (!hasRole(userRole, requiredRole)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Insufficient permissions' }
      });
    }

    // Inject firm context for row-level security
    req.firmId = firmId;
    next();
  };
}

// Usage
app.post('/v1/templates',
  authenticate,
  authorize('Admin'),
  createTemplate
);
```

### Password Security

**Hashing:**
- **Algorithm:** bcrypt
- **Salt Rounds:** 12
- **Implementation:**
  ```typescript
  import bcrypt from 'bcrypt';

  // Hash password on registration
  const passwordHash = await bcrypt.hash(password, 12);

  // Verify password on login
  const isValid = await bcrypt.compare(password, storedHash);
  ```

**Password Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

**Password Reset:**
1. User requests reset via email
2. Generate secure token (crypto.randomBytes)
3. Store token hash + expiration (15 minutes) in database
4. Email reset link with token
5. User clicks link, provides new password
6. Validate token, update password, invalidate token

---

## Data Encryption

### Encryption at Rest

**Database (RDS PostgreSQL):**
- **Method:** AWS KMS encryption
- **Key:** AWS-managed key (default) or customer-managed key (CMK)
- **Scope:** All database files, backups, snapshots
- **Algorithm:** AES-256

**Object Storage (S3):**
- **Method:** Server-side encryption (SSE-S3 or SSE-KMS)
- **Buckets:**
  - Documents: SSE-KMS with CMK (enhanced audit)
  - Exports: SSE-S3 (cost-effective)
  - Static Assets: SSE-S3
- **Algorithm:** AES-256

**Secrets (Secrets Manager):**
- Encrypted by default with KMS
- Automatic rotation for database credentials

**Additional Encryption (Sensitive Fields):**
- Consider application-layer encryption for:
  - Extracted document text (contains PII)
  - Metadata fields with sensitive case info
- Use AWS Encryption SDK or libsodium

### Encryption in Transit

**TLS/SSL:**
- **Protocol:** TLS 1.3 (minimum TLS 1.2)
- **Cipher Suites:** Strong ciphers only (ECDHE, AES-GCM)
- **Certificates:** AWS Certificate Manager (ACM)
- **HSTS:** Enabled (max-age=31536000, includeSubDomains)

**Endpoints:**
- CloudFront → HTTPS only (redirect HTTP)
- API Gateway → HTTPS only
- Lambda → RDS → Encrypted connection
- Lambda → S3 → HTTPS (SDK default)
- Lambda → Anthropic API → HTTPS

**Certificate Management:**
- Automatic renewal via ACM
- Wildcard certificate: *.stenodemandletters.com
- Root domain: stenodemandletters.com

---

## Network Security

### VPC Architecture

**CIDR:** 10.0.0.0/16

**Subnets:**
- **Public Subnets (2 AZs):** 10.0.101.0/24, 10.0.102.0/24
  - NAT Gateways
- **Private Subnets (2 AZs):** 10.0.1.0/24, 10.0.2.0/24
  - Lambda functions
- **Database Subnets (2 AZs):** 10.0.201.0/24, 10.0.202.0/24
  - RDS instances (no internet access)

**Security Groups:**

**Lambda Security Group:**
```
Inbound: None (Lambda-initiated connections only)
Outbound:
  - PostgreSQL: Port 5432 → DB Security Group
  - HTTPS: Port 443 → 0.0.0.0/0 (Anthropic, SendGrid, AWS APIs)
```

**RDS Security Group:**
```
Inbound:
  - PostgreSQL: Port 5432 ← Lambda Security Group
Outbound: None
```

**Network ACLs:**
- Default allow within VPC
- Deny known malicious IPs (managed list)

### AWS WAF (Web Application Firewall)

**Enabled On:** API Gateway, CloudFront

**Rule Sets:**
1. **AWS Managed Rules:**
   - Core Rule Set (OWASP Top 10)
   - Known Bad Inputs
   - SQL Database
   - Admin Protection

2. **Custom Rules:**
   - **Rate Limiting:** 100 requests per 5 minutes per IP
   - **Geo-Blocking:** Block non-US IPs (configurable)
   - **Bot Protection:** Challenge suspected bots

**Logging:**
- All WAF logs to S3 bucket
- Analyze for attack patterns
- Auto-ban IPs with malicious patterns (P1)

### DDoS Protection

**AWS Shield Standard:**
- Included free with AWS
- Layer 3/4 DDoS protection
- CloudFront and API Gateway protected

**AWS Shield Advanced (P1):**
- $3000/month
- Layer 7 DDoS protection
- 24/7 DDoS response team
- Cost protection (DDoS-related charges refunded)

---

## Application Security

### Input Validation

**Server-Side Validation (All Requests):**
```typescript
import Joi from 'joi';

const letterSchema = Joi.object({
  clientName: Joi.string().max(255).required(),
  defendantName: Joi.string().max(255).required(),
  incidentDate: Joi.date().max('now').optional(),
  demandAmount: Joi.number().positive().max(1000000000).optional(),
  metadata: Joi.object().optional()
});

// Validate request
const { error, value } = letterSchema.validate(req.body);
if (error) {
  return res.status(400).json({ error: 'Validation failed' });
}
```

**File Upload Validation:**
- File type whitelist: PDF, DOCX, TXT, JPG, PNG
- File size limit: 25 MB per file, 100 MB total
- Virus scanning: ClamAV on upload (P1)
- Magic byte verification (not just extension)

### SQL Injection Prevention

**Parameterized Queries (Prisma ORM):**
```typescript
// SAFE: Parameterized query
const letters = await prisma.demandLetter.findMany({
  where: {
    firmId: firmId,  // Parameterized
    status: status    // Parameterized
  }
});

// NEVER: String concatenation
// const query = `SELECT * FROM demand_letter WHERE firm_id = '${firmId}'`; // UNSAFE!
```

**Row-Level Security (PostgreSQL):**
```sql
-- Enforce firm isolation at database level
ALTER TABLE demand_letter ENABLE ROW LEVEL SECURITY;

CREATE POLICY letter_firm_isolation ON demand_letter
  USING (firm_id = current_setting('app.current_firm_id')::uuid);

-- Set context before each query
SET LOCAL app.current_firm_id = '<firm-uuid>';
```

### XSS Prevention

**Content Security Policy (CSP):**
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self' https://api.stenodemandletters.com;
  frame-ancestors 'none';
```

**Output Encoding:**
- React automatically escapes JSX content
- Sanitize user input before rendering (DOMPurify)
- Never use `dangerouslySetInnerHTML` without sanitization

### CSRF Protection

**Token-Based:**
- Generate CSRF token on login
- Include in form submissions
- Validate on server side

**SameSite Cookies:**
```javascript
res.cookie('accessToken', token, {
  httpOnly: true,
  secure: true, // HTTPS only
  sameSite: 'strict',
  maxAge: 3600000 // 1 hour
});
```

### API Security Headers

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

---

## Multi-Tenant Isolation

### Data Isolation Strategy

**1. Application-Layer Filtering:**
```typescript
// Every query filtered by firmId
async function getLetters(userId: string, firmId: string) {
  return await prisma.demandLetter.findMany({
    where: {
      firmId: firmId,  // ALWAYS filter by firm
      // ... other filters
    }
  });
}
```

**2. Database Row-Level Security:**
```sql
-- Enforce at database level (defense in depth)
CREATE POLICY user_firm_isolation ON "user"
  USING (firm_id = current_setting('app.current_firm_id')::uuid);
```

**3. S3 Bucket Policies:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::123456789:role/LambdaDocumentService"
      },
      "Action": ["s3:GetObject", "s3:PutObject"],
      "Resource": "arn:aws:s3:::steno-documents-prod/firms/${aws:userid}/*",
      "Condition": {
        "StringLike": {
          "s3:prefix": ["firms/${aws:userid}/*"]
        }
      }
    }
  ]
}
```

**4. Audit & Verification:**
- Quarterly audit: Scan for cross-firm data access
- Automated tests: Verify isolation in integration tests
- Manual reviews: Code reviews check for firmId filtering

---

## Compliance

### GDPR Compliance

**Data Subject Rights:**

| Right | Implementation |
|-------|----------------|
| **Right to Access** | API endpoint to export all user data |
| **Right to Rectification** | User profile edit functionality |
| **Right to Erasure** | Anonymize user data on request (keep letter history) |
| **Right to Data Portability** | Export user data in JSON format |
| **Right to Object** | Opt-out of non-essential processing |

**Consent Management:**
- Clear privacy policy and terms of service
- Explicit consent for data processing
- Cookie consent banner (if using tracking cookies)

**Data Retention:**
- Active letters: Indefinite (until firm deletes)
- Finalized letters: 7 years (configurable per jurisdiction)
- Audit logs: 2 years minimum
- User data after account closure: 30-day grace period, then anonymize

### Attorney-Client Privilege

**Protections:**
- Data never shared across firms
- No admin access to firm data without consent
- Subpoena handling: Legal review required
- Data never used for training AI models without explicit consent

### Data Residency

**Storage Locations:**
- Primary: AWS US-East-1 (Virginia)
- Backup: AWS US-West-2 (Oregon) - P1
- **No international data transfer** (US-only customers initially)

### Compliance Certifications (P1)

- **SOC 2 Type II:** Annual audit
- **ISO 27001:** Information security management
- **HIPAA:** For medical records (if required)

---

## Threat Model & Mitigation

### Threat 1: Unauthorized Access to Firm Data

**Threat:** Attacker gains access to another firm's letters/documents.

**Mitigation:**
- Multi-layer access control (JWT + RBAC + RLS)
- Application-layer firmId filtering on all queries
- Database row-level security
- S3 bucket policies enforce firm boundaries
- Regular penetration testing

**Detection:**
- Audit logs for cross-firm access attempts
- Anomaly detection (user accessing unusual firms)

### Threat 2: Credential Compromise

**Threat:** Attacker obtains user credentials (phishing, breach).

**Mitigation:**
- Strong password requirements
- bcrypt hashing with salt (computationally expensive to crack)
- Rate limiting on login attempts (5 attempts, 15-minute lockout)
- MFA enforcement (P1)
- Session timeout (1 hour)
- Suspicious login detection (IP, device, location)

**Detection:**
- Failed login attempt monitoring
- Login from new device/location alerts

### Threat 3: SQL Injection

**Threat:** Attacker injects malicious SQL via input fields.

**Mitigation:**
- Parameterized queries only (Prisma ORM)
- Input validation and sanitization
- WAF SQL injection rule set
- Least privilege database user (no DROP, CREATE)

**Detection:**
- WAF logs SQL injection attempts
- Database query monitoring for anomalies

### Threat 4: Data Exfiltration

**Threat:** Malicious insider or compromised account exports large volumes of data.

**Mitigation:**
- Export rate limiting (10 exports per hour per user)
- Audit logging of all exports
- DLP policies (P1): Alert on mass export
- Access controls: Only authorized roles can export

**Detection:**
- Monitor export volume per user
- Alert on unusual export patterns

### Threat 5: AI Prompt Injection

**Threat:** Attacker crafts malicious prompts to manipulate AI output.

**Mitigation:**
- Input sanitization before sending to AI
- AI system prompts enforce boundaries
- Output validation and filtering
- Monitor AI responses for anomalies
- Rate limiting on AI requests

**Detection:**
- Log all AI prompts and responses
- Alert on suspicious patterns

### Threat 6: DDoS Attack

**Threat:** Attacker floods API with requests, causing service disruption.

**Mitigation:**
- AWS Shield Standard (automatic)
- WAF rate limiting (100 req/5min per IP)
- API Gateway throttling (1000 burst, 500 steady)
- CloudFront caching reduces origin load

**Detection:**
- CloudWatch monitors request rates
- Alert on unusual traffic spikes

---

## Security Monitoring

### Security Logging

**Audit Log Events:**
- User login/logout
- Failed login attempts
- Password changes
- User created/deleted/modified
- Letter created/finalized/deleted
- Document uploaded/downloaded
- Template created/modified
- Export generated
- Firm settings changed
- API key rotation

**Log Format:**
```json
{
  "timestamp": "2025-12-04T15:30:00.000Z",
  "eventType": "USER_LOGIN",
  "userId": "user-uuid",
  "firmId": "firm-uuid",
  "ipAddress": "203.0.113.42",
  "userAgent": "Mozilla/5.0...",
  "result": "success",
  "metadata": {
    "loginMethod": "password"
  }
}
```

**Log Storage:**
- CloudWatch Logs: 30-day retention
- S3 (archived): 2-year retention
- Immutable logs (write-once-read-many)

### Security Metrics

**Dashboard:**
- Failed login attempts (last 24 hours)
- Unusual access patterns
- Cross-firm access attempts (should be 0)
- WAF blocked requests
- API error rate by endpoint
- Suspicious IP addresses

**Alerts:**
- Failed login rate > 10/min (potential brute force)
- Cross-firm access attempt (critical)
- Large data export (> 100 letters)
- API from new country (suspicious)
- Database connection from unknown IP

### Vulnerability Scanning

**Automated Scanning:**
- **Dependency Scanning:** Snyk (daily)
- **Container Scanning:** Trivy (on build)
- **Infrastructure Scanning:** Prowler (weekly)

**Manual Testing:**
- **Penetration Testing:** Annually (external firm)
- **Code Review:** Security-focused reviews for sensitive code
- **Bug Bounty Program:** P1 (HackerOne or Bugcrowd)

---

## Incident Response

### Incident Response Plan

**Severity Levels:**

| Level | Description | Response Time | Escalation |
|-------|-------------|---------------|------------|
| **Critical** | Data breach, unauthorized access | Immediate | CTO, CEO |
| **High** | Service outage, security vulnerability | < 1 hour | Engineering Lead |
| **Medium** | Degraded performance, minor vulnerability | < 4 hours | On-call Engineer |
| **Low** | Low-impact issue, non-urgent | < 24 hours | Ticket queue |

### Incident Response Steps

**1. Detection & Triage (0-15 min):**
- Alert received (automated or manual report)
- Assess severity and impact
- Activate incident response team

**2. Containment (15-60 min):**
- Isolate affected systems
- Block malicious IPs (WAF)
- Revoke compromised credentials
- Disable affected accounts (if necessary)

**3. Investigation (1-4 hours):**
- Analyze logs (CloudWatch, audit logs)
- Identify attack vector and scope
- Determine data/system impact
- Preserve evidence for forensics

**4. Eradication (2-8 hours):**
- Remove malicious code/access
- Patch vulnerabilities
- Apply security updates
- Rotate credentials if compromised

**5. Recovery (2-8 hours):**
- Restore from backups if needed
- Verify system integrity
- Gradually restore service
- Monitor for recurrence

**6. Post-Incident (24-72 hours):**
- Post-mortem meeting
- Root cause analysis
- Document lessons learned
- Update security measures
- Notify affected users (if required by law)

### Data Breach Response

**If Personal Data Compromised:**

1. **Immediate Actions:**
   - Contain breach
   - Assess scope (which users, what data)
   - Preserve forensic evidence

2. **Legal Obligations:**
   - **GDPR:** Notify supervisory authority within 72 hours
   - **State Laws:** Notify affected individuals (varies by state)
   - **Transparency:** Public disclosure if widespread

3. **Communication:**
   - Internal: Executive team, legal counsel
   - External: Affected users, regulatory authorities
   - Public: Press release (if significant)

4. **Remediation:**
   - Force password resets
   - Enhanced monitoring
   - Offer identity protection services (if PII leaked)

---

## Conclusion

The security architecture implements defense-in-depth with multiple layers: network security (VPC, WAF), application security (RBAC, input validation), data security (encryption, multi-tenant isolation), and operational security (monitoring, incident response).

**Key Security Strengths:**
- JWT-based authentication with RS256
- Role-based access control (Admin, Attorney, Paralegal)
- Multi-tenant isolation (application + database)
- Encryption at rest (AES-256) and in transit (TLS 1.3)
- Comprehensive audit logging
- AWS WAF protection against common attacks
- Incident response plan

**Security Roadmap:**
- **P0 (MVP):** Core authentication, encryption, multi-tenant isolation
- **P1 (Post-MVP):** MFA, advanced monitoring, bug bounty program
- **P2 (Scale):** SOC 2 certification, DLP, advanced threat detection

**Next Steps:**
1. Implement authentication service with JWT
2. Configure WAF rules and rate limiting
3. Enable RDS and S3 encryption
4. Set up audit logging to CloudWatch
5. Conduct security audit before launch
6. Create incident response runbook

---

## Document Change History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-04 | Winston | Initial security architecture documentation |
