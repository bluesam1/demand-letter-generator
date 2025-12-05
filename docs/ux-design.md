# UX Design Document: Demand Letter Generator

**Project:** Steno - Demand Letter Generator
**Version:** 1.0
**Last Updated:** 2025-12-04
**UX Designer:** Sally (UX Expert)

---

## Table of Contents

1. [Overview](#overview)
2. [Design Principles](#design-principles)
3. [User Flows](#user-flows)
4. [Screen Inventory & Descriptions](#screen-inventory--descriptions)
5. [Navigation Structure](#navigation-structure)
6. [Interaction Patterns](#interaction-patterns)
7. [UI Component Hierarchy](#ui-component-hierarchy)
8. [Responsive Design Considerations](#responsive-design-considerations)
9. [Accessibility Requirements](#accessibility-requirements)
10. [Visual Design System](#visual-design-system)

---

## Overview

### Purpose
The Demand Letter Generator is an AI-driven solution designed to streamline the creation of demand letters for attorneys. This UX design document defines the user experience, interaction patterns, and interface requirements for the web application.

### Target Users
- **Primary:** Attorneys (Sarah - Senior Litigation Attorney persona)
- **Secondary:** Paralegals (Marcus persona)
- **Tertiary:** Firm Administrators

### Design Goals
- Minimize learning curve for legal professionals
- Create a seamless workflow from document upload to export
- Maintain professional aesthetic appropriate for legal industry
- Enable efficient collaboration without cognitive overload
- Ensure accessibility compliance for all users

---

## Design Principles

### 1. User-Centric Legal Workflow
Every design decision prioritizes the attorney's workflow. The interface adapts to legal professionals' mental models, not the other way around.

**Application:**
- Use legal terminology familiar to attorneys
- Mirror traditional document creation workflows
- Minimize context switching between tasks
- Preserve attorney control over AI-generated content

### 2. Progressive Disclosure
Complex features are revealed contextually, keeping the primary interface clean while maintaining power-user capabilities.

**Application:**
- Show essential controls by default
- Reveal advanced features on hover or expand
- Use tooltips for feature discovery
- Provide shortcuts for experienced users

### 3. Transparent AI Assistance
AI capabilities are clearly communicated. Users understand what the AI is doing and maintain full control.

**Application:**
- Show AI processing states clearly
- Provide before/after comparisons
- Enable easy acceptance or rejection of AI suggestions
- Display confidence indicators where appropriate

### 4. Professional Aesthetic
The interface conveys trustworthiness, competence, and attention to detail expected in legal software.

**Application:**
- Clean, uncluttered layouts
- Professional typography and color palette
- Consistent spacing and alignment
- Subtle, purposeful animations

### 5. Error Prevention over Error Recovery
Design prevents errors before they occur, reducing frustration and maintaining productivity.

**Application:**
- Clear file type and size requirements
- Confirmation dialogs for destructive actions
- Auto-save to prevent data loss
- Validation before submission

---

## User Flows

### Flow 1: Document Upload and Letter Generation

**User Goal:** Upload case documents and generate a first draft demand letter

**Steps:**

1. **Entry Point:** Dashboard - Click "Create New Letter" button
2. **Letter Setup Screen**
   - User enters basic case information (client name, defendant name, incident date)
   - User selects template (optional, with preview capability)
   - User proceeds to document upload
3. **Document Upload Screen**
   - User drags and drops files or clicks to browse
   - System displays upload progress for each file
   - User can preview uploaded documents
   - User can tag documents by type (medical records, police reports, etc.)
   - User can remove documents if needed
4. **Processing State**
   - System shows processing indicator with estimated time
   - User can navigate away (processing continues in background)
   - User receives notification when processing completes
5. **Generation Trigger**
   - User reviews uploaded and processed documents
   - User clicks "Generate Draft Letter" button
   - System shows generation progress with real-time status
6. **Draft Review**
   - Generated letter displays in rich text editor
   - Key extracted information is highlighted
   - User can immediately begin editing
   - Auto-save begins

**Decision Points:**
- Template selection (use template vs. default structure)
- Document tagging (manual categorization vs. AI suggestion)
- Generation timing (wait for all processing vs. start with available)

**Error States:**
- File type not supported → Clear message with supported formats
- File too large → Message with size limit and compression suggestion
- Processing failed → Retry option with support contact
- Generation failed → Retry with option to contact support

**Success Criteria:**
- User completes upload in < 2 minutes
- Processing completes within 30 seconds per file
- Generation produces usable draft in < 2 minutes
- User can begin editing immediately after generation

---

### Flow 2: Template Creation and Management

**User Goal:** Create firm-specific demand letter template for consistent output

**Steps:**

1. **Entry Point:** Settings → Templates → "Create New Template" button
2. **Template Builder Screen**
   - User enters template name and description
   - User selects category/case type
   - User proceeds to template editor
3. **Template Structure Definition**
   - User sees default sections (Introduction, Facts, Liability, Damages, Demand)
   - User can add custom sections via "+ Add Section" button
   - User can reorder sections via drag-and-drop
   - User can remove unnecessary sections
4. **Section Content Editing**
   - User clicks into each section to edit content
   - Rich text editor with formatting controls
   - User can insert placeholder variables ({{client_name}}, {{demand_amount}})
   - Variable picker shows all available placeholders
5. **Template Configuration**
   - User can set as firm default template
   - User can specify when template should be suggested (case type matching)
   - User previews template structure
6. **Save and Publish**
   - User clicks "Save Template"
   - Template becomes immediately available to all firm users
   - Success notification with option to create another

**Decision Points:**
- Use default sections vs. fully custom structure
- Set as firm default vs. optional template
- Define new variables vs. use standard placeholders

**Error States:**
- Missing required fields → Inline validation messages
- Duplicate template name → Warning with rename suggestion
- Invalid placeholder syntax → Highlight with correction hint

**Success Criteria:**
- Template creation completable in < 10 minutes
- Template immediately available across firm
- Clear preview of final output structure
- Easy to edit and iterate on templates

---

### Flow 3: Real-Time Collaboration and Editing

**User Goal:** Collaborate with paralegal to refine demand letter draft

**Steps:**

1. **Entry Point:** Dashboard - User opens existing draft letter
2. **Editor Interface Loads**
   - Letter content displays in rich text editor
   - Auto-save status indicator visible
   - Collaboration panel shows active users (if any)
3. **Paralegal Joins Session**
   - Paralegal opens same letter
   - Attorney receives notification: "Marcus joined"
   - Paralegal's avatar appears in collaboration panel
   - Paralegal's cursor position visible in document
4. **Simultaneous Editing**
   - Both users can edit different sections
   - Changes appear in real-time for both users
   - Cursor positions update live
   - Section-level locking prevents edit conflicts (optional)
5. **Commenting and Discussion**
   - User selects text and clicks "Add Comment" icon
   - Comment panel opens on right side
   - User types comment and optionally tags collaborator
   - Tagged user receives notification
   - Threaded replies enable discussion
6. **AI Refinement**
   - User selects section for refinement
   - User clicks "Refine with AI" button
   - User enters natural language instruction
   - AI processes and shows before/after comparison
   - User accepts or rejects changes
   - Changes sync to all collaborators immediately
7. **Session Completion**
   - Users can leave session at any time
   - All changes auto-saved
   - Change history preserved
   - Letter status can be updated (Draft → In Review → Finalized)

**Decision Points:**
- Accept or reject AI refinements
- Resolve or continue comment threads
- Manual save vs. rely on auto-save
- Finalize letter vs. continue editing

**Error States:**
- Connection lost → Auto-reconnect with saved state recovery
- Conflicting edits → Last write wins with change highlight
- AI refinement failed → Error message with retry option

**Success Criteria:**
- Real-time updates with < 500ms latency
- Clear indication of who is editing where
- No data loss during collaboration
- Seamless transition between solo and collaborative editing

---

### Flow 4: Export Workflow

**User Goal:** Export finalized demand letter to Word document for delivery

**Steps:**

1. **Entry Point:** Letter editor - User clicks "Export" button in toolbar
2. **Pre-Export Validation**
   - System checks letter completion status
   - If not finalized, prompts: "Finalize letter before export?"
   - User can proceed to finalize or export draft version
3. **Finalization (if needed)**
   - User clicks "Finalize Letter"
   - Confirmation dialog: "Once finalized, this letter cannot be edited. Continue?"
   - User confirms
   - Letter status changes to "Finalized"
   - Finalized timestamp recorded
4. **Export Options Dialog**
   - User selects export format (Word .docx default, PDF in P1)
   - User can toggle firm letterhead inclusion
   - User can add watermark (Draft, Confidential, etc.) - P1
   - User can modify filename (default: ClientName-DemandLetter-YYYY-MM-DD)
5. **Export Processing**
   - Progress indicator shows export generation
   - Processing typically < 10 seconds
   - File automatically downloads to user's device
6. **Post-Export Confirmation**
   - Success notification: "Export complete"
   - Option to download again
   - Export logged in audit trail
   - Optional: Email export directly (P1 feature)
7. **Export History Access**
   - User can access "Export History" from letter menu
   - View all previous exports with timestamps
   - Re-download any previous export (available 30 days)

**Decision Points:**
- Finalize before export vs. export draft
- Include letterhead vs. plain document
- Download vs. email directly (P1)
- Rename file vs. use default naming

**Error States:**
- Export generation failed → Retry with support contact option
- Letter not finalized warning → Clear explanation with finalize option
- Storage quota exceeded → Clear message with upgrade path (P1)

**Success Criteria:**
- Export completes in < 10 seconds
- File preserves all formatting accurately
- Clear confirmation of successful export
- Easy access to re-download exported files

---

## Screen Inventory & Descriptions

### 1. Dashboard (Home Screen)

**Purpose:** Central hub for accessing all demand letters and key actions

**Key Elements:**
- **Header Navigation Bar**
  - Steno logo (left)
  - Search bar (center) - P1
  - User profile menu (right)
  - Notifications icon (right)

- **Primary Action Button**
  - "Create New Letter" - Large, prominent CTA button
  - Located top-right of content area

- **Letters List/Grid View**
  - Switchable between list and grid views (P1)
  - Each letter card shows:
    - Client name (primary text)
    - Defendant name (secondary text)
    - Status badge (Draft, In Review, Finalized, Exported)
    - Last modified date
    - Quick actions (hover): Edit, Duplicate, Delete
  - Default sort: Last modified (newest first)
  - Pagination: 50 items per page

- **Filter and Sort Controls**
  - Filter by status (All, Draft, In Review, Finalized)
  - Sort options: Last modified, Created date, Client name
  - Search by client or defendant name

- **Empty State** (for new users)
  - Friendly illustration
  - "Create your first demand letter"
  - Brief description of capabilities
  - "Create New Letter" CTA button

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│ [Logo]        [Search...]           [@] [Bell] [👤]│
├─────────────────────────────────────────────────────┤
│                                    [+ Create New]   │
│ My Demand Letters                                   │
│                                                     │
│ [Filter: All ▼] [Sort: Last Modified ▼]           │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ Johnson vs. State Farm      [Draft]         │   │
│ │ Car accident - rear-end collision           │   │
│ │ Last modified: Dec 3, 2025                  │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ Martinez vs. City Corp      [In Review]     │   │
│ │ Slip and fall - premises liability          │   │
│ │ Last modified: Dec 2, 2025                  │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ [← Previous] Page 1 of 5 [Next →]                 │
└─────────────────────────────────────────────────────┘
```

**Interactions:**
- Click letter card → Opens letter editor
- Click "Create New Letter" → Opens letter setup wizard
- Hover letter card → Shows quick action buttons
- Click filter/sort → Updates list immediately

**Responsive Behavior:**
- Tablet: 2-column grid layout
- Mobile: Single column, simplified cards

---

### 2. Letter Setup Screen

**Purpose:** Capture essential case information before document upload

**Key Elements:**
- **Progress Indicator**
  - Step 1 of 3: Case Information
  - Step 2 of 3: Upload Documents
  - Step 3 of 3: Generate Letter

- **Case Information Form**
  - Client name (required) - Text input
  - Defendant name (required) - Text input
  - Incident date (optional) - Date picker
  - Case reference (optional) - Text input
  - Demand amount (optional) - Currency input
  - Case type dropdown (Personal Injury, Contract Dispute, etc.)

- **Template Selection**
  - "Use Template" toggle (default: off)
  - When toggled on, shows template picker
  - Template cards with preview button
  - Filter by case type
  - "No template (use default structure)" option always visible

- **Navigation Buttons**
  - "Cancel" - Returns to dashboard
  - "Next: Upload Documents" - Validates and proceeds

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│ [X] Create New Demand Letter                        │
│                                                     │
│ ●───────○───────○  (1) Case Info (2) Docs (3) Gen │
│                                                     │
│ Case Information                                    │
│                                                     │
│ Client Name *                                       │
│ [_________________________]                         │
│                                                     │
│ Defendant Name *                                    │
│ [_________________________]                         │
│                                                     │
│ Incident Date                                       │
│ [MM/DD/YYYY ▼]                                     │
│                                                     │
│ Demand Amount                                       │
│ [$ ____________]                                    │
│                                                     │
│ ☐ Use firm template                                │
│                                                     │
│                                    [Cancel] [Next →]│
└─────────────────────────────────────────────────────┘
```

**Interactions:**
- Form validation on blur and before next
- Template preview opens in modal
- Template selection highlights chosen option
- "Next" disabled until required fields complete

**Responsive Behavior:**
- Mobile: Single column, full-width inputs
- Tablet: Same as desktop

---

### 3. Document Upload Screen

**Purpose:** Enable users to upload and manage source documents

**Key Elements:**
- **Progress Indicator**
  - Step 2 of 3: Upload Documents (active)

- **Upload Zone**
  - Large drag-and-drop area
  - "Drag files here or click to browse"
  - Supported file types listed below
  - File size limit reminder (25MB per file, 100MB total)

- **Uploaded Documents List**
  - Each document row shows:
    - File icon (based on type)
    - Filename
    - File size
    - Processing status (Pending, Processing, Completed, Failed)
    - Document type dropdown (Medical Record, Police Report, etc.)
    - Preview button
    - Remove button
  - Progress bar during upload
  - Success/error icons after processing

- **Processing Summary**
  - "3 of 5 documents processed"
  - Estimated time for remaining files

- **Navigation Buttons**
  - "← Back" - Returns to case information
  - "Next: Generate Letter" - Enabled when at least 1 document processed
  - "Skip Upload" - Proceeds without documents (creates blank letter)

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│ [X] Create New Demand Letter                        │
│                                                     │
│ ○───────●───────○  (1) Case Info (2) Docs (3) Gen │
│                                                     │
│ Upload Source Documents                             │
│                                                     │
│ ┌───────────────────────────────────────────────┐ │
│ │                                               │ │
│ │   📁  Drag files here or click to browse     │ │
│ │                                               │ │
│ │   Supported: PDF, Word, Text, Images         │ │
│ │   Max 25MB per file, 100MB total             │ │
│ └───────────────────────────────────────────────┘ │
│                                                     │
│ Uploaded Documents (3)                              │
│                                                     │
│ ┌───────────────────────────────────────────────┐ │
│ │ 📄 medical-records.pdf        [✓] Completed   │ │
│ │    2.3 MB   [Medical Record ▼]  [Preview][X] │ │
│ └───────────────────────────────────────────────┘ │
│                                                     │
│ ┌───────────────────────────────────────────────┐ │
│ │ 📄 police-report.pdf   [⟳] Processing...     │ │
│ │    1.8 MB   [Police Report ▼]    [Preview][X]│ │
│ └───────────────────────────────────────────────┘ │
│                                                     │
│                           [← Back] [Generate Draft]│
└─────────────────────────────────────────────────────┘
```

**Interactions:**
- Drag and drop files → Triggers upload
- Click upload zone → Opens file browser
- Click Preview → Opens document preview modal
- Click X → Removes document with confirmation
- Document type selection → Tags document for AI context

**Error States:**
- File too large → Red border, error message below
- Unsupported type → Error message with supported formats
- Processing failed → Retry button appears

**Responsive Behavior:**
- Mobile: Simplified upload zone, vertical document list
- Tablet: Same as desktop with adjusted spacing

---

### 4. Letter Editor Screen (Primary Workspace)

**Purpose:** Central workspace for editing, refining, and collaborating on demand letters

**Key Elements:**

**Top Toolbar**
- Letter title (editable inline)
- Status badge (Draft/In Review/Finalized)
- Auto-save indicator ("Saved 30 seconds ago")
- Primary actions:
  - "Export" button
  - "Finalize" button
  - "Share" button (P1)
  - More actions menu (⋮): Duplicate, Delete, Version History

**Left Sidebar - Document Structure**
- Collapsible section navigator
- Letter sections listed:
  - Introduction
  - Statement of Facts
  - Liability Analysis
  - Damages
  - Demand
  - (Custom sections if applicable)
- Click section → Scrolls to section in editor
- Drag to reorder sections (P1)

**Central Editor Area**
- Rich text editor with formatting toolbar:
  - Text formatting: Bold, Italic, Underline
  - Lists: Bullets, Numbering
  - Alignment: Left, Center, Right, Justify
  - Undo/Redo
- Section headers clearly delineated
- AI-highlighted content has subtle background color
- Current cursor position indicator
- Collaborative cursors (colored, labeled with user names) - P1

**Right Sidebar - Contextual Panels**
- Tabbed interface:
  - "Source Docs" tab: List of uploaded documents with quick preview
  - "AI Refine" tab: Refinement controls
  - "Comments" tab: Comment threads (P1)
  - "Collaborators" tab: Active users and change history (P1)

**AI Refinement Panel (Right Sidebar)**
- Text area: "Enter refinement instructions..."
- Example suggestions:
  - "Make this section more detailed"
  - "Adjust tone to be more assertive"
  - "Expand on damages calculation"
- Apply to: "Selected text" vs. "Entire document"
- "Refine" button
- Refinement history (P1)

**Floating Action Toolbar (appears on text selection)**
- Comment icon (P1)
- Refine with AI icon
- Formatting options

**Bottom Status Bar**
- Word count
- Character count
- Last edited by [User] at [Time]

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│ Johnson vs. State Farm [Draft ▼]     Saved 30s ago  [Export][⋮]│
├─────────────────────────────────────────────────────────────────┤
│ [≡] [B][I][U] [•][1.] [⟲][⟳]                                  │
├──────┬──────────────────────────────────────────────┬──────────┤
│      │                                              │          │
│ Sec- │  December 4, 2025                            │ AI Refine│
│tions │                                              │          │
│      │  State Farm Insurance                        │ Enter    │
│ ▼Intro│  123 Main Street                            │refinement│
│  Facts│  Anytown, CA 90210                          │instruct- │
│  Liab.│                                              │ions:     │
│  Dam. │  RE: Demand for Settlement - Sarah Johnson │          │
│  Dem. │      Claim No: SF-2025-12345                │[        ]│
│      │                                              │[        ]│
│      │  Dear Claims Adjuster:                       │[        ]│
│      │                                              │ Examples:│
│      │  Introduction                                │ • Make   │
│      │  This office represents Sarah Johnson in... │   more   │
│      │                                              │   detail │
│      │  Statement of Facts                          │          │
│      │  On November 15, 2024, our client was...    │[Refine →]│
│      │                                              │          │
│      │                                              │          │
├──────┴──────────────────────────────────────────────┴──────────┤
│ 547 words | Last edited by you at 2:45 PM                      │
└─────────────────────────────────────────────────────────────────┘
```

**Interactions:**
- Type directly in editor → Auto-saves every 30 seconds
- Select text + click "Refine with AI" → Opens refinement panel
- Click section in left nav → Scrolls to section
- Click source doc → Opens preview
- Hover over AI-highlighted text → Shows original vs. generated tooltip (P1)

**Responsive Behavior:**
- Tablet: Sidebars collapse to overlay panels
- Mobile: Single-column editor, toolbars stack, sidebars accessible via bottom tabs

---

### 5. Template Management Screen (Admin)

**Purpose:** Enable firm administrators to create and manage letter templates

**Key Elements:**

**Header**
- "Demand Letter Templates"
- "Create New Template" button (primary CTA)

**Templates Library**
- Grid or list view of existing templates
- Each template card shows:
  - Template name
  - Category/case type
  - "Default" badge (if firm default)
  - Number of letters using this template
  - Last modified date
  - Quick actions: Edit, Duplicate, Delete

**Template Editor (when creating/editing)**
- Template name input
- Category dropdown
- Description text area
- Section builder:
  - List of current sections
  - Add Section button
  - Drag to reorder sections
  - Edit section content (rich text)
  - Insert variable placeholders via picker
- Preview panel (live preview of template)
- "Set as firm default" toggle
- Save/Cancel buttons

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│ Firm Settings → Templates          [+ Create New]  │
│                                                     │
│ ┌─────────────────┐  ┌─────────────────┐          │
│ │ Personal Injury │  │ Contract Dispute│          │
│ │ [DEFAULT]       │  │                 │          │
│ │                 │  │                 │          │
│ │ 23 letters      │  │ 8 letters       │          │
│ │ Updated Dec 1   │  │ Updated Nov 28  │          │
│ │                 │  │                 │          │
│ │ [Edit][Copy][X] │  │ [Edit][Copy][X] │          │
│ └─────────────────┘  └─────────────────┘          │
│                                                     │
│ ┌─────────────────┐                                │
│ │ Premises Liab.  │                                │
│ │                 │                                │
│ │                 │                                │
│ │ 5 letters       │                                │
│ │ Updated Nov 15  │                                │
│ │                 │                                │
│ │ [Edit][Copy][X] │                                │
│ └─────────────────┘                                │
└─────────────────────────────────────────────────────┘
```

**Interactions:**
- Click "Create New" → Opens template editor
- Click "Edit" → Opens template in editor
- Click "Duplicate" → Creates copy for editing
- Drag sections → Reorders in template
- Insert variable → Opens variable picker dropdown

**Responsive Behavior:**
- Mobile: Single column template cards
- Tablet: 2-column grid

---

### 6. Firm Settings Screen (Admin)

**Purpose:** Configure firm-level settings and preferences

**Key Elements:**

**Navigation Tabs**
- Profile
- Templates (covered above)
- Users & Permissions
- Branding
- Subscription

**Profile Tab**
- Firm name
- Contact information
- Address
- Phone/Email
- Timezone
- Date format preferences

**Users & Permissions Tab**
- User list with role indicators
- "Invite User" button
- User row actions: Edit role, Deactivate
- Pending invitations section

**Branding Tab**
- Firm logo upload (preview)
- Letterhead template upload
- Default signature block editor
- Preview of branded document

**Subscription Tab**
- Current plan details
- Usage statistics:
  - Letters generated this month
  - Storage used
  - Active users
- Billing history link
- Upgrade/downgrade options (P1)

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│ Firm Settings                                       │
│                                                     │
│ [Profile][Templates][Users][Branding][Subscription]│
├─────────────────────────────────────────────────────┤
│                                                     │
│ Profile Information                                 │
│                                                     │
│ Firm Name                                           │
│ [Johnson & Associates LLP___________]               │
│                                                     │
│ Contact Email                                       │
│ [admin@johnsonlaw.com_______________]               │
│                                                     │
│ Phone                                               │
│ [(555) 123-4567____________________]               │
│                                                     │
│ Address                                             │
│ [_____________________________________]             │
│ [_____________________________________]             │
│                                                     │
│ Timezone                                            │
│ [Pacific Time (PT) ▼]                              │
│                                                     │
│                                [Cancel] [Save]      │
└─────────────────────────────────────────────────────┘
```

**Interactions:**
- Tab navigation
- Form validation
- File upload with preview
- Invite user → Opens email input modal

**Responsive Behavior:**
- Mobile: Tabs convert to dropdown selector
- Forms stack vertically on narrow screens

---

### 7. Export Dialog/Modal

**Purpose:** Configure and execute letter export

**Key Elements:**
- Modal overlay (centered on screen)
- Export format selection (Word default, PDF P1)
- Filename input (pre-filled with smart default)
- Include letterhead checkbox
- Watermark options (P1): None, Draft, Confidential
- Preview thumbnail (P1)
- "Cancel" and "Export" buttons
- Progress indicator during export
- Success state with download link

**Layout:**
```
┌─────────────────────────────────────┐
│ Export Demand Letter           [X]  │
│                                     │
│ Format                              │
│ ● Word (.docx)  ○ PDF              │
│                                     │
│ Filename                            │
│ [Johnson-DemandLetter-2025-12-04]  │
│                                     │
│ ☑ Include firm letterhead          │
│                                     │
│ ☐ Add watermark: [Draft ▼]        │
│                                     │
│               [Cancel] [Export]     │
└─────────────────────────────────────┘
```

**Interactions:**
- Radio buttons for format selection
- Filename editable inline
- Checkboxes toggle options
- Export button triggers generation
- Progress indicator replaces form during export
- Success state shows download button

---

## Navigation Structure

### Information Architecture

```
Dashboard (Home)
│
├── Create New Letter
│   ├── Case Information (Setup)
│   ├── Upload Documents
│   └── Letter Editor
│
├── Letter Editor (from existing letter)
│   ├── Export Dialog
│   ├── Version History (P1)
│   └── Share/Collaboration Settings (P1)
│
├── Settings
│   ├── Firm Profile
│   ├── Templates
│   │   ├── Create Template
│   │   └── Edit Template
│   ├── Users & Permissions
│   │   └── Invite User
│   ├── Branding
│   └── Subscription
│
├── Help & Support (P1)
│   ├── Documentation
│   ├── Video Tutorials
│   └── Contact Support
│
└── User Profile
    ├── Personal Information
    ├── Change Password
    └── Notification Preferences
```

### Primary Navigation (Top Bar)

**Always Visible:**
- Steno logo (home link)
- Search (P1)
- Notifications icon (with badge for unread)
- User profile menu

**User Profile Menu Dropdown:**
- My Profile
- Firm Settings (Admin only)
- Help & Support
- Logout

### Contextual Navigation

**Letter Editor:**
- Breadcrumb: Dashboard > Johnson vs. State Farm
- Back button (returns to dashboard)
- Section navigation (left sidebar)

**Settings:**
- Tab navigation across settings sections
- Back to Dashboard link

### Mobile Navigation

- Hamburger menu (top left)
- Drawer-style navigation panel
- Bottom tab bar for key sections:
  - Home
  - Create
  - Search (P1)
  - Profile

---

## Interaction Patterns

### 1. Auto-Save Pattern

**Behavior:**
- Automatic save every 30 seconds while editing
- Save triggered on major actions (template change, section reorder)
- Visual indicator shows save status:
  - "Saving..." (spinner)
  - "Saved 30 seconds ago" (checkmark)
  - "Save failed - Retry" (error icon)

**User Benefits:**
- Prevents data loss
- Reduces anxiety about losing work
- No need to remember to save manually

**Implementation Notes:**
- Debounce rapid changes
- Show retry option on failure
- Store save state in localStorage as backup

---

### 2. AI Refinement Workflow

**Step 1: Selection**
- User selects text in editor OR chooses "entire document"
- Floating toolbar appears with "Refine with AI" option

**Step 2: Instruction**
- User clicks "Refine with AI"
- Right panel focuses on refinement input
- User types natural language instruction
- Example suggestions available for common refinements

**Step 3: Processing**
- User clicks "Refine" button
- Loading indicator appears
- Estimated time displayed (typically < 30 seconds)

**Step 4: Review**
- Side-by-side or inline comparison appears:
  - Original text (left/top)
  - Refined text (right/bottom)
- Differences highlighted
- Accept/Reject buttons prominent

**Step 5: Completion**
- User clicks "Accept" → Refined text replaces original
- User clicks "Reject" → Original text preserved
- All refinements logged in history (P1)

**Interaction Details:**
- Keyboard shortcut: Cmd/Ctrl + R for refine
- Can queue multiple refinements (P1)
- Undo refinement available via standard undo (Cmd/Ctrl + Z)

---

### 3. Drag-and-Drop Upload

**Drag Over:**
- Upload zone highlights with blue border
- Cursor changes to copy cursor
- Text updates: "Drop files to upload"

**Drop:**
- Files added to upload queue
- Upload progress bars appear
- Percentage complete shows for each file

**Invalid Drop:**
- Red border flash
- Error message: "Some files are not supported" with details
- Supported files still added to queue

**Completion:**
- Green checkmark appears
- Processing status updates
- User can immediately preview or tag documents

---

### 4. Real-Time Collaboration Indicators (P1)

**Presence Awareness:**
- Avatars of active users in top-right
- "Marcus is editing..." status message
- Cursor positions shown with colored highlights
- User labels follow cursors

**Change Synchronization:**
- Changes appear within 500ms
- Smooth animation for remote changes
- No jarring jumps or lost cursor position

**Conflict Resolution:**
- Section-level locking (optional)
- Last write wins for same-word edits
- Visual indicator when conflict occurs
- Change history preserves all versions

---

### 5. Template Selection and Preview

**Template Picker:**
- Grid of template cards
- Hover shows quick preview thumbnail
- Click "Preview" opens full-screen modal

**Preview Modal:**
- Shows template structure
- Section names and order visible
- Sample content displayed
- "Use This Template" button in modal
- "Close" returns to picker

**Selection:**
- Selected template highlighted
- Template name appears in setup summary
- Can change template before generation

---

### 6. Notification System

**Types of Notifications:**
- Processing complete (documents, letter generation)
- Collaboration (user joined, commented)
- Export ready
- System alerts (errors, maintenance)

**Display:**
- Toast notification (top-right, auto-dismiss after 5 seconds)
- Persistent notification center (bell icon)
- Badge count on bell icon

**Actions:**
- Click notification → Navigate to relevant item
- Dismiss notification
- Mark all as read

---

### 7. Progressive Disclosure in Forms

**Example: Letter Setup**
- Show only essential fields initially
- "Show Advanced Options" expands additional fields:
  - Case reference number
  - Additional parties
  - Custom metadata
- Advanced options remember user's preference

**Benefits:**
- Reduces cognitive load
- Speeds up common workflows
- Maintains access to power features

---

### 8. Inline Validation

**Real-Time Feedback:**
- Validation on blur (field loses focus)
- Immediate feedback for format errors (email, currency)
- Character count for limited fields
- Required field indicators (*)

**Error States:**
- Red border on invalid field
- Error icon with message below field
- Clear instruction for correction

**Success States:**
- Green checkmark on valid field (optional)
- No intrusive success messaging
- Proceed button enables when form valid

---

## UI Component Hierarchy

### Component Library Structure

**Atomic Components (Building Blocks)**

1. **Buttons**
   - Primary button (solid fill, high emphasis)
   - Secondary button (outline, medium emphasis)
   - Tertiary button (text only, low emphasis)
   - Icon button (icon only, various sizes)
   - Floating action button (circular, bottom-right)

2. **Form Controls**
   - Text input
   - Text area
   - Dropdown/Select
   - Checkbox
   - Radio button
   - Date picker
   - Currency input
   - File upload
   - Toggle switch

3. **Typography**
   - Page heading (H1)
   - Section heading (H2)
   - Subsection heading (H3)
   - Body text (regular, medium, small)
   - Caption text
   - Link text
   - Label text
   - Code/monospace text

4. **Icons**
   - Navigation icons
   - Action icons
   - Status icons
   - File type icons
   - Social/brand icons

5. **Feedback Elements**
   - Loading spinner
   - Progress bar
   - Progress indicator (stepped)
   - Skeleton loader
   - Success checkmark
   - Error icon
   - Warning icon

**Molecular Components (Combinations)**

1. **Cards**
   - Letter card (dashboard)
   - Template card
   - Document card
   - User card
   - Stat card (metrics)

2. **Form Groups**
   - Labeled input
   - Input with validation
   - Input with helper text
   - Multi-field group

3. **Navigation Elements**
   - Tab bar
   - Breadcrumb
   - Pagination
   - Side navigation
   - Dropdown menu

4. **Notifications**
   - Toast notification
   - Banner notification
   - Inline alert
   - Empty state message

5. **Modals**
   - Dialog modal
   - Full-screen modal
   - Drawer/side panel
   - Confirmation dialog

**Organism Components (Complex Structures)**

1. **Headers**
   - Global header/nav bar
   - Page header with actions
   - Editor toolbar

2. **Lists**
   - Letter list
   - Document list
   - User list
   - Comment thread

3. **Editor Components**
   - Rich text editor
   - Section navigator
   - Refinement panel
   - Collaboration panel

4. **Wizards**
   - Letter creation wizard
   - Template builder
   - User onboarding flow

**Template Components (Full Pages)**

1. **Dashboard layout**
2. **Editor layout**
3. **Settings layout**
4. **Wizard layout**

### Component Specifications

#### Primary Button
```
Size: Medium (default)
- Height: 40px
- Padding: 12px 24px
- Font: 14px medium
- Border radius: 6px

States:
- Default: Brand primary color, white text
- Hover: 10% darker, subtle lift shadow
- Active: 15% darker, inner shadow
- Disabled: 40% opacity, no pointer events
- Loading: Spinner replaces text, disabled state

Variants:
- Small: 32px height, 8px 16px padding
- Large: 48px height, 16px 32px padding
```

#### Text Input
```
Size: Default
- Height: 40px
- Padding: 8px 12px
- Font: 14px regular
- Border: 1px solid gray-300
- Border radius: 4px

States:
- Default: Gray border
- Focus: Blue border, focus ring
- Error: Red border, error icon
- Disabled: Gray background, no interaction
- Read-only: Light gray background

With label:
- Label above input, 8px margin
- Label font: 12px medium, gray-700
- Required indicator (*) in red
```

#### Letter Card
```
Structure:
- Container: White background, 1px border, 8px radius
- Padding: 16px
- Shadow: Subtle on hover
- Min height: 120px

Content:
- Client name: 16px medium, gray-900
- Defendant name: 14px regular, gray-700
- Status badge: Pill shape, color-coded
- Date: 12px regular, gray-500
- Quick actions: Hidden until hover

Interaction:
- Hover: Lift shadow, quick actions appear
- Click: Navigate to editor
- Right-click: Context menu (P1)
```

---

## Responsive Design Considerations

### Breakpoints

```
Mobile: 0-767px (< 768px)
Tablet: 768px-1023px
Desktop: 1024px+ (default)
Large Desktop: 1440px+ (optimized)
```

### Mobile Adaptations (< 768px)

**Dashboard:**
- Single-column letter list
- Simplified letter cards
- Bottom navigation bar
- Hamburger menu for settings

**Letter Editor:**
- Single-column layout
- Sidebars become bottom sheets/modals
- Simplified toolbar (essential actions only)
- Full-screen editor on focus
- Floating "Refine" button

**Forms:**
- Full-width inputs
- Stacked labels
- Larger touch targets (48px min)
- Native date/time pickers

**Templates:**
- Single-column template cards
- Simplified template editor
- Section reordering via up/down buttons (not drag)

**Navigation:**
- Drawer navigation
- Bottom tab bar for primary sections
- Reduced header height
- Collapsible sections

### Tablet Adaptations (768px-1023px)

**Dashboard:**
- 2-column letter grid
- Persistent side navigation
- Responsive header

**Letter Editor:**
- Collapsible sidebars (overlay mode)
- Tab bar for right panel switching
- Preserved toolbar functionality

**Forms:**
- 2-column layouts where appropriate
- Maintained desktop interactions

### Desktop Optimizations (1024px+)

**Standard Desktop (1024-1439px):**
- Default layouts as designed
- 3-column grids where applicable
- Full-featured toolbars and sidebars

**Large Desktop (1440px+):**
- Wider editor max-width (900px)
- More visible templates/documents in lists
- Enhanced previews
- Multi-panel views (P1)

### Touch Considerations (Mobile/Tablet)

**Target Sizes:**
- Minimum touch target: 48x48px
- Spacing between targets: 8px minimum
- Buttons sized for thumb reach

**Gestures:**
- Swipe to delete (lists)
- Pull to refresh (dashboard)
- Pinch to zoom (document preview)
- Long press for context menu

**Mobile Keyboard:**
- Inputs trigger appropriate keyboard (email, number, text)
- Autocomplete attributes for autofill
- Keyboard dismissal on submit

### Performance Considerations

**Mobile:**
- Lazy load letter list (infinite scroll)
- Compress images and assets
- Minimize initial bundle size
- Cache aggressively

**Tablet/Desktop:**
- Preload hover states
- Optimistic UI updates
- Prefetch likely next actions

---

## Accessibility Requirements

### WCAG 2.1 Level AA Compliance

**Perceivable**

1. **Text Alternatives**
   - All images have alt text
   - Icon buttons have aria-labels
   - File type icons have descriptive labels
   - Status indicators have text equivalents

2. **Time-Based Media**
   - Video tutorials have captions (P1)
   - Transcripts provided for audio content (P1)

3. **Adaptable Content**
   - Semantic HTML structure (headings, landmarks)
   - Content reflows at 400% zoom
   - No information conveyed by shape/size/location alone
   - Proper heading hierarchy (H1 → H2 → H3)

4. **Distinguishable**
   - Color contrast ratio minimum 4.5:1 (text)
   - Color contrast ratio minimum 3:1 (UI components)
   - No information conveyed by color alone
   - Text resize up to 200% without loss of function
   - No auto-playing audio

**Operable**

1. **Keyboard Accessible**
   - All functionality available via keyboard
   - No keyboard traps
   - Logical tab order throughout
   - Keyboard shortcuts documented
   - Skip navigation link provided

2. **Enough Time**
   - Auto-save prevents timeout data loss
   - Session timeout warnings with extend option
   - Ability to pause/disable auto-advancing content

3. **Seizures**
   - No flashing content > 3 times per second
   - Animations can be disabled (prefers-reduced-motion)

4. **Navigable**
   - Descriptive page titles
   - Focus indicator always visible (3px blue outline)
   - Logical focus order
   - Link purpose clear from text or context
   - Multiple navigation methods (menu, search, breadcrumb)
   - Clear section headings

**Understandable**

1. **Readable**
   - Page language declared (lang="en")
   - Section language changes marked
   - Legal jargon minimized; tooltips for complex terms
   - Plain language error messages

2. **Predictable**
   - Consistent navigation across pages
   - Consistent component behavior
   - No unexpected context changes
   - Components with same function have same labels

3. **Input Assistance**
   - Clear error identification
   - Labels or instructions for all inputs
   - Error suggestions provided
   - Error prevention for critical actions (confirmation dialogs)
   - Context-sensitive help available

**Robust**

1. **Compatible**
   - Valid HTML markup
   - ARIA landmarks used appropriately
   - Status messages use aria-live regions
   - Name, role, value for all UI components
   - Tested with screen readers (NVDA, JAWS, VoiceOver)

### Keyboard Navigation

**Global Shortcuts:**
- Tab: Next focusable element
- Shift+Tab: Previous focusable element
- Enter: Activate button/link
- Space: Activate button, toggle checkbox
- Escape: Close modal/dialog, cancel action
- Arrow keys: Navigate lists, radio groups

**Editor Shortcuts:**
- Ctrl/Cmd + B: Bold
- Ctrl/Cmd + I: Italic
- Ctrl/Cmd + U: Underline
- Ctrl/Cmd + S: Manual save
- Ctrl/Cmd + Z: Undo
- Ctrl/Cmd + Shift + Z: Redo
- Ctrl/Cmd + R: Refine with AI
- Ctrl/Cmd + E: Export

**Dashboard Shortcuts:**
- N: New letter
- S: Search (focus search input)
- /: Focus search (alternate)

**Navigation:**
- Alt/Option + 1: Dashboard
- Alt/Option + 2: Templates (admin)
- Alt/Option + 3: Settings (admin)

### Screen Reader Support

**ARIA Labels:**
- Navigation landmarks: navigation, main, complementary, search
- Form labels associated with inputs
- Button purposes clearly labeled
- Status messages announced

**Live Regions:**
- Auto-save status: aria-live="polite"
- Error messages: aria-live="assertive"
- Processing status: aria-live="polite"
- Collaboration updates: aria-live="polite"

**Focus Management:**
- Modal opens → Focus trapped in modal
- Modal closes → Focus returns to trigger
- Page loads → Focus on main heading
- AJAX content loads → Focus notified/moved appropriately

### Visual Accessibility

**Color Blindness:**
- Status indicated by icon + color + text
- Links underlined, not just colored
- Graphs/charts use patterns + colors
- Error states use icon + border + message

**Low Vision:**
- High contrast mode supported
- Zoom to 200% without horizontal scroll
- Focus indicators clearly visible
- Minimum 16px body text
- Sufficient spacing between interactive elements

**Motion Sensitivity:**
- Respect prefers-reduced-motion
- Disable auto-play animations
- Provide static alternative to animated content
- Transitions can be disabled in settings (P1)

### Accessibility Testing Checklist

**Automated Testing:**
- [ ] Axe DevTools scan passes
- [ ] Lighthouse accessibility score > 95
- [ ] HTML validation passes
- [ ] ARIA validation passes

**Manual Testing:**
- [ ] Keyboard-only navigation functional
- [ ] Screen reader testing (NVDA, JAWS, VoiceOver)
- [ ] Color contrast verification
- [ ] Zoom to 200% testing
- [ ] Focus indicator visibility
- [ ] Form validation clarity

**User Testing:**
- [ ] Testing with users who use assistive tech
- [ ] Testing with users with disabilities
- [ ] Feedback incorporated into design

---

## Visual Design System

### Color Palette

**Primary Colors:**
```
Primary Blue (Brand):
- 50:  #E3F2FD
- 100: #BBDEFB
- 500: #2196F3 (Primary action color)
- 700: #1976D2 (Hover state)
- 900: #0D47A1 (Active state)

Use: Primary buttons, links, focus states, active states
```

**Secondary Colors:**
```
Slate Gray (Professional):
- 50:  #F8FAFC
- 100: #F1F5F9
- 300: #CBD5E1 (Borders)
- 500: #64748B (Secondary text)
- 700: #334155 (Body text)
- 900: #0F172A (Headings)

Use: Text, borders, backgrounds, neutral UI elements
```

**Semantic Colors:**
```
Success Green:
- Light: #D1FAE5
- Main:  #10B981
- Dark:  #059669
Use: Success messages, completed states, positive indicators

Warning Amber:
- Light: #FEF3C7
- Main:  #F59E0B
- Dark:  #D97706
Use: Warnings, caution states, important notices

Error Red:
- Light: #FEE2E2
- Main:  #EF4444
- Dark:  #DC2626
Use: Errors, destructive actions, critical alerts

Info Blue:
- Light: #DBEAFE
- Main:  #3B82F6
- Dark:  #2563EB
Use: Informational messages, tips, neutral notifications
```

**Status Colors:**
```
Draft:      #94A3B8 (Slate 400)
In Review:  #F59E0B (Amber 500)
Finalized:  #10B981 (Green 500)
Exported:   #3B82F6 (Blue 500)
```

**Background Colors:**
```
Page background:      #F9FAFB (Gray 50)
Card background:      #FFFFFF
Input background:     #FFFFFF
Disabled background:  #F3F4F6 (Gray 100)
Hover background:     #F9FAFB (Gray 50)
Active background:    #F3F4F6 (Gray 100)
```

### Typography

**Font Stack:**
```
Primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
Monospace: 'SF Mono', Consolas, 'Liberation Mono', Menlo, Courier, monospace
```

**Type Scale:**
```
H1 - Page Title:
  Size: 32px (2rem)
  Weight: 700 (Bold)
  Line height: 40px (1.25)
  Color: Gray 900
  Margin bottom: 24px

H2 - Section Heading:
  Size: 24px (1.5rem)
  Weight: 600 (Semibold)
  Line height: 32px (1.33)
  Color: Gray 900
  Margin bottom: 16px

H3 - Subsection Heading:
  Size: 18px (1.125rem)
  Weight: 600 (Semibold)
  Line height: 28px (1.56)
  Color: Gray 800
  Margin bottom: 12px

Body - Regular:
  Size: 16px (1rem)
  Weight: 400 (Regular)
  Line height: 24px (1.5)
  Color: Gray 700

Body - Medium:
  Size: 16px (1rem)
  Weight: 500 (Medium)
  Line height: 24px (1.5)
  Color: Gray 800

Body - Small:
  Size: 14px (0.875rem)
  Weight: 400 (Regular)
  Line height: 20px (1.43)
  Color: Gray 600

Caption:
  Size: 12px (0.75rem)
  Weight: 400 (Regular)
  Line height: 16px (1.33)
  Color: Gray 500

Label:
  Size: 14px (0.875rem)
  Weight: 500 (Medium)
  Line height: 20px (1.43)
  Color: Gray 700

Link:
  Size: Inherits
  Weight: 500 (Medium)
  Color: Primary Blue 500
  Text decoration: Underline
  Hover: Primary Blue 700
```

### Spacing System

**Base Unit: 4px**

```
Spacing Scale:
- xs:  4px   (0.25rem)
- sm:  8px   (0.5rem)
- md:  16px  (1rem)
- lg:  24px  (1.5rem)
- xl:  32px  (2rem)
- 2xl: 48px  (3rem)
- 3xl: 64px  (4rem)

Common Applications:
- Element padding: 12px (sm + xs) or 16px (md)
- Card padding: 16px-24px (md-lg)
- Section spacing: 24px-32px (lg-xl)
- Page margins: 32px-48px (xl-2xl)
- Form field spacing: 16px (md)
- Button padding: 8px 16px (sm md)
```

### Elevation (Shadows)

```
Shadow Scale:

None:
  box-shadow: none

SM (Subtle lift):
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
  Use: Buttons on hover, cards at rest

MD (Card):
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
              0 2px 4px -1px rgba(0, 0, 0, 0.06)
  Use: Cards on hover, dropdowns, tooltips

LG (Modal):
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
              0 4px 6px -2px rgba(0, 0, 0, 0.05)
  Use: Modals, popovers, elevated panels

XL (High elevation):
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
              0 10px 10px -5px rgba(0, 0, 0, 0.04)
  Use: Full-screen overlays, important modals
```

### Border Radius

```
Radius Scale:
- None: 0px
- SM:   4px  (subtle rounding)
- MD:   6px  (default for most components)
- LG:   8px  (cards, panels)
- XL:   12px (large cards)
- Full: 9999px (pills, circular buttons)

Applications:
- Buttons: 6px (md)
- Inputs: 4px (sm)
- Cards: 8px (lg)
- Modals: 8px (lg)
- Badges/Pills: 9999px (full)
- Images: 8px (lg)
```

### Iconography

**Icon Library:** Heroicons (recommended for React)

**Icon Sizes:**
```
- Small:  16x16px (inline with text)
- Medium: 20x20px (buttons, navigation)
- Large:  24x24px (prominent actions)
- XL:     32x32px (empty states, illustrations)
```

**Icon Usage:**
```
Navigation icons:     Medium (20px)
Button icons:         Medium (20px)
Input icons:          Small (16px)
Status indicators:    Small (16px)
File type icons:      Large (24px)
Empty state icons:    XL (32px+)
```

**Icon Colors:**
- Default: Gray 500
- Active: Primary Blue 500
- Disabled: Gray 300
- Error: Error Red 500
- Success: Success Green 500

### Animation & Transitions

**Duration:**
```
- Fast:     150ms (hover effects, simple transitions)
- Normal:   250ms (default for most transitions)
- Slow:     350ms (complex state changes, panel slides)
```

**Easing:**
```
- ease-out:     cubic-bezier(0, 0, 0.2, 1) - Default
- ease-in:      cubic-bezier(0.4, 0, 1, 1) - Exits, dismissals
- ease-in-out:  cubic-bezier(0.4, 0, 0.2, 1) - Modal opens/closes
```

**Animation Principles:**
- Subtle and purposeful (not distracting)
- Provide feedback (button clicks, state changes)
- Guide attention (new content, errors)
- Respect prefers-reduced-motion

**Common Animations:**
```
Button hover:
  transition: background-color 150ms ease-out, transform 150ms ease-out
  transform: translateY(-1px)

Card hover:
  transition: box-shadow 250ms ease-out
  box-shadow: [MD shadow] → [LG shadow]

Modal open:
  transition: opacity 250ms ease-out, transform 250ms ease-out
  opacity: 0 → 1
  transform: scale(0.95) → scale(1)

Toast notification:
  transition: transform 350ms ease-out, opacity 350ms ease-out
  transform: translateX(100%) → translateX(0)

Loading spinner:
  animation: spin 1s linear infinite
```

### Component States

**Interactive Elements (Buttons, Links, Inputs):**

```
Default:
  - Base styles applied
  - Cursor: pointer (for interactive)

Hover:
  - Slight color darkening (10%)
  - Shadow lift (for buttons/cards)
  - Cursor: pointer

Focus:
  - 3px outline in Primary Blue 500
  - Outline offset: 2px
  - Preserves other states (hover can combine with focus)

Active:
  - Color darkening (15%)
  - Inset shadow or slight scale down
  - Brief transition

Disabled:
  - Opacity: 0.4
  - Cursor: not-allowed
  - No hover/active states

Loading:
  - Disabled state + spinner
  - Cursor: wait or progress
```

**Form Validation States:**

```
Valid:
  - Subtle green border (optional, non-intrusive)
  - Checkmark icon (optional)

Invalid:
  - Red border (2px)
  - Error icon (red)
  - Error message below (red text)

Warning:
  - Amber border (1px)
  - Warning icon
  - Warning message below
```

### Layout Grid

**Desktop (1024px+):**
```
Container max-width: 1280px
Columns: 12
Gutter: 24px
Side margins: 32px
```

**Tablet (768-1023px):**
```
Container max-width: 100%
Columns: 8
Gutter: 16px
Side margins: 24px
```

**Mobile (< 768px):**
```
Container max-width: 100%
Columns: 4
Gutter: 12px
Side margins: 16px
```

### Design Tokens (Reference)

**For developers implementing the design system:**

```javascript
// colors.js
export const colors = {
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    500: '#2196F3',
    700: '#1976D2',
    900: '#0D47A1',
  },
  gray: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    300: '#CBD5E1',
    500: '#64748B',
    700: '#334155',
    900: '#0F172A',
  },
  success: {
    light: '#D1FAE5',
    main: '#10B981',
    dark: '#059669',
  },
  // ... etc
};

// spacing.js
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
};

// typography.js
export const typography = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  h1: {
    fontSize: '32px',
    fontWeight: 700,
    lineHeight: '40px',
  },
  // ... etc
};
```

---

## Appendix

### Design Deliverables Checklist

**Completed:**
- [x] Design principles defined
- [x] User flows documented for 4 critical journeys
- [x] Screen inventory with descriptions
- [x] Navigation structure mapped
- [x] Interaction patterns specified
- [x] Component hierarchy defined
- [x] Responsive breakpoints and adaptations
- [x] Accessibility requirements (WCAG 2.1 AA)
- [x] Visual design system (colors, typography, spacing)

**Next Steps (for design implementation):**
- [ ] High-fidelity mockups for key screens
- [ ] Interactive prototype for user testing
- [ ] Component library implementation (React)
- [ ] Design system documentation site
- [ ] Accessibility audit with assistive technology
- [ ] User testing sessions with target attorneys
- [ ] Responsive design testing across devices

### References

**Design Standards:**
- WCAG 2.1 Level AA Guidelines
- Material Design 3 (inspiration for interaction patterns)
- Apple Human Interface Guidelines (interaction best practices)

**Legal Industry UX:**
- Clio interface patterns (practice management software)
- MyCase collaboration features
- LexisNexis research interface (professional aesthetic)

**AI Interface Patterns:**
- GitHub Copilot (code assistance UX)
- Notion AI (content refinement)
- Grammarly (inline suggestions)

### Glossary

**Demand Letter:** A formal legal document sent to a defendant or insurance company demanding payment or action before litigation.

**Template:** A pre-defined structure for demand letters with placeholder variables and standard sections.

**AI Refinement:** The process of using AI to improve or modify specific sections of generated content based on attorney instructions.

**Collaboration:** Real-time editing capability where multiple users can work on the same document simultaneously.

**Finalization:** The action of marking a letter as complete and read-only, ready for export and delivery.

**Source Documents:** Uploaded files (medical records, police reports, etc.) used as input for AI letter generation.

---

**End of UX Design Document**

**Document Status:** Complete - Ready for design implementation and development handoff

**Last Updated:** 2025-12-04
