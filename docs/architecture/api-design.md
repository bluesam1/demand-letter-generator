# API Design

**Project:** Steno - Demand Letter Generator
**Document:** REST API Specification & Design
**Version:** 1.0
**Last Updated:** 2025-12-04

---

## Overview

This document specifies the RESTful API design for the Demand Letter Generator, including endpoints, request/response formats, authentication, error handling, and API best practices.

---

## Table of Contents

1. [API Design Principles](#api-design-principles)
2. [Base URL & Versioning](#base-url--versioning)
3. [Authentication](#authentication)
4. [API Endpoints](#api-endpoints)
5. [Request/Response Formats](#requestresponse-formats)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)
8. [API Documentation](#api-documentation)

---

## API Design Principles

### 1. RESTful Design
- Resource-based URLs (`/letters`, `/templates`)
- HTTP verbs: GET (read), POST (create), PUT/PATCH (update), DELETE (delete)
- Stateless requests

### 2. Consistent Naming
- **Resources:** Plural nouns (`/letters`, not `/letter`)
- **Actions:** HTTP verbs (not `/createLetter`)
- **Nested resources:** `/letters/:id/documents`
- **kebab-case** for multi-word paths (`/source-documents`)

### 3. JSON Everywhere
- Request body: `Content-Type: application/json`
- Response body: `Content-Type: application/json`
- Consistent field naming: **camelCase**

### 4. Security First
- HTTPS only (TLS 1.3)
- JWT authentication
- Input validation
- Rate limiting

### 5. Developer-Friendly
- Clear error messages
- Comprehensive documentation (OpenAPI)
- Consistent response structure
- Pagination and filtering

---

## Base URL & Versioning

### Base URL

**Production:**
```
https://api.stenodemandletters.com/v1
```

**Staging:**
```
https://api-staging.stenodemandletters.com/v1
```

**Development:**
```
http://localhost:3000/v1
```

### Versioning Strategy

- **URL-based versioning:** `/v1/`, `/v2/`
- Major version in URL path
- Maintain backward compatibility within major version
- Deprecation notices 6 months before removal

---

## Authentication

### JWT (JSON Web Token) Authentication

**Flow:**
1. User logs in with email + password
2. Server returns JWT access token (1-hour expiration)
3. Client includes token in subsequent requests

**Authorization Header:**
```http
Authorization: Bearer <access_token>
```

### Login Endpoint

**POST `/v1/auth/login`**

Request:
```json
{
  "email": "attorney@lawfirm.com",
  "password": "securePassword123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "userId": "uuid",
      "email": "attorney@lawfirm.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "Attorney",
      "firmId": "firm-uuid",
      "firmName": "Smith & Associates"
    },
    "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

### JWT Payload Structure

```json
{
  "sub": "user-uuid",
  "email": "attorney@lawfirm.com",
  "firmId": "firm-uuid",
  "role": "Attorney",
  "iat": 1701388800,
  "exp": 1701392400
}
```

### Token Refresh (P1)

**POST `/v1/auth/refresh`**

Request:
```json
{
  "refreshToken": "refresh-token-here"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "accessToken": "new-access-token",
    "expiresIn": 3600
  }
}
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/v1/auth/login` | User login | No |
| POST | `/v1/auth/logout` | User logout | Yes |
| POST | `/v1/auth/refresh` | Refresh access token (P1) | Yes |
| POST | `/v1/auth/forgot-password` | Request password reset | No |
| POST | `/v1/auth/reset-password` | Reset password with token | No |

### Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/v1/users/me` | Get current user profile | Yes |
| PATCH | `/v1/users/me` | Update current user profile | Yes |
| POST | `/v1/users/invite` | Invite new user (Admin only) | Yes |
| GET | `/v1/users` | List all firm users (Admin only) | Yes |
| PATCH | `/v1/users/:id` | Update user (Admin only) | Yes |
| DELETE | `/v1/users/:id` | Deactivate user (Admin only) | Yes |

### Demand Letters

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/v1/letters` | List letters (paginated, filtered) | Yes |
| POST | `/v1/letters` | Create new letter | Yes |
| GET | `/v1/letters/:id` | Get letter details | Yes |
| PATCH | `/v1/letters/:id` | Update letter | Yes |
| DELETE | `/v1/letters/:id` | Delete letter | Yes |
| POST | `/v1/letters/:id/generate` | Generate letter from documents | Yes |
| POST | `/v1/letters/:id/refine` | AI refinement | Yes |
| POST | `/v1/letters/:id/finalize` | Finalize letter (lock editing) | Yes |
| POST | `/v1/letters/:id/export` | Export to Word/PDF | Yes |

### Source Documents

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/v1/letters/:letterId/documents` | Upload document | Yes |
| GET | `/v1/letters/:letterId/documents` | List documents for letter | Yes |
| GET | `/v1/documents/:id` | Get document details | Yes |
| GET | `/v1/documents/:id/download` | Download document (pre-signed URL) | Yes |
| DELETE | `/v1/documents/:id` | Delete document | Yes |

### Templates

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/v1/templates` | List templates | Yes |
| POST | `/v1/templates` | Create template (Admin only) | Yes |
| GET | `/v1/templates/:id` | Get template details | Yes |
| PATCH | `/v1/templates/:id` | Update template (Admin only) | Yes |
| DELETE | `/v1/templates/:id` | Delete template (Admin only) | Yes |

### Firm Settings

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/v1/firm` | Get firm details | Yes |
| PATCH | `/v1/firm` | Update firm details (Admin only) | Yes |
| POST | `/v1/firm/branding/logo` | Upload firm logo (Admin only) | Yes |
| GET | `/v1/firm/branding/logo` | Get firm logo URL | Yes |

---

## Request/Response Formats

### Standard Response Structure

All API responses follow this structure:

**Success Response:**
```json
{
  "success": true,
  "data": { /* response data */ },
  "meta": { /* optional metadata */ }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { /* optional error details */ }
  }
}
```

### Pagination

**Request (Query Parameters):**
```
GET /v1/letters?page=2&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [
    { /* letter 1 */ },
    { /* letter 2 */ }
  ],
  "meta": {
    "pagination": {
      "page": 2,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": true
    }
  }
}
```

### Filtering & Sorting

**Query Parameters:**
- `status` - Filter by status (Draft, In_Review, Finalized, Exported)
- `search` - Search by client or defendant name
- `sort` - Sort field (e.g., `createdAt`, `updatedAt`)
- `order` - Sort order (`asc` or `desc`)

**Example:**
```
GET /v1/letters?status=Draft&sort=updatedAt&order=desc&page=1&limit=50
```

---

## Detailed Endpoint Specifications

### 1. GET `/v1/letters` - List Demand Letters

**Description:** Retrieve paginated list of demand letters for the authenticated user's firm.

**Query Parameters:**
- `page` (integer, default: 1)
- `limit` (integer, default: 50, max: 100)
- `status` (string, optional): Draft | In_Review | Finalized | Exported
- `search` (string, optional): Search client or defendant name
- `sort` (string, default: updatedAt): createdAt | updatedAt | clientName
- `order` (string, default: desc): asc | desc

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "letterId": "uuid",
      "clientName": "Sarah Johnson",
      "defendantName": "State Farm Insurance",
      "status": "Draft",
      "demandAmount": 50000.00,
      "incidentDate": "2024-11-15",
      "createdAt": "2025-12-01T10:30:00Z",
      "updatedAt": "2025-12-04T14:22:00Z",
      "createdBy": {
        "userId": "uuid",
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 23,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

---

### 2. POST `/v1/letters` - Create New Letter

**Description:** Create a new demand letter.

**Request:**
```json
{
  "clientName": "Sarah Johnson",
  "defendantName": "State Farm Insurance",
  "incidentDate": "2024-11-15",
  "demandAmount": 50000,
  "caseReference": "CASE-2024-1234",
  "templateId": "template-uuid",
  "metadata": {
    "caseType": "Personal Injury",
    "jurisdiction": "California"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "letterId": "uuid",
    "clientName": "Sarah Johnson",
    "defendantName": "State Farm Insurance",
    "status": "Draft",
    "demandAmount": 50000,
    "incidentDate": "2024-11-15",
    "caseReference": "CASE-2024-1234",
    "templateId": "template-uuid",
    "content": null,
    "metadata": {
      "caseType": "Personal Injury",
      "jurisdiction": "California"
    },
    "createdAt": "2025-12-04T15:00:00Z",
    "updatedAt": "2025-12-04T15:00:00Z"
  }
}
```

---

### 3. POST `/v1/letters/:letterId/documents` - Upload Document

**Description:** Upload a source document for a letter.

**Request:**
- Content-Type: `multipart/form-data`
- Form Fields:
  - `file` (required): Document file
  - `documentType` (optional): Medical_Record | Police_Report | Correspondence | Other

**Response:**
```json
{
  "success": true,
  "data": {
    "documentId": "uuid",
    "letterId": "letter-uuid",
    "fileName": "medical-records.pdf",
    "fileType": "application/pdf",
    "fileSize": 2458624,
    "documentType": "Medical_Record",
    "processingStatus": "Pending",
    "uploadedAt": "2025-12-04T15:05:00Z"
  }
}
```

---

### 4. POST `/v1/letters/:id/generate` - Generate Letter

**Description:** Generate initial letter draft from uploaded documents using AI.

**Request:**
```json
{
  "additionalInstructions": "Focus on medical damages and lost wages"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "letterId": "uuid",
    "status": "Draft",
    "content": "<p>December 4, 2025</p><p>State Farm Insurance...</p>",
    "metadata": {
      "generatedAt": "2025-12-04T15:10:00Z",
      "aiModel": "claude-3-5-sonnet-20241022",
      "tokenCount": 5420,
      "processingTimeMs": 12450
    }
  }
}
```

---

### 5. POST `/v1/letters/:id/refine` - AI Refinement

**Description:** Refine letter content based on natural language instructions.

**Request:**
```json
{
  "instruction": "Make the liability section more aggressive and add case law citations",
  "targetSection": "liability",
  "content": "<p>Current liability section text...</p>"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "refinementId": "uuid",
    "originalContent": "<p>Current liability section text...</p>",
    "refinedContent": "<p>The defendant's actions constitute clear negligence per California Civil Code §1714...</p>",
    "status": "Completed",
    "aiModel": "claude-3-5-sonnet-20241022",
    "tokenCount": 1850,
    "processingTimeMs": 4200,
    "createdAt": "2025-12-04T15:15:00Z"
  }
}
```

---

### 6. POST `/v1/letters/:id/export` - Export Letter

**Description:** Export letter to Word or PDF format.

**Request:**
```json
{
  "format": "DOCX",
  "includeLetterhead": true,
  "fileName": "Johnson-DemandLetter-2025-12-04"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "exportId": "uuid",
    "fileName": "Johnson-DemandLetter-2025-12-04.docx",
    "format": "DOCX",
    "fileSize": 45820,
    "downloadUrl": "https://s3.amazonaws.com/steno-exports/signed-url...",
    "expiresAt": "2025-12-04T16:15:00Z"
  }
}
```

---

### 7. POST `/v1/templates` - Create Template

**Description:** Create a new firm template (Admin only).

**Request:**
```json
{
  "templateName": "Personal Injury - Car Accident",
  "templateDescription": "Standard template for car accident personal injury cases",
  "category": "Personal Injury",
  "isDefault": false,
  "templateContent": {
    "sections": [
      {
        "id": "introduction",
        "title": "Introduction",
        "content": "This office represents {{client_name}} in connection with injuries sustained on {{incident_date}}...",
        "order": 1
      },
      {
        "id": "facts",
        "title": "Statement of Facts",
        "content": "{{facts_summary}}",
        "order": 2
      }
    ],
    "variables": ["client_name", "incident_date", "facts_summary"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "templateId": "uuid",
    "templateName": "Personal Injury - Car Accident",
    "templateDescription": "Standard template for car accident personal injury cases",
    "category": "Personal Injury",
    "isDefault": false,
    "version": 1,
    "createdAt": "2025-12-04T15:20:00Z"
  }
}
```

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "fields": {
        "email": "Invalid email format",
        "password": "Password must be at least 8 characters"
      }
    }
  }
}
```

### Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | `VALIDATION_ERROR` | Request validation failed |
| 401 | `UNAUTHORIZED` | Missing or invalid authentication token |
| 403 | `FORBIDDEN` | User lacks permission for this resource |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Resource conflict (e.g., duplicate) |
| 413 | `FILE_TOO_LARGE` | Uploaded file exceeds size limit |
| 415 | `UNSUPPORTED_FILE_TYPE` | File type not supported |
| 422 | `UNPROCESSABLE_ENTITY` | Business logic validation failed |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_SERVER_ERROR` | Unexpected server error |
| 502 | `BAD_GATEWAY` | External service error (AI API) |
| 503 | `SERVICE_UNAVAILABLE` | Service temporarily unavailable |

### Example Error Responses

**Validation Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "fields": {
        "clientName": "Client name is required",
        "demandAmount": "Must be a positive number"
      }
    }
  }
}
```

**Unauthorized:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication token is missing or invalid"
  }
}
```

**Forbidden:**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to access this resource"
  }
}
```

**Not Found:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Letter not found"
  }
}
```

**Rate Limit Exceeded:**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again in 60 seconds.",
    "details": {
      "retryAfter": 60,
      "limit": 100,
      "remaining": 0,
      "resetAt": "2025-12-04T16:00:00Z"
    }
  }
}
```

---

## Rate Limiting

### Limits

**Per User:**
- **Standard:** 100 requests per minute
- **Burst:** 1000 requests per hour
- **File Uploads:** 10 uploads per minute

**Response Headers:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1701388920
```

### Rate Limit Exceeded Response

**Status:** 429 Too Many Requests

**Body:**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again later.",
    "details": {
      "retryAfter": 45
    }
  }
}
```

### Implementation

- **AWS API Gateway:** Throttling settings
- **Application Layer:** Redis-based rate limiting (P1)
- **IP-based limits:** For unauthenticated endpoints

---

## API Documentation

### OpenAPI Specification

API documented using OpenAPI 3.1 (Swagger).

**Interactive Documentation URL:**
```
https://api.stenodemandletters.com/docs
```

**OpenAPI JSON:**
```
https://api.stenodemandletters.com/openapi.json
```

### Documentation Tools

- **Swagger UI:** Interactive API explorer
- **Redoc:** Clean, readable documentation
- **Postman Collection:** Importable API collection

---

## API Versioning & Deprecation

### Versioning Policy

- **Major Version (v1, v2):** Breaking changes
- **Minor Updates:** Backward-compatible changes (no version bump)
- **Deprecation Notice:** 6 months before removal

### Deprecation Headers

```http
Deprecation: true
Sunset: Sat, 1 Jun 2026 23:59:59 GMT
Link: <https://api.stenodemandletters.com/v2/letters>; rel="successor-version"
```

---

## Security Best Practices

### Request Security

1. **HTTPS Only:** Redirect HTTP to HTTPS
2. **CORS:** Whitelist allowed origins
3. **CSRF Protection:** For cookie-based auth (if used)
4. **Input Validation:** All requests validated before processing
5. **SQL Injection Prevention:** Parameterized queries only
6. **XSS Prevention:** Sanitize user input, CSP headers

### Response Security

**Headers:**
```http
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
```

---

## WebSocket API (P1 - Real-Time Collaboration)

**See [realtime.md](realtime.md) for WebSocket specification**

WebSocket endpoint for real-time collaboration:
```
wss://ws.stenodemandletters.com/v1/letters/:id/collaborate
```

---

## Conclusion

This API design provides a comprehensive, secure, and developer-friendly interface for the Demand Letter Generator. The RESTful structure, consistent response formats, and detailed error handling ensure a smooth integration experience for frontend developers and future third-party integrations.

**Key Design Strengths:**
- Clear, predictable endpoints
- Consistent JSON structure
- Comprehensive error handling
- Built-in pagination and filtering
- JWT-based security
- Rate limiting for protection
- OpenAPI documentation

**Next Steps:**
1. Implement API gateway configuration
2. Generate OpenAPI spec from code
3. Build Postman collection
4. Create API client SDKs (TypeScript, Python)

---

## Document Change History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-04 | Winston | Initial API design documentation |
