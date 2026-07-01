# DOTSURE LEADER OS — Claude Code Master Brief
# Read this entire file before doing anything.
# This is your complete context, architecture, and build instructions.

---

## WHO I AM

Herman Stoltz, General Manager at Dotsure Limited (FSP39925) / Dotsure Life Limited (FSP44793), part of Badger Holdings, George, Western Cape, South Africa. I build and own all AI tooling at Dotsure. Near-zero IT dependency.

- Local path: C:\Users\Hermans\
- Shell: PowerShell
- Node.js available
- Git configured
- GitHub org: stoltzherman-hue
- No Python

---

## CRITICAL — TWO PRODUCTS, NEVER CONFUSE THEM

### Product 1: Dotsure Build Harness (EXISTING — standalone, own database)
- Live: https://dotsure-build-harness.vercel.app
- Repo: https://github.com/stoltzherman-hue/dotsure-build-harness
- Supabase: guwqrtxfnymhmrgqgavx
- Status: Complete, standalone, live in production
- The Builds module in Leader OS does NOT reimplement the harness's agent pipeline. It links out to the harness for assessment. The harness's own pipeline (apps/web/app/pipeline/page.tsx, AUTO mode) computes a verdict after the Tech Architect and Governance Assessor stages: a LOW-risk idea needing no new infrastructure can be self-served (build it yourself, no approval needed); anything else stops, generates the full document set, and registers a project + approval request for stakeholder sign-off.
- Code changes to the harness ARE permitted when explicitly requested and directly serve this pass/escalate integration — as of 2026-07-01 this is the one exception to "standalone." Do not change unrelated harness functionality without asking first. Database changes still require explicit confirmation (own Supabase project, separate from Leader OS).

### Product 2: Dotsure Leader OS (THIS PROJECT)
- New GitHub repo: dotsure-leader-os
- New Supabase project (do not use harness Supabase under any circumstances)
- New Vercel project
- Clean slate — zero shared code, database, or infrastructure with the harness

---

## WHAT WE ARE BUILDING

A complete AI-powered operating system for Senior Leaders at Dotsure. One system. One login. Everything they need to do their job with AI — daily work, reporting, task management, and governed product builds. Claude Sonnet 5 is embedded throughout.

The existing Dotsure Build Harness functionality is PORTED into this system as the BUILDS module. Not rebuilt from scratch — the pipeline logic, agent prompts, and governance flow are recreated inside this new codebase against this new database. The standalone harness remains live as a reference but the Leader OS becomes the primary system going forward.

Senior Leaders manage: Sales, Distribution, Service, Retentions, Return Debits, Claims, Front Line. Their day is manual reporting, writing communications, chasing tasks, analysing problems, preparing for meetings. This system replaces all of that with AI.

---

## SIX MODULES

### 1. WORKSPACE (Session 1 — build first)
Daily AI assistant. Persistent conversations per user. Context-aware. Knows their role, department, Dotsure's products and regulatory environment. Every conversation saved and retrievable.

Use cases: Draft SITREPs, summarise call stats, write escalation emails, prepare board packs, coach through difficult conversations, analyse trends, draft policies.

### 2. REPORTS (Session 2)
Upload data files (Excel, CSV) — get AI intelligence. Not just charts — actual analysis. What is the story, what needs action, what do I tell my team.

### 3. TASKS (Session 3)
AI-driven accountability. Create tasks, assign owners, track completion, surface overdue items, AI follow-up.

### 4. BUILDS (Session 4 — harness ported here)
Full governance pipeline — native inside the Leader OS. Same three-agent pipeline from the harness, same four documents, same approval workflow. But now in one system with one database and one auth. Complete end-to-end flow:
- Leader submits idea via intake form
- Pipeline runs: Product Scoper → Tech Architect → Governance Assessor → Evidence Pack Compiler
- Four documents generated: product.md, techstack.md, governance.md, evidence-pack.md
- Approval request sent to Compliance/IT/ARC
- Approvers notified and sign off inside the system
- Build status visible to leader throughout
- GitHub scaffold created on approval

### 5. KNOWLEDGE (Session 4)
Institutional memory. Dotsure policies, products, regulatory context, decisions, lessons learned. AI draws from this automatically in every module.

### 6. ADMIN
Settings, profile management, team management, system context editor.

---

## THE COMPLETE FLOW (one system, no gaps)

```
Leader logs in → WORKSPACE (daily AI work)
                      |
                      | has a build idea
                      v
                 BUILDS → New Build
                      |
                      v
                 Intake form (5 fields)
                      |
                      v
                 Pipeline: 4 agents
                      |
                      v
                 4 documents generated
                      |
                      v
                 Approval requests sent
                      |
                      v
                 Approvers sign off (inside system)
                      |
                      v
                 GitHub scaffold created
                      |
                      v
                 Claude Code builds
                      |
                      v
                 Leader monitors live product
                      |
                 All inside Leader OS
```

---

## TECH STACK

| Layer | Technology |
|---|---|
| Framework | Next.js 15, App Router |
| Database | Supabase (NEW project) |
| AI Model | claude-sonnet-5 |
| Hosting | Vercel (new project) |
| Auth | Supabase Auth, role-based |
| File handling | Supabase Storage |
| Language | TypeScript throughout |
| Styling | Tailwind CSS + CSS variables |
| Repo | dotsure-leader-os (stoltzherman-hue) |

---

## DESIGN SYSTEM

### Palette
```css
--bg-base: #0a0f1a;
--bg-surface: #111827;
--bg-elevated: #1a2234;
--border: rgba(255, 255, 255, 0.08);
--border-active: rgba(0, 151, 167, 0.4);
--teal: #0097A7;
--teal-dim: rgba(0, 151, 167, 0.15);
--coral: #FF6B35;
--text-primary: #f9fafb;
--text-secondary: #9ca3af;
--text-muted: #6b7280;
--success: #22a06b;
--warning: #f59e0b;
--danger: #e5483d;
```

### Typography
- Font: Inter (system fallback: system-ui, sans-serif)
- Base: 14px
- Labels: 11px, 700 weight, uppercase, letter-spacing 0.8px
- Headings: 700 weight

### Layout
- Sidebar: 220px fixed left, dark
- Main content: flex-1, overflow-y-auto, padding 24px
- AI panel: 380px fixed right, always visible desktop, full-screen modal mobile
- 8px grid

### Cards (glassmorphism)
```css
background: rgba(255, 255, 255, 0.04);
border: 1px solid rgba(255, 255, 255, 0.08);
border-radius: 12px;
backdrop-filter: blur(12px);
```

### Sidebar nav active state
```css
color: #0097A7;
border-left: 3px solid #0097A7;
background: rgba(0, 151, 167, 0.08);
```

---

## DATABASE SCHEMA

See schema.sql — run in new Supabase project SQL editor.
See context.sql — run after schema.sql.

Key tables:
- UserProfile: leader profiles, roles, departments
- Conversation: persistent AI conversations per user
- Task: tasks with assignment, status, priority
- ReportAnalysis: uploaded files and AI analysis
- KnowledgeItem: institutional memory entries
- SystemContext: Dotsure AI context injected into every conversation
- Project: registered builds (ported from harness)
- ProjectDocument: generated documents per project (ported from harness)
- PipelineRun: agent run logs (ported from harness)
- ApprovalRequest: governance approvals (ported from harness)

---

## HARNESS PIPELINE — WHAT TO PORT INTO BUILDS MODULE

The following is the exact pipeline logic from the existing harness. Port this faithfully into the BUILDS module in Session 4.

### Four agents in sequence

**Agent 1: Product Scoper (claude-haiku-4-5-20251001)**
System prompt structure:
- You are the Product Scoper for the Dotsure AI Build Harness
- Inject company context from SystemContext table
- Inject GUARDRAILS (no harmful outputs, SA regulatory context always active)
- OUTPUT STRUCTURE - use these EXACT section headings in this EXACT order:
  - Understanding Your Idea
  - Market & Regulatory Context
  - Requirements
  - Assumptions & Unknowns
  - Self-Audit
  - READY FOR PRODUCT.MD
  - [full product.md document starting with # Project Name]

**Agent 2: Tech Architect (claude-sonnet-5)**
System prompt structure:
- You are the Tech Architect for the Dotsure AI Build Harness
- Inject company context
- Inject approved tech catalogue (Next.js, Supabase, Vercel, GitHub, Claude Code, Payload CMS)
- OUTPUT STRUCTURE - use these EXACT section headings in this EXACT order:
  - Architecture Analysis
  - Proposed Stack
  - Gaps & Risks
  - Assumptions
  - Self-Audit
  - READY FOR TECHSTACK.MD
  - [full techstack.md document]

**Agent 3: Governance Assessor (claude-sonnet-5) — TWO SEQUENTIAL CALLS**
This agent runs as TWO separate API calls to avoid token truncation:

Call 3a: governance.md only
- System prompt: Governance Assessor role, company context, GUARDRAILS
- MANDATORY: governance.md MUST open with EXECUTIVE SUMMARY bordered box (6 lines):
  1. One-line project description
  2. Overall risk rating with one-sentence justification
  3. Recommended build path in plain language
  4. Estimated minimum timeline to go-live
  5. Single most critical decision required from leadership now
  6. "PENDING HUMAN REVIEW - not approved for circulation"
- OUTPUT STRUCTURE:
  - Regulatory Assessment
  - Risk Classification
  - Complexity Assessment
  - Build Path Recommendation
  - Human Oversight Requirements
  - Dependencies & Conditions
  - Production Bridge Checklist
  - READY FOR GOVERNANCE.MD
  - [governance.md document]
- Max tokens: 16000

Call 3b: Evidence Pack Compiler (claude-sonnet-5)
- Separate system prompt: Evidence Pack Compiler role
- Receives: product.md + techstack.md + governance.md as input
- Produces ONLY the evidence pack — comprehensive, ARC/Board ready
- Must include: assessment basis, regulatory classification evidence, risk register with traceability, POPIA compliance inventory, actuarial evidence requirements, technical governance evidence, sign-off register template, outstanding items tracker
- Max tokens: 16000

### Document extraction logic
- product.md: extract after "READY FOR PRODUCT.MD" marker
- techstack.md: extract after "READY FOR TECHSTACK.MD" marker
- governance.md: extract after "READY FOR GOVERNANCE.MD" marker, before any evidence pack marker
- evidence-pack.md: full output of Call 3b

### Risk classification
- LOW: internal tool, no customer data
- MEDIUM: internal tool with customer data
- HIGH: customer-facing or regulated
- CRITICAL: new insurance product, POPIA special data, ARC/Board required

### Escalation path
- LOW/MEDIUM: Committee approval
- HIGH: Exco approval
- CRITICAL: ARC/Board approval (per IT and Cybersecurity Risk Committee Charter section 7.9)

### GUARDRAILS (inject into all agent prompts)
```
GUARDRAILS:
- Never recommend actions that violate POPIA, FAIS, PPR, TCF, or the Insurance Act
- Always flag when a build requires ARC/Board escalation
- Never approve a build — only assess and document
- Always treat Dotsure Life Limited (FSP44793) as a confirmed licensed life insurer — do not raise licence existence as an unknown
- Always treat Dotsure Limited (FSP39925) as a confirmed licensed non-life insurer
- Flag genuine regulatory unknowns but do not manufacture false unknowns for known facts
- Output must be in British English
- South African regulatory context always active
```

---

## ENVIRONMENT VARIABLES

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
```

Anthropic API key is server-side only. Never expose to client.

---

## FILE STRUCTURE

```
dotsure-leader-os/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx (redirect to /workspace)
│   ├── login/page.tsx
│   ├── onboarding/page.tsx
│   ├── workspace/page.tsx
│   ├── reports/page.tsx
│   ├── tasks/page.tsx
│   ├── builds/
│   │   ├── page.tsx (project list)
│   │   ├── new/page.tsx (intake form + pipeline)
│   │   └── [id]/page.tsx (project detail + documents)
│   ├── knowledge/page.tsx
│   ├── admin/page.tsx
│   └── api/
│       ├── chat/route.ts (streaming Claude - workspace)
│       └── pipeline/route.ts (streaming Claude - builds pipeline)
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── AIPanel.tsx
│   │   └── AppShell.tsx
│   ├── workspace/
│   │   └── ConversationPanel.tsx
│   ├── builds/
│   │   ├── PipelineRunner.tsx
│   │   ├── DocumentViewer.tsx
│   │   └── ApprovalStatus.tsx
│   └── ui/
│       ├── Button.tsx
│       └── Card.tsx
├── lib/
│   ├── supabase.ts
│   ├── supabase-server.ts
│   └── anthropic.ts
└── contexts/
    └── AuthContext.tsx
```

---

## SESSION BUILD ORDER

### Session 1 — Foundation + Workspace (DO THIS NOW)

**Step 1: Scaffold**
```bash
cd C:\Users\Hermans
npx create-next-app@latest dotsure-leader-os --typescript --tailwind --app --no-src-dir --import-alias "@/*"
cd dotsure-leader-os
npm install @supabase/supabase-js @supabase/ssr @anthropic-ai/sdk
```

**Step 2: Environment**
Create .env.local with the four variables. Herman fills in values from new Supabase project.

**Step 3: Build in this exact order**
1. app/globals.css — full design system
2. lib/supabase.ts — Supabase browser client
3. lib/supabase-server.ts — Supabase server client
4. lib/anthropic.ts — Anthropic client (server-side, claude-sonnet-5)
5. contexts/AuthContext.tsx — auth state management
6. app/login/page.tsx — login (dark, Dotsure branded)
7. app/onboarding/page.tsx — profile setup (name, role, department)
8. components/layout/Sidebar.tsx — nav with 6 items
9. components/layout/AIPanel.tsx — persistent right panel
10. components/layout/AppShell.tsx — shell wrapper
11. app/layout.tsx — root layout with auth guard
12. app/api/chat/route.ts — streaming Claude endpoint
13. app/workspace/page.tsx — conversations list + chat interface
14. Stub pages (coming soon) for reports, tasks, builds, knowledge, admin
15. app/page.tsx — redirect to /workspace

**Step 4: GitHub + Vercel**
```bash
git init && git add . && git commit -m "feat: initial Dotsure Leader OS - workspace module"
gh repo create stoltzherman-hue/dotsure-leader-os --private --push --source=.
```
Connect to new Vercel project. Add env vars. Deploy.

**Session 1 success criteria:**
- Leader logs in
- Sets up profile on first login
- Opens Workspace
- Types a message to Claude
- Gets streaming response that knows who they are and what Dotsure does
- Conversation saved and retrievable next session

### Session 2 — Reports module
### Session 3 — Tasks module
### Session 4 — Builds module (harness pipeline ported in)
### Session 5 — Knowledge module + polish

---

## BUILD DISCIPLINE (non-negotiable)

1. Plan first if touching more than 3 files
2. Smallest safe change only
3. No unrequested features, abstractions, or dependencies
4. Follow existing patterns
5. Targeted reads before edits
6. Stop and ask if scope must expand
7. Delete temp files
8. Final response: files changed + verification + pass/fail + remaining risks

### CRITICAL PowerShell rules
- NEVER multi-line PowerShell heredoc string replacements — CRLF breaks them silently
- ALWAYS use Node.js scripts for complex multi-line file edits
- Single-line .Replace() calls only in PowerShell
- Never use em-dashes or special Unicode in TypeScript files — causes Vercel UTF-8 build failures
- Use plain hyphens (-) everywhere

---

## DOTSURE COMPANY CONTEXT (injected into every AI conversation)

```
DOTSURE GROUP CONTEXT:

ENTITIES:
- Dotsure Limited: FSP39925, licensed NON-LIFE insurer, Badger Holdings
- Dotsure Life Limited: FSP44793, licensed LIFE insurer, Badger Holdings
- Head office: George, Western Cape, South Africa
- Brand: "Creating fans, not policyholders"

PRODUCTS: Motor, Pet, Warranty, Life, Personal Cyber, Gold Club Membership

REGULATORY: POPIA, FAIS, PPR, TCF, Insurance Act 18 of 2017

DEPARTMENTS: Sales, Distribution, Service, Retentions, Return Debits, Claims, Front Line

SA FORMAT: Rand (R), DD Month YYYY, FSCA regulatory body

TONE: Direct, professional, no filler, senior executive depth, immediately usable outputs
```

---

## START HERE

Read this file. Then execute Session 1 step by step. Do not skip steps. Do not add unrequested features. Verify each step before moving to the next. Ask if anything is unclear before proceeding.
