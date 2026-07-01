# Dotsure Leader OS — Starter Package

## What this is

Complete Claude Code project brief for the Dotsure Leader OS — a full AI operating system for Senior Leaders at Dotsure. One system, one login, everything they need with AI embedded throughout.

The existing Dotsure Build Harness pipeline is ported into this system as the BUILDS module. The standalone harness at https://dotsure-build-harness.vercel.app stays live and unchanged.

---

## Files in this package

| File | Purpose |
|---|---|
| CLAUDE.md | Master brief — Claude Code reads this first and executes from it |
| schema.sql | Full database schema for new Supabase project |
| context.sql | Dotsure AI context — run after schema.sql |
| env.template | Environment variables — fill in and rename to .env.local |

---

## Before you open Claude Code

### Step 1: Create a new Supabase project
- Go to supabase.com
- Create a NEW project (do not use the harness project)
- Note your: Project URL, Anon key, Service role key

### Step 2: Run database scripts
In the new Supabase project SQL editor:
1. Run schema.sql
2. Run context.sql

### Step 3: Fill in environment variables
- Open env.template
- Fill in the 4 values
- Rename the file to .env.local
- Keep it handy — Claude Code will need it

---

## Opening Claude Code

1. Extract this zip to C:\Users\Hermans\
2. Open Claude Code
3. Point Claude Code at the dotsure-leader-os-starter folder
4. Say exactly: "Read CLAUDE.md and execute Session 1"

Claude Code will scaffold the project, build the foundation, set up auth, build the Workspace module with Claude Sonnet 5 embedded, and deploy to Vercel.

---

## What gets built in Session 1

- Next.js 15 project scaffolded
- Dark ops design system (Dotsure teal + coral on near-black)
- Supabase auth with profile setup on first login
- 6-module sidebar navigation
- Persistent AI panel (right side, always visible)
- Workspace module — Claude Sonnet 5 embedded, persistent conversations
- Deployed to Vercel

---

## Subsequent sessions

- Session 2: Reports module (file upload + AI analysis)
- Session 3: Tasks module (create, assign, track, AI follow-up)
- Session 4: Builds module (harness pipeline ported in natively)
- Session 5: Knowledge module + polish + mobile

---

## Do not touch

- Harness live: https://dotsure-build-harness.vercel.app
- Harness repo: https://github.com/stoltzherman-hue/dotsure-build-harness
- Harness Supabase: guwqrtxfnymhmrgqgavx
