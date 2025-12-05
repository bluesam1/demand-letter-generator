# API Documentation

**Project:** Steno - Demand Letter Generator
**Version:** 1.0
**Last Updated:** 2025-12-04

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Response Format](#response-format)
4. [Error Handling](#error-handling)
5. [Endpoints](#endpoints)
   - [Health Check](#health-check)
   - [Authentication](#authentication-endpoints)
   - [Users](#user-endpoints)
   - [Letters](#letter-endpoints)
   - [Templates](#template-endpoints)
   - [Documents](#document-endpoints)

---

## Overview

Base URL: `http://localhost:3001/api` (development)
Production URL: TBD

All endpoints (except `/health` and `/auth/*`) require authentication via JWT token.

---

## Authentication

### JWT Token

Include the JWT token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

Tokens expire after 1 hour. Use the `/auth/refresh` endpoint to obtain a new token.

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "meta": {
    "timestamp": "2025-12-04T00:00:00.000Z",
    "version": "1.0"
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasMore": true
  },
  "meta": {
    "timestamp": "2025-12-04T00:00:00.000Z",
    "version": "1.0"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-12-04T00:00:00.000Z",
    "version": "1.0"
  }
}
```

---

## Error Handling

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `500` - Internal Server Error
- `501` - Not Implemented
- `503` - Service Unavailable

### Error Codes

- `VALIDATION_ERROR` - Request validation failed
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Duplicate entry
- `DATABASE_ERROR` - Database operation failed
- `INVALID_TOKEN` - Invalid JWT token
- `TOKEN_EXPIRED` - JWT token expired
- `INTERNAL_ERROR` - Server error
- `NOT_IMPLEMENTED` - Feature not yet implemented

---

## Endpoints

### Health Check

#### `GET /health`

Check API health status and database connectivity.

**Authentication:** Not required

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-04T00:00:00.000Z",
  "database": "connected",
  "environment": "development"
}
```

---

### Authentication Endpoints

#### `POST /auth/register`

Register a new user and firm.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "attorney@lawfirm.com",
  "password": "SecurePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "firmName": "Doe & Associates"
}
```

**Validation:**
- `email`: Valid email format, required
- `password`: Minimum 8 characters, required
- `firstName`: 1-100 characters, required
- `lastName`: 1-100 characters, required
- `firmName`: 1-255 characters, required

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": "uuid",
      "email": "attorney@lawfirm.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "Admin",
      "firmId": "uuid",
      "firmName": "Doe & Associates"
    }
  },
  "meta": {...}
}
```

#### `POST /auth/login`

Authenticate existing user.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "attorney@lawfirm.com",
  "password": "SecurePassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": "uuid",
      "email": "attorney@lawfirm.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "Admin",
      "firmId": "uuid",
      "firmName": "Doe & Associates"
    }
  },
  "meta": {...}
}
```

#### `POST /auth/refresh`

Refresh JWT token.

**Authentication:** Required

**Status:** 501 Not Implemented (placeholder for future implementation)

---

### User Endpoints

#### `GET /users/profile`

Get current user's profile.

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "attorney@lawfirm.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "Admin",
      "firmId": "uuid",
      "lastLogin": "2025-12-04T00:00:00.000Z",
      "createdAt": "2025-12-01T00:00:00.000Z",
      "updatedAt": "2025-12-04T00:00:00.000Z",
      "firm": {
        "id": "uuid",
        "firmName": "Doe & Associates",
        "firmAddress": "123 Main St",
        "contactEmail": "contact@lawfirm.com",
        "contactPhone": "+1-555-0100",
        "subscriptionTier": "Basic"
      }
    }
  },
  "meta": {...}
}
```

#### `PUT /users/profile`

Update current user's profile.

**Authentication:** Required

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@lawfirm.com"
}
```

**Validation:**
- `firstName`: 1-100 characters, optional
- `lastName`: 1-100 characters, optional
- `email`: Valid email format, optional

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "jane.smith@lawfirm.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "role": "Admin",
      "firmId": "uuid",
      "updatedAt": "2025-12-04T00:00:00.000Z"
    }
  },
  "meta": {...}
}
```

#### `POST /users/change-password`

Change user password.

**Authentication:** Required

**Request Body:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewSecurePassword456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Password changed successfully"
  },
  "meta": {...}
}
```

---

### Letter Endpoints

#### `GET /letters`

Get all demand letters for the firm.

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "letters": [
      {
        "id": "uuid",
        "clientName": "John Client",
        "defendantName": "Jane Defendant",
        "status": "Draft",
        "caseReference": "CASE-2025-001",
        "demandAmount": "50000.00",
        "createdAt": "2025-12-01T00:00:00.000Z",
        "updatedAt": "2025-12-04T00:00:00.000Z",
        "createdBy": {
          "firstName": "John",
          "lastName": "Doe"
        }
      }
    ]
  },
  "meta": {...}
}
```

#### `GET /letters/:id`

Get a specific demand letter by ID.

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "letter": {
      "id": "uuid",
      "clientName": "John Client",
      "defendantName": "Jane Defendant",
      "status": "Draft",
      "caseReference": "CASE-2025-001",
      "incidentDate": "2025-01-15",
      "demandAmount": "50000.00",
      "content": "Letter content here...",
      "metadata": {},
      "createdAt": "2025-12-01T00:00:00.000Z",
      "updatedAt": "2025-12-04T00:00:00.000Z",
      "template": {
        "id": "uuid",
        "templateName": "Standard Demand Letter"
      },
      "createdBy": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "attorney@lawfirm.com"
      },
      "sourceDocuments": []
    }
  },
  "meta": {...}
}
```

#### `POST /letters`

Create a new demand letter.

**Authentication:** Required

**Request Body:**
```json
{
  "clientName": "John Client",
  "defendantName": "Jane Defendant",
  "templateId": "uuid",
  "caseReference": "CASE-2025-001",
  "incidentDate": "2025-01-15",
  "demandAmount": 50000.00
}
```

**Validation:**
- `clientName`: 1-255 characters, required
- `defendantName`: 1-255 characters, required
- `templateId`: UUID, optional
- `caseReference`: Max 100 characters, optional
- `incidentDate`: ISO date, optional
- `demandAmount`: Positive number with 2 decimal places, optional

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "letter": {
      "id": "uuid",
      "clientName": "John Client",
      "defendantName": "Jane Defendant",
      "status": "Draft",
      "caseReference": "CASE-2025-001",
      "incidentDate": "2025-01-15T00:00:00.000Z",
      "demandAmount": "50000.00",
      "createdAt": "2025-12-04T00:00:00.000Z",
      "updatedAt": "2025-12-04T00:00:00.000Z"
    }
  },
  "meta": {...}
}
```

#### `PUT /letters/:id`

Update a demand letter.

**Authentication:** Required

**Request Body:**
```json
{
  "clientName": "John Updated Client",
  "content": "Updated letter content...",
  "status": "In Review",
  "demandAmount": 75000.00
}
```

**Validation:**
- `clientName`: 1-255 characters, optional
- `defendantName`: 1-255 characters, optional
- `content`: String, optional
- `status`: One of "Draft", "In Review", "Finalized", "Exported", optional
- `caseReference`: Max 100 characters, optional
- `incidentDate`: ISO date, optional
- `demandAmount`: Positive number, optional

**Note:** Cannot update finalized letters.

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "letter": {
      "id": "uuid",
      "clientName": "John Updated Client",
      "content": "Updated letter content...",
      "status": "In Review",
      // ... other fields
    }
  },
  "meta": {...}
}
```

#### `DELETE /letters/:id`

Delete a demand letter.

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Letter deleted successfully"
  },
  "meta": {...}
}
```

---

### Template Endpoints

#### `GET /templates`

Get all active templates for the firm.

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "uuid",
        "templateName": "Standard Demand Letter",
        "templateDescription": "Default template for demand letters",
        "category": "Personal Injury",
        "isDefault": true,
        "createdAt": "2025-12-01T00:00:00.000Z",
        "updatedAt": "2025-12-01T00:00:00.000Z"
      }
    ]
  },
  "meta": {...}
}
```

#### `GET /templates/:id`

Get a specific template by ID.

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "template": {
      "id": "uuid",
      "templateName": "Standard Demand Letter",
      "templateDescription": "Default template for demand letters",
      "templateContent": {
        // JSON content structure
      },
      "category": "Personal Injury",
      "isDefault": true,
      "version": 1,
      "createdAt": "2025-12-01T00:00:00.000Z",
      "updatedAt": "2025-12-01T00:00:00.000Z"
    }
  },
  "meta": {...}
}
```

#### `POST /templates`

Create a new template.

**Authentication:** Required
**Authorization:** Admin or Attorney roles only

**Request Body:**
```json
{
  "templateName": "Medical Malpractice Template",
  "templateDescription": "Template for medical malpractice cases",
  "templateContent": {
    // JSON content structure
  },
  "category": "Medical Malpractice",
  "isDefault": false
}
```

**Validation:**
- `templateName`: 1-255 characters, required
- `templateDescription`: String, optional
- `templateContent`: JSON object, required
- `category`: Max 100 characters, optional
- `isDefault`: Boolean, optional

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "template": {
      "id": "uuid",
      "templateName": "Medical Malpractice Template",
      // ... other fields
    }
  },
  "meta": {...}
}
```

#### `PUT /templates/:id`

Update a template.

**Authentication:** Required
**Authorization:** Admin or Attorney roles only

**Request Body:**
```json
{
  "templateName": "Updated Template Name",
  "templateContent": {
    // Updated JSON content
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "template": {
      "id": "uuid",
      "templateName": "Updated Template Name",
      // ... other fields
    }
  },
  "meta": {...}
}
```

#### `DELETE /templates/:id`

Delete a template (soft delete).

**Authentication:** Required
**Authorization:** Admin role only

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Template deleted successfully"
  },
  "meta": {...}
}
```

---

### Document Endpoints

**Note:** Document endpoints are placeholder implementations. Full functionality will be implemented in Story 3.1.

#### `POST /documents/upload`

Upload a source document.

**Authentication:** Required

**Status:** 501 Not Implemented

**Response:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_IMPLEMENTED",
    "message": "Document upload service will be implemented in Story 3.1"
  },
  "meta": {...}
}
```

#### `GET /documents/letter/:letterId`

Get all documents for a letter.

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "documents": [],
    "message": "Document service will be fully implemented in Story 3.1"
  },
  "meta": {...}
}
```

#### `GET /documents/:id`

Get a specific document.

**Authentication:** Required

**Status:** 501 Not Implemented

#### `DELETE /documents/:id`

Delete a document.

**Authentication:** Required

**Status:** 501 Not Implemented

---

## Rate Limiting

API requests are limited to 100 requests per 15-minute window per IP address.

If you exceed the rate limit, you'll receive a `429 Too Many Requests` response.

---

## Development Notes

### Local Development

Start the backend server:
```bash
cd backend
npm run dev
```

Server runs on `http://localhost:3001`

### Testing with curl

**Register:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123",
    "firstName": "Test",
    "lastName": "User",
    "firmName": "Test Firm"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123"
  }'
```

**Get Profile (with token):**
```bash
curl http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Security Considerations

1. Always use HTTPS in production
2. Store JWT tokens securely (not in localStorage)
3. Tokens expire after 1 hour
4. All passwords are hashed with bcrypt (12 rounds)
5. CORS is configured for specific origins
6. Rate limiting prevents abuse
7. SQL injection prevented by Prisma parameterized queries
8. Input validation on all endpoints

---

## Future Enhancements

- Refresh token implementation
- Document upload and processing (Story 3.1)
- AI letter generation endpoints (Story 4.1)
- Real-time collaboration via WebSockets (P1)
- Advanced search and filtering
- Bulk operations
- Webhook support

---

## Support

For issues or questions, contact the development team.
