Excellent. Do **not start coding Leads, Pipeline, Meetings, Proposals, Follow-ups, etc. immediately**.

Build the CRM in layers.

Think of CRM as:

```txt
Layer 1 → Foundation Data
Layer 2 → Lead Operations
Layer 3 → Sales Conversion
Layer 4 → Client Handover
Layer 5 → Reporting & Analytics
```

---

# PHASE 1 - CRM FOUNDATION

Build the data structure first.

No fancy UI.

No Kanban.

No automations.

---

## 1. Lead Entity

Create the core Lead model.

```txt
Lead
```

Fields:

```txt
id
brandId

companyName
contactPerson

email
phone

website
industry

source

status

ownerId

createdAt
updatedAt
```

---

## 2. Lead Sources

Master data.

```txt
LinkedIn
Instagram
Website
Referral
Cold Call
WhatsApp
Email
Event
Other
```

Create settings table.

---

## 3. Lead Status

Use your finalized sales process.

```txt
Lead Intake
Business Review
Lead Qualification
Lead Classification
Lead Nurturing
Qualification Audit

Meeting
Proposal
Documentation
Engagement Manager Assigned

Won
Lost
On Hold
```

Store as master data.

Not hardcoded.

---

## 4. Lead Owner

Who handles the lead.

```txt
Assigned To

User
Role
```

---

## Deliverables

After Phase 1:

```txt
Can create lead
Can edit lead
Can assign lead
Can change stage
```

Nothing more.

---

# PHASE 2 - LEAD OPERATIONS

Now build the first operational layer.

---

## Lead List Page

Like:

```txt
CRM
 └─ Leads
```

View:

```txt
Table
```

Columns:

```txt
Company
Contact
Source
Owner
Stage
Created
```

---

## Filters

```txt
Stage
Owner
Source
Date
```

---

## Search

```txt
Company Name
Contact Name
```

---

## Lead Details Page

When clicking lead:

```txt
Lead Profile
```

---

# Lead Profile Layout

## Left

```txt
Company
Contact
Source
Stage
Owner
```

---

## Right

```txt
Activity Timeline
```

---

# PHASE 3 - BUSINESS REVIEW

This is your "Lead Enrichment + Sales Audit".

---

Create:

```txt
Business Review
```

inside Lead Profile.

Fields:

```txt
Business Model
Target Market
Current Problems
Opportunities
Notes
```

---

Pain Points

```txt
No Website
No Ecommerce
Poor Branding
Poor Lead Generation
Low Conversion
```

Multi-select.

---

Opportunity Score

```txt
Low
Medium
High
```

---

Now your sales team has context before pitching.

---

# PHASE 4 - LEAD QUALIFICATION

Create qualification score.

---

Example:

```txt
Budget
Need
Authority
Timeline
```

---

Score:

```txt
0-100
```

or

```txt
Cold
Warm
Hot
```

---

This decides whether lead moves forward.

---

# PHASE 5 - LEAD CLASSIFICATION

Classify lead.

---

Examples:

```txt
Service Interested

Consulting
Marketing
Web Development
Branding
Video Production
Training
```

---

Priority:

```txt
High
Medium
Low
```

---

Expected Deal Value

```txt
₹
```

---

# PHASE 6 - LEAD NURTURING

Communication tracking.

---

Track:

```txt
Call
WhatsApp
Email
Meeting
Note
```

---

Timeline:

```txt
10:00 AM
Called Client

2:00 PM
Sent Proposal

5:00 PM
Follow-up Scheduled
```

---

# PHASE 7 - MEETING MODULE

Now build:

```txt
Meetings
```

---

Fields:

```txt
Date
Time
Attendees
Mode
```

Mode:

```txt
Google Meet
Zoom
Phone
In-Person
```

---

Meeting Notes:

```txt
Summary
Decision
Next Action
```

---

# PHASE 8 - PROPOSAL MODULE

Proposal tracking only.

Not document generation yet.

---

Fields:

```txt
Proposal Number

Status

Sent Date

Value
```

Status:

```txt
Draft
Sent
Viewed
Negotiation
Approved
Rejected
```

---

# PHASE 9 - DOCUMENTATION

Track:

```txt
Quotation
Agreement
Invoice
Onboarding Form
```

---

Only status tracking.

Actual DMS comes later.

---

# PHASE 10 - ENGAGEMENT MANAGER HANDOVER

When sale closes:

```txt
Assign Engagement Manager
```

---

Fields:

```txt
Assigned To
Assigned Date
Notes
```

---

Then:

```txt
Lead
     ↓
Client
```

Conversion happens.

---

# PHASE 11 - CRM DASHBOARD

Only now build analytics.

---

Widgets:

```txt
Lead Funnel

Source Performance

Conversion Rate

Revenue Pipeline

Meeting Performance

Owner Performance
```

---

# CRM SIDEBAR STRUCTURE

I would build:

```txt
CRM

Dashboard

Leads
Meetings

Proposals

Pipeline

Reports
```

Do **not** build Clients inside CRM. Clients should remain a separate module because once a lead becomes a client, it moves into the Client Database system you already designed.

### Recommended Build Order

```txt
Week 1
1. Lead Model
2. Lead List
3. Lead Details

Week 2
4. Business Review
5. Qualification
6. Classification

Week 3
7. Activities
8. Meetings

Week 4
9. Proposals
10. Documentation Tracking

Week 5
11. Handover
12. CRM Dashboard
```

This sequence prevents rework and ensures every later feature sits on top of a solid CRM foundation.
