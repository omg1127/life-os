# Life OS

A personal life operating system — a premium PWA that tracks goals, habits, plans, journal entries, and weekly reviews. Built as a single-page app with offline-first architecture and Notion cloud persistence.

**Live:** https://life-os-neon-alpha.vercel.app

---

## What It Does

Life OS replaces scattered task lists, habit trackers, and journal apps with one unified system. Five surfaces give you different lenses into the same data:

### Now (Home)

The command center. Shows at a glance:

- **Today's Shape** — one-line summary: "3 urgent . 4 up next . 1 habit left"
- **Right Now Block** — the single most important task, rendered as a hero card with swipe-to-complete
- **Life Pulse Strip** — per-area health indicators (green/amber/rose) showing which areas of your life are active vs stalled
- **Daily Habits** — inline habit toggles with streak counters and 7-day dot history
- **AI Nudge** — contextual one-liner that changes daily: stale plan warnings, inbox triage prompts, streak encouragement
- **Inbox Pulse** — amber dot with unassigned item count, tap to filter
- **Step List** — all tasks grouped by priority (Do Now / Up Next / Backlog) or by plan, filterable by life area
- **Capture Bar** — persistent input at bottom with priority shortcuts (`!` = next, `!!` = now), area selector, voice input, and journal quick-open
- **Dreams Banner** — your three driving motivations, always visible at the bottom

### Plans

Multi-phase project tracking for life goals. Each plan has:

- **Progress ring** with animated percentage
- **Phases** that expand/collapse, with a sequential lock system (later phases locked until earlier ones complete)
- **Strategy note** ("play") — your reasoning for the approach
- **Target date** with countdown
- **Cost tracking** — aggregated from individual step costs
- **Stale detection** — amber "stale" pill when no progress in 7+ days
- **Due urgency** — rose indicator when deadline is approaching

### Habits

Daily habit tracker with:

- **Toggle circles** with animated check marks (SVG stroke-dashoffset animation)
- **Streak counter** with fire icon
- **Best streak** tracking
- **7-day dot history** — colored dots showing recent consistency
- **Streak break detection** — "broke" label when streak is interrupted

### Journal

Mood-tagged diary entries with:

- **Mood selector** — Clear, Energized, Neutral, Scattered, Low (each with a signature color)
- **Entry types** — Diary, Reflection, Note, Counterfactual
- **Serif italic typography** for a paper-journal feel
- **Full-screen modal** for writing with mood and type selectors
- **Date grouping** with formatted headers

### Review

Weekly retrospective surface:

- **Week-of header** with date range
- **Weekly Targets** — set and check off goals for the week
- **What Got Done** — area-grouped completion counts
- **Habits This Week** — 7-day colored dot grid per habit with streak status
- **How You Felt** — mood visualization from journal entries
- **Reflection prompt** — "If you could rerun this week with one thing changed, what would it be?"
- **Counterfactual tracking** — "What would you change about this week?" with a "You keep saying..." card that surfaces repeated themes

---

## Design System: Field Notebook

The visual language is "Field Notebook" — a worn, warm aesthetic that feels like a leather-bound journal, not a SaaS dashboard.

### Colors

Dark theme (default):
- Background: `#0b0908` (near-black warm)
- Surface: `#1a1614` to `#2a2422` (layered depth)
- Text: `#f7f4f0` to `#3d3832` (5-tier hierarchy)
- Accent palette: Amber `#f5a623`, Emerald `#3dd68c`, Sky `#3dafff`, Rose `#ff6b7a`, Violet `#b19cff`, Coral `#ff8c5a`

Light theme:
- Background: `#faf7f2` (warm parchment)
- Surface: `#ffffff` to `#ebe4d9`
- Full light-mode accent palette with adjusted saturation

### Typography

Three fonts with distinct roles:
- **Fraunces** (serif) — headings, greetings, journal text. Gives the "field notebook" character.
- **Inter** (sans) — body text, labels, UI elements
- **JetBrains Mono** (mono) — dates, stats, meta information, status badges

### Texture

- **Grain overlay** — 3.5% opacity SVG fractal noise on `::after` pseudo-element (dark mode only)
- **Ambient glow** — radial amber gradient (top) + radial violet gradient (bottom-left) on `::before` pseudo-element

### Motion

Framer Motion throughout:
- `AnimatePresence mode="wait"` for tab transitions
- Spring physics on toggle interactions
- `layoutId` for shared element transitions
- Hand-drawn SVG check animation (`stroke-dashoffset` keyframes)
- Breathing dot animation for active indicators
- Ring pulse on task completion
- Mic recording pulse animation
- Reduced motion support via `prefers-reduced-motion` media query

---

## Architecture

### Frontend

Single-file React app (`src/app/page.tsx`, ~1840 lines) using:
- **Next.js 16.2.4** with App Router and Turbopack
- **React 19.2** with hooks-only architecture
- **Framer Motion** for all animations
- **Lucide React** for icons
- **Tailwind CSS v4** with CSS custom properties bridge
- **No external state management** — pure `useState` + `useCallback` + `useMemo`

**Component hierarchy:**

```
Page (state + persistence + routing)
  Header (greeting, sync status, theme toggle, logout)
  CaptureBar (text input, voice, area selector)
  BottomTabs (5-tab navigation)

  Now surface:
    RightNowBlock (hero task card)
    LifePulse (area health strip)
    HabitsStrip (inline habit toggles)
    InboxPulse (unassigned item counter)
    StepSection > StepRow (task list)
    DreamsBanner (motivational anchors)

  Plans surface:
    PlanCard (overview cards with progress rings)
    PlanDetail > PhaseBlock (expanded plan view)

  Habits surface:
    HabitsStrip (full view with streaks)

  Journal surface:
    JournalEntryCard (entry display)
    JournalModal (entry creation)

  Review surface:
    ReviewScreen (weekly targets, stats, reflection)

  EditDrawer (step editing overlay)
```

### Persistence: Offline-First with Cloud Sync

**Layer 1 — localStorage (instant)**
- All state changes write to `localStorage` synchronously
- App loads from localStorage first for zero-latency startup
- Key: `life-os-v4`

**Layer 2 — Notion API (cloud)**
- Debounced sync (2-second delay after last change)
- Full app state stored as JSON code blocks in a single Notion page
- On load: fetch from Notion in background, merge if newer
- Sync status indicator in header: syncing / saved / offline / error

**Layer 3 — Service Worker (offline)**
- Precaches app shell (HTML, icons, manifest)
- Network-first for navigation, cache-first for static assets
- API calls are never cached (always network-only)
- When offline: all changes queue in localStorage with `pendingSync` flag
- When connectivity returns: `online` event triggers automatic sync flush

**Data flow:**
```
User action
  -> setState (React)
  -> localStorage.setItem (sync, instant)
  -> debounce 2s -> POST /api/state (async)
    -> Notion API: find state page -> clear blocks -> write JSON chunks
```

### Notion Integration

State is stored as a single JSON blob in the Items database:
- **Page title:** `life-os-state-v1`
- **Content:** JSON split into 1900-char code blocks (Notion rich_text limit is 2000)
- **Read path:** Query for page by title -> read code blocks -> concatenate -> JSON.parse
- **Write path:** Find or create page -> delete existing blocks -> append new code blocks
- Uses `@notionhq/client` v5.20 with `dataSources.query()` and `pages.create({ parent: { data_source_id } })`

### Security

**Authentication:**
- Password-gated login page at `/login`
- Password stored as `AUTH_PASSWORD` env var (never in code)
- HMAC-SHA256 signed session tokens
- Timing-safe password comparison (hashed before comparing to prevent length leaks)

**Session management:**
- HttpOnly cookie (`life-os-session`) — not accessible via JavaScript
- Secure flag — only transmitted over HTTPS
- SameSite=Lax — prevents CSRF from third-party sites
- 30-day expiry
- Logout clears cookie server-side

**Middleware:**
- Runs on every request (Edge Runtime)
- Public paths whitelist: `/login`, `/api/auth`, `/sw.js`, static assets
- HMAC verification using Web Crypto API (Edge-compatible)
- API routes return `401 Unauthorized` for unauthenticated requests
- Page routes redirect to `/login`

---

## File Structure

```
src/
  app/
    page.tsx              # Main app (all 5 surfaces, ~1840 lines)
    layout.tsx            # Root layout (fonts, theme flash prevention, SW registration)
    globals.css           # Design system (CSS variables, themes, animations, textures)
    manifest.ts           # PWA manifest (standalone, icons, theme)
    login/
      page.tsx            # Login page
    api/
      state/
        route.ts          # GET/POST state sync endpoint
      auth/
        route.ts          # POST login / DELETE logout
  lib/
    notion.ts             # Notion state storage (load/save app state as JSON)
    auth.ts               # HMAC session tokens, password verification
  middleware.ts           # Auth gate for all routes (Edge Runtime)
public/
  sw.js                   # Service worker (offline caching)
  icon-192.png            # PWA icon
  icon-512.png            # PWA icon
  apple-touch-icon.png    # iOS icon
```

---

## Data Model

```typescript
Step {
  id, text, done, areaId, cost?, note?, link?,
  estTime?, priority (0=backlog, 1=next, 2=now),
  completedAt?, createdAt, order, planId?, phaseId?
}

Area { id, name, icon, color }

Habit {
  id, name, icon, color, streak, bestStreak,
  history: Record<date, boolean>
}

Plan {
  id, title, subtitle?, icon, color, areaId,
  play?, targetDate?, createdAt,
  phases: Phase[]
}

Phase { id, title, description?, steps: Step[], expanded }

JournalEntry {
  id, date, title?, body,
  mood?: Clear | Energized | Neutral | Scattered | Low,
  type?: Diary | Reflection | Note | Counterfactual
}

WeeklyTarget { id, text, weekOf, hit }
```

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `NOTION_TOKEN` | Notion internal integration token |
| `NOTION_ITEMS_DB` | Notion Items database ID (stores app state) |
| `NOTION_JOURNAL_DB` | Notion Journal database ID (reserved) |
| `NOTION_HABITS_DB` | Notion Habits database ID (reserved) |
| `NOTION_HABIT_LOG_DB` | Notion Habit Log database ID (reserved) |
| `AUTH_SECRET` | HMAC signing key for session tokens (64-char hex) |
| `AUTH_PASSWORD` | Login password |

---

## Development

```bash
npm install
npm run dev         # http://localhost:3000
npm run build       # Production build
npm run start       # Serve production build
```

## Deployment

Hosted on Vercel. Deploy with:

```bash
npx vercel --prod
```

All environment variables must be set in the Vercel project settings (production + development).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.4 (App Router, Turbopack) |
| UI | React 19.2 + Framer Motion 12 |
| Styling | Tailwind CSS v4 + CSS custom properties |
| Icons | Lucide React |
| Fonts | Fraunces, Inter, JetBrains Mono (Google Fonts) |
| Database | Notion API via @notionhq/client v5.20 |
| Auth | HMAC-SHA256 signed cookies + Edge middleware |
| Offline | Service Worker + localStorage sync queue |
| Hosting | Vercel (serverless) |
| PWA | Web App Manifest + Service Worker |
