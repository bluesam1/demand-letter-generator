# Data Model & Database Architecture

**Project:** Steno - Demand Letter Generator
**Document:** Database Schema, Relationships, and Data Architecture
**Version:** 1.0
**Last Updated:** 2025-12-04

---

## Overview

This document provides comprehensive documentation of the database schema, entity relationships, indexing strategy, and data management for the Demand Letter Generator. The system uses PostgreSQL 15 as the primary relational database.

---

## Table of Contents

1. [Database Design Principles](#database-design-principles)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Core Entities](#core-entities)
4. [Complete Schema DDL](#complete-schema-ddl)
5. [Indexing Strategy](#indexing-strategy)
6. [Data Security](#data-security)
7. [Query Patterns](#query-patterns)
8. [Data Migration](#data-migration)
9. [Backup & Recovery](#backup--recovery)

---

## Database Design Principles

### 1. Normalization
- Third Normal Form (3NF) for core entities
- Denormalization only where performance requires
- No duplicate data except for caching/performance

### 2. Multi-Tenancy
- Firm-level data isolation
- All tables include `firm_id` where applicable
- Row-level security enforced at database and application layer
- No cross-firm data visibility

### 3. Audit Trail
- `created_at` and `updated_at` on all entities
- Immutable audit log for sensitive operations
- Soft deletes where data retention required

### 4. Scalability
- UUIDs for primary keys (distributed-friendly)
- Partitioning strategy for large tables (future)
- Efficient indexing for common queries

### 5. Flexibility
- JSONB for variable/dynamic metadata
- Template structure in JSON for flexibility
- Support for future schema evolution

---

## Entity Relationship Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                     Multi-Tenant Data Model                          │
└──────────────────────────────────────────────────────────────────────┘

                    ┌─────────────┐
                    │    Firm     │
                    ├─────────────┤
                    │ firm_id (PK)│
                    │ firm_name   │
                    │ ...         │
                    └─────────────┘
                          │
                          │ 1:M
              ┌───────────┴───────────┬──────────────┐
              │                       │              │
              ▼                       ▼              ▼
        ┌──────────┐          ┌──────────┐    ┌──────────┐
        │   User   │          │ Template │    │  Demand  │
        ├──────────┤          ├──────────┤    │  Letter  │
        │user_id(PK│          │template_ │    ├──────────┤
        │firm_id(FK│          │   id(PK) │    │letter_id │
        │email     │          │firm_id(FK│    │  (PK)    │
        │role      │          │content   │    │firm_id   │
        │...       │          │...       │    │  (FK)    │
        └──────────┘          └──────────┘    │template_ │
              │                     │          │  id (FK) │
              │                     │          │created_by│
              │                     └──────────┤  (FK)    │
              │                                │status    │
              │                                │content   │
              │                                │...       │
              │                                └──────────┘
              │                                      │
              │                            ┌─────────┴───────────┬─────────┐
              │                            │                     │         │
              │                            ▼                     ▼         ▼
              │                   ┌──────────────┐    ┌─────────────┐ ┌────────┐
              │                   │ Source       │    │Letter       │ │Collab  │
              │                   │ Document     │    │Version      │ │oration │
              │                   ├──────────────┤    ├─────────────┤ ├────────┤
              │                   │document_id   │    │version_id   │ │collab_ │
              │                   │  (PK)        │    │  (PK)       │ │ id(PK) │
              │                   │letter_id(FK) │    │letter_id(FK)│ │letter_ │
              │                   │uploaded_by   │    │created_by   │ │ id(FK) │
              │                   │  (FK)        │    │  (FK)       │ │user_id │
              │                   │file_name     │    │content      │ │  (FK)  │
              │                   │...           │    │...          │ │...     │
              │                   └──────────────┘    └─────────────┘ └────────┘
              │                            │
              │                            │
              └────────────────────────────┴───────────────────────────┐
                                                                        │
                                                                        ▼
                                                              ┌─────────────┐
                                                              │AI Refinement│
                                                              ├─────────────┤
                                                              │refinement_id│
                                                              │   (PK)      │
                                                              │letter_id(FK)│
                                                              │requested_by │
                                                              │   (FK)      │
                                                              │instruction  │
                                                              │...          │
                                                              └─────────────┘

Legend:
PK = Primary Key
FK = Foreign Key
1:M = One-to-Many Relationship
```

---

## Core Entities

### 1. Firm

Represents a law firm account (tenant).

```sql
CREATE TABLE firm (
    firm_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_name VARCHAR(255) NOT NULL,
    firm_address TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    subscription_tier VARCHAR(50) DEFAULT 'Basic'
        CHECK (subscription_tier IN ('Basic', 'Professional', 'Enterprise')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to update updated_at
CREATE TRIGGER update_firm_updated_at
    BEFORE UPDATE ON firm
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Indexes:**
```sql
CREATE INDEX idx_firm_name ON firm(firm_name);
CREATE INDEX idx_firm_active ON firm(is_active);
```

**Notes:**
- Single source of truth for firm-level settings
- All other entities reference this via `firm_id`
- Soft delete via `is_active` flag

---

### 2. User

Represents attorneys, paralegals, and admins within a firm.

```sql
CREATE TABLE "user" (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID NOT NULL REFERENCES firm(firm_id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL
        CHECK (role IN ('Admin', 'Attorney', 'Paralegal')),
    password_hash VARCHAR(255) NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_email_per_firm UNIQUE (email, firm_id)
);

-- Trigger
CREATE TRIGGER update_user_updated_at
    BEFORE UPDATE ON "user"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Indexes:**
```sql
CREATE INDEX idx_user_firm ON "user"(firm_id);
CREATE INDEX idx_user_email ON "user"(email);
CREATE INDEX idx_user_active ON "user"(is_active);
```

**Notes:**
- Email must be unique per firm
- Password stored as bcrypt hash (12 rounds)
- Role determines permissions (Admin > Attorney > Paralegal)
- Cascade delete if firm is deleted

---

### 3. Template

Firm-specific demand letter templates.

```sql
CREATE TABLE template (
    template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID NOT NULL REFERENCES firm(firm_id) ON DELETE CASCADE,
    template_name VARCHAR(255) NOT NULL,
    template_description TEXT,
    template_content JSONB NOT NULL,
    category VARCHAR(100),
    created_by UUID NOT NULL REFERENCES "user"(user_id) ON DELETE SET NULL,
    version INTEGER DEFAULT 1,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_template_name_per_firm UNIQUE (firm_id, template_name)
);

-- Trigger
CREATE TRIGGER update_template_updated_at
    BEFORE UPDATE ON template
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Template Content Structure (JSONB):**
```json
{
  "sections": [
    {
      "id": "introduction",
      "title": "Introduction",
      "content": "{{firm_name}} represents {{client_name}} in connection with...",
      "order": 1
    },
    {
      "id": "facts",
      "title": "Statement of Facts",
      "content": "On {{incident_date}}, our client was involved in...",
      "order": 2
    },
    {
      "id": "liability",
      "title": "Liability Analysis",
      "content": "{{defendant_name}} is liable for the following reasons...",
      "order": 3
    },
    {
      "id": "damages",
      "title": "Damages",
      "content": "Our client has suffered the following damages:\n{{damages_breakdown}}",
      "order": 4
    },
    {
      "id": "demand",
      "title": "Demand for Settlement",
      "content": "We demand payment in the amount of {{demand_amount}}...",
      "order": 5
    }
  ],
  "variables": [
    "firm_name", "client_name", "defendant_name",
    "incident_date", "demand_amount", "damages_breakdown"
  ]
}
```

**Indexes:**
```sql
CREATE INDEX idx_template_firm ON template(firm_id);
CREATE INDEX idx_template_category ON template(category);
CREATE INDEX idx_template_default ON template(is_default) WHERE is_default = true;
CREATE INDEX idx_template_content ON template USING GIN (template_content);
```

**Notes:**
- JSONB allows flexible template structure
- Only one default template per category per firm (application enforced)
- Version tracking for template evolution (P1)

---

### 4. DemandLetter

Core entity representing a demand letter document.

```sql
CREATE TABLE demand_letter (
    letter_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID NOT NULL REFERENCES firm(firm_id) ON DELETE CASCADE,
    template_id UUID REFERENCES template(template_id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES "user"(user_id) ON DELETE SET NULL,

    -- Case Information
    case_reference VARCHAR(100),
    client_name VARCHAR(255) NOT NULL,
    defendant_name VARCHAR(255) NOT NULL,
    incident_date DATE,
    demand_amount NUMERIC(15, 2),

    -- Letter Content
    status VARCHAR(50) DEFAULT 'Draft'
        CHECK (status IN ('Draft', 'In_Review', 'Finalized', 'Exported')),
    content TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    finalized_at TIMESTAMP WITH TIME ZONE
);

-- Trigger
CREATE TRIGGER update_demand_letter_updated_at
    BEFORE UPDATE ON demand_letter
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Metadata Structure (JSONB):**
```json
{
  "case_type": "Personal Injury",
  "jurisdiction": "California",
  "insurance_info": {
    "carrier": "State Farm",
    "policy_number": "SF-123456",
    "adjuster_name": "John Doe",
    "claim_number": "CLM-789"
  },
  "tags": ["car_accident", "rear_end", "medical"],
  "custom_fields": {
    "accident_location": "Highway 101, San Francisco",
    "witnesses": ["Jane Smith", "Bob Johnson"]
  }
}
```

**Indexes:**
```sql
CREATE INDEX idx_letter_firm ON demand_letter(firm_id);
CREATE INDEX idx_letter_created_by ON demand_letter(created_by);
CREATE INDEX idx_letter_status ON demand_letter(status);
CREATE INDEX idx_letter_template ON demand_letter(template_id);
CREATE INDEX idx_letter_client ON demand_letter(client_name);
CREATE INDEX idx_letter_defendant ON demand_letter(defendant_name);

-- Composite indexes for common queries
CREATE INDEX idx_letter_firm_status ON demand_letter(firm_id, status);
CREATE INDEX idx_letter_firm_created_at ON demand_letter(firm_id, created_at DESC);

-- JSONB index for metadata queries
CREATE INDEX idx_letter_metadata ON demand_letter USING GIN (metadata);
```

**Notes:**
- Core document entity
- Content stores the actual letter text (rich text as HTML or Markdown)
- JSONB metadata allows flexible case-specific data
- Status transitions: Draft → In_Review → Finalized → Exported
- Finalized letters cannot be edited (application enforced)

---

### 5. SourceDocument

Uploaded documents used to generate demand letters.

```sql
CREATE TABLE source_document (
    document_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    letter_id UUID NOT NULL REFERENCES demand_letter(letter_id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES "user"(user_id) ON DELETE SET NULL,

    -- File Information
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size BIGINT NOT NULL, -- bytes
    storage_path VARCHAR(500) NOT NULL, -- S3 key

    -- Processing
    extracted_text TEXT,
    document_type VARCHAR(100)
        CHECK (document_type IN ('Medical_Record', 'Police_Report',
                                  'Correspondence', 'Photo', 'Other')),
    processing_status VARCHAR(50) DEFAULT 'Pending'
        CHECK (processing_status IN ('Pending', 'Processing',
                                       'Completed', 'Failed')),

    -- Timestamps
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE
);
```

**Indexes:**
```sql
CREATE INDEX idx_source_document_letter ON source_document(letter_id);
CREATE INDEX idx_source_document_uploaded_by ON source_document(uploaded_by);
CREATE INDEX idx_source_document_status ON source_document(processing_status);
CREATE INDEX idx_source_document_type ON source_document(document_type);
```

**Notes:**
- Files stored in S3, only metadata in database
- `storage_path` is S3 key (e.g., `documents/{firm_id}/{letter_id}/{document_id}.pdf`)
- `extracted_text` populated after OCR/processing
- Processing handled asynchronously by Lambda

---

### 6. LetterVersion

Version history for demand letters.

```sql
CREATE TABLE letter_version (
    version_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    letter_id UUID NOT NULL REFERENCES demand_letter(letter_id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES "user"(user_id) ON DELETE SET NULL,
    change_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_letter_version UNIQUE (letter_id, version_number)
);
```

**Indexes:**
```sql
CREATE INDEX idx_letter_version_letter ON letter_version(letter_id);
CREATE INDEX idx_letter_version_created_at ON letter_version(created_at DESC);
```

**Notes:**
- Snapshot of letter content at each version
- Version number auto-incremented (application logic)
- Used for version history and rollback (P1 feature)
- Change summary provided by user or auto-generated

---

### 7. Collaboration

Real-time collaboration tracking (P1 feature).

```sql
CREATE TABLE collaboration (
    collaboration_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    letter_id UUID NOT NULL REFERENCES demand_letter(letter_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,

    change_type VARCHAR(50) NOT NULL
        CHECK (change_type IN ('Edit', 'Comment', 'Suggestion')),
    change_data JSONB NOT NULL,
    position JSONB,
    is_resolved BOOLEAN DEFAULT false,

    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Change Data Structure (JSONB):**
```json
{
  "type": "edit",
  "old_text": "The defendant was negligent",
  "new_text": "The defendant acted with gross negligence",
  "section_id": "liability"
}
```

**Indexes:**
```sql
CREATE INDEX idx_collaboration_letter ON collaboration(letter_id);
CREATE INDEX idx_collaboration_user ON collaboration(user_id);
CREATE INDEX idx_collaboration_timestamp ON collaboration(timestamp DESC);
CREATE INDEX idx_collaboration_type ON collaboration(change_type);
```

**Notes:**
- Stores all edits, comments, suggestions
- Position stores location in document (character offset, section)
- Used for change tracking and comment threads
- Real-time sync via WebSocket (P1)

---

### 8. AIRefinement

AI-powered refinement request and result tracking.

```sql
CREATE TABLE ai_refinement (
    refinement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    letter_id UUID NOT NULL REFERENCES demand_letter(letter_id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES "user"(user_id) ON DELETE SET NULL,

    -- Request
    instruction TEXT NOT NULL,
    ai_model VARCHAR(100) NOT NULL, -- e.g., "claude-3-5-sonnet-20241022"

    -- Input/Output
    input_content TEXT NOT NULL,
    output_content TEXT,

    -- Processing
    status VARCHAR(50) DEFAULT 'Pending'
        CHECK (status IN ('Pending', 'Processing', 'Completed', 'Failed')),
    processing_time_ms INTEGER,
    token_count INTEGER,
    error_message TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);
```

**Indexes:**
```sql
CREATE INDEX idx_ai_refinement_letter ON ai_refinement(letter_id);
CREATE INDEX idx_ai_refinement_requested_by ON ai_refinement(requested_by);
CREATE INDEX idx_ai_refinement_status ON ai_refinement(status);
CREATE INDEX idx_ai_refinement_created_at ON ai_refinement(created_at DESC);
```

**Notes:**
- Tracks all AI refinement requests
- Used for analytics and cost tracking
- `token_count` for billing reconciliation
- Error message stored for debugging

---

### 9. Export

Document export history.

```sql
CREATE TABLE export (
    export_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    letter_id UUID NOT NULL REFERENCES demand_letter(letter_id) ON DELETE CASCADE,
    exported_by UUID NOT NULL REFERENCES "user"(user_id) ON DELETE SET NULL,

    export_format VARCHAR(10) NOT NULL
        CHECK (export_format IN ('DOCX', 'PDF')),
    file_name VARCHAR(255) NOT NULL,
    storage_path VARCHAR(500) NOT NULL, -- S3 key
    file_size BIGINT,

    exported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes:**
```sql
CREATE INDEX idx_export_letter ON export(letter_id);
CREATE INDEX idx_export_user ON export(exported_by);
CREATE INDEX idx_export_date ON export(exported_at DESC);
```

**Notes:**
- Tracks all exports for audit
- Exported files stored in S3 for 30 days (lifecycle policy)
- Users can re-download from history within retention period

---

## Complete Schema DDL

### Helper Function for Updated At

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';
```

### Complete Schema Creation Script

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Helper function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. Firm
CREATE TABLE firm (
    firm_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_name VARCHAR(255) NOT NULL,
    firm_address TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    subscription_tier VARCHAR(50) DEFAULT 'Basic'
        CHECK (subscription_tier IN ('Basic', 'Professional', 'Enterprise')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_firm_updated_at
    BEFORE UPDATE ON firm
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. User
CREATE TABLE "user" (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID NOT NULL REFERENCES firm(firm_id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL
        CHECK (role IN ('Admin', 'Attorney', 'Paralegal')),
    password_hash VARCHAR(255) NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_email UNIQUE (email)
);

CREATE TRIGGER update_user_updated_at
    BEFORE UPDATE ON "user"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Template
CREATE TABLE template (
    template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID NOT NULL REFERENCES firm(firm_id) ON DELETE CASCADE,
    template_name VARCHAR(255) NOT NULL,
    template_description TEXT,
    template_content JSONB NOT NULL,
    category VARCHAR(100),
    created_by UUID REFERENCES "user"(user_id) ON DELETE SET NULL,
    version INTEGER DEFAULT 1,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_template_name_per_firm UNIQUE (firm_id, template_name)
);

CREATE TRIGGER update_template_updated_at
    BEFORE UPDATE ON template
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. DemandLetter
CREATE TABLE demand_letter (
    letter_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID NOT NULL REFERENCES firm(firm_id) ON DELETE CASCADE,
    template_id UUID REFERENCES template(template_id) ON DELETE SET NULL,
    created_by UUID REFERENCES "user"(user_id) ON DELETE SET NULL,
    case_reference VARCHAR(100),
    client_name VARCHAR(255) NOT NULL,
    defendant_name VARCHAR(255) NOT NULL,
    incident_date DATE,
    demand_amount NUMERIC(15, 2),
    status VARCHAR(50) DEFAULT 'Draft'
        CHECK (status IN ('Draft', 'In_Review', 'Finalized', 'Exported')),
    content TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    finalized_at TIMESTAMP WITH TIME ZONE
);

CREATE TRIGGER update_demand_letter_updated_at
    BEFORE UPDATE ON demand_letter
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. SourceDocument
CREATE TABLE source_document (
    document_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    letter_id UUID NOT NULL REFERENCES demand_letter(letter_id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES "user"(user_id) ON DELETE SET NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size BIGINT NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    extracted_text TEXT,
    document_type VARCHAR(100)
        CHECK (document_type IN ('Medical_Record', 'Police_Report',
                                  'Correspondence', 'Photo', 'Other')),
    processing_status VARCHAR(50) DEFAULT 'Pending'
        CHECK (processing_status IN ('Pending', 'Processing',
                                       'Completed', 'Failed')),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE
);

-- 6. LetterVersion
CREATE TABLE letter_version (
    version_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    letter_id UUID NOT NULL REFERENCES demand_letter(letter_id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_by UUID REFERENCES "user"(user_id) ON DELETE SET NULL,
    change_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_letter_version UNIQUE (letter_id, version_number)
);

-- 7. Collaboration
CREATE TABLE collaboration (
    collaboration_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    letter_id UUID NOT NULL REFERENCES demand_letter(letter_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
    change_type VARCHAR(50) NOT NULL
        CHECK (change_type IN ('Edit', 'Comment', 'Suggestion')),
    change_data JSONB NOT NULL,
    position JSONB,
    is_resolved BOOLEAN DEFAULT false,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. AIRefinement
CREATE TABLE ai_refinement (
    refinement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    letter_id UUID NOT NULL REFERENCES demand_letter(letter_id) ON DELETE CASCADE,
    requested_by UUID REFERENCES "user"(user_id) ON DELETE SET NULL,
    instruction TEXT NOT NULL,
    ai_model VARCHAR(100) NOT NULL,
    input_content TEXT NOT NULL,
    output_content TEXT,
    status VARCHAR(50) DEFAULT 'Pending'
        CHECK (status IN ('Pending', 'Processing', 'Completed', 'Failed')),
    processing_time_ms INTEGER,
    token_count INTEGER,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 9. Export
CREATE TABLE export (
    export_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    letter_id UUID NOT NULL REFERENCES demand_letter(letter_id) ON DELETE CASCADE,
    exported_by UUID REFERENCES "user"(user_id) ON DELETE SET NULL,
    export_format VARCHAR(10) NOT NULL
        CHECK (export_format IN ('DOCX', 'PDF')),
    file_name VARCHAR(255) NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    exported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create all indexes (see Indexing Strategy section below)
```

---

## Indexing Strategy

### Primary Indexes (Foreign Keys)

```sql
-- User
CREATE INDEX idx_user_firm ON "user"(firm_id);
CREATE INDEX idx_user_email ON "user"(email);
CREATE INDEX idx_user_active ON "user"(is_active);

-- Template
CREATE INDEX idx_template_firm ON template(firm_id);
CREATE INDEX idx_template_category ON template(category);
CREATE INDEX idx_template_default ON template(is_default) WHERE is_default = true;
CREATE INDEX idx_template_content ON template USING GIN (template_content);

-- DemandLetter
CREATE INDEX idx_letter_firm ON demand_letter(firm_id);
CREATE INDEX idx_letter_created_by ON demand_letter(created_by);
CREATE INDEX idx_letter_status ON demand_letter(status);
CREATE INDEX idx_letter_template ON demand_letter(template_id);
CREATE INDEX idx_letter_client ON demand_letter(client_name);
CREATE INDEX idx_letter_defendant ON demand_letter(defendant_name);

-- Composite indexes for common queries
CREATE INDEX idx_letter_firm_status ON demand_letter(firm_id, status);
CREATE INDEX idx_letter_firm_created_at ON demand_letter(firm_id, created_at DESC);

-- JSONB indexes
CREATE INDEX idx_letter_metadata ON demand_letter USING GIN (metadata);

-- SourceDocument
CREATE INDEX idx_source_document_letter ON source_document(letter_id);
CREATE INDEX idx_source_document_uploaded_by ON source_document(uploaded_by);
CREATE INDEX idx_source_document_status ON source_document(processing_status);
CREATE INDEX idx_source_document_type ON source_document(document_type);

-- LetterVersion
CREATE INDEX idx_letter_version_letter ON letter_version(letter_id);
CREATE INDEX idx_letter_version_created_at ON letter_version(created_at DESC);

-- Collaboration
CREATE INDEX idx_collaboration_letter ON collaboration(letter_id);
CREATE INDEX idx_collaboration_user ON collaboration(user_id);
CREATE INDEX idx_collaboration_timestamp ON collaboration(timestamp DESC);
CREATE INDEX idx_collaboration_type ON collaboration(change_type);

-- AIRefinement
CREATE INDEX idx_ai_refinement_letter ON ai_refinement(letter_id);
CREATE INDEX idx_ai_refinement_requested_by ON ai_refinement(requested_by);
CREATE INDEX idx_ai_refinement_status ON ai_refinement(status);
CREATE INDEX idx_ai_refinement_created_at ON ai_refinement(created_at DESC);

-- Export
CREATE INDEX idx_export_letter ON export(letter_id);
CREATE INDEX idx_export_user ON export(exported_by);
CREATE INDEX idx_export_date ON export(exported_at DESC);
```

### Index Rationale

- **Firm-based indexes:** Most queries filter by `firm_id` (multi-tenancy)
- **Status indexes:** Dashboard filtering by letter status
- **Composite indexes:** Optimize common query patterns (firm + status, firm + date)
- **GIN indexes:** JSONB queries on metadata and template content
- **Timestamp indexes:** Sorting by creation/modification date

---

## Data Security

### Row-Level Security (RLS)

Enable PostgreSQL Row-Level Security for multi-tenant isolation:

```sql
-- Enable RLS on all multi-tenant tables
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE template ENABLE ROW LEVEL SECURITY;
ALTER TABLE demand_letter ENABLE ROW LEVEL SECURITY;
-- ... (all tables with firm_id)

-- Policy: Users can only see their own firm's data
CREATE POLICY user_firm_isolation ON "user"
    USING (firm_id = current_setting('app.current_firm_id')::uuid);

CREATE POLICY template_firm_isolation ON template
    USING (firm_id = current_setting('app.current_firm_id')::uuid);

CREATE POLICY letter_firm_isolation ON demand_letter
    USING (firm_id = current_setting('app.current_firm_id')::uuid);

-- ... (similar policies for other tables)
```

**Application Layer:**
Before each query, set the firm context:
```sql
SET LOCAL app.current_firm_id = 'abc123-firm-uuid';
```

### Encryption at Rest

- **RDS Encryption:** Enable at RDS instance creation (AWS KMS)
- **Sensitive Fields:** Consider additional application-layer encryption for:
  - Password hashes (already hashed with bcrypt)
  - Extracted text (contains PII)

### Access Control

- **Database Credentials:** Stored in AWS Secrets Manager
- **Lambda IAM Roles:** Least privilege access to RDS
- **Connection Pooling:** RDS Proxy with IAM authentication
- **Read-Only User:** For reporting/analytics (P1)

---

## Query Patterns

### Common Queries with Optimizations

**1. Dashboard - Get all letters for a firm:**
```sql
SELECT
    letter_id, client_name, defendant_name,
    status, created_at, updated_at
FROM demand_letter
WHERE firm_id = $1
  AND status != 'Archived'
ORDER BY updated_at DESC
LIMIT 50 OFFSET $2;

-- Uses: idx_letter_firm_created_at
```

**2. Get letter with all source documents:**
```sql
SELECT
    dl.*,
    COALESCE(
        json_agg(
            json_build_object(
                'document_id', sd.document_id,
                'file_name', sd.file_name,
                'document_type', sd.document_type,
                'processing_status', sd.processing_status
            )
        ) FILTER (WHERE sd.document_id IS NOT NULL),
        '[]'::json
    ) AS source_documents
FROM demand_letter dl
LEFT JOIN source_document sd ON dl.letter_id = sd.letter_id
WHERE dl.letter_id = $1
  AND dl.firm_id = $2
GROUP BY dl.letter_id;

-- Uses: idx_source_document_letter
```

**3. Template search by category:**
```sql
SELECT template_id, template_name, template_description, is_default
FROM template
WHERE firm_id = $1
  AND category = $2
  AND is_active = true
ORDER BY template_name;

-- Uses: idx_template_firm, idx_template_category
```

**4. AI refinement history for a letter:**
```sql
SELECT
    refinement_id, instruction, status,
    processing_time_ms, token_count, created_at
FROM ai_refinement
WHERE letter_id = $1
ORDER BY created_at DESC
LIMIT 20;

-- Uses: idx_ai_refinement_letter, idx_ai_refinement_created_at
```

**5. User activity log (audit):**
```sql
SELECT
    u.first_name, u.last_name, u.email,
    dl.letter_id, dl.client_name, dl.status,
    dl.updated_at AS last_activity
FROM "user" u
INNER JOIN demand_letter dl ON u.user_id = dl.created_by
WHERE u.firm_id = $1
ORDER BY dl.updated_at DESC
LIMIT 100;

-- Uses: idx_letter_created_by, idx_letter_firm_created_at
```

### Query Optimization Guidelines

1. **Always filter by firm_id first** (leverages multi-tenant isolation)
2. **Use LIMIT/OFFSET for pagination** (avoid loading large result sets)
3. **Eager load related data** with JOINs or subqueries (avoid N+1 queries)
4. **Use EXPLAIN ANALYZE** to verify index usage
5. **Monitor slow query log** (RDS Performance Insights)

---

## Data Migration

### Schema Migrations

**Tool:** Flyway or Prisma Migrate

**Migration Strategy:**
1. All schema changes via versioned migration scripts
2. Migrations run automatically on deployment
3. Rollback script for each migration
4. Test migrations on staging before production

**Example Migration (Flyway):**
```sql
-- V001__initial_schema.sql
CREATE TABLE firm (...);
CREATE TABLE "user" (...);
-- ...

-- V002__add_ai_refinement_table.sql
CREATE TABLE ai_refinement (...);

-- V003__add_letter_metadata_index.sql
CREATE INDEX idx_letter_metadata ON demand_letter USING GIN (metadata);
```

### Data Seeding

**Seed Data for Development:**
- Sample firms
- Test users (hashed passwords)
- Sample templates (5+ standard templates)
- Demo letters

**Script:**
```sql
-- seeds/dev_seed.sql
INSERT INTO firm (firm_id, firm_name, contact_email)
VALUES ('11111111-1111-1111-1111-111111111111', 'Demo Law Firm', 'admin@demo.com');

INSERT INTO "user" (firm_id, email, first_name, last_name, role, password_hash)
VALUES
    ('11111111-1111-1111-1111-111111111111',
     'admin@demo.com', 'Admin', 'User', 'Admin',
     '$2b$12$hashedpassword...');
-- ...
```

---

## Backup & Recovery

### Automated Backups

**RDS Automated Backups:**
- **Frequency:** Daily
- **Retention:** 30 days
- **Backup Window:** 2:00-3:00 AM UTC (low traffic)
- **Point-in-Time Recovery:** Enabled (5-minute granularity)

### Manual Snapshots

- Before major releases
- Before schema migrations
- Quarterly (long-term retention)

### Backup Testing

- **Quarterly:** Restore backup to test environment
- **Verify:** Data integrity and completeness
- **Document:** Restore procedure and timing

### Disaster Recovery Procedure

**Scenario: Database Corruption**

1. **Identify Issue:** Monitor alerts / user reports
2. **Assess Impact:** Determine scope of corruption
3. **Initiate Recovery:**
   ```bash
   # Restore from point-in-time
   aws rds restore-db-instance-to-point-in-time \
     --source-db-instance-identifier steno-prod \
     --target-db-instance-identifier steno-prod-restored \
     --restore-time 2025-12-04T10:30:00Z
   ```
4. **Validate:** Verify restored data
5. **Switch Over:** Update RDS endpoint in application config
6. **Monitor:** Ensure application functioning
7. **Post-Mortem:** Document incident and improvements

**RTO:** < 2 hours
**RPO:** < 15 minutes (point-in-time recovery)

---

## Data Retention & Archival

### Retention Policies

| Entity | Active Retention | Archive Strategy |
|--------|------------------|------------------|
| Firm | Indefinite | Soft delete (is_active) |
| User | Indefinite | Soft delete (is_active) |
| DemandLetter | 7 years (configurable) | Move to archive table (P1) |
| SourceDocument | Match letter retention | S3 Glacier after 90 days |
| LetterVersion | 1 year | Delete old versions (keep major) |
| Collaboration | 90 days | Delete after resolution |
| AIRefinement | 90 days | Keep summary, delete details |
| Export | 30 days | S3 lifecycle deletion |

### Archival Process (P1)

```sql
-- Archive old letters
CREATE TABLE demand_letter_archive (LIKE demand_letter INCLUDING ALL);

-- Move letters older than 7 years
INSERT INTO demand_letter_archive
SELECT * FROM demand_letter
WHERE finalized_at < NOW() - INTERVAL '7 years';

DELETE FROM demand_letter
WHERE letter_id IN (SELECT letter_id FROM demand_letter_archive);
```

---

## Performance Monitoring

### Key Metrics

- **Query Performance:** Slow query log (> 1 second)
- **Connection Pool:** Active/idle connections
- **Database Size:** Storage usage trends
- **Index Usage:** Unused indexes (bloat)
- **Cache Hit Rate:** > 95% target

### Monitoring Tools

- **AWS RDS Performance Insights:** Query analysis
- **CloudWatch Metrics:** CPU, IOPS, connections
- **pgBadger:** PostgreSQL log analyzer
- **Prisma Studio:** Visual database browser

### Optimization Checklist

- [ ] Review slow query log weekly
- [ ] Analyze EXPLAIN plans for key queries
- [ ] Monitor index usage (pg_stat_user_indexes)
- [ ] Vacuum and analyze tables regularly
- [ ] Review connection pool settings
- [ ] Monitor table/index bloat

---

## Conclusion

The database architecture provides a robust, scalable foundation for the Demand Letter Generator with strong multi-tenant isolation, comprehensive audit trails, and flexible metadata storage. The PostgreSQL design leverages JSONB for flexibility while maintaining relational integrity for core entities.

Key strengths:
- **Multi-tenant security** via row-level security
- **Audit trail** for all operations
- **Flexible metadata** for evolving requirements
- **Optimized indexes** for common queries
- **Disaster recovery** with point-in-time recovery

**Next Steps:**
1. Implement schema in PostgreSQL RDS
2. Create seed data for development
3. Set up migration pipeline
4. Configure backups and monitoring
5. Load test with sample data

---

## Document Change History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-04 | Winston | Initial data model documentation |
