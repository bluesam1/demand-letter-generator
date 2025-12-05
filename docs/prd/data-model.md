# Data Model

## Overview

The Demand Letter Generator requires a robust data model to support document management, template storage, user collaboration, and AI-generated content. The system uses PostgreSQL for data persistence with a focus on security, performance, and scalability.

---

## Core Entities

### 1. Firm

Represents a law firm using the Demand Letter Generator.

**Attributes:**
- `firm_id` (UUID, Primary Key)
- `firm_name` (String, Required)
- `firm_address` (Text)
- `contact_email` (String)
- `contact_phone` (String)
- `subscription_tier` (Enum: Basic, Professional, Enterprise)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)
- `is_active` (Boolean)

**Relationships:**
- Has many Users
- Has many Templates
- Has many DemandLetters

---

### 2. User

Represents attorneys, paralegals, and other users within a firm.

**Attributes:**
- `user_id` (UUID, Primary Key)
- `firm_id` (UUID, Foreign Key -> Firm)
- `email` (String, Unique, Required)
- `first_name` (String, Required)
- `last_name` (String, Required)
- `role` (Enum: Attorney, Paralegal, Admin)
- `password_hash` (String, Required)
- `last_login` (Timestamp)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)
- `is_active` (Boolean)

**Relationships:**
- Belongs to Firm
- Has many DemandLetters (as creator)
- Has many Collaborations

---

### 3. Template

Represents firm-specific demand letter templates.

**Attributes:**
- `template_id` (UUID, Primary Key)
- `firm_id` (UUID, Foreign Key -> Firm)
- `template_name` (String, Required)
- `template_description` (Text)
- `template_content` (Text, Required) - Structured JSON with placeholders
- `category` (String) - e.g., "Personal Injury", "Contract Dispute"
- `created_by` (UUID, Foreign Key -> User)
- `version` (Integer)
- `is_default` (Boolean)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)
- `is_active` (Boolean)

**Relationships:**
- Belongs to Firm
- Created by User
- Has many DemandLetters

**Template Content Structure (JSON):**
```json
{
  "sections": [
    {
      "id": "introduction",
      "title": "Introduction",
      "content": "{{firm_name}} represents {{client_name}}...",
      "order": 1
    },
    {
      "id": "facts",
      "title": "Statement of Facts",
      "content": "{{facts_summary}}",
      "order": 2
    },
    {
      "id": "liability",
      "title": "Liability",
      "content": "{{liability_analysis}}",
      "order": 3
    },
    {
      "id": "damages",
      "title": "Damages",
      "content": "{{damages_breakdown}}",
      "order": 4
    },
    {
      "id": "demand",
      "title": "Demand",
      "content": "We demand payment of {{demand_amount}}...",
      "order": 5
    }
  ],
  "variables": [
    "firm_name", "client_name", "defendant_name",
    "incident_date", "demand_amount"
  ]
}
```

---

### 4. DemandLetter

Represents a demand letter document in various stages of completion.

**Attributes:**
- `letter_id` (UUID, Primary Key)
- `firm_id` (UUID, Foreign Key -> Firm)
- `template_id` (UUID, Foreign Key -> Template, Nullable)
- `created_by` (UUID, Foreign Key -> User)
- `case_reference` (String) - Firm's internal case number
- `client_name` (String, Required)
- `defendant_name` (String, Required)
- `incident_date` (Date)
- `demand_amount` (Decimal)
- `status` (Enum: Draft, In_Review, Finalized, Exported)
- `content` (Text) - Current version of the letter content
- `created_at` (Timestamp)
- `updated_at` (Timestamp)
- `finalized_at` (Timestamp, Nullable)
- `metadata` (JSONB) - Additional case-specific data

**Relationships:**
- Belongs to Firm
- Created by User
- Uses Template (optional)
- Has many SourceDocuments
- Has many LetterVersions
- Has many Collaborations
- Has many AIRefinements

**Metadata Structure (JSONB):**
```json
{
  "case_type": "Personal Injury",
  "jurisdiction": "California",
  "insurance_info": {
    "carrier": "State Farm",
    "policy_number": "12345",
    "adjuster": "John Doe"
  },
  "custom_fields": {}
}
```

---

### 5. SourceDocument

Represents uploaded documents used to generate demand letters.

**Attributes:**
- `document_id` (UUID, Primary Key)
- `letter_id` (UUID, Foreign Key -> DemandLetter)
- `uploaded_by` (UUID, Foreign Key -> User)
- `file_name` (String, Required)
- `file_type` (String) - e.g., "PDF", "DOCX", "TXT"
- `file_size` (Integer) - in bytes
- `storage_path` (String) - S3 or file system path
- `extracted_text` (Text) - OCR/extracted content
- `document_type` (Enum: Medical_Record, Police_Report, Correspondence, Other)
- `uploaded_at` (Timestamp)
- `processed_at` (Timestamp, Nullable)
- `processing_status` (Enum: Pending, Processing, Completed, Failed)

**Relationships:**
- Belongs to DemandLetter
- Uploaded by User

---

### 6. LetterVersion

Tracks version history for demand letters.

**Attributes:**
- `version_id` (UUID, Primary Key)
- `letter_id` (UUID, Foreign Key -> DemandLetter)
- `version_number` (Integer)
- `content` (Text) - Snapshot of letter content
- `created_by` (UUID, Foreign Key -> User)
- `change_summary` (Text) - Description of changes
- `created_at` (Timestamp)

**Relationships:**
- Belongs to DemandLetter
- Created by User

---

### 7. Collaboration

Represents real-time collaboration sessions and change tracking.

**Attributes:**
- `collaboration_id` (UUID, Primary Key)
- `letter_id` (UUID, Foreign Key -> DemandLetter)
- `user_id` (UUID, Foreign Key -> User)
- `change_type` (Enum: Edit, Comment, Suggestion)
- `change_data` (JSONB) - Details of the change
- `position` (JSONB) - Location in document (character offset, section)
- `timestamp` (Timestamp)
- `is_resolved` (Boolean) - For comments/suggestions

**Relationships:**
- Belongs to DemandLetter
- Made by User

**Change Data Structure (JSONB):**
```json
{
  "type": "edit",
  "old_text": "The defendant was negligent",
  "new_text": "The defendant acted with gross negligence",
  "section_id": "liability"
}
```

---

### 8. AIRefinement

Tracks AI-powered refinements requested by users.

**Attributes:**
- `refinement_id` (UUID, Primary Key)
- `letter_id` (UUID, Foreign Key -> DemandLetter)
- `requested_by` (UUID, Foreign Key -> User)
- `instruction` (Text) - User's refinement request
- `ai_model` (String) - e.g., "claude-3-opus"
- `input_content` (Text) - Content before refinement
- `output_content` (Text) - AI-generated refinement
- `status` (Enum: Pending, Processing, Completed, Failed)
- `processing_time_ms` (Integer)
- `token_count` (Integer)
- `created_at` (Timestamp)
- `completed_at` (Timestamp, Nullable)
- `error_message` (Text, Nullable)

**Relationships:**
- Belongs to DemandLetter
- Requested by User

---

### 9. Export

Tracks document exports to Word format.

**Attributes:**
- `export_id` (UUID, Primary Key)
- `letter_id` (UUID, Foreign Key -> DemandLetter)
- `exported_by` (UUID, Foreign Key -> User)
- `export_format` (Enum: DOCX, PDF)
- `file_name` (String)
- `storage_path` (String)
- `file_size` (Integer)
- `exported_at` (Timestamp)

**Relationships:**
- Belongs to DemandLetter
- Exported by User

---

## Entity Relationship Diagram

```
Firm (1) ----< (M) User
 |                   |
 |                   |
 +--< Template       +--< DemandLetter
         |                    |
         |                    +--< SourceDocument
         |                    |
         +--------------------+--< LetterVersion
                              |
                              +--< Collaboration
                              |
                              +--< AIRefinement
                              |
                              +--< Export
```

---

## Data Security & Privacy

### Encryption

1. **At Rest:**
   - All sensitive data encrypted in PostgreSQL using AES-256
   - Source documents encrypted in S3 storage
   - Password hashes using bcrypt with salt

2. **In Transit:**
   - All API communications over HTTPS/TLS 1.3
   - Database connections encrypted
   - File uploads/downloads encrypted

### Access Control

1. **Row-Level Security:**
   - Users can only access data from their own firm
   - Admins have full access within their firm
   - Cross-firm data access prevented at database level

2. **Data Isolation:**
   - Firm data logically separated
   - No shared data between firms
   - Audit logging for all data access

### Compliance

- GDPR compliance for data handling
- Attorney-client privilege protection
- Data retention policies configurable per firm
- Right to deletion/data export

---

## Performance Considerations

### Indexing Strategy

```sql
-- Primary indexes
CREATE INDEX idx_user_firm ON User(firm_id);
CREATE INDEX idx_template_firm ON Template(firm_id);
CREATE INDEX idx_letter_firm ON DemandLetter(firm_id);
CREATE INDEX idx_letter_status ON DemandLetter(status);
CREATE INDEX idx_letter_created_by ON DemandLetter(created_by);

-- Composite indexes
CREATE INDEX idx_letter_firm_status ON DemandLetter(firm_id, status);
CREATE INDEX idx_letter_firm_created ON DemandLetter(firm_id, created_at DESC);

-- JSON indexes
CREATE INDEX idx_letter_metadata ON DemandLetter USING GIN(metadata);
```

### Query Optimization

- Eager loading for common relationships
- Connection pooling (max 100 connections)
- Query result caching for templates
- Pagination for large result sets (50 items per page)

### Scalability

- Horizontal scaling via read replicas
- Partitioning by firm_id for large tables
- Archive strategy for old/finalized letters
- Blob storage (S3) for documents, not database

---

## Data Migration & Versioning

### Schema Versioning

- Database migrations managed via Flyway or similar
- Version tracking in schema_version table
- Rollback scripts for each migration

### Data Retention

- Active letters: Retained indefinitely
- Finalized letters: Configurable retention (default 7 years)
- Source documents: Match letter retention
- Audit logs: 2 years minimum
- AI refinement logs: 90 days

### Backup & Recovery

- Daily automated backups
- Point-in-time recovery capability
- 30-day backup retention
- Cross-region backup replication
- Tested restore procedures (quarterly)
