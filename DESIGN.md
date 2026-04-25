# Field Notebook — Design Specification

> A personal command center for an operator's life. Not a productivity tool. A place to think.

This document is the source of truth for the visual and interaction design of Life OS. Read it once before writing any code. If you find yourself violating it, stop and re-read the relevant section — the rule almost certainly exists because we already tried the other thing.

---

## I. Manifesto

We are not making a productivity app. We are making a notebook.

The product the user already opens twenty times a day is paper — a Moleskine, a Field Notes, a margin in a book. Our job is to be the digital version of that, not the digital version of Asana. That's the entire conceptual frame.

A notebook is private. It is warm. It is forgiving. It is sparse where the writer is sparse, dense where they want it dense. It carries no pressure of unread counts. It does not optimize you. It records you, it prompts you, and it gets out of the way.

Five non-negotiables follow from this:

**One. The screen answers "what now?" before anything else.** One task gets the visual weight on the home screen. Not three. Not a list. One. Everything else is context. We will fight every instinct to "show more above the fold" — that's a productivity-tool reflex, not a notebook one.

**Two. Empty space is the loudest signal we have.** A screen with three things on it tells you exactly what matters. A screen with thirty tells you nothing. Negative space is not the absence of design — it is the design.

**Three. Color encodes meaning, not feeling.** Area gets a color. Priority gets a color. Done gets a color. That is the entire color budget. No decorative accents. No gradient flourishes. No "let's pop this with a tint."

**Four. Motion is causal, never decorative.** Things move because they're explaining where they came from or where they went. A check ticks because we want the user to feel the commitment of the act. A card slides in because it's emerging from a place. Motion is grammar — without it the sentence is unclear.

**Five. The hand is in the work.** A hand-drawn check, an italic serif greeting, warm ink rather than pure black, a slight asymmetric rhythm. Perfection reads as corporate; near-perfect reads as *made*. The smudges are deliberate.

Every spec below either serves these five constraints or it does not exist.

---

## II. Information architecture

The whole app is five surfaces. Do not add a sixth without removing one.

| Surface | What it answers |
|---|---|
| **Now** | What should I do right now, and how am I doing today? |
| **Plans** | What journeys am I on? Where am I in each? |
| **Habits** | Did I show up today? |
| **Journal** | What's in my head? |
| **Review** | What happened this week? What did I learn? |

Two things sit on every surface: the **capture bar** (sticky at the bottom — input + mic + send) and the **bottom tabs**. Above them, the surface breathes its own content.

**Areas** (PolicyRadar, InnoMatic, HelloFresh, Personal, Driving, Health, Finance) are *categorical filters*, not surfaces. Tap an area pill and the current surface reshapes itself to that area. Areas have colors. Surfaces don't.

**Plans vs flat tasks.** A "step" can live two ways: loose (lives in Inbox until triaged, or directly in an Area), or attached to a Plan (lives in a phase of a journey). Both shapes exist; the same `Step` type carries both. A Plan is just a step container with phases, a strategy paragraph, and a target date.

---

## III. Foundations

### III.1 Typography

We use three families in deliberate roles. Each does exactly one thing.

```css
--font-serif: "Fraunces", "Iowan Old Style", Georgia, serif;
--font-sans:  "Inter", system-ui, -apple-system, sans-serif;
--font-mono:  "JetBrains Mono", "SFMono-Regular", ui-monospace, monospace;
```

**Fraunces (serif)** carries the *human* moments. The greeting. The task title in the Right Now block. The dream. The journal entry. The plan title. Anything where a *person* is speaking. Fraunces has a soul; Inter does not. We are not afraid of italics — italic Fraunces is the quietest, most personal voice in the system. Reach for it on prompts ("What worked this week?") and reflective lines.

**Inter (sans)** carries the *work*. Step titles in lists. Buttons. Body text in drawers. Anywhere we need clarity without personality.

**JetBrains Mono** carries the *data*. Counts, costs, dates, percentages, area labels in uppercase, "DAY 12", "67%", "€450". Mono has implicit weight — it says "this is a fact." Always uppercase with `letter-spacing: 0.2em` for category labels. Never use it for full sentences.

#### Type scale

| Role | Family | Size | Weight | Line | Letter |
|---|---|---|---|---|---|
| Display (greeting) | Fraunces | 36px / 32px* | 600 | 1.05 | -0.02em |
| Page title | Fraunces | 30px | 600 | 1.05 | -0.02em |
| Section title | Fraunces | 22px | 600 | 1.1 | -0.01em |
| Right-now task | Fraunces | 22px | 600 | 1.15 | -0.01em |
| Card title | Fraunces | 17px | 500 | 1.2 | normal |
| Italic prompt | Fraunces italic | 16px | 400 | 1.5 | normal |
| Body | Inter | 14px | 400 | 1.5 | normal |
| Step title | Inter | 14px | 400 | 1.4 | normal |
| Compact | Inter | 13px | 400 | 1.4 | normal |
| Stat number | Mono | 24px | 600 | 1 | -0.02em |
| Stat label | Mono uppercase | 10px | 500 | 1 | 0.25em |
| Pill / chip | Mono | 11px | 500 | 1 | 0.05em |
| Caption | Mono | 9–10px | 400 | 1 | 0.2em |

*36px on desktop, 32px on mobile (≤lg).

**Two weights only.** 400 regular and 600 semibold. We do not use 700 — it reads heavy against the warm-ink background. We do not use 500 except on the rarest UI label. Bold is for headings and pure data, never for emphasis in body.

**Sentence case everywhere.** Never Title Case. Never ALL CAPS *except* for mono labels with strong letter-spacing where it's a typographic device, not shouting.

**Italics carry warmth.** `<em>` is reserved for human moments. The greeting subtitle, the journal prompt, the empty-state line. Never italicize for emphasis in functional text.

### III.2 Color

The full system. Every color has a job. There are no decorative tones.

```css
:root[data-theme="dark"] {
  /* Warm ink — never pure black */
  --bg: #0b0908;
  --bg-2: #120f0d;
  --surface: #1a1614;
  --surface-2: #221d1a;
  --surface-3: #2a2422;
  --border: #2a2422;
  --border-subtle: #1a1614;
  --overlay: rgba(11, 9, 8, 0.75);

  /* Text — five steps, used precisely */
  --text:    #f7f4f0;  /* primary — body, titles */
  --text-2:  #c4bdb5;  /* secondary — italic prompts, sub-titles */
  --text-3:  #857d75;  /* dim — meta, captions */
  --text-4:  #5a534c;  /* muted — placeholders, inactive */
  --text-5:  #3d3832;  /* nearly invisible — long-tail labels */

  /* Accents — saturated but not neon */
  --amber:   #f5a623;  /* default action, focus, "next" */
  --amber-2: #d48a0f;
  --emerald: #3dd68c;  /* completion, success, "today done" */
  --emerald-2: #0f9d5f;
  --sky:     #3dafff;  /* informational, neutral category */
  --sky-2:   #1e7fcc;
  --rose:    #ff6b7a;  /* P1 / urgent / now */
  --rose-2:  #d13d50;
  --violet:  #b19cff;  /* personal / introspective */
  --violet-2: #7d5fff;
  --coral:   #ff8c5a;  /* streak fire */
}

:root[data-theme="light"] {
  --bg: #faf7f2;
  --bg-2: #f1ece4;
  --surface: #ffffff;
  --surface-2: #f5f0e8;
  --surface-3: #ebe4d9;
  --border: #e5dfd3;
  --border-subtle: #f0eadf;
  --overlay: rgba(250, 247, 242, 0.75);

  --text:    #1a1411;
  --text-2:  #4a423a;
  --text-3:  #7a716a;
  --text-4:  #a39a90;
  --text-5:  #c4bdb5;

  /* Accents stay perceptually similar; tweak luminance only */
  --amber:   #c97b00;
  --amber-2: #9a5d00;
  --emerald: #2a9d65;
  --emerald-2: #167044;
  --sky:     #2280bf;
  --sky-2:   #15568b;
  --rose:    #d83a4d;
  --rose-2:  #9d2030;
  --violet:  #7d5fd1;
  --violet-2: #5a3ca0;
  --coral:   #d65a25;
}
```

**Rules of color use.**

The background is *warm*. `#0b0908` is the foundation; nothing is darker. Pure `#000` is forbidden — it reads cold and digital. The light theme equivalent (`#faf7f2`) is paper, not white.

**Areas own their color.** PolicyRadar = amber. Driving = amber. Career = sky. Health = emerald. Personal = rose. Finance = violet. Each area's color appears in: the area pill, the small dot before the area name, the tint behind a Right Now task that belongs to that area, and the radial progress ring on its plan. Nowhere else.

**Priority owns rose and amber.** P1 (now) = rose. P2 (next) = amber. P0 (backlog) = no color, just text. The left-edge stripe on a step row is the only place priority manifests visually outside of section headers.

**Done is emerald, always.** Streak dots, ticked checkboxes, "today complete" rings — emerald. There is no other "success" green.

**Stat-card numbers are the area color.** The "spent so far" number on the Driving plan is amber, because Driving is amber. This is the only place we tint a number.

**No gradients, except two.** (1) The very subtle ambient glow on the page background (already in `globals.css` — radial amber from top, radial violet from bottom-left, both ≤8% opacity). (2) The "fade" on the capture bar where it sits on top of content — `from-bg via-bg/95 to-transparent`, used to cover the scroll edge. Anywhere else, gradients are forbidden.

**Text-on-color rule.** When text sits on a tinted background (a colored pill, a tint card), the text uses the *same hue but darker*. An amber pill has amber-2 text, never gray, never white. This rule alone separates an amateur palette from a coherent one.

### III.3 Spacing and rhythm

We use a **4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 56** scale. No 6, no 10, no 14, no 18. The friction of these constraints produces visual rhythm.

**Touch targets are 44px minimum** anywhere a finger lands. The interior icon can be 14–22px; the button itself is 44.

**Outer page padding** is 16px on mobile, 24–32px on desktop. The content stack lives inside `max-w-xl` (576px) on mobile single-column, and a 1400px desktop frame with a 320px right rail.

**Vertical rhythm.** Section gap = 24px. Item gap inside a section = 8px. Major surface gap = 32px. Header to content = 32px. Capture-bar fade = 96px tall.

**Border radius.** 8px on inputs and small chips. 12px on buttons. 16–18px on cards. 24px on bottom sheets and modals. Never a perfect pill except for `rounded-full` priority dots and the streak history dots.

### III.4 Motion

Motion is grammar. Use it to explain causality, not to perform.

**Easing.** Use exactly one curve everywhere except instant transitions: `cubic-bezier(0.16, 1, 0.3, 1)`. This is "ease-out-quart" — fast start, soft landing. It feels like a paper page falling onto a desk. Avoid `ease`, `ease-in-out`, springs (except for sheet entrances).

**Durations.**

| What | Duration |
|---|---|
| Hover color change | 150ms |
| Button press scale | 100ms |
| Item enter (stagger) | 300–400ms, stagger 60–80ms |
| Sheet open | 350ms (spring damping 30, stiffness 300) |
| Page transition | 250ms opacity |
| Check tick draw | 350ms |
| Ring pulse on completion | 700ms |
| Number animate | 900ms |
| Progress bar fill | 800ms |

**Things that move on this app.**

A check tick *draws* (SVG path animation). A completed step *pulses* a ring outward and fades. A new step *slides in* from below. A removed step *slides out* to the left. A page transition is *only* opacity — no slide, no scale. A sheet *springs* up from the bottom. Numbers *count* to their value. Progress bars *fill* on mount.

Things that do not move: hovers (color change is fine, no scale), idle UI, anything decorative. If a thing moves and you can't articulate the causal story, delete the motion.

### III.5 Iconography

Lucide React is the family. Stroke 1.5–1.8 for inactive, 2 for active states. Sizes: 12 (caption), 14 (in-text), 16 (chip / button), 18 (button standalone), 20–22 (checkbox / hero), 36+ (empty-state illustration).

Never two icon families on the same surface. Never a filled icon next to a stroked one.

The check is special. We do not use Lucide's `Check` for completed steps — we use a hand-drawn SVG path that *animates the stroke* (`stroke-dasharray` keyframe). This is the deliberate hand-feel; it appears only on the primary check action.

```tsx
// The signature check — used for completed steps only
function CheckMark({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none" className="draw-check">
      <circle cx="13" cy="13" r="12" stroke={color} strokeWidth="1.5" fill={`${color}18`} />
      <path d="M7.5 13.5 L11.5 17 L18.5 9.5"
            stroke={color} strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
```

```css
@keyframes draw-check { to { stroke-dashoffset: 0; } }
.draw-check path {
  stroke-dasharray: 20;
  stroke-dashoffset: 20;
  animation: draw-check 0.35s cubic-bezier(0.65, 0, 0.35, 1) forwards;
}
```

### III.6 Texture

A 3.5%-opacity SVG noise overlay covers the entire page. This is non-negotiable — it's the difference between "digital surface" and "paper." The noise is in `globals.css` already; never disable it.

A subtle ambient glow sits behind the content (radial amber top, radial violet bottom-left, ≤8% opacity). This anchors the page emotionally without competing with content.

---

## IV. Components

This section is the implementation reference. Every component below is what gets built. Code blocks are paste-ready Tailwind + Framer Motion + Lucide.

### IV.1 The header

The first thing on every page. Two lines. No ornament.

```tsx
function Header({ doneToday }: { doneToday: number }) {
  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 5 ? "Late night" :
    hour < 12 ? "Good morning" :
    hour < 18 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en", {
    weekday: "long", month: "long", day: "numeric"
  });

  return (
    <header className="mb-8">
      <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[var(--text-4)] mb-2">
        {dateStr}
      </p>
      <h1 className="font-serif text-[32px] lg:text-[36px] leading-[1.05] font-semibold tracking-tight">
        {greeting}, <span className="italic text-[var(--text-2)]">Owais</span>.
      </h1>
      {doneToday > 0 && (
        <p className="font-serif italic text-[15px] text-[var(--text-3)] mt-2">
          {doneToday} step{doneToday > 1 ? "s" : ""} closer today.
        </p>
      )}
    </header>
  );
}
```

The italic name is the signature move. It's not "Hi Owais" — it's "Good morning, *Owais*." That italic carries the warmth.

The subtitle line *only appears when there's something to say*. If `doneToday === 0`, the line vanishes — we don't fill the slot with a fallback. Nothingness is information.

### IV.2 The Right Now block — the most important component in the app

This is the single answer to "what should I do right now?". It must dominate the home screen visually. Nothing else on the screen comes close in weight.

```tsx
function RightNowBlock({ task, area, onOpen, onTick }: {
  task: Step; area: Area;
  onOpen: () => void; onTick: () => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileTap={{ scale: 0.985 }}
      onClick={onOpen}
      className="w-full text-left rounded-2xl p-5 relative overflow-hidden group"
      style={{
        background: `linear-gradient(145deg, ${area.color}12 0%, var(--surface) 60%)`,
        border: `1px solid ${area.color}20`,
      }}
    >
      {/* Hover glow — appears only on hover, never idle */}
      <div
        className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-0
                   group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{ backgroundColor: area.color, transform: "translate(30%, -30%)" }}
      />

      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-1.5 h-1.5 rounded-full breathe"
            style={{ backgroundColor: area.color, boxShadow: `0 0 8px ${area.color}` }}
          />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em]"
                style={{ color: area.color }}>
            Right now
          </span>
        </div>

        <p className="font-serif text-[22px] leading-[1.15] font-semibold tracking-tight pr-4">
          {task.text}
        </p>

        {task.note && (
          <p className="text-[13px] text-[var(--text-3)] mt-2 leading-relaxed">
            {task.note}
          </p>
        )}

        <div className="flex items-center gap-3 mt-5">
          <span
            className="text-[11px] font-mono px-2.5 py-1 rounded-full"
            style={{
              color: area.color,
              backgroundColor: `${area.color}10`,
              border: `1px solid ${area.color}20`,
            }}
          >
            {area.name}
          </span>
          {task.cost && (
            <span className="text-[11px] font-mono ml-auto" style={{ color: area.color }}>
              {task.cost}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}
```

**Specs that matter.**

The colored dot pulses with `.breathe` animation (`opacity 0.4 → 0.8 → 0.4` over 2.5s). This is the only idle-animated element on the home screen. It signals "this thing is alive and waiting for you."

The card's background is a *diagonal* gradient from the area color (12% opacity) to the surface — never a flat tint. The gradient direction (145°) gives the card a slight rake, like light hitting paper.

The hero text is **22px Fraunces 600**. This is heavy on a phone screen. It is meant to be heavy. This is the answer.

The hover glow lives in a separately-positioned div blurred to 24px, opacity 0 by default, opacity 1 on group-hover. It travels off-card by 30% — only the "spillover" is visible. This is craft.

### IV.3 The capture bar

Sticky bottom on every surface. Always available. The single point of input for the whole app.

```tsx
function CaptureBar({
  areas, onAdd, onJournal, onVoice, defaultAreaId
}: {
  areas: Area[];
  onAdd: (text: string, areaId: string | null, priority: number) => void;
  onJournal: () => void;
  onVoice: () => void;
  defaultAreaId?: string;
}) {
  const [text, setText] = useState("");
  const [areaId, setAreaId] = useState<string | null>(defaultAreaId ?? null);
  const [showPicker, setShowPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    if (!text.trim()) return;
    let priority = 0;
    let clean = text.trim();
    if (clean.startsWith("!!")) { priority = 2; clean = clean.slice(2).trim(); }
    else if (clean.startsWith("!")) { priority = 1; clean = clean.slice(1).trim(); }
    onAdd(clean, areaId, priority);
    setText("");
    inputRef.current?.focus();
  };

  const selectedArea = areas.find(a => a.id === areaId);

  return (
    <div className="relative">
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl
                      bg-[var(--surface)] border border-[var(--border)]
                      focus-within:border-[var(--text-4)] transition-colors
                      shadow-[0_8px_24px_-8px_rgba(0,0,0,0.4)]">

        {/* Area pill — null = Inbox */}
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-mono
                     transition-all active:scale-95"
          style={{
            color: selectedArea?.color ?? "var(--text-3)",
            backgroundColor: selectedArea ? `${selectedArea.color}10` : "var(--surface-2)",
            border: `1px solid ${selectedArea ? `${selectedArea.color}20` : "var(--border)"}`,
          }}
        >
          {selectedArea?.name ?? "Inbox"}
        </button>

        <input
          ref={inputRef} type="text" value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") submit();
            if (e.key === "Escape") inputRef.current?.blur();
          }}
          placeholder="Add anything…  ! = next  !! = now"
          className="flex-1 bg-transparent text-[14px] text-[var(--text)]
                     outline-none placeholder:text-[var(--text-5)]"
        />

        {/* Mic — voice input */}
        <button
          onClick={onVoice}
          className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center
                     text-[var(--text-3)] hover:text-[var(--text)] transition-colors"
          aria-label="Voice input"
        >
          <Mic size={15} strokeWidth={1.8} />
        </button>

        {/* Journal — long-form capture */}
        <button
          onClick={onJournal}
          className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center
                     text-[var(--text-3)] hover:text-[var(--text)] transition-colors"
          aria-label="Open journal"
        >
          <BookOpen size={15} strokeWidth={1.8} />
        </button>

        {/* Send */}
        <button
          onClick={submit} disabled={!text.trim()}
          className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center
                     transition-all disabled:opacity-20 active:scale-90"
          style={{
            backgroundColor: text.trim() ? "var(--amber)" : "var(--surface-2)",
            color: text.trim() ? "#0b0908" : "var(--text-4)",
          }}
          aria-label="Add"
        >
          <Send size={14} strokeWidth={2.5} />
        </button>
      </div>

      {/* Area picker popover */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 right-0 mb-2 p-2
                       rounded-2xl bg-[var(--surface)] border border-[var(--border)]
                       shadow-2xl z-50"
          >
            <button
              onClick={() => { setAreaId(null); setShowPicker(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg
                         hover:bg-[var(--surface-2)] transition-colors"
            >
              <Inbox size={13} className="text-[var(--text-3)]" />
              <span className="text-[13px]">Inbox <span className="text-[var(--text-4)]">(triage later)</span></span>
            </button>
            <div className="h-px bg-[var(--border)] my-1" />
            {areas.map(a => (
              <button
                key={a.id}
                onClick={() => { setAreaId(a.id); setShowPicker(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg
                           hover:bg-[var(--surface-2)] transition-colors"
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: a.color }} />
                <span className="text-[13px]">{a.name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

**Specs that matter.**

Default destination is **Inbox**, not a forced area. This is the single most important change. People dump captures *before* they know where they belong. Forcing them to triage at capture time creates friction and they stop capturing.

Three buttons after the input: **mic, journal, send.** In that order. Mic is leftmost of the three because voice is the fastest path. Journal is in the middle because it's an alternate input mode (long-form). Send is rightmost in amber — the affordance for the primary action.

`!` and `!!` prefix priority is taught in the placeholder. Don't add UI for it — let the text language do the work.

The bar has a **subtle drop shadow** (`0_8px_24px_-8px`) — this is the *only* shadow in the entire app. The shadow is what makes it read as "floating above content." Without it, the capture bar looks pasted in.

A **fade gradient** (`from-bg via-bg/95 to-transparent`) sits behind the bar, 96px tall, so content scrolling underneath gracefully fades out instead of cutting at the bar's edge.

### IV.4 Step row (the workhorse)

Lists of these everywhere. They are dense. They do not pretend to be cards.

```tsx
function StepRow({ step, area, onToggle, onEdit, compact }: {
  step: Step; area?: Area;
  onToggle: () => void; onEdit: () => void; compact?: boolean;
}) {
  const [burst, setBurst] = useState(false);
  const handleToggle = () => {
    if (!step.done) { setBurst(true); setTimeout(() => setBurst(false), 700); }
    onToggle();
  };

  // Priority left-stripe
  const stripe =
    step.priority === 2 ? "border-l-[var(--rose)]" :
    step.priority === 1 ? "border-l-[var(--amber)]" : "border-l-transparent";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.2 }}
      onClick={onEdit}
      className={`group flex items-start gap-3 px-3 py-2.5 rounded-xl
                  border-l-[3px] ${stripe} transition-all cursor-pointer
                  hover:bg-[var(--surface-2)] active:bg-[var(--surface-3)]
                  ${step.done ? "opacity-45" : ""}`}
    >
      <button
        onClick={(e) => { e.stopPropagation(); handleToggle(); }}
        className="relative flex-shrink-0 mt-0.5 active:scale-90 transition-transform"
        aria-label={step.done ? "Mark incomplete" : "Mark complete"}
      >
        {burst && (
          <div className="absolute inset-0 rounded-full ring-pulse"
               style={{ border: `2px solid ${area?.color ?? "var(--amber)"}` }} />
        )}
        {step.done
          ? <CheckMark color={area?.color ?? "var(--amber)"} size={compact ? 20 : 22} />
          : <Circle size={compact ? 20 : 22} strokeWidth={1.5}
                    className="text-[var(--text-4)] group-hover:text-[var(--text-3)] transition-colors" />
        }
      </button>

      <div className="flex-1 min-w-0">
        <p className={`${compact ? "text-[13px]" : "text-[14px]"} leading-snug transition-all
                       ${step.done ? "line-through text-[var(--text-4)]" : "text-[var(--text)]"}`}>
          {step.text}
        </p>

        <div className="flex flex-wrap items-center gap-1.5 mt-1">
          {area && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md"
              style={{
                color: area.color,
                backgroundColor: `${area.color}12`,
                border: `1px solid ${area.color}18`,
              }}>
              {area.name}
            </span>
          )}
          {step.cost && (
            <span className="text-[9px] font-mono text-[var(--text-3)] px-1.5 py-0.5
                             rounded-md bg-[var(--surface-2)]">
              {step.cost}
            </span>
          )}
          {step.estTime && (
            <span className="text-[9px] font-mono text-[var(--text-4)] flex items-center gap-0.5">
              <Clock size={8} /> {step.estTime}
            </span>
          )}
          {step.link && (
            <a href={step.link} target="_blank" rel="noopener noreferrer"
               onClick={e => e.stopPropagation()}
               className="text-[9px] font-mono text-[var(--text-3)] flex items-center gap-0.5
                          hover:text-[var(--text)] transition-colors">
              <ExternalLink size={8} /> link
            </a>
          )}
        </div>

        {step.note && !step.done && !compact && (
          <p className="text-[11px] text-[var(--text-4)] mt-1 leading-relaxed line-clamp-1">
            {step.note}
          </p>
        )}
      </div>

      {step.priority === 2 && !step.done && (
        <span className="flex-shrink-0 text-[8px] font-mono font-bold uppercase tracking-wider
                         text-[var(--rose)] mt-1">Now</span>
      )}
      {step.priority === 1 && !step.done && (
        <span className="flex-shrink-0 text-[8px] font-mono font-bold uppercase tracking-wider
                         text-[var(--amber)] mt-1">Next</span>
      )}
    </motion.div>
  );
}
```

**Specs that matter.**

The 3px **left stripe** is the only chrome on the row. No card border, no full background. The stripe carries priority. When priority = 0, the stripe is transparent — but the 3px gutter is still present, so rows align identically regardless of priority.

The **ring pulse** on completion is the moment of release. A 2px ring expands from 1× to 2.2× and fades to 0 over 700ms. This is the user's reward for the act. Make sure it works — without it the tap feels like it goes nowhere.

The metadata row (area pill, cost, time, link) wraps. It uses `gap-1.5` for tight rhythm. Pills are 9px mono — small enough to scan past, present enough to inform.

A done step has **45% opacity**, not 100%, not strikethrough alone. Strikethrough alone says "deleted." 45% says "completed and quiet." Both apply.

### IV.5 Plan detail page

When an area has phases, tapping it opens this. A long-form, editorial page. The reading-mode for goals.

The page has five regions, top to bottom:

1. **Back link** — tiny mono uppercase, top-left. Disposable.
2. **Hero** — radial progress + plan title + animated percent.
3. **Stats strip** — Day N · X to go · €total — under a thin rule.
4. **The Play card** — strategy paragraph, lightning icon.
5. **Phase stack** — each phase with its own progress and steps.

```tsx
function PlanDetail({ plan, onBack, onUpdate }: {
  plan: Plan; onBack: () => void; onUpdate: (p: Plan) => void;
}) {
  const { done, total, pct } = getProgress(plan);
  const totalCost = getTotalCost(plan);
  const Ic = ICONS[plan.icon] ?? Target;
  const nextStep = plan.phases.flatMap(p => p.steps).find(s => !s.done);
  const daysActive = daysBetween(plan.createdAt, today()) + 1;
  const daysToTarget = plan.targetDate ? daysBetween(today(), plan.targetDate) : null;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="relative z-10 max-w-xl mx-auto w-full px-5 py-8 pb-32 min-h-screen"
    >
      <button onClick={onBack}
        className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.2em]
                   text-[var(--text-3)] mb-8 hover:text-[var(--text-2)] transition-colors">
        ← Back
      </button>

      {/* HERO */}
      <div className="mb-8 flex items-start gap-5">
        <div className="flex-shrink-0 relative">
          <RadialProgress value={pct} color={plan.color} size={96} stroke={5}>
            <Ic size={22} style={{ color: plan.color }} strokeWidth={1.8} />
          </RadialProgress>
          {/* Color halo behind ring */}
          <div className="absolute -inset-4 rounded-full blur-2xl -z-10 opacity-30"
               style={{ backgroundColor: plan.color }} />
        </div>
        <div className="flex-1 pt-1 min-w-0">
          {plan.subtitle && (
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] mb-1"
               style={{ color: plan.color }}>
              {plan.subtitle}
            </p>
          )}
          <h1 className="font-serif text-[30px] leading-[1.05] font-semibold tracking-tight">
            {plan.title}
          </h1>
          <div className="mt-3 flex items-baseline gap-2">
            <AnimatedPct value={pct} color={plan.color} />
            <span className="text-[12px] text-[var(--text-3)] font-mono">{done}/{total}</span>
          </div>
        </div>
      </div>

      {/* STATS STRIP */}
      <div className="flex items-center gap-5 text-[12px] font-mono text-[var(--text-3)]
                      border-t border-[var(--border)] pt-4 mb-8">
        <span className="flex items-center gap-1.5">
          <Calendar size={12} className="text-[var(--text-4)]" />
          Day <span className="text-[var(--text)] font-semibold">{daysActive}</span>
        </span>
        {daysToTarget !== null && daysToTarget > 0 && (
          <span className="flex items-center gap-1.5">
            <Target size={12} className="text-[var(--text-4)]" />
            <span className="text-[var(--text)] font-semibold">{daysToTarget}</span> to go
          </span>
        )}
        {totalCost && (
          <span className="flex items-center gap-1.5 ml-auto">
            <span style={{ color: plan.color }}>{totalCost}</span>
            <span className="text-[var(--text-4)]">total</span>
          </span>
        )}
      </div>

      {/* THE PLAY */}
      {plan.play && (
        <div className="rounded-2xl p-5 mb-8"
             style={{
               background: `linear-gradient(135deg, ${plan.color}0d 0%, transparent 60%)`,
               border: `1px solid ${plan.color}20`,
             }}>
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} style={{ color: plan.color }} />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em]"
                  style={{ color: plan.color }}>The Play</span>
          </div>
          <p className="font-serif text-[15px] leading-[1.6] text-[var(--text-2)]">
            {plan.play}
          </p>
        </div>
      )}

      {/* NEXT MOVE */}
      {nextStep && (
        <div className="rounded-2xl p-5 mb-8 relative overflow-hidden"
             style={{
               background: `linear-gradient(135deg, ${plan.color}10 0%, transparent 60%)`,
               border: `1px solid ${plan.color}20`,
             }}>
          <Flame size={36} className="absolute top-4 right-4 opacity-20"
                 style={{ color: plan.color }} />
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full breathe"
                 style={{ backgroundColor: plan.color, boxShadow: `0 0 8px ${plan.color}` }} />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em]"
                  style={{ color: plan.color }}>Your next move</span>
          </div>
          <p className="font-serif text-[18px] leading-snug text-[var(--text)] font-medium pr-10">
            {nextStep.text}
          </p>
          {nextStep.note && (
            <p className="text-[13px] text-[var(--text-3)] mt-1.5">{nextStep.note}</p>
          )}
        </div>
      )}

      {/* PHASES */}
      <div className="flex flex-col gap-3">
        {plan.phases.map((phase, i) => (
          <PhaseBlock key={phase.id} phase={phase} color={plan.color} index={i}
            isLocked={i > 0 && plan.phases[i-1].steps.some(s => !s.done)}
            onToggleStep={(stepId) => {/* update */}} />
        ))}
      </div>

      {/* CELEBRATION */}
      {pct === 1 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          className="mt-10 relative text-center py-12 rounded-3xl overflow-hidden"
          style={{ border: `1px solid ${plan.color}40`, backgroundColor: `${plan.color}08` }}
        >
          <div className="absolute inset-0"
               style={{ background: `radial-gradient(circle at 50% 50%, ${plan.color}20, transparent 60%)` }} />
          <div className="relative z-10">
            <Trophy size={48} className="mx-auto mb-4" style={{ color: plan.color }} />
            <p className="font-serif text-[26px] font-semibold italic mb-1">You did it.</p>
            <p className="text-[12px] text-[var(--text-3)] font-mono">
              {total} steps · {daysActive} days
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
```

**Specs that matter.**

The hero has a **blurred halo** behind the radial progress ring — `-inset-4` with `blur-2xl` at 30% opacity. This is what makes the progress ring look like it's *glowing through paper*. Without the halo, it looks pasted. Critical detail.

**Animated percent** (counts up to value over 900ms) appears next to the radial. Use `useMotionValue` + `useTransform` from Framer:

```tsx
function AnimatedPct({ value, color, size = "lg" }: { value: number; color: string; size?: "lg" | "sm" }) {
  const mv = useMotionValue(0);
  const display = useTransform(mv, v => `${Math.round(v)}`);
  useEffect(() => animate(mv, value * 100, { duration: 0.9, ease: [0.16, 1, 0.3, 1] }).stop, [value, mv]);
  const cls = size === "lg"
    ? "text-[32px] font-serif font-semibold"
    : "text-[20px] font-mono font-semibold";
  return (
    <span className="inline-flex items-baseline" style={{ color }}>
      <motion.span className={cls}>{display}</motion.span>
      <span className={size === "lg" ? "text-sm font-mono ml-0.5 opacity-70" : "text-xs font-mono ml-0.5 opacity-70"}>%</span>
    </span>
  );
}
```

**The Play** is a paragraph card. Background is a 13% diagonal tint of the area color. The icon + label sit in the area color. The body is `--text-2` Fraunces (not mono). This card is the *strategic reasoning* — it's what makes the plan feel intelligent, not just listed.

**Sequential locks.** Phase blocks display a small lock icon when the previous phase has incomplete steps. The lock is **visual only** — the phase is still tappable. Locks set expectation, they don't enforce.

**Completion** is a celebration block at the bottom. Trophy icon, "You did it." in italic Fraunces. Date stamp in mono. This appears only when `pct === 1`. Make it feel earned.

### IV.6 Phase block

Inside a Plan, each phase is its own collapsible card with its own progress.

```tsx
function PhaseBlock({ phase, color, index, isLocked, onToggleStep, onToggleExpand }: {
  phase: Phase; color: string; index: number; isLocked: boolean;
  onToggleStep: (id: string) => void; onToggleExpand: () => void;
}) {
  const done = phase.steps.filter(s => s.done).length;
  const total = phase.steps.length;
  const pct = total > 0 ? done / total : 0;
  const complete = pct === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border overflow-hidden transition-colors duration-500"
      style={{
        borderColor: complete ? `${color}25` : "var(--border)",
        backgroundColor: complete ? `${color}06` : "var(--surface)",
      }}
    >
      <button onClick={onToggleExpand} className="w-full text-left flex items-center gap-4 p-4">
        <RadialProgress value={pct} color={color} size={36} stroke={3}>
          {complete
            ? <Trophy size={14} style={{ color }} />
            : <span className="text-[10px] font-mono font-semibold"
                    style={{ color: pct > 0 ? color : "var(--text-4)" }}>
                {index + 1}
              </span>
          }
        </RadialProgress>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <h3 className={`font-serif text-[16px] font-medium leading-tight
                            ${complete ? "text-[var(--text-3)]" : ""}`}>
              {phase.title}
            </h3>
            <span className="text-[10px] font-mono"
                  style={{ color: complete ? color : "var(--text-4)" }}>
              {done}/{total}
            </span>
            {isLocked && <Lock size={11} className="text-[var(--text-4)] ml-auto" />}
          </div>
          {phase.description && !phase.expanded && (
            <p className="text-[12px] text-[var(--text-3)] mt-0.5 truncate">
              {phase.description}
            </p>
          )}
        </div>
        <motion.div animate={{ rotate: phase.expanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown size={16} className="text-[var(--text-4)]" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {phase.expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 flex flex-col gap-1">
              {phase.steps.map(s => (
                <StepRow key={s.id} step={s} onToggle={() => onToggleStep(s.id)}
                         onEdit={() => {/* open edit drawer */}} compact />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
```

**Specs that matter.**

The phase number sits **inside the radial progress ring** when not complete. When complete, it becomes a small trophy. The transition is binary — when you tick the last step in a phase, the number → trophy swap should feel like an earned moment.

A **completed phase changes its border and tint** to the area color at low opacity. The visual shift signals "this section of the journey is done" without breaking the page rhythm.

When collapsed, phase descriptions show as a single truncated line. When expanded, they vanish — the steps below speak for themselves.

### IV.7 Streak grid (habits)

Two views: a **strip** for the home screen (one row per habit, 7-day dots, streak count) and a **full grid** for the Habits tab (one row per habit, 30-day cells, history).

```tsx
function HabitsStrip({ habits, onToggle }: { habits: Habit[]; onToggle: (id: string) => void }) {
  const today = todayStr();
  const days = getLast7Days();
  const doneCount = habits.filter(h => h.history[today] === true).length;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-4)]">
          Daily habits
        </p>
        <span className="text-[10px] font-mono"
              style={{ color: doneCount === habits.length ? "var(--emerald)" : "var(--text-3)" }}>
          {doneCount}/{habits.length}
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {habits.map(h => {
          const Ic = ICONS[h.icon] ?? Target;
          const done = h.history[today] === true;
          return (
            <div key={h.id} className="flex items-center gap-3">
              <button
                onClick={() => onToggle(h.id)}
                className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center
                           active:scale-90 transition-all"
                style={{
                  backgroundColor: done ? `${h.color}18` : "var(--surface-2)",
                  border: `1px solid ${done ? h.color : "var(--border)"}`,
                }}
                aria-label={`${done ? "Uncheck" : "Check"} ${h.name}`}
              >
                {done
                  ? <CheckCircle2 size={14} style={{ color: h.color }} strokeWidth={2} />
                  : <Ic size={12} style={{ color: "var(--text-4)" }} strokeWidth={1.8} />}
              </button>

              <span className={`text-[13px] flex-1 ${done ? "text-[var(--text-3)] line-through" : "text-[var(--text)]"}`}>
                {h.name}
              </span>

              {h.streak > 0 && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Flame size={10} style={{ color: h.color }} />
                  <span className="text-[10px] font-mono font-semibold" style={{ color: h.color }}>
                    {h.streak}
                  </span>
                </div>
              )}

              <div className="flex gap-0.5 flex-shrink-0">
                {days.map(d => (
                  <div key={d} className="w-[5px] h-[5px] rounded-full"
                       style={{ backgroundColor: h.history[d] ? h.color : "var(--surface-3)" }} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

**Specs that matter.**

The streak dots are **5px**. Tiny. Easy to read at a glance, easy to ignore. The full row is dense: button + name + flame+streak + 7 dots. Dense rows are fine here — habits are meant to be scanned, not lingered on.

The flame icon next to the streak count is the **only place we use coral/orange**. It's the universal symbol for "don't break the chain." Don't replace it.

A **dashed circle outline** is used for "today, not yet done" in the larger habit views (not in this strip). It's gentle nudge — present but not accusatory.

### IV.8 Journal entry

Long-form. Editorial. The most "writerly" surface in the app.

```tsx
function JournalEntry({ entry }: { entry: Journal }) {
  return (
    <article className="border-l-2 border-[var(--border)] pl-5 py-1 mb-8">
      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-4)] mb-2">
        {formatDate(entry.date)} · <span style={{ color: moodColor(entry.mood) }}>{entry.mood}</span>
      </p>
      {entry.title && (
        <h2 className="font-serif text-[20px] font-semibold leading-tight mb-2">
          {entry.title}
        </h2>
      )}
      <div className="font-serif text-[16px] leading-[1.7] text-[var(--text-2)] italic">
        {entry.body}
      </div>
      {entry.type && (
        <span className="inline-block mt-3 text-[10px] font-mono px-2 py-0.5 rounded-md
                         bg-[var(--surface-2)] text-[var(--text-3)]">
          {entry.type}
        </span>
      )}
    </article>
  );
}
```

**Specs that matter.**

The body is **italic Fraunces 16px with line-height 1.7**. This is the most generous line-height in the app. We are inviting reading. The italic makes it feel like a private voice.

The **left border** is 2px and the entry has 20px left padding. This is the visual signature of a journal entry — it's a quote, it's a margin note, it's *something pulled from somewhere else*. Don't put a card around it.

Mood color comes from a fixed palette: Clear → emerald, Energized → amber, Neutral → text-3, Scattered → violet, Low → rose. Always one of five.

### IV.9 Bottom tabs

Five tabs. Sticky bottom. The capture bar floats *above* the tab bar.

```tsx
function BottomTabs({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const tabs: { id: Tab; label: string; icon: LucideIcon }[] = [
    { id: "now",     label: "Now",     icon: Zap },
    { id: "plans",   label: "Plans",   icon: Compass },
    { id: "habits",  label: "Habits",  icon: Flame },
    { id: "journal", label: "Journal", icon: BookOpen },
    { id: "review",  label: "Review",  icon: TrendingUp },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 z-40">
      <div className="absolute inset-0 bg-[var(--bg)]/90 backdrop-blur-xl
                      border-t border-[var(--border-subtle)]" />
      <div className="relative max-w-xl mx-auto flex items-center justify-around
                      px-4 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {tabs.map(t => {
          const Icon = t.icon;
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl"
            >
              <div className="relative">
                <Icon size={19} strokeWidth={isActive ? 2.2 : 1.5}
                  style={{ color: isActive ? "var(--amber)" : "var(--text-4)" }}
                  className="transition-colors" />
                {isActive && (
                  <motion.div
                    layoutId="tab-dot"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ backgroundColor: "var(--amber)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </div>
              <span className="text-[9px] font-mono uppercase tracking-wider transition-colors"
                    style={{ color: isActive ? "var(--amber)" : "var(--text-5)" }}>
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

**Specs that matter.**

The active tab gets a **dot below the icon** that *travels* between tabs (Framer Motion `layoutId` does this for free). This is the single most polished motion in the chrome. It costs nothing and signals the entire app is alive.

Stroke weight changes from 1.5 to 2.2 on activation. Active is amber, inactive is `--text-4`. Label color shifts in lockstep.

The bar **respects bottom safe area** (`env(safe-area-inset-bottom)`) so it sits above the iPhone home indicator. Test on a real notched device.

The capture bar sits **above** the tab bar. There's a 12px gap between them. The capture bar is sticky, the tab bar is fixed. The fade gradient on the capture bar handles the visual transition between scrolling content and chrome.

### IV.10 Dreams banner

Bottom of the home screen. Almost invisible. Always present.

```tsx
function DreamsBanner({ dreams }: { dreams: string[] }) {
  return (
    <div className="text-center py-8 mt-12 border-t border-[var(--border-subtle)]">
      <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[var(--text-5)] mb-3">
        Why you started
      </p>
      <div className="font-serif italic text-[14px] text-[var(--text-4)] leading-[1.7] max-w-md mx-auto">
        {dreams.map((d, i) => (
          <span key={i}>
            {d}{i < dreams.length - 1 ? <br /> : null}
          </span>
        ))}
      </div>
    </div>
  );
}
```

**Specs that matter.**

The dreams are in **`--text-4`** — almost invisible. This is deliberate. A dream you read every day in big bold type becomes background; a dream you *barely see* but is always present is the thing that surfaces in your awareness when you need it.

The label "Why you started" is the only directly emotional copy in the chrome. It earns its place by being rare.

Position: bottom of the Now surface, after everything else, separated by a thin top border. Never above the fold. You earn the dream by scrolling for it.

### IV.11 Review screen (Sunday)

The most editorial surface. A weekly retrospective in five movements.

```tsx
function ReviewScreen({ data }: { data: WeekData }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="max-w-xl mx-auto px-5 py-8 pb-32"
    >
      <header className="mb-10">
        <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[var(--text-4)] mb-2">
          Week of {data.weekLabel}
        </p>
        <h1 className="font-serif text-[32px] leading-[1.05] font-semibold tracking-tight mb-3">
          A look back.
        </h1>
        <p className="font-serif italic text-[16px] text-[var(--text-3)] leading-[1.6]">
          What worked? What didn't? What's next week's one thing?
        </p>
      </header>

      {/* Movement 1 — by area */}
      <section className="mb-10">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-4)] mb-4">
          What got done
        </p>
        <div className="space-y-3">
          {data.byArea.map(a => (
            <div key={a.id} className="flex items-baseline gap-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: a.color }} />
              <span className="font-serif text-[16px] flex-1">{a.name}</span>
              <span className="font-mono text-[20px] font-semibold" style={{ color: a.color }}>
                {a.count}
              </span>
              <span className="text-[10px] font-mono text-[var(--text-4)]">steps</span>
            </div>
          ))}
        </div>
      </section>

      {/* Movement 2 — habits */}
      <section className="mb-10">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-4)] mb-4">
          Habits this week
        </p>
        <div className="space-y-2">
          {data.habits.map(h => (
            <div key={h.id} className="flex items-center gap-3">
              <span className="text-[14px] flex-1">{h.name}</span>
              <div className="flex gap-1">
                {h.days.map((done, i) => (
                  <div key={i} className="w-3 h-3 rounded"
                       style={{ backgroundColor: done ? h.color : "var(--surface-3)" }} />
                ))}
              </div>
              <span className="text-[10px] font-mono w-8 text-right"
                    style={{ color: h.held ? "var(--emerald)" : "var(--rose)" }}>
                {h.held ? "held" : "broke"}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Movement 3 — mood */}
      <section className="mb-10">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-4)] mb-4">
          How you felt
        </p>
        <div className="flex gap-1.5">
          {data.moodByDay.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full h-12 rounded-md"
                   style={{ backgroundColor: m ? moodColor(m) : "var(--surface-2)" }} />
              <span className="text-[9px] font-mono text-[var(--text-4)]">
                {weekdayInitial(i)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Movement 4 — the prompt */}
      <section className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6 mb-6">
        <p className="font-serif italic text-[18px] leading-[1.6] text-[var(--text-2)]">
          “If you could rerun this week with one thing changed, what would it be?”
        </p>
      </section>

      <button className="w-full py-3.5 rounded-xl text-[14px] font-semibold
                         bg-[var(--amber)] text-[#0b0908] active:scale-[0.98] transition-transform">
        Save reflection
      </button>
    </motion.div>
  );
}
```

**Specs that matter.**

The four movements (areas, habits, mood, prompt) read like a magazine spread. Each section has a 40px bottom margin. They are not cards — they are *passages*. The page wants to be read top-to-bottom.

The mood row is **seven 12px squares** — one per day, colored by mood. This is the most graphical element on the page; it does the heavy emotional lifting. A row of mostly-rose squares is a hard week, visible at a glance.

The prompt at the bottom is in italic Fraunces with smart quotes (`"…"`). Clicking "Save reflection" opens the journal modal pre-filled with `Type: Reflection`, `Mood: <today's>`, body empty. The week's data is appended in a markdown blockquote so the journal entry has context.

### IV.12 Edit drawer

Bottom sheet for editing any step. Quiet, dense, full-featured.

The existing implementation in `page.tsx` is solid — keep its shape. Two improvements:

1. Add a **link** field after the time-est input. Same input style. Display an external-link icon in the placeholder.
2. The save button should reflect a **dirty state**. Disabled gray when no changes; amber when changes pending; emerald flash for 200ms on save.

```tsx
// Inside EditDrawer, add to the form:
<div>
  <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-4)] mb-2">Link</p>
  <input type="url" value={link} onChange={e => setLink(e.target.value)}
    className="w-full bg-[var(--surface-2)] text-[13px] text-[var(--text)] outline-none
               px-3 py-2 rounded-lg border border-[var(--border)] placeholder:text-[var(--text-5)]"
    placeholder="https://…" />
</div>
```

---

## V. Screen layouts

### V.1 Now (home)

The most important surface. Desktop is mobile + a right rail.

**Vertical order, top to bottom:**

1. Header (greeting + date + "X done today" if > 0)
2. Filter pills (areas) — horizontally scrollable on mobile
3. Stats bar (today / total / streak) — single line of mono
4. **Right Now block** (the hero) — only shows if there's a P1 or first-priority step
5. Habits strip (the 4 most-tracked)
6. Step list grouped by priority (Now / Next / Backlog)
7. Inbox pulse (only if Inbox > 0)
8. Journal whisper (only if there's a recent entry)
9. Dreams banner

The whole thing scrolls under a sticky capture bar + tab bar.

**Desktop:** the Right Now block, capture bar, and step list live in a **center column (max 720px)**. The right rail (320px) holds habits, inbox pulse, and journal whisper. Dreams banner is below everything, full width.

### V.2 Plans

A grid of plan cards. Each card has a small radial progress, the plan title, area pill, and a one-line "next move" preview.

```tsx
function PlanCard({ plan, onOpen }: { plan: Plan; onOpen: () => void }) {
  const { done, total, pct } = getProgress(plan);
  const nextStep = plan.phases.flatMap(p => p.steps).find(s => !s.done);
  const Ic = ICONS[plan.icon] ?? Target;

  return (
    <button onClick={onOpen}
      className="text-left p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]
                 hover:bg-[var(--surface-2)] active:scale-[0.99] transition-all">
      <div className="flex items-start gap-4">
        <RadialProgress value={pct} color={plan.color} size={56} stroke={3.5}>
          <Ic size={18} style={{ color: plan.color }} strokeWidth={1.8} />
        </RadialProgress>
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-[17px] font-medium leading-tight truncate mb-1">
            {plan.title}
          </h3>
          <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--text-3)] mb-2">
            <span style={{ color: plan.color }}>{done}/{total}</span>
            <span className="text-[var(--text-5)]">·</span>
            <span>Day {daysActive(plan)}</span>
          </div>
          {nextStep && (
            <p className="text-[12px] text-[var(--text-3)] italic line-clamp-1">
              Next: {nextStep.text}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
```

Tapping the card opens the Plan Detail page (IV.5). On the Plans tab, plans render in a single-column list on mobile and a 2-column grid on desktop. **No FAB** — the capture bar handles creation through an "Add as plan" affordance.

### V.3 Habits, Journal, Review

Already covered in components above. Each is a single scrollable column.

---

## VI. Empty states

Empty states are the most under-designed surface in most apps. We design them with care.

**Now — no steps anywhere:**
> Sparkles icon, 32px, `--text-5`
> "Nothing on your plate." — Fraunces italic 18px `--text-3`
> "Capture something below." — body 13px `--text-4`

**Now — area filter active, no steps:**
> "All clear here." — Fraunces italic 16px `--text-3`

**Plans — no plans:**
> Compass icon
> "No journeys yet." — Fraunces italic 20px `--text-2`
> "Start one with the capture bar — type a goal and tap *plan it*." — body 13px `--text-3`

**Habits — none defined:**
> Flame icon
> "Pick a daily ritual." — Fraunces italic 18px

**Journal — empty:**
> Pen icon
> "Your first entry waits." — Fraunces italic 18px

**Review — first week:**
> "Come back Sunday." — Fraunces italic 18px
> "There's nothing to look back on yet." — body 13px `--text-3`

The pattern: **icon → italic Fraunces line → optional helper sentence**. Never use exclamation marks. Never sound cheery. The voice is calm, slightly literary.

---

## VII. Loading states

**Initial app load:** a single 4px ring spinning slowly (1.2s cycle), amber on transparent. No skeleton, no logo. The page is empty for 200–400ms — that's fine.

**Inline (fetching new data):** opacity drop to 0.6 on the affected region with no spinner. The data arrives, opacity returns. We trust the user's eye.

**Optimistic updates everywhere.** A tap on a checkbox should immediately show the check, the strikethrough, the dimming. The network round-trip happens in the background. If it fails, revert silently and show a tiny banner.

---

## VIII. Error states

We do not show error toasts unless an action *failed*. Network 404s on background fetches are silent. The user only sees an error when their direct action couldn't complete.

When we do show one: a thin banner slides in from the top, `--rose` accent, 13px sentence-case message, auto-dismiss after 4s. Never red flash. Never modal alerts.

```tsx
function ErrorBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -40, opacity: 0 }}
      className="fixed top-4 left-4 right-4 max-w-md mx-auto z-50 px-4 py-3 rounded-xl
                 bg-[var(--surface)] border border-[var(--rose)]/30
                 flex items-center gap-3"
    >
      <AlertCircle size={14} className="text-[var(--rose)] flex-shrink-0" />
      <span className="text-[13px] text-[var(--text-2)] flex-1">{message}</span>
      <button onClick={onDismiss} className="text-[var(--text-4)]"><X size={14} /></button>
    </motion.div>
  );
}
```

---

## IX. Microcopy guide

Every word is a design decision.

**Time greetings:** "Good morning" / "Good afternoon" / "Good evening" / "Late night." (Yes, "Late night" — for the 1am session. It says we know.)

**Daily summary:** "X steps closer today." (Not "X tasks completed." Not "Great job!" Closer is direction.)

**Empty states:** Italic Fraunces, sentence case, no exclamations. "Nothing on your plate." "All clear here." "Your first entry waits."

**Buttons:** Verbs only. "Save." "Confirm." "Open." Never "OK" or "Submit."

**Labels:** Mono uppercase with `letter-spacing: 0.2em`. "RIGHT NOW" not "Right Now". This is a typographic device, not shouting.

**The Play:** 1–3 sentences. Names the leverage. Plain language. The driving license example is the gold standard: "Jordan isn't on Anlage 11 → you need both exams, but zero mandatory hours. That's your cost lever."

**Journal prompts (used in Review):** Always italic Fraunces with smart quotes. Always a question. Always one question, never a list.

**Date formatting:** Always natural — "Saturday, April 25" not "04/25/2026". Mono uppercase: "SATURDAY · APRIL 25".

**Number formatting:** `Math.round` everything that displays. Never raw floats. Currency: "€450" not "€450.00" unless cents matter. Counts: bare integers in mono.

**Things we never write:**
- "Great job!", "Awesome!", "🎉" — sycophantic
- "Loading…", "Please wait" — say nothing
- "Are you sure?" — confirm-delete is a button label change, not a dialog
- "Welcome back!" — patronizing
- Emoji anywhere in chrome — never
- "AI-powered" — embarrassing

---

## X. Accessibility

The work is incomplete until this is done.

**Color contrast.** All body text meets WCAG AA (4.5:1) against its background. The dim tones (`--text-4`, `--text-5`) are *not* used for body — only for decorative labels and whisper text where the user does not need to read every word.

**Focus rings.** Every interactive element shows a 2px focus ring (`--text-3` or `--amber`) on keyboard focus. Never `outline: none` without a replacement.

**Aria labels.** Every icon-only button has `aria-label`. Toggles announce state.

**Keyboard.**
- `⌘K` / `Ctrl+K` — focus capture bar
- `Esc` — close any open sheet, drawer, or popover
- `J` / `K` — navigate steps in a list (next / previous)
- `X` — toggle done on the focused step
- `E` — open edit drawer for the focused step
- `1`–`5` — switch tabs

**Reduced motion.** `prefers-reduced-motion: reduce` disables all non-essential animation. The check tick still draws (it's the affordance). Page transitions become instant. Decorative motion (breathe, ring-pulse) is disabled.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Touch targets.** Minimum 44×44px. The smaller-looking icons (12–16px) sit inside larger button padding to meet this.

**Safe areas.** `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` respected on header and tab bar. Test on a notched device.

---

## XI. The 1% details

These are the things 99% of designers don't bother with. They are why the work feels different.

**The breathing dot.** The colored dot before "Right Now" pulses at 2.5s. Nothing else on the home screen idles. Your eye finds it without trying.

**The check that draws.** The completed check animates its stroke once, on first render. Then it sits. The animation says "this happened, it was an act."

**The ring pulse.** When you tap a circle to complete a step, a 2px ring expands and fades. Without it, the tap feels insubstantial. With it, the tap feels *committed*.

**The number that counts.** The percentage on the plan hero counts up to its value. The duration is 900ms — long enough to feel like *progress*, short enough to not annoy.

**The italic name.** "Good morning, *Owais*." The italic on the name is the most personal moment in the chrome.

**The travelling tab dot.** The active-tab indicator slides between tabs via Framer's `layoutId`. Free, but it makes the chrome feel alive.

**The diagonal gradient.** Every tinted card is a 145° gradient from accent-12% → surface, not a flat tint. The rake makes it look like light hitting paper.

**The hover halo.** Right Now block, plan card hero — when hovered, a 48px-blurred color halo blooms behind the card, partially clipped by the card's edge. Subtle, expensive, worth it.

**The 5px streak dots.** Big enough to read, small enough to not demand attention. The history is *there* but it is *quiet*.

**The grain overlay.** 3.5% opacity SVG noise across the whole page. The single most important detail in the entire system. Without it, "warm dark mode" reads as "designer dark mode." With it, it reads as paper.

**Warm ink, never black.** `#0b0908`, never `#000`. `#faf7f2`, never `#fff`. This single rule changes the emotional temperature of the app from "screen" to "page."

**The italic dream.** Dreams in `--text-4` italic Fraunces, almost invisible. You barely see them — and so you read them with your peripheral attention, which is exactly the attention dreams should get.

**The "Late night" greeting.** A small thing. But the 1am user reads "Late night" and feels seen.

**Smart quotes, always.** `"…"` not `"…"`. `'…'` not `'…'`. Use proper Unicode. This is the bar.

**Round every displayed number.** `Math.round`, `.toFixed(0)`, `Intl.NumberFormat`. JS float math leaks artifacts; never let `0.30000000000000004` reach a screen.

**No double scroll.** Sheets and modals scroll inside themselves. The page underneath does not scroll. Lock body scroll on open.

**Tap highlights off.** `-webkit-tap-highlight-color: transparent` globally. Replaced with proper active states.

---

## XII. Implementation order

When the AI builds this, build in this order. Each step ships a working app.

1. **Foundations.** `globals.css` with all CSS variables, theme toggle, grain overlay, ambient glow, all keyframes (`draw-check`, `breathe`, `ring-pulse`). Layout shell with `safe-top`/`safe-bottom`.
2. **Type system.** Confirm Fraunces / Inter / JetBrains Mono are loading. Build a typography page in `/dev` showing every type role rendered correctly.
3. **Capture bar.** Sticky bottom. Mic stub, journal stub, send works. Inbox is the default destination.
4. **Step row + sections.** "Now / Next / Backlog" priority groupings on the Now surface. Edit drawer. Add link field.
5. **Right Now block.** The hero. Every detail in IV.2. This is the moment the app starts to feel real.
6. **Bottom tabs.** All five. The travelling dot.
7. **Inbox tab.** Same step row, no area filtering — Inbox is steps with `areaId === null`. Triage button on each row to assign an area inline.
8. **Plans tab + Plan Detail page.** Phase block, the play card, next-move callout, completion celebration. This is the unlock.
9. **Habits strip + full Habits tab.**
10. **Journal modal + Journal tab.** Journal capture from the capture bar.
11. **Review tab.** All five movements. Mock data is fine for now.
12. **Dreams banner.** On the Now surface, last item, near-invisible.
13. **Empty states + loading + error banner.**
14. **Keyboard shortcuts + reduced motion + accessibility audit.**
15. **AI plan generation in the capture bar.** Long capture detected → "Plan it?" button. Claude generates phases. Preview, save.
16. **Voice transcription** (Web Speech API). Wire to mic button.
17. **Notion wiring.** Replace localStorage with the existing `life-command-center` API. Optimistic updates everywhere.

Each step leaves the app in a deployable state.

---

## XIII. The thing to remember

If you are about to add a feature and you cannot articulate which of the five non-negotiables it serves, do not ship it.

If a screen has more than three competing visual weights, you are designing a productivity app, not a notebook.

If you are reaching for `font-weight: 700`, a fourth color, a gradient, an emoji, or an exclamation mark, stop and ask what would happen if you didn't.

The goal is not "good design." The goal is *a place the user wants to come back to twenty times a day*. Everything in this document is in service of that, and only that.

— Field Notebook design system, v1
