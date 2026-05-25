# MergeX Sales OS — Architectural & Codebase Documentation

Welcome to the comprehensive technical documentation for **MergeX Sales OS**, an enterprise-grade, all-in-one sales operations platform designed to orchestrate the entire customer acquisition and onboarding lifecycle. 

This document serves as an exhaustive blueprint of the system's architecture, database design, core engine flows, directory structure, and technology stack.

---

## 🗺️ System Overview & Architecture

MergeX Sales OS is built on a modern **Serverless-First Hybrid Architecture**. It utilizes Next.js (App Router) for modular rendering and API routing, backed by Neon Serverless Postgres for relational storage with auto-scaling connection pools. Authentication and Identity management are decoupled via Clerk, which is synchronized seamlessly into our database using asynchronous webhooks.

```mermaid
graph TD
    subgraph Client Tier [Client Tier - React 19 / Next.js Client]
        UI[Tailwind CSS & Shadcn UI]
        CC[Command Center Search]
        KB[Kanban Board / Drag & Drop]
    end

    subgraph Auth & Gateways [Auth & Gateway Tier]
        Clerk[Clerk Auth & Directory]
        MW[Next.js Middleware]
        RBAC[RBAC Permission Guard]
    end

    subgraph Compute Tier [Compute Tier - Next.js Server Components & Route Handlers]
        API[API Endpoints /api/*]
        Pulse[Pulse Engine Background Scheduler]
        Workflows[Workflow Automation Engine]
    end

    subgraph Storage & Integration [Storage & Integration Tier]
        Prisma[Prisma Client v7]
        Neon[Neon Serverless Postgres]
        Resend[Resend Transactional Email]
    end

    UI --> Clerk
    Clerk --> MW
    MW --> RBAC
    RBAC --> Compute Tier
    CC --> |Parallel Queries| API
    KB --> |Stage Updates| API
    Pulse --> |Cron /api/pulse/process| Neon
    Pulse --> |Emails| Resend
    API --> Prisma
    Prisma --> Neon
```

---

## 📂 Directory & Codebase Tree

The project follows a standard Next.js directory structure, segregating API routes, page views, UI components, shared library code, type definitions, and database schemas.

```text
Sales OS (Root)
├── prisma/
│   ├── migrations/             # Database migration history
│   └── schema.prisma           # Prisma 7 Database schema definition
├── public/                     # Static assets (logos, icons, illustrations)
├── src/                        # Main application source directory
│   ├── app/                    # Next.js App Router root
│   │   ├── (auth)/             # Authentication route group (Login/Register layouts)
│   │   ├── api/                # Backend API endpoints
│   │   │   ├── auth/           # Auth synchronization and webhook endpoints
│   │   │   ├── export/         # Excel (xlsx) & PDF (jsPDF) report builders
│   │   │   ├── leads/          # CRUD operations for leads & pipeline transitions
│   │   │   ├── pulse/          # Core Pulse notification API routes
│   │   │   │   ├── activity/   # Unified activity logging endpoints
│   │   │   │   ├── emit/       # Custom notification trigger endpoint
│   │   │   │   ├── notifications/ # Unread counts and read markers
│   │   │   │   ├── preferences/ # User in-app/email toggles & quiet hours
│   │   │   │   └── process/    # Background cron engine scheduler
│   │   │   └── search/         # Command Center multi-entity search endpoint
│   │   ├── dashboard/          # Core application layout & dashboards
│   │   │   ├── analytics/      # Performance dashboards & metric reports
│   │   │   ├── client-launch/  # Client onboarding & delivery hubs
│   │   │   ├── crm/            # Sales directories (leads, contacts, companies, deals)
│   │   │   │   ├── companies/
│   │   │   │   ├── contacts/
│   │   │   │   ├── deals/
│   │   │   │   └── leads/
│   │   │   ├── insights/       # Pipeline Intelligence metrics & win/loss records
│   │   │   ├── knowledge/      # Knowledge Base repository (SOPs, playbooks)
│   │   │   ├── meetings/       # Discovery meeting tracker & MOM generator
│   │   │   ├── operations/     # Operations checklist & tasks interface
│   │   │   ├── pipeline/       # Visual 11-Stage Kanban board
│   │   │   ├── proposals/      # Commercial proposal packages
│   │   │   ├── pulse/          # In-app notifications inbox
│   │   │   ├── settings/       # Organization & workspace preferences
│   │   │   └── team/           # Team structure & invite panel
│   │   ├── sso-callback/       # OAuth / SSO Callback handlers
│   │   ├── unauthorized/       # Access denied view (RBAC protection)
│   │   ├── globals.css         # Global styling and custom scrollbars
│   │   ├── layout.tsx          # Root HTML layout (theme providers, fonts)
│   │   └── page.tsx            # Main landing page (redirects to dashboard)
│   ├── components/             # Reusable UI component modules
│   │   ├── command/            # Global Command Center UI and search provider
│   │   │   ├── command-center.tsx
│   │   │   ├── command-provider.tsx
│   │   │   └── use-command-search.ts
│   │   ├── layout/             # Navigation bars, sidebar, and workspace frames
│   │   │   ├── mobile-sidebar.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── top-nav.tsx
│   │   ├── modals/             # Global dialog controllers (deal lost reasons, tasks)
│   │   ├── notifications/      # Real-time bell dropdowns & alerts
│   │   │   ├── notification-badge.tsx
│   │   │   ├── notification-dropdown.tsx
│   │   │   └── notification-item.tsx
│   │   ├── ui/                 # Atomic shadcn/ui custom styled primitives
│   │   ├── theme-provider.tsx  # Next-Themes provider (light, dark, system modes)
│   │   └── theme-toggle.tsx    # Sun/Moon client side button
│   ├── lib/                    # Shared configuration and utilities
│   │   ├── auth/               # Server-side security and permissions check logic
│   │   │   ├── index.ts        # Clerk synchronization, session lookups & audit logs
│   │   │   └── permissions.ts  # RBAC default roles configuration
│   │   ├── db.ts               # Prisma Client initialization & Neon pool adapters
│   │   ├── pulse.ts            # Pulse Engine notification & email emitter utility
│   │   ├── resend.ts           # Sleek dark-themed HTML transaction email builders
│   │   └── utils.ts            # High-performance class names joiner
│   ├── types/                  # Global TypeScript typings
│   │   └── index.ts            # Domain types, cards data, API custom formats
│   └── proxy.ts                # WebSocket & TCP connection proxy configurations
├── next.config.ts              # Next.js optimization and security headers config
├── prisma.config.ts            # Direct migration bypass & connection config
└── package.json                # Core dependencies and developer scripts
```

---

## 🗄️ Database Schema & Models Overview

The database uses PostgreSQL via Neon's serverless platform. The schema defined in `prisma/schema.prisma` is highly structured and supports granular relations, cascade deletions, and index optimization. Below is a comprehensive blueprint of the data models grouped by module.

### 🔑 Module 1: Authentication & Organization (RBAC System)

The authentication system supports single-tenant multi-user architecture with a highly strict Role-Based Access Control (RBAC) design. We also support standard login and credential audits.

```text
+------------------+         +------------------+         +----------------------+
|       User       |=======> |       Role       |=======> |    RolePermission    |
+------------------+         +------------------+         +----------------------+
         ||                           ||                             ||
         ||                           ||                             \/
         ||                           ||                  +----------------------+
         ||                           ||                  |      Permission      |
         ||                           ||                  +----------------------+
         \/                           \/
+-------------------------------------------------------+
|                     Organization                      |
+-------------------------------------------------------+
```

#### 1. `Organization`
*   **Purpose**: Represents the enterprise tenant account. Every single record in CRM, meetings, tasks, and proposals belongs to an Organization.
*   **Key Fields**:
    *   `id`: Primary key (CUID)
    *   `name`: Organization name
    *   `slug`: Unique slug for URL routing (e.g. `acme-corp`)
    *   `plan`: `PlanType` enum (`FREE`, `PRO`, `ENTERPRISE`)

#### 2. `User`
*   **Purpose**: Represents a teammate/employee in the organization.
*   **Key Relations**:
    *   Belongs to an `Organization`
    *   Assigned a single `Role` (e.g. `admin`, `sales_manager`)
    *   Has custom notification preferences via `NotificationPreference`
*   **Key Fields**:
    *   `clerkId`: Clerk-specific unique ID (Indexed)
    *   `employeeId`: Optional employee ID for password-based corporate backup login (Indexed)
    *   `isActive`: Boolean flag to revoke system access instantly

#### 3. `Role`, `Permission` & `RolePermission`
*   **Purpose**: Forms the granular RBAC security matrix.
*   **Key Fields**:
    *   `Permission`: Holds a combination of `module` (e.g. `leads`, `deals`) and `action` (e.g. `create`, `export`). Secured via a compound unique index `@@unique([module, action])`.
    *   `RolePermission`: A junction model mapping a Role to a Permission with Cascade deletes.

#### 4. `EmployeeCredential`
*   **Purpose**: Password hashes for teammates logging in via `EmployeeID` rather than SSO.
*   **Key Fields**:
    *   `passwordHash`: BCrypt hash of corporate password
    *   `failedAttempts`: Int tracking security status (autolocks account upon threshold)
    *   `lockedUntil`: DateTime indicating lockout timer

#### 5. `UserInvite`
*   **Purpose**: Invitation platform that blocks open public signup to secure organization boundaries.
*   **Key Fields**:
    *   `token`: Unique invite hash sent to target email
    *   `status`: `InviteStatus` enum (`PENDING`, `ACCEPTED`, `EXPIRED`, `REVOKED`)

#### 6. `LoginAudit`
*   **Purpose**: Strict compliance logging to audit all modifications and login sequences.
*   **Key Fields**:
    *   `action`: `AuditAction` enum (`LOGIN_SUCCESS`, `LOGIN_FAILED`, `ROLE_CHANGED`, etc.)
    *   `ipAddress` & `userAgent`: Session metadata

---

### 📈 Module 2: CRM Module (11-Stage Pipeline Engine)

The pipeline is the heart of Sales OS. It leverages an advanced 11-stage pipeline rather than basic CRM statuses, enabling massive insight generation.

```text
+------------------+         +------------------+         +----------------------+
|     Company      | <====== |     Contact      | <====== |         Deal         |
+------------------+         +------------------+         +----------------------+
                                      ||                             ||
                                      \/                             \/
                             +------------------+         +----------------------+
                             |       Lead       |=======> |   LeadStageHistory   |
                             +------------------+         +----------------------+
```

#### 1. `Lead`
*   **Purpose**: The central entity representing a prospective business opportunity.
*   **Pipeline Stages** (`LeadPipelineStage` Enum):
    *   `LEAD_GENERATED` ➡️ `LEAD_ENRICHED` ➡️ `ICP_QUALIFIED` ➡️ `TEMPERATURE_ASSIGNED` ➡️ `WARM_NURTURE` ➡️ `COLD_NURTURE` ➡️ `MEETING_PREPARED` ➡️ `DISCOVERY_COMPLETED` ➡️ `QUALIFICATION_GATE` ➡️ `PROPOSAL_HANDOFF` ➡️ `WON` / `LOST`.
*   **ICP Scoring Dimensions** (0–20 points each, totaling a maximum score of 100):
    *   `icpIndustry` (Vertical match rating)
    *   `icpRevenue` (Company annual turnover check)
    *   `icpUrgency` (Procurement urgency factor)
    *   `icpDecisionAccess` (Direct line to C-suite/Decision makers)
    *   `icpBudget` (Budget scope fit)
    *   `icpScore` (Automated sum of the dimensions, stored 0-100)
*   **Qualification Gate Flags** (Strict checks required to unlock next stages):
    *   `qualBudgetConfirmed`: Budget fit checked and confirmed
    *   `qualDecisionMakerFound`: Buying authority verified
    *   `qualTimelineConfirmed`: Purchase timeline aligns
    *   `qualDiscoveryDone`: Structured discovery call finished
    *   `qualMomSubmitted`: Meeting minutes submitted to CRM
    *   `qualIcpValidated`: Qualified lead profile matches target market ICP

#### 2. `LeadScoreHistory` & `LeadStageHistory`
*   **Purpose**: Provides audit trails of score changes and stage durations.
*   **Key Fields**:
    *   `durationSeconds`: Tracks exactly how long a lead stayed in a pipeline stage to isolate velocity bottlenecks in sales.

#### 3. `Contact` & `Company`
*   **Purpose**: Standard business directories detailing individual stakeholders and organizations.
*   **Key Relations**: 
    *   A `Company` has multiple `Contacts`.
    *   A `Contact` is linked to multiple `Deals` and `Leads`.

#### 4. `Deal`
*   **Purpose**: Visualized revenue opportunity linked to a Lead/Company.
*   **Key Fields**:
    *   `stage`: `DealStage` enum (`PROSPECTING`, `QUALIFICATION`, `PROPOSAL`, `NEGOTIATION`, `CLOSED_WON`, `CLOSED_LOST`)
    *   `value`: Commercial volume (default in `INR`)
    *   `probability`: Expected conversion likelihood percentage (0-100)

---

### 📅 Module 3: Meeting & Structured Discovery System

Integrates meetings directly into customer profiles, enforcing structured discovery Q&As and automated Minutes of Meeting (MOM) report generation.

```mermaid
sequenceDiagram
    participant Rep as Sales Rep
    participant Meeting as Meeting Record
    participant QAs as MeetingNotes (Q&A)
    participant MOM as MOMReport (Auto-Gen)

    Rep->>Meeting: Schedule & Set Goal / Pain Hypothesis
    Rep->>QAs: Answer Structured Discovery Questions (Pain, Budget, etc.)
    Rep->>Meeting: Mark Call as COMPLETED
    Meeting->>MOM: Auto-Generate Summary, Action Items & Next Steps
```

#### 1. `Meeting`
*   **Purpose**: Records discovery calls, demos, and closing reviews.
*   **Key Fields**:
    *   `type`: `MeetingType` (`DISCOVERY`, `FOLLOW_UP`, `DEMO`, `PROPOSAL_REVIEW`, `CLOSING`)
    *   `meetingGoal` & `painHypothesis`: Pre-meeting structured preparation briefs.
    *   `rawNotes` & `nextSteps`: Structured post-meeting transcripts and plans.

#### 2. `MeetingNote`
*   **Purpose**: Highly structured discovery Q&As categorizing the prospect's responses.
*   **Key Sections** (`NoteSection` Enum):
    *   `BUSINESS_CONTEXT`, `PAIN_DISCOVERY`, `BUDGET`, `TIMELINE`, `DECISION_PROCESS`, `PREVIOUS_ATTEMPTS`, `SUCCESS_CRITERIA`, `GENERAL`

#### 3. `MOMReport` (Minutes of Meeting)
*   **Purpose**: The compiled minutes report generated right after a meeting is marked completed.
*   **Key Fields**:
    *   `summary`: Comprehensive text summary
    *   `keyOutcomes`: Crucial takeaways
    *   `actionItems`: JSON representation of `{ action, owner, dueDate }` lists.

---

### 🔄 Module 4: Follow-up & Multichannel Nurturing System

Enforces follow-up accountability through multi-day cadence structures (Days 1, 3, 7, 14, 30) with predefined templates.

#### 1. `FollowUp`
*   **Purpose**: Scheduled nurturing touches mapped to a specific Lead.
*   **Key Fields**:
    *   `channel`: `FollowUpChannel` (`EMAIL`, `WHATSAPP`, `LINKEDIN`, `CALL`, `MEETING`, `SMS`)
    *   `status`: `FollowUpStatus` (`PENDING`, `COMPLETED`, `SKIPPED`, `OVERDUE`)
    *   `sequenceDay`: Optional index indicating position in a sequence (e.g. Day 3 check-in)

#### 2. `FollowUpTemplate`
*   **Purpose**: Predefined message bodies corresponding to channels and sequence days.

---

### 📄 Module 5: Proposal Handoff Module

Manages the transition from Sales to Delivery once a client is ready to contract.

#### 1. `Proposal`
*   **Purpose**: An aggregated handoff package compiling lead profile details, meeting notes, requirements, and commercial pricing.
*   **Key Fields**:
    *   `status`: `ProposalStatus` enum (`DRAFT`, `PENDING_REVIEW`, `APPROVED`, `SENT`, `ACCEPTED`, `REJECTED`, `EXPIRED`)
    *   `value`: Bid commercial price
    *   `reviewerId`: ID of the designated proposal manager who must sign off on the package before it is sent to the client.

---

### 🚀 Module 6: Client Launch & Onboarding Module

Tracks post-sales onboarding execution, internal vs. client checklists, milestone tracking, and health logging.

```text
                      +------------------+
                      |   ClientLaunch   |
                      +------------------+
                               ||
      +========================++========================+
      ||                       ||                        ||
      \/                       \/                        \/
+------------+           +------------+            +------------+
| Checklist  |           | Milestones |            | HealthLogs |
+------------+           +------------+            +------------+
```

#### 1. `ClientLaunch`
*   **Purpose**: The central post-sale workspace for client intake, handoff validation, and kickoff delivery.
*   **Key Fields**:
    *   `status`: `LaunchStatus` (`INTAKE`, `KICKOFF_PENDING`, `KICKOFF_DONE`, `DOCUMENTS_PENDING`, `IN_DELIVERY`, `COMPLETED`)
    *   `health`: `ClientHealthStatus` (`HEALTHY`, `ATTENTION`, `AT_RISK`)
    *   `handoffAccepted`: Boolean checking if the delivery team accepted the handoff

#### 2. `ClientContact` & `ClientDocument`
*   **Purpose**: Key external contacts (categorized by `ContactAuthority`: `DECISION_MAKER`, `PROJECT_OWNER`, `TECHNICAL`, etc.) and documents uploaded during onboarding.

#### 3. `OnboardingChecklistItem` & `Milestone`
*   **Purpose**: Granular checklist tasks (internal, kickoff, client categories) and weekly milestone trackers.

#### 4. `ClientHealthLog`
*   **Purpose**: History of account health modifications detailing reasons and owners.

---

### 🔔 Module 7: Notifications & Pulse Engine

The automated monitoring platform of Sales OS. Drives real-time alerts, critical status updates, and automated escalations.

#### 1. `Notification`
*   **Purpose**: Holds in-app notifications shown on the UI navigation bell.
*   **Key Fields**:
    *   `priority`: `NotificationPriority` (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`)
    *   `type`: `NotificationType` enum (`LEAD_ASSIGNED`, `MOM_OVERDUE`, `MOM_ESCALATION`, `LEAD_INACTIVITY`, `PROPOSAL_STALLED`, etc.)
    *   `entityId` & `entityType`: Enables deep-linking to the exact record (e.g. `Lead` or `Meeting`)

#### 2. `NotificationPreference`
*   **Purpose**: User preferences enabling custom in-app/email alerts and **Quiet Hours** during which notifications are suppressed or delayed.

#### 3. `ReminderRule`
*   **Purpose**: Configurable triggers for automations (e.g., alert rep 1 hour before meeting).

---

### ⚙️ Module 8: Operations, Knowledge Base & Command Center

#### 1. `Task` & `Workflow`
*   **Purpose**: System operations. Tasks represent to-dos, and workflows contain automation JSON arrays triggered on events like `lead.created` or `deal.stage.changed`.

#### 2. `Document` & `Category`
*   **Purpose**: Hierarchical Knowledge Base storing playbooks and SOPs. Includes parent/child self-relations for flexible category structures.

#### 3. `SearchHistory`
*   **Purpose**: Tracks clicked items within the Command Center search bar to dynamically surface recent items.

---

## ⚡ Core Engine Design & Logic Flows

### 🛡️ 1. Role-Based Access Control (RBAC) Engine

Permissions are structured under the standard string format `module.action`. 

The core permission utility at `src/lib/auth/permissions.ts` exports:
1.  **`PERMISSIONS`**: A structured dictionary mapping human-readable keys to `{ module, action }` objects.
2.  **`DEFAULT_ROLE_PERMISSIONS`**: Seeding configuration mapping standard role names to permissions:
    *   `super_admin`: Has 100% of permissions.
    *   `admin`: Full CRM/Lead/Settings access, but lacks super_admin backend system controls.
    *   `sales_manager`: Full crm, leads, deals, contacts, reports, meetings, and task management. Lacks system role/permission configurations.
    *   `cx_executive`: Customer success specialist. Access to CRM, meetings, and task creation. Lacks deletion.
    *   `proposal_manager`: Focused entirely on deal-level commerce, proposals, and knowledge playbooks.
    *   `analyst`: Read-only reporting access with export capability.
    *   `viewer`: Global read-only lookup.
3.  **`can(userPermissions, key)` Helper**:
    Checks if a permission string array includes the mapped target:
    ```typescript
    export function can(userPermissions: PermissionString[], key: PermissionKey): boolean {
      const p = PERMISSIONS[key];
      const target = `${p.module}.${p.action}` as PermissionString;
      return userPermissions.includes(target);
    }
    ```

In server-side code (`src/lib/auth/index.ts`), we secure routes and API handlers using Clerk session validation:
```typescript
const user = await getCurrentUser();
if (!hasPermission(user, "LEADS_EXPORT")) {
  redirect("/unauthorized"); // or return 403 response
}
```

---

### 🩸 2. Pulse Engine & Background Task Scheduler

The Pulse Engine acts as the nervous system of the platform. It handles two primary processes: **Instant Notification Emitters** and **Scheduled Cron Jobs**.

```mermaid
graph LR
    SystemEvent[System Trigger] --> |Instant Emit| PulseEmit[emit() in pulse.ts]
    CronSecret[x-cron-secret] --> |GET API Request| PulseProcess[/api/pulse/process]

    PulseEmit --> DBNotif[(Insert Notification)]
    PulseEmit --> |Send Email?| Resend[Resend API Integration]

    PulseProcess --> |1. Check Meetings 2h+| MOMOverdue[Emit MOM_OVERDUE]
    PulseProcess --> |2. Check Overdue FollowUps| FUOverdue[Mark Status OVERDUE & Emit FOLLOW_UP_DUE]
    PulseProcess --> |3. Check Meetings in 1-2h| MeetRemind[Emit MEETING_REMINDER]
    PulseProcess --> |4. Check WARM Leads 14d+| StaleLeads[Mark Temp COLD & Emit LEAD_INACTIVITY]

    MOMOverdue --> PulseEmit
    FUOverdue --> PulseEmit
    MeetRemind --> PulseEmit
    StaleLeads --> PulseEmit
```

#### The `GET /api/pulse/process` Scheduler
This API endpoint (`src/app/api/pulse/process/route.ts`) is designed to run asynchronously via a cron scheduler (e.g. Vercel Cron) or external webhook. It executes four crucial pipeline checks in a single run:

1.  **MOM Overdue Validation**:
    *   **Logic**: Finds completed meetings scheduled 2+ hours ago where no linked `MOMReport` exists in the database.
    *   **Action**: Verifies a duplicate alert hasn't been fired recently. If clean, emits a `MOM_OVERDUE` critical-priority notification and dispatches an email via Resend to the host.
2.  **Overdue Follow-up Audit**:
    *   **Logic**: Scans for `FollowUp` items where status is `PENDING` and the due date is in the past (`dueDate <= now`).
    *   **Action**: Updates their status to `OVERDUE` in the database and triggers a `FOLLOW_UP_DUE` high-priority email alert.
3.  **Meeting Reminders**:
    *   **Logic**: Queries upcoming meetings starting in the next 2 hours.
    *   **Action**: Emits a `MEETING_REMINDER` to the host in-app to remind them to review pre-meeting discovery briefs.
4.  **Stale Lead Reclassification**:
    *   **Logic**: Scans for active leads (not in `WON` or `LOST` stages) whose temperature is currently `WARM` but haven't had any activity updates in over **14 days**.
    *   **Action**: Reclassifies the lead temperature to `COLD` and fires a `LEAD_INACTIVITY` warning notification to the owner.

---

### 🔍 3. Command Center (Global Multi-Entity Search)

The Command Center is an ultra-fast search bar designed to query multiple entities simultaneously.

When a query is dispatched to `GET /api/search?q=query`, the server-side route handler at `src/app/api/search/route.ts` runs a highly optimized, **non-blocking parallel database search** across 7 separate tables:

```typescript
const [leads, contacts, companies, meetings, proposals, tasks, users] =
  await Promise.all([
    db.lead.findMany({ ... }),
    db.contact.findMany({ ... }),
    db.company.findMany({ ... }),
    db.meeting.findMany({ ... }),
    db.proposal.findMany({ ... }),
    db.task.findMany({ ... }),
    db.user.findMany({ ... })
  ]);
```

#### Search Results & Click Analytics
1.  **Fuzzy Text Matching**: Case-insensitive text lookups on names, emails, companies, titles, and descriptions.
2.  **Navigation and Quick Actions**: Merges static routes (e.g., `/dashboard/pipeline`) and common quick action triggers (e.g., `/dashboard/pipeline/new`) so users can navigate the platform using keyboard shortcuts.
3.  **Search History Tracking**: Every time a user selects a search result, it is recorded in the `SearchHistory` model, enabling the search bar to show the user's "Recent Items" instantly when opened empty.

---

## 🛠️ Technology Stack & Third-Party Integrations

Sales OS is engineered using robust, standard libraries that maintain clean TypeScript interfaces.

| Core Tier | Technology / Library | Version | Description |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | `16.2.6` | Supports Server Components & optimized build structures |
| **Runtime / Library** | React & React DOM | `19.2.4` | Harnesses functional hooks, suspense, and server actions |
| **Styling** | Tailwind CSS v4 & CSS Modules | `^4.0.0` | Flexible styles and robust layout rendering |
| **Authentication** | Clerk Next.js SDK | `^7.3.3` | SSO logins, secure cookies, and session sync webhooks |
| **Database Adapter** | `@neondatabase/serverless` | `^1.1.0` | Serverless PostgreSQL connection adapter |
| **ORM** | Prisma Client & CLI | `^7.8.0` | Standard DB client supporting Neon Serverless adapter |
| **UI Components** | Radix UI Primitive Suite | — | Headless, accessible interactive primitives |
| **Drag & Drop** | `@dnd-kit` Core & Sortable | `^6.x` / `^10.x` | Powering the Kanban Board visual pipeline card moving |
| **Transactional Email**| Resend Node.js SDK | `^6.12.3` | Custom designed dark-themed operational templates |
| **Data Processing** | Zod | `^4.4.3` | Client and Server side type validation |
| **Analytics Charts** | Recharts | `^3.8.1` | Dashboard metrics graphs and analytics charts |
| **File Generation** | `xlsx` / `jspdf` | — | Generates clean CSVs and PDFs of invoices and reports |

---

## 🚀 Setup & Deployment Reference

### 1. Environment Configurations (`.env`)
To run this application locally, ensure you set the following environment variables in your local `.env` file:

```env
# Database Pool Connection (Neon Pooler)
DATABASE_URL="postgresql://user:pass@ep-pooler-name.aws.neon.tech/dbname?sslmode=require"

# Direct Connection (Migrate Bypass for Prisma 7)
DIRECT_URL="postgresql://user:pass@ep-direct-name.aws.neon.tech/dbname?sslmode=require"

# Clerk Identity Credentials
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# Resend Mail Key
RESEND_API_KEY="re_..."

# Pulse Engine Cron Secret
CRON_SECRET="super-secret-hash-for-cron-verification"
```

### 2. Database Migrations (Prisma 7 convention)
In **Prisma v7**, `directUrl` is no longer specified inside `schema.prisma`. All configuration must be defined inside `prisma.config.ts`. 

Run the following to synchronize your database during initial setup or modifications:
```bash
# Apply migrations to database using the Direct non-pooler connection
npx prisma migrate dev

# Generate local Typescript types
npx prisma generate
```

### 3. Running Locally
Run the development server locally:
```bash
npm run dev
```

### 4. Deploying to Vercel
1.  Import your repository into the Vercel Dashboard.
2.  Configure all Environment Variables.
3.  Vercel automatically detects the Next.js setup and applies optimizations.
4.  Configure a **Vercel Cron** targeting `/api/pulse/process` with the header `x-cron-secret` matching your `CRON_SECRET` to automate the background Pulse Engine alerts.
