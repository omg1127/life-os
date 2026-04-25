"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  motion, AnimatePresence, useMotionValue, useTransform,
  animate as fmAnimate,
} from "framer-motion";
import {
  Circle, Flame, Sparkles, Car, BookOpen, Code, Briefcase, Heart,
  Dumbbell, Home as HomeIcon, GraduationCap, Rocket, Target, Compass,
  TrendingUp, Zap, CheckCircle2, ChevronDown, Send, Trash2, Clock,
  Sun, Moon, ExternalLink, Mic, Inbox, PenLine, Plus, Lock, Trophy,
  Calendar,
  type LucideIcon,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════

type Tab = "now" | "plans" | "habits" | "journal" | "review";
type Mood = "Clear" | "Energized" | "Neutral" | "Scattered" | "Low";

interface Step {
  id: string;
  text: string;
  done: boolean;
  areaId: string | null;
  cost?: string;
  note?: string;
  link?: string;
  estTime?: string;
  priority: number;
  completedAt?: string;
  createdAt: string;
  order: number;
  planId?: string;
  phaseId?: string;
}

interface Area {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  streak: number;
  bestStreak: number;
  history: Record<string, boolean>;
}

interface Phase {
  id: string;
  title: string;
  description?: string;
  steps: Step[];
  expanded: boolean;
}

interface Plan {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  color: string;
  areaId: string;
  play?: string;
  targetDate?: string;
  createdAt: string;
  phases: Phase[];
}

interface JournalEntry {
  id: string;
  date: string;
  title?: string;
  body: string;
  mood?: Mood;
  type?: string;
}

interface WeeklyTarget {
  id: string;
  text: string;
  weekOf: string;
  hit: boolean;
}

// ═══════════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════════

const ICONS: Record<string, LucideIcon> = {
  car: Car, book: BookOpen, code: Code, briefcase: Briefcase,
  heart: Heart, dumbbell: Dumbbell, home: HomeIcon, graduation: GraduationCap,
  rocket: Rocket, target: Target, sparkles: Sparkles, compass: Compass,
  trending: TrendingUp, zap: Zap, flame: Flame, trophy: Trophy,
};

const MOOD_COLORS: Record<Mood, string> = {
  Clear: "var(--emerald)", Energized: "var(--amber)", Neutral: "var(--text-3)",
  Scattered: "var(--violet)", Low: "var(--rose)",
};

const MOOD_HEX: Record<Mood, string> = {
  Clear: "#3dd68c", Energized: "#f5a623", Neutral: "#857d75",
  Scattered: "#b19cff", Low: "#ff6b7a",
};

const SAMPLE_AREAS: Area[] = [
  { id: "driving", name: "Driving License", icon: "car", color: "#f5a623" },
  { id: "career", name: "Career", icon: "briefcase", color: "#3dafff" },
  { id: "health", name: "Health & Fitness", icon: "dumbbell", color: "#3dd68c" },
  { id: "personal", name: "Personal", icon: "heart", color: "#ff6b7a" },
  { id: "finance", name: "Finance", icon: "trending", color: "#b19cff" },
];

const SAMPLE_PLANS: Plan[] = [
  {
    id: "plan-driving", title: "German Driving License", subtitle: "Klasse B",
    icon: "car", color: "#f5a623", areaId: "driving",
    play: "Jordan isn't on Anlage 11 → you need both exams, but zero mandatory hours. That's your cost lever. Do theory fast, batch the special drives, and sit the practical before summer.",
    targetDate: "2026-09-01", createdAt: "2026-04-13",
    phases: [
      {
        id: "ph1", title: "Registration & documents", expanded: true,
        description: "Get all paperwork sorted before theory starts",
        steps: [
          { id: "ps1", text: "Research driving schools nearby", done: true, areaId: "driving", note: "Compare prices, Google reviews, English availability", priority: 0, completedAt: "2026-04-13", createdAt: "2026-04-13", order: 1, planId: "plan-driving", phaseId: "ph1" },
          { id: "ps2", text: "Register at a Fahrschule", done: true, areaId: "driving", cost: "€200–400", priority: 0, completedAt: "2026-04-16", createdAt: "2026-04-13", order: 2, planId: "plan-driving", phaseId: "ph1" },
          { id: "ps3", text: "Get biometric passport photos", done: true, areaId: "driving", cost: "€10–15", priority: 0, completedAt: "2026-04-19", createdAt: "2026-04-13", order: 3, planId: "plan-driving", phaseId: "ph1" },
          { id: "ps4", text: "Complete eye test (Sehtest)", done: false, areaId: "driving", cost: "€6.43", note: "Any optician — takes 5 minutes", estTime: "5 min", priority: 2, createdAt: "2026-04-13", order: 4, planId: "plan-driving", phaseId: "ph1" },
          { id: "ps5", text: "Take first aid course (Erste-Hilfe-Kurs)", done: false, areaId: "driving", cost: "€30–50", note: "Full day, 9 hours. Book online.", estTime: "9 hours", priority: 1, createdAt: "2026-04-13", order: 5, planId: "plan-driving", phaseId: "ph1" },
          { id: "ps6", text: "Submit Führerscheinantrag at Bürgeramt", done: false, areaId: "driving", cost: "€43", note: "Bring: photos, eye test, first aid cert, ID", priority: 0, createdAt: "2026-04-13", order: 6, planId: "plan-driving", phaseId: "ph1" },
        ],
      },
      {
        id: "ph2", title: "Theory", expanded: false,
        description: "14 lessons + practice app + pass the written exam",
        steps: [
          { id: "ps7", text: "Attend 14 theory lessons (90 min each)", done: false, areaId: "driving", note: "12 basic + 2 for Klasse B", priority: 0, createdAt: "2026-04-13", order: 7, planId: "plan-driving", phaseId: "ph2" },
          { id: "ps8", text: "Install Führerschein practice app", done: false, areaId: "driving", cost: "€10–30", estTime: "10 min", priority: 0, createdAt: "2026-04-13", order: 8, planId: "plan-driving", phaseId: "ph2" },
          { id: "ps9", text: "Practice until passing mock exams consistently", done: false, areaId: "driving", note: "Aim for <5 errors", priority: 0, createdAt: "2026-04-13", order: 9, planId: "plan-driving", phaseId: "ph2" },
          { id: "ps10", text: "Pass the Theorieprüfung at TÜV/DEKRA", done: false, areaId: "driving", cost: "€23", note: "30 questions, max 10 error points", priority: 0, createdAt: "2026-04-13", order: 10, planId: "plan-driving", phaseId: "ph2" },
        ],
      },
      {
        id: "ph3", title: "Practical driving", expanded: false,
        description: "Get behind the wheel",
        steps: [
          { id: "ps11", text: "Complete 12 mandatory special drives", done: false, areaId: "driving", cost: "€50–70/lesson", note: "5× highway, 4× rural, 3× night", priority: 0, createdAt: "2026-04-13", order: 11, planId: "plan-driving", phaseId: "ph3" },
          { id: "ps12", text: "Take regular practice lessons", done: false, areaId: "driving", cost: "€40–60/lesson", note: "Most people need 15–25 lessons", priority: 0, createdAt: "2026-04-13", order: 12, planId: "plan-driving", phaseId: "ph3" },
        ],
      },
      {
        id: "ph4", title: "Practical exam", expanded: false,
        description: "The final test",
        steps: [
          { id: "ps13", text: "Pass the practical driving exam", done: false, areaId: "driving", cost: "€117", note: "45 min drive with examiner", priority: 0, createdAt: "2026-04-13", order: 13, planId: "plan-driving", phaseId: "ph4" },
        ],
      },
    ],
  },
  {
    id: "plan-tax", title: "Steuererklärung 2025", subtitle: "Tax return",
    icon: "trending", color: "#b19cff", areaId: "finance",
    play: "ELSTER is free and faster than a Steuerberater for a simple employee return. Gather everything first, then file in one sitting. The refund usually lands in 6–8 weeks.",
    targetDate: "2026-07-31", createdAt: "2026-04-18",
    phases: [
      {
        id: "tph1", title: "Gather documents", expanded: true,
        steps: [
          { id: "ts1", text: "Gather documents for Steuererklärung", done: false, areaId: "finance", note: "Lohnsteuerbescheinigung, insurance docs, receipts", priority: 2, createdAt: "2026-04-18", order: 1, planId: "plan-tax", phaseId: "tph1" },
          { id: "ts2", text: "Download ELSTER certificate", done: false, areaId: "finance", estTime: "15 min", priority: 1, createdAt: "2026-04-18", order: 2, planId: "plan-tax", phaseId: "tph1" },
        ],
      },
      {
        id: "tph2", title: "File the return", expanded: false,
        steps: [
          { id: "ts3", text: "Fill out Anlage N (employment income)", done: false, areaId: "finance", priority: 0, createdAt: "2026-04-18", order: 3, planId: "plan-tax", phaseId: "tph2" },
          { id: "ts4", text: "Fill out Anlage Vorsorgeaufwand (insurance)", done: false, areaId: "finance", priority: 0, createdAt: "2026-04-18", order: 4, planId: "plan-tax", phaseId: "tph2" },
          { id: "ts5", text: "Submit Steuererklärung via ELSTER", done: false, areaId: "finance", priority: 0, createdAt: "2026-04-18", order: 5, planId: "plan-tax", phaseId: "tph2" },
        ],
      },
    ],
  },
];

const SAMPLE_STEPS: Step[] = [
  { id: "s14", text: "Update CV with latest HelloFresh projects", done: false, areaId: "career", estTime: "1 hour", priority: 1, createdAt: "2026-04-20", order: 14 },
  { id: "s15", text: "Set up PolicyRadar landing page", done: false, areaId: "career", priority: 0, createdAt: "2026-04-22", order: 15 },
  { id: "s16", text: "Book gym membership", done: false, areaId: "health", cost: "€30–50/month", priority: 1, createdAt: "2026-04-20", order: 16 },
];

const SAMPLE_HABITS: Habit[] = [
  { id: "h1", name: "Workout", icon: "dumbbell", color: "#3dd68c", streak: 5, bestStreak: 12, history: { "2026-04-25": true, "2026-04-24": true, "2026-04-23": true, "2026-04-22": true, "2026-04-21": true } },
  { id: "h2", name: "Read", icon: "book", color: "#3dafff", streak: 3, bestStreak: 21, history: { "2026-04-25": true, "2026-04-24": true, "2026-04-23": true } },
  { id: "h3", name: "No Social Media", icon: "target", color: "#b19cff", streak: 0, bestStreak: 7, history: { "2026-04-24": true } },
  { id: "h4", name: "Journal", icon: "book", color: "#ff8c5a", streak: 2, bestStreak: 14, history: { "2026-04-25": true, "2026-04-24": true } },
];

const SAMPLE_JOURNAL: JournalEntry[] = [
  { id: "j1", date: "2026-04-25", title: "Starting the driving license journey", body: "Finally registered at a Fahrschule today. Feels like one of those things I've been putting off forever. The instructor seems solid—speaks English, which helps. Cost is steep but it's a one-time unlock.", mood: "Energized", type: "Diary" },
  { id: "j2", date: "2026-04-23", body: "Spent the evening organizing tax documents. Not glamorous but there's something satisfying about reducing chaos to a neat folder. One less thing hanging over me.", mood: "Clear", type: "Reflection" },
];

const SAMPLE_DREAMS = [
  "Financial independence before 35.",
  "Build something people use every day.",
  "Never feel stuck again.",
];

// ═══════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════

const uid = () => Math.random().toString(36).slice(2, 10);
const todayStr = () => new Date().toISOString().split("T")[0];
const ease = [0.16, 1, 0.3, 1] as const;

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

function getMonday(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00");
  const db = new Date(b + "T00:00:00");
  return Math.round((db.getTime() - da.getTime()) / 86400000);
}

function getProgress(plan: Plan) {
  const steps = plan.phases.flatMap(p => p.steps);
  const done = steps.filter(s => s.done).length;
  const total = steps.length;
  return { done, total, pct: total > 0 ? done / total : 0 };
}

function getTotalCost(plan: Plan): string | null {
  let total = 0;
  let hasCost = false;
  for (const phase of plan.phases) {
    for (const step of phase.steps) {
      if (step.cost) {
        const match = step.cost.match(/[\d.]+/);
        if (match) { total += parseFloat(match[0]); hasCost = true; }
      }
    }
  }
  return hasCost ? `€${Math.round(total)}` : null;
}

function formatDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("en", {
    weekday: "long", month: "long", day: "numeric",
  });
}

const STORAGE_KEY = "life-os-v4";
const THEME_KEY = "life-os-theme";

function loadState() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) { try { return JSON.parse(raw); } catch { return null; } }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════
// Hooks
// ═══════════════════════════════════════════════════════════════════════

function useTheme() {
  const [theme, setThemeState] = useState<"dark" | "light">("dark");
  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY);
    const initial = saved === "light" ? "light" : "dark";
    setThemeState(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);
  const setTheme = useCallback((t: "dark" | "light") => {
    setThemeState(t);
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem(THEME_KEY, t);
  }, []);
  const toggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);
  return { theme, toggle };
}

// ═══════════════════════════════════════════════════════════════════════
// Small shared components
// ═══════════════════════════════════════════════════════════════════════

function CheckMark({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none" className="draw-check">
      <circle cx="13" cy="13" r="12" stroke={color} strokeWidth="1.5" fill={`${color}18`} />
      <path d="M7.5 13.5 L11.5 17 L18.5 9.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RadialProgress({ value, color, size, stroke, children }: {
  value: number; color: string; size: number; stroke: number; children: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - value);
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="var(--surface-3)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={stroke} strokeLinecap="round"
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease }}
          strokeDasharray={circ}
        />
      </svg>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function AnimatedPct({ value, color, size = "lg" }: { value: number; color: string; size?: "lg" | "sm" }) {
  const mv = useMotionValue(0);
  const display = useTransform(mv, v => `${Math.round(v)}`);
  useEffect(() => {
    const ctrl = fmAnimate(mv, value * 100, { duration: 0.9, ease });
    return () => ctrl.stop();
  }, [value, mv]);
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

function EmptyState({ icon: Icon, title, subtitle }: {
  icon: LucideIcon; title: string; subtitle?: string;
}) {
  return (
    <div className="text-center py-16">
      <Icon size={32} className="mx-auto mb-4 text-[var(--text-5)]" strokeWidth={1.2} />
      <p className="font-serif italic text-[18px] text-[var(--text-3)] mb-1">{title}</p>
      {subtitle && <p className="text-[13px] text-[var(--text-4)]">{subtitle}</p>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// IV.1 — Header
// ═══════════════════════════════════════════════════════════════════════

function Header({ doneToday, theme, onToggleTheme }: {
  doneToday: number; theme: "dark" | "light"; onToggleTheme: () => void;
}) {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 5 ? "Late night" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" });
  return (
    <header className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[var(--text-4)]">{dateStr}</p>
        <button onClick={onToggleTheme} className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-4)] hover:text-[var(--text-2)] transition-colors" aria-label="Toggle theme">
          {theme === "dark" ? <Sun size={15} strokeWidth={1.8} /> : <Moon size={15} strokeWidth={1.8} />}
        </button>
      </div>
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

// ═══════════════════════════════════════════════════════════════════════
// IV.2 — Right Now block
// ═══════════════════════════════════════════════════════════════════════

function RightNowBlock({ task, area, onOpen, onTick }: {
  task: Step; area: Area; onOpen: () => void; onTick: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08, duration: 0.5, ease }}
      whileTap={{ scale: 0.985 }} onClick={onOpen} role="button" tabIndex={0}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(); } }}
      className="w-full text-left rounded-2xl p-5 relative overflow-hidden group mb-6 cursor-pointer"
      style={{ background: `linear-gradient(145deg, ${area.color}12 0%, var(--surface) 60%)`, border: `1px solid ${area.color}20` }}
    >
      <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ backgroundColor: area.color, transform: "translate(30%, -30%)" }} />
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-1.5 rounded-full breathe" style={{ backgroundColor: area.color, boxShadow: `0 0 8px ${area.color}` }} />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em]" style={{ color: area.color }}>Right now</span>
        </div>
        <p className="font-serif text-[22px] leading-[1.15] font-semibold tracking-tight pr-12">{task.text}</p>
        {task.note && <p className="text-[13px] text-[var(--text-3)] mt-2 leading-relaxed">{task.note}</p>}
        <div className="flex items-center gap-3 mt-5">
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full" style={{ color: area.color, backgroundColor: `${area.color}10`, border: `1px solid ${area.color}20` }}>{area.name}</span>
          {task.cost && <span className="text-[11px] font-mono ml-auto" style={{ color: area.color }}>{task.cost}</span>}
        </div>
      </div>
      <div onClick={e => { e.stopPropagation(); onTick(); }} role="button" tabIndex={0}
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); e.preventDefault(); onTick(); } }}
        className="absolute top-5 right-5 w-11 h-11 rounded-xl flex items-center justify-center active:scale-90 transition-all cursor-pointer"
        style={{ backgroundColor: `${area.color}10`, border: `1px solid ${area.color}20` }} aria-label="Mark complete">
        <Circle size={20} strokeWidth={1.5} style={{ color: area.color }} />
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// IV.3 — Capture bar
// ═══════════════════════════════════════════════════════════════════════

function CaptureBar({ areas, onAdd, onJournal, defaultAreaId }: {
  areas: Area[];
  onAdd: (text: string, areaId: string | null, priority: number) => void;
  onJournal: () => void; defaultAreaId?: string | null;
}) {
  const [text, setText] = useState("");
  const [areaId, setAreaId] = useState<string | null>(defaultAreaId ?? null);
  const [showPicker, setShowPicker] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevDefault = useRef(defaultAreaId);
  useEffect(() => {
    if (defaultAreaId !== prevDefault.current) { setAreaId(defaultAreaId ?? null); prevDefault.current = defaultAreaId; }
  }, [defaultAreaId]);
  const submit = () => {
    if (!text.trim()) return;
    let priority = 0; let clean = text.trim();
    if (clean.startsWith("!!") || clean.endsWith("!!")) { priority = 2; clean = clean.replace(/^!!|!!$/g, "").trim(); }
    else if (clean.startsWith("!") || clean.endsWith("!")) { priority = 1; clean = clean.replace(/^!|!$/g, "").trim(); }
    onAdd(clean, areaId, priority); setText(""); inputRef.current?.focus();
  };
  const startListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    setIsListening(true);
    const rec = new SR();
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e: any) => { const t = e.results[0][0].transcript; setText(prev => prev ? `${prev} ${t}` : t); setIsListening(false); inputRef.current?.focus(); };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    rec.start();
  };
  const selectedArea = areas.find(a => a.id === areaId);
  return (
    <div className="relative">
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] focus-within:border-[var(--text-4)] transition-colors shadow-[0_8px_24px_-8px_rgba(0,0,0,0.4)]">
        <button onClick={() => setShowPicker(!showPicker)} className="flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all active:scale-95"
          style={{ color: selectedArea?.color ?? "var(--text-3)", backgroundColor: selectedArea ? `${selectedArea.color}10` : "var(--surface-2)", border: `1px solid ${selectedArea ? `${selectedArea.color}20` : "var(--border)"}` }}>
          {selectedArea?.name ?? "Inbox"}
        </button>
        <input ref={inputRef} type="text" value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") submit(); if (e.key === "Escape") inputRef.current?.blur(); }}
          placeholder="Add anything...  ! = next  !! = now"
          className="flex-1 bg-transparent text-[14px] text-[var(--text)] outline-none placeholder:text-[var(--text-5)]" />
        <button onClick={startListening} className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${isListening ? "mic-pulse" : "text-[var(--text-3)] hover:text-[var(--text)]"}`}
          style={isListening ? { color: "var(--rose)", backgroundColor: "rgba(255,107,122,0.12)" } : undefined} aria-label="Voice input"><Mic size={15} strokeWidth={1.8} /></button>
        <button onClick={onJournal} className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-3)] hover:text-[var(--text)] transition-colors" aria-label="Open journal"><BookOpen size={15} strokeWidth={1.8} /></button>
        <button onClick={submit} disabled={!text.trim()} className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all disabled:opacity-20 active:scale-90"
          style={{ backgroundColor: text.trim() ? "var(--amber)" : "var(--surface-2)", color: text.trim() ? "#0b0908" : "var(--text-4)" }} aria-label="Add"><Send size={14} strokeWidth={2.5} /></button>
      </div>
      <AnimatePresence>
        {showPicker && (
          <motion.div initial={{ opacity: 0, y: -4, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.97 }} transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 right-0 mb-2 p-2 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl z-50">
            <button onClick={() => { setAreaId(null); setShowPicker(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[var(--surface-2)] transition-colors">
              <Inbox size={13} className="text-[var(--text-3)]" /><span className="text-[13px]">Inbox <span className="text-[var(--text-4)]">(triage later)</span></span>
            </button>
            <div className="h-px bg-[var(--border)] my-1" />
            {areas.map(a => (
              <button key={a.id} onClick={() => { setAreaId(a.id); setShowPicker(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[var(--surface-2)] transition-colors">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: a.color }} /><span className="text-[13px]">{a.name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// IV.4 — Step row
// ═══════════════════════════════════════════════════════════════════════

function StepRow({ step, area, onToggle, onEdit, compact }: {
  step: Step; area?: Area; onToggle: () => void; onEdit: () => void; compact?: boolean;
}) {
  const [burst, setBurst] = useState(false);
  const handleToggle = () => { if (!step.done) { setBurst(true); setTimeout(() => setBurst(false), 700); } onToggle(); };
  const stripe = step.priority === 2 ? "border-l-[var(--rose)]" : step.priority === 1 ? "border-l-[var(--amber)]" : "border-l-transparent";
  return (
    <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}
      onClick={onEdit} role="button" tabIndex={0}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onEdit(); } }}
      className={`group flex items-start gap-3 px-3 py-2.5 rounded-xl border-l-[3px] ${stripe} transition-all cursor-pointer hover:bg-[var(--surface-2)] active:bg-[var(--surface-3)] ${step.done ? "opacity-45" : ""}`}>
      <button onClick={e => { e.stopPropagation(); handleToggle(); }} className="relative flex-shrink-0 mt-0.5 active:scale-90 transition-transform" aria-label={step.done ? "Mark incomplete" : "Mark complete"}>
        {burst && <div className="absolute inset-0 rounded-full ring-pulse" style={{ border: `2px solid ${area?.color ?? "var(--amber)"}` }} />}
        {step.done ? <CheckMark color={area?.color ?? "var(--amber)"} size={compact ? 20 : 22} /> : <Circle size={compact ? 20 : 22} strokeWidth={1.5} className="text-[var(--text-4)] group-hover:text-[var(--text-3)] transition-colors" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`${compact ? "text-[13px]" : "text-[14px]"} leading-snug transition-all ${step.done ? "line-through text-[var(--text-4)]" : "text-[var(--text)]"}`}>{step.text}</p>
        <div className="flex flex-wrap items-center gap-1.5 mt-1">
          {area && <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md" style={{ color: area.color, backgroundColor: `${area.color}12`, border: `1px solid ${area.color}18` }}>{area.name}</span>}
          {!area && step.areaId === null && <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md text-[var(--text-4)] bg-[var(--surface-2)] border border-[var(--border)]">Inbox</span>}
          {step.cost && <span className="text-[9px] font-mono text-[var(--text-3)] px-1.5 py-0.5 rounded-md bg-[var(--surface-2)]">{step.cost}</span>}
          {step.estTime && <span className="text-[9px] font-mono text-[var(--text-4)] flex items-center gap-0.5"><Clock size={8} /> {step.estTime}</span>}
          {step.link && <a href={step.link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-[9px] font-mono text-[var(--text-3)] flex items-center gap-0.5 hover:text-[var(--text)] transition-colors"><ExternalLink size={8} /> link</a>}
        </div>
        {step.note && !step.done && !compact && <p className="text-[11px] text-[var(--text-4)] mt-1 leading-relaxed line-clamp-1">{step.note}</p>}
      </div>
      {step.priority === 2 && !step.done && <span className="flex-shrink-0 text-[8px] font-mono font-bold uppercase tracking-wider text-[var(--rose)] mt-1">Now</span>}
      {step.priority === 1 && !step.done && <span className="flex-shrink-0 text-[8px] font-mono font-bold uppercase tracking-wider text-[var(--amber)] mt-1">Next</span>}
    </motion.div>
  );
}

function StepSection({ label, color, steps, areas, onToggle, onEdit, compact }: {
  label: string; color: string; steps: Step[]; areas: Area[];
  onToggle: (id: string) => void; onEdit: (s: Step) => void; compact?: boolean;
}) {
  if (steps.length === 0) return null;
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 px-3 py-1.5 mb-1">
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-[9px] font-mono uppercase tracking-[0.2em]" style={{ color }}>{label}</span>
        <span className="text-[9px] font-mono text-[var(--text-5)]">{steps.length}</span>
      </div>
      <AnimatePresence mode="popLayout">
        {steps.map(s => <StepRow key={s.id} step={s} area={areas.find(a => a.id === s.areaId)} onToggle={() => onToggle(s.id)} onEdit={() => onEdit(s)} compact={compact} />)}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// IV.6 — Phase block
// ═══════════════════════════════════════════════════════════════════════

function PhaseBlock({ phase, color, index, isLocked, onToggleStep, onToggleExpand }: {
  phase: Phase; color: string; index: number; isLocked: boolean;
  onToggleStep: (id: string) => void; onToggleExpand: () => void;
}) {
  const done = phase.steps.filter(s => s.done).length;
  const total = phase.steps.length;
  const pct = total > 0 ? done / total : 0;
  const complete = pct === 1;
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease }}
      className="rounded-2xl border overflow-hidden transition-colors duration-500"
      style={{ borderColor: complete ? `${color}25` : "var(--border)", backgroundColor: complete ? `${color}06` : "var(--surface)" }}>
      <button onClick={onToggleExpand} className="w-full text-left flex items-center gap-4 p-4">
        <RadialProgress value={pct} color={color} size={36} stroke={3}>
          {complete ? <Trophy size={14} style={{ color }} /> : <span className="text-[10px] font-mono font-semibold" style={{ color: pct > 0 ? color : "var(--text-4)" }}>{index + 1}</span>}
        </RadialProgress>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <h3 className={`font-serif text-[16px] font-medium leading-tight ${complete ? "text-[var(--text-3)]" : ""}`}>{phase.title}</h3>
            <span className="text-[10px] font-mono" style={{ color: complete ? color : "var(--text-4)" }}>{done}/{total}</span>
            {isLocked && <Lock size={11} className="text-[var(--text-4)] ml-auto" />}
          </div>
          {phase.description && !phase.expanded && <p className="text-[12px] text-[var(--text-3)] mt-0.5 truncate">{phase.description}</p>}
        </div>
        <motion.div animate={{ rotate: phase.expanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown size={16} className="text-[var(--text-4)]" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {phase.expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-1 flex flex-col gap-1">
              {phase.steps.map(s => <StepRow key={s.id} step={s} onToggle={() => onToggleStep(s.id)} onEdit={() => {}} compact />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// IV.5 — Plan detail
// ═══════════════════════════════════════════════════════════════════════

function PlanDetail({ plan, areas, onBack, onToggleStep, onTogglePhase }: {
  plan: Plan; areas: Area[]; onBack: () => void;
  onToggleStep: (planId: string, stepId: string) => void;
  onTogglePhase: (planId: string, phaseId: string) => void;
}) {
  const { done, total, pct } = getProgress(plan);
  const totalCost = getTotalCost(plan);
  const Ic = ICONS[plan.icon] ?? Target;
  const nextStep = plan.phases.flatMap(p => p.steps).find(s => !s.done);
  const daysActive = daysBetween(plan.createdAt, todayStr()) + 1;
  const daysToTarget = plan.targetDate ? daysBetween(todayStr(), plan.targetDate) : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
      className="relative z-10 max-w-xl mx-auto w-full px-5 py-8 pb-48 min-h-screen">
      <button onClick={onBack} className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-3)] mb-8 hover:text-[var(--text-2)] transition-colors">← Back</button>

      {/* HERO */}
      <div className="mb-8 flex items-start gap-5">
        <div className="flex-shrink-0 relative">
          <RadialProgress value={pct} color={plan.color} size={96} stroke={5}>
            <Ic size={22} style={{ color: plan.color }} strokeWidth={1.8} />
          </RadialProgress>
          <div className="absolute -inset-4 rounded-full blur-2xl -z-10 opacity-30" style={{ backgroundColor: plan.color }} />
        </div>
        <div className="flex-1 pt-1 min-w-0">
          {plan.subtitle && <p className="text-[10px] font-mono uppercase tracking-[0.2em] mb-1" style={{ color: plan.color }}>{plan.subtitle}</p>}
          <h1 className="font-serif text-[30px] leading-[1.05] font-semibold tracking-tight">{plan.title}</h1>
          <div className="mt-3 flex items-baseline gap-2">
            <AnimatedPct value={pct} color={plan.color} />
            <span className="text-[12px] text-[var(--text-3)] font-mono">{done}/{total}</span>
          </div>
        </div>
      </div>

      {/* STATS STRIP */}
      <div className="flex items-center gap-5 text-[12px] font-mono text-[var(--text-3)] border-t border-[var(--border)] pt-4 mb-8">
        <span className="flex items-center gap-1.5"><Calendar size={12} className="text-[var(--text-4)]" /> Day <span className="text-[var(--text)] font-semibold">{daysActive}</span></span>
        {daysToTarget !== null && daysToTarget > 0 && (
          <span className="flex items-center gap-1.5"><Target size={12} className="text-[var(--text-4)]" /> <span className="text-[var(--text)] font-semibold">{daysToTarget}</span> to go</span>
        )}
        {totalCost && <span className="flex items-center gap-1.5 ml-auto"><span style={{ color: plan.color }}>{totalCost}</span> <span className="text-[var(--text-4)]">total</span></span>}
      </div>

      {/* THE PLAY */}
      {plan.play && (
        <div className="rounded-2xl p-5 mb-8" style={{ background: `linear-gradient(135deg, ${plan.color}0d 0%, transparent 60%)`, border: `1px solid ${plan.color}20` }}>
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} style={{ color: plan.color }} />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em]" style={{ color: plan.color }}>The play</span>
          </div>
          <p className="font-serif text-[15px] leading-[1.6] text-[var(--text-2)]">{plan.play}</p>
        </div>
      )}

      {/* NEXT MOVE */}
      {nextStep && (
        <div className="rounded-2xl p-5 mb-8 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${plan.color}10 0%, transparent 60%)`, border: `1px solid ${plan.color}20` }}>
          <Flame size={36} className="absolute top-4 right-4 opacity-20" style={{ color: plan.color }} />
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full breathe" style={{ backgroundColor: plan.color, boxShadow: `0 0 8px ${plan.color}` }} />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em]" style={{ color: plan.color }}>Your next move</span>
          </div>
          <p className="font-serif text-[18px] leading-snug text-[var(--text)] font-medium pr-10">{nextStep.text}</p>
          {nextStep.note && <p className="text-[13px] text-[var(--text-3)] mt-1.5">{nextStep.note}</p>}
        </div>
      )}

      {/* PHASES */}
      <div className="flex flex-col gap-3">
        {plan.phases.map((phase, i) => (
          <PhaseBlock key={phase.id} phase={phase} color={plan.color} index={i}
            isLocked={i > 0 && plan.phases[i - 1].steps.some(s => !s.done)}
            onToggleStep={(stepId) => onToggleStep(plan.id, stepId)}
            onToggleExpand={() => onTogglePhase(plan.id, phase.id)} />
        ))}
      </div>

      {/* CELEBRATION */}
      {pct === 1 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          className="mt-10 relative text-center py-12 rounded-3xl overflow-hidden"
          style={{ border: `1px solid ${plan.color}40`, backgroundColor: `${plan.color}08` }}>
          <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 50%, ${plan.color}20, transparent 60%)` }} />
          <div className="relative z-10">
            <Trophy size={48} className="mx-auto mb-4" style={{ color: plan.color }} />
            <p className="font-serif text-[26px] font-semibold italic mb-1">You did it.</p>
            <p className="text-[12px] text-[var(--text-3)] font-mono">{total} steps · {daysActive} days</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// V.2 — Plan card
// ═══════════════════════════════════════════════════════════════════════

function PlanCard({ plan, onOpen }: { plan: Plan; onOpen: () => void }) {
  const { done, total, pct } = getProgress(plan);
  const nextStep = plan.phases.flatMap(p => p.steps).find(s => !s.done);
  const Ic = ICONS[plan.icon] ?? Target;
  const daysActive = daysBetween(plan.createdAt, todayStr()) + 1;
  const lastCompleted = plan.phases.flatMap(p => p.steps)
    .filter(s => s.done && s.completedAt)
    .sort((a, b) => (b.completedAt || "").localeCompare(a.completedAt || ""))[0];
  const daysSinceProgress = lastCompleted?.completedAt ? daysBetween(lastCompleted.completedAt, todayStr()) : daysActive;
  const isStale = daysSinceProgress >= 7 && pct < 1;
  const daysToTarget = plan.targetDate ? daysBetween(todayStr(), plan.targetDate) : null;
  const dueUrgent = daysToTarget !== null && daysToTarget <= 14 && daysToTarget > 0 && pct < 1;
  return (
    <button onClick={onOpen} className="text-left p-5 rounded-2xl border bg-[var(--surface)] hover:bg-[var(--surface-2)] active:scale-[0.99] transition-all w-full"
      style={{ borderColor: dueUrgent ? "var(--rose)" : isStale ? "var(--amber)" : "var(--border)" }}>
      <div className="flex items-start gap-4">
        <RadialProgress value={pct} color={plan.color} size={56} stroke={3.5}>
          <Ic size={18} style={{ color: plan.color }} strokeWidth={1.8} />
        </RadialProgress>
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-[17px] font-medium leading-tight truncate mb-1">{plan.title}</h3>
          <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--text-3)] mb-2 flex-wrap">
            <span style={{ color: plan.color }}>{done}/{total}</span>
            <span className="text-[var(--text-5)]">·</span>
            <span>Day {daysActive}</span>
            {isStale && <span className="text-[9px] px-1.5 py-0.5 rounded-md font-semibold" style={{ color: "var(--amber)", backgroundColor: "rgba(245,166,35,0.1)" }}>stale</span>}
            {dueUrgent && <span className="text-[9px] px-1.5 py-0.5 rounded-md font-semibold" style={{ color: "var(--rose)", backgroundColor: "rgba(255,107,122,0.1)" }}>{daysToTarget}d left</span>}
          </div>
          {nextStep && <p className="text-[12px] text-[var(--text-3)] italic line-clamp-1">Next: {nextStep.text}</p>}
        </div>
      </div>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// IV.7 — Habits strip
// ═══════════════════════════════════════════════════════════════════════

function HabitsStrip({ habits, onToggle }: { habits: Habit[]; onToggle: (id: string) => void }) {
  const today = todayStr();
  const days = getLast7Days();
  const doneCount = habits.filter(h => h.history[today] === true).length;
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-4)]">Daily habits</p>
        <span className="text-[10px] font-mono" style={{ color: doneCount === habits.length ? "var(--emerald)" : "var(--text-3)" }}>{doneCount}/{habits.length}</span>
      </div>
      <div className="flex flex-col gap-2.5">
        {habits.map(h => {
          const Ic = ICONS[h.icon] ?? Target;
          const done = h.history[today] === true;
          return (
            <div key={h.id} className="flex items-center gap-3">
              <button onClick={() => onToggle(h.id)} className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center active:scale-90 transition-all"
                style={{ backgroundColor: done ? `${h.color}18` : "var(--surface-2)", border: `1px solid ${done ? h.color : "var(--border)"}` }}
                aria-label={`${done ? "Uncheck" : "Check"} ${h.name}`}>
                {done ? <CheckCircle2 size={14} style={{ color: h.color }} strokeWidth={2} /> : <Ic size={12} style={{ color: "var(--text-4)" }} strokeWidth={1.8} />}
              </button>
              <span className={`text-[13px] flex-1 ${done ? "text-[var(--text-3)] line-through" : "text-[var(--text)]"}`}>{h.name}</span>
              {h.streak > 0 && <div className="flex items-center gap-1 flex-shrink-0"><Flame size={10} style={{ color: h.color }} /><span className="text-[10px] font-mono font-semibold" style={{ color: h.color }}>{h.streak}</span></div>}
              <div className="flex gap-0.5 flex-shrink-0">
                {days.map(d => <div key={d} className="w-[5px] h-[5px] rounded-full" style={{ backgroundColor: h.history[d] ? h.color : "var(--surface-3)" }} />)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// IV.8 — Journal entry
// ═══════════════════════════════════════════════════════════════════════

function JournalEntryCard({ entry }: { entry: JournalEntry }) {
  return (
    <article className="border-l-2 border-[var(--border)] pl-5 py-1 mb-8">
      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-4)] mb-2">
        {formatDate(entry.date)}{entry.mood && <> · <span style={{ color: MOOD_COLORS[entry.mood] }}>{entry.mood}</span></>}
      </p>
      {entry.title && <h2 className="font-serif text-[20px] font-semibold leading-tight mb-2">{entry.title}</h2>}
      <div className="font-serif text-[16px] leading-[1.7] text-[var(--text-2)] italic">{entry.body}</div>
      {entry.type && <span className="inline-block mt-3 text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--surface-2)] text-[var(--text-3)]">{entry.type}</span>}
    </article>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Journal modal
// ═══════════════════════════════════════════════════════════════════════

function JournalModal({ onClose, onSave }: { onClose: () => void; onSave: (entry: JournalEntry) => void }) {
  const [body, setBody] = useState("");
  const [title, setTitle] = useState("");
  const [mood, setMood] = useState<Mood | null>(null);
  const [type, setType] = useState<string | null>(null);
  const moods: Mood[] = ["Clear", "Energized", "Neutral", "Scattered", "Low"];
  const types = ["Thought", "Feeling", "Idea", "Reflection", "Rant", "Gratitude", "Diary"];
  const submit = () => {
    if (!body.trim()) return;
    onSave({ id: uid(), date: todayStr(), title: title.trim() || undefined, body: body.trim(), mood: mood ?? undefined, type: type ?? undefined });
    onClose();
  };
  useEffect(() => { const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, [onClose]);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50">
      <div className="absolute inset-0 backdrop-blur-sm" style={{ backgroundColor: "var(--overlay)" }} onClick={onClose} />
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="absolute bottom-0 inset-x-0 max-w-xl mx-auto bg-[var(--surface)] border-t border-[var(--border)] rounded-t-[24px] p-5 pb-8 max-h-[85vh] overflow-y-auto">
        <div className="w-10 h-1 rounded-full bg-[var(--border)] mx-auto mb-5" />
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Title (optional)" autoFocus
          className="w-full bg-transparent text-[18px] font-serif text-[var(--text)] outline-none pb-3 border-b border-[var(--border)] mb-4 placeholder:text-[var(--text-5)]" />
        <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="What's on your mind…"
          className="w-full bg-[var(--surface-2)] text-[15px] font-serif italic text-[var(--text-2)] outline-none px-4 py-3 rounded-xl border border-[var(--border)] min-h-[120px] resize-none placeholder:text-[var(--text-5)] mb-4 leading-[1.7]" />
        <div className="mb-3">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-4)] mb-2">Mood</p>
          <div className="flex flex-wrap gap-1.5">
            {moods.map(m => (
              <button key={m} onClick={() => setMood(mood === m ? null : m)}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-mono transition-all"
                style={{ color: mood === m ? MOOD_COLORS[m] : "var(--text-4)", backgroundColor: mood === m ? `${MOOD_COLORS[m]}15` : "var(--surface-2)", border: `1px solid ${mood === m ? `${MOOD_COLORS[m]}30` : "var(--border)"}` }}>
                {m}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-5">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-4)] mb-2">Type</p>
          <div className="flex flex-wrap gap-1.5">
            {types.map(t => (
              <button key={t} onClick={() => setType(type === t ? null : t)}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-mono transition-all"
                style={{ color: type === t ? "var(--text)" : "var(--text-4)", backgroundColor: type === t ? "var(--surface-3)" : "var(--surface-2)", border: `1px solid ${type === t ? "var(--text-4)" : "var(--border)"}` }}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <button onClick={submit} disabled={!body.trim()}
          className="w-full py-3.5 rounded-xl text-[14px] font-semibold active:scale-[0.98] transition-all disabled:opacity-25 bg-[var(--amber)] text-[#0b0908]">
          Save
        </button>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Inbox pulse
// ═══════════════════════════════════════════════════════════════════════

function InboxPulse({ count, onTap }: { count: number; onTap: () => void }) {
  if (count === 0) return null;
  return (
    <button onClick={onTap} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-2)] transition-colors mb-4">
      <Inbox size={14} className="text-[var(--text-3)]" />
      <span className="text-[13px] text-[var(--text-2)] flex-1 text-left">{count} in inbox</span>
      <span className="text-[10px] font-mono text-[var(--amber)]">triage →</span>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Life Pulse — cross-area health check
// ═══════════════════════════════════════════════════════════════════════

function LifePulse({ areas, plans, allSteps }: {
  areas: Area[]; plans: Plan[]; allSteps: Step[];
}) {
  const weekDays = getLast7Days();
  const statusColors = { green: "var(--emerald)", amber: "var(--amber)", rose: "var(--rose)" };
  const pulse = areas.map(a => {
    const areaSteps = allSteps.filter(s => s.areaId === a.id);
    const completedThisWeek = areaSteps.filter(s => s.done && s.completedAt && weekDays.includes(s.completedAt)).length;
    const plan = plans.find(p => p.areaId === a.id);

    const lastCompleted = areaSteps
      .filter(s => s.done && s.completedAt)
      .sort((x, y) => (y.completedAt || "").localeCompare(x.completedAt || ""))[0];
    const daysSinceProgress = lastCompleted?.completedAt ? daysBetween(lastCompleted.completedAt, todayStr()) : 999;

    let status: "green" | "amber" | "rose" = "green";
    if (daysSinceProgress >= 7) status = "rose";
    else if (completedThisWeek === 0 && daysSinceProgress >= 3) status = "amber";

    let summary = "";
    if (plan) {
      const { pct } = getProgress(plan);
      summary = `${Math.round(pct * 100)}%`;
      if (daysSinceProgress >= 7) summary += ` · ${daysSinceProgress}d stale`;
      else if (completedThisWeek > 0) summary += ` · ${completedThisWeek} this wk`;
    } else {
      summary = completedThisWeek > 0 ? `${completedThisWeek} this week` : "no activity";
    }

    return { ...a, status, summary };
  });

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 mb-6">
      <div className="flex flex-col gap-1.5">
        {pulse.map(p => (
          <div key={p.id} className="flex items-center gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: statusColors[p.status] }} />
            <span className="text-[11px] flex-1 truncate" style={{ color: p.color }}>{p.name}</span>
            <span className="text-[10px] font-mono text-[var(--text-4)] flex-shrink-0">{p.summary}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// IV.10 — Dreams banner
// ═══════════════════════════════════════════════════════════════════════

function DreamsBanner({ dreams }: { dreams: string[] }) {
  return (
    <div className="text-center py-8 mt-12 border-t border-[var(--border-subtle)]">
      <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[var(--text-5)] mb-3">Why you started</p>
      <div className="font-serif italic text-[14px] text-[var(--text-4)] leading-[1.7] max-w-md mx-auto">
        {dreams.map((d, i) => <span key={i}>{"“"}{d}{"”"}{i < dreams.length - 1 ? <br /> : null}</span>)}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Edit drawer
// ═══════════════════════════════════════════════════════════════════════

function EditDrawer({ step, areas, onSave, onDelete, onClose }: {
  step: Step; areas: Area[]; onSave: (s: Step) => void; onDelete: () => void; onClose: () => void;
}) {
  const [text, setText] = useState(step.text);
  const [note, setNote] = useState(step.note || "");
  const [cost, setCost] = useState(step.cost || "");
  const [estTime, setEstTime] = useState(step.estTime || "");
  const [link, setLink] = useState(step.link || "");
  const [areaId, setAreaId] = useState(step.areaId);
  const [priority, setPriority] = useState(step.priority);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saveFlash, setSaveFlash] = useState(false);
  const isDirty = text !== step.text || note !== (step.note || "") || cost !== (step.cost || "") || estTime !== (step.estTime || "") || link !== (step.link || "") || areaId !== step.areaId || priority !== step.priority;
  const save = () => {
    onSave({ ...step, text: text.trim(), note: note.trim() || undefined, cost: cost.trim() || undefined, estTime: estTime.trim() || undefined, link: link.trim() || undefined, areaId, priority });
    setSaveFlash(true); setTimeout(() => onClose(), 200);
  };
  useEffect(() => { const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, [onClose]);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50">
      <div className="absolute inset-0 backdrop-blur-sm" style={{ backgroundColor: "var(--overlay)" }} onClick={onClose} />
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="absolute bottom-0 inset-x-0 max-w-xl mx-auto bg-[var(--surface)] border-t border-[var(--border)] rounded-t-[24px] p-5 pb-8 max-h-[85vh] overflow-y-auto">
        <div className="w-10 h-1 rounded-full bg-[var(--border)] mx-auto mb-5" />
        <input type="text" value={text} onChange={e => setText(e.target.value)} autoFocus className="w-full bg-transparent text-[18px] font-serif text-[var(--text)] outline-none pb-3 border-b border-[var(--border)] mb-4 placeholder:text-[var(--text-5)]" placeholder="Step name" />
        <div className="flex flex-col gap-3 mb-5">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-4)] mb-2">Area</p>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setAreaId(null)} className="px-2.5 py-1.5 rounded-lg text-[11px] font-mono transition-all" style={{ color: areaId === null ? "var(--text)" : "var(--text-3)", backgroundColor: areaId === null ? "var(--surface-3)" : "var(--surface-2)", border: `1px solid ${areaId === null ? "var(--text-4)" : "var(--border)"}` }}>Inbox</button>
              {areas.map(a => <button key={a.id} onClick={() => setAreaId(a.id)} className="px-2.5 py-1.5 rounded-lg text-[11px] font-mono transition-all" style={{ color: areaId === a.id ? a.color : "var(--text-3)", backgroundColor: areaId === a.id ? `${a.color}15` : "var(--surface-2)", border: `1px solid ${areaId === a.id ? `${a.color}30` : "var(--border)"}` }}>{a.name}</button>)}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-4)] mb-2">Priority</p>
            <div className="flex gap-1.5">
              {[{ v: 0, label: "Backlog", color: "var(--text-3)" }, { v: 1, label: "Next", color: "var(--amber)" }, { v: 2, label: "Now", color: "var(--rose)" }].map(p => (
                <button key={p.v} onClick={() => setPriority(p.v)} className="px-3 py-1.5 rounded-lg text-[11px] font-mono transition-all"
                  style={{ color: priority === p.v ? p.color : "var(--text-4)", backgroundColor: priority === p.v ? (p.v === 0 ? "var(--surface-3)" : `${p.color}15`) : "var(--surface-2)", border: `1px solid ${priority === p.v ? (p.v === 0 ? "var(--text-4)" : `${p.color}30`) : "var(--border)"}` }}>{p.label}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-4)] mb-2">Cost</p><input type="text" value={cost} onChange={e => setCost(e.target.value)} className="w-full bg-[var(--surface-2)] text-[13px] text-[var(--text)] outline-none px-3 py-2 rounded-lg border border-[var(--border)] placeholder:text-[var(--text-5)]" placeholder="€0" /></div>
            <div><p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-4)] mb-2">Time est.</p><input type="text" value={estTime} onChange={e => setEstTime(e.target.value)} className="w-full bg-[var(--surface-2)] text-[13px] text-[var(--text)] outline-none px-3 py-2 rounded-lg border border-[var(--border)] placeholder:text-[var(--text-5)]" placeholder="15 min" /></div>
          </div>
          <div><p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-4)] mb-2">Link</p><input type="url" value={link} onChange={e => setLink(e.target.value)} className="w-full bg-[var(--surface-2)] text-[13px] text-[var(--text)] outline-none px-3 py-2 rounded-lg border border-[var(--border)] placeholder:text-[var(--text-5)]" placeholder="https://…" /></div>
          <div><p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-4)] mb-2">Notes</p><textarea value={note} onChange={e => setNote(e.target.value)} className="w-full bg-[var(--surface-2)] text-[13px] text-[var(--text)] outline-none px-3 py-2.5 rounded-lg border border-[var(--border)] min-h-[60px] resize-none placeholder:text-[var(--text-5)]" placeholder="Additional details…" /></div>
        </div>
        <div className="flex gap-2">
          <button onClick={save} disabled={!isDirty && !saveFlash} className="flex-1 py-3 rounded-xl text-[13px] font-semibold active:scale-[0.98] transition-all disabled:opacity-40"
            style={{ backgroundColor: saveFlash ? "var(--emerald)" : isDirty ? "var(--amber)" : "var(--surface-2)", color: saveFlash ? "#fff" : isDirty ? "#0b0908" : "var(--text-4)" }}>Save</button>
          {confirmDelete
            ? <button onClick={onDelete} className="px-6 py-3 rounded-xl text-[13px] font-semibold bg-[var(--rose)] text-white active:scale-[0.98] transition-transform">Confirm</button>
            : <button onClick={() => setConfirmDelete(true)} className="px-4 py-3 rounded-xl text-[var(--text-4)] bg-[var(--surface-2)] border border-[var(--border)] active:scale-[0.98] transition-transform" aria-label="Delete"><Trash2 size={16} /></button>
          }
        </div>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// IV.9 — Bottom tabs
// ═══════════════════════════════════════════════════════════════════════

function BottomTabs({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const tabs: { id: Tab; label: string; icon: LucideIcon }[] = [
    { id: "now", label: "Now", icon: Zap }, { id: "plans", label: "Plans", icon: Compass },
    { id: "habits", label: "Habits", icon: Flame }, { id: "journal", label: "Journal", icon: BookOpen },
    { id: "review", label: "Review", icon: TrendingUp },
  ];
  return (
    <div className="backdrop-blur-xl border-t border-[var(--border-subtle)]" style={{ backgroundColor: "color-mix(in srgb, var(--bg) 90%, transparent)" }}>
      <div className="max-w-xl mx-auto flex items-center justify-around px-4 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {tabs.map(t => {
          const Icon = t.icon; const isActive = active === t.id;
          return (
            <button key={t.id} onClick={() => onChange(t.id)} className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl">
              <div className="relative">
                <Icon size={19} strokeWidth={isActive ? 2.2 : 1.5} style={{ color: isActive ? "var(--amber)" : "var(--text-4)" }} className="transition-colors" />
                {isActive && <motion.div layoutId="tab-dot" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ backgroundColor: "var(--amber)" }} transition={{ type: "spring", stiffness: 300, damping: 30 }} />}
              </div>
              <span className="text-[9px] font-mono uppercase tracking-wider transition-colors" style={{ color: isActive ? "var(--amber)" : "var(--text-5)" }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// IV.11 — Review screen
// ═══════════════════════════════════════════════════════════════════════

function ReviewScreen({ areas, steps, plans, habits, journal, weeklyTargets, onSaveReflection, onSaveCounterfactual, onAddTarget, onToggleTarget }: {
  areas: Area[]; steps: Step[]; plans: Plan[]; habits: Habit[];
  journal: JournalEntry[]; weeklyTargets: WeeklyTarget[];
  onSaveReflection: (body: string) => void;
  onSaveCounterfactual: (body: string) => void;
  onAddTarget: (text: string) => void;
  onToggleTarget: (id: string) => void;
}) {
  const [reflection, setReflection] = useState("");
  const [counterfactual, setCounterfactual] = useState("");
  const [savedR, setSavedR] = useState(false);
  const [savedC, setSavedC] = useState(false);
  const [newTarget, setNewTarget] = useState("");
  const allSteps = [...steps, ...plans.flatMap(p => p.phases.flatMap(ph => ph.steps))];
  const weekDays = getLast7Days();
  const monday = getMonday();
  const weekLabel = (() => {
    const d = new Date(); d.setDate(d.getDate() - 6);
    return `${d.toLocaleDateString("en", { month: "short", day: "numeric" })} – ${new Date().toLocaleDateString("en", { month: "short", day: "numeric" })}`;
  })();
  const byArea = areas.map(a => ({
    ...a,
    count: allSteps.filter(s => s.areaId === a.id && s.done && s.completedAt && weekDays.includes(s.completedAt)).length,
  })).filter(a => a.count > 0);

  const habitData = habits.map(h => ({
    ...h,
    days: weekDays.map(d => h.history[d] === true),
    held: weekDays.filter(d => h.history[d] === true).length >= 5,
  }));

  const moodByDay = weekDays.map(d => {
    const entry = journal.find(j => j.date === d);
    return entry?.mood ?? null;
  });

  const weekdayInit = weekDays.map(d => ["S", "M", "T", "W", "T", "F", "S"][new Date(d + "T12:00:00").getDay()]);

  const thisWeekTargets = weeklyTargets.filter(t => t.weekOf === monday);

  const pastCounterfactuals = journal
    .filter(j => j.type === "Counterfactual")
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);

  const handleSaveR = () => {
    if (!reflection.trim()) return;
    onSaveReflection(reflection.trim());
    setReflection("");
    setSavedR(true);
    setTimeout(() => setSavedR(false), 2000);
  };

  const handleSaveC = () => {
    if (!counterfactual.trim()) return;
    onSaveCounterfactual(counterfactual.trim());
    setCounterfactual("");
    setSavedC(true);
    setTimeout(() => setSavedC(false), 2000);
  };

  const handleAddTarget = () => {
    if (!newTarget.trim()) return;
    onAddTarget(newTarget.trim());
    setNewTarget("");
  };

  return (
    <div className="max-w-xl mx-auto px-5 py-8 pb-48">
      <header className="mb-10">
        <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[var(--text-4)] mb-2">Week of {weekLabel}</p>
        <h1 className="font-serif text-[32px] leading-[1.05] font-semibold tracking-tight mb-3">A look back.</h1>
        <p className="font-serif italic text-[16px] text-[var(--text-3)] leading-[1.6]">{"“What worked? What didn’t? What’s next week’s one thing?”"}</p>
      </header>

      {/* Weekly targets */}
      <section className="mb-10">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-4)] mb-4">Weekly targets</p>
        {thisWeekTargets.length > 0 && (
          <div className="space-y-2 mb-4">
            {thisWeekTargets.map(t => (
              <div key={t.id} className="flex items-center gap-3 group" onClick={() => onToggleTarget(t.id)} role="button" tabIndex={0}
                onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggleTarget(t.id); } }}>
                <div className="w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all cursor-pointer"
                  style={{ borderColor: t.hit ? "var(--emerald)" : "var(--text-4)", backgroundColor: t.hit ? "var(--emerald)" : "transparent" }}>
                  {t.hit && <CheckCircle2 size={12} strokeWidth={2.5} className="text-[var(--bg)]" />}
                </div>
                <span className="text-[14px] flex-1" style={{ textDecoration: t.hit ? "line-through" : "none", color: t.hit ? "var(--text-3)" : "var(--text)" }}>{t.text}</span>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input type="text" value={newTarget} onChange={e => setNewTarget(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleAddTarget(); }}
            placeholder="Add a target for this week..."
            className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-[13px] outline-none placeholder:text-[var(--text-5)] focus:border-[var(--amber)]" />
          <button onClick={handleAddTarget} disabled={!newTarget.trim()}
            className="px-3 py-2 rounded-lg text-[12px] font-mono font-semibold disabled:opacity-25 transition-all"
            style={{ backgroundColor: "var(--amber)", color: "#0b0908" }}>
            <Plus size={14} />
          </button>
        </div>
        {thisWeekTargets.length === 0 && <p className="text-[12px] text-[var(--text-5)] mt-2 italic">No targets set yet. What are you aiming for?</p>}
      </section>

      {/* Movement 1 — by area */}
      <section className="mb-10">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-4)] mb-4">What got done</p>
        {byArea.length > 0 ? (
          <div className="space-y-3">
            {byArea.map(a => (
              <div key={a.id} className="flex items-baseline gap-3">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: a.color }} />
                <span className="font-serif text-[16px] flex-1">{a.name}</span>
                <span className="font-mono text-[20px] font-semibold" style={{ color: a.color }}>{a.count}</span>
                <span className="text-[10px] font-mono text-[var(--text-4)]">steps</span>
              </div>
            ))}
          </div>
        ) : <p className="text-[13px] text-[var(--text-4)] italic">No steps completed this week yet.</p>}
      </section>

      {/* Movement 2 — habits */}
      <section className="mb-10">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-4)] mb-4">Habits this week</p>
        <div className="space-y-2">
          {habitData.map(h => (
            <div key={h.id} className="flex items-center gap-3">
              <span className="text-[14px] flex-1">{h.name}</span>
              <div className="flex gap-1">
                {h.days.map((done, i) => <div key={i} className="w-3 h-3 rounded" style={{ backgroundColor: done ? h.color : "var(--surface-3)" }} />)}
              </div>
              <span className="text-[10px] font-mono w-8 text-right" style={{ color: h.held ? "var(--emerald)" : "var(--rose)" }}>{h.held ? "held" : "broke"}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Movement 3 — mood from journal */}
      <section className="mb-10">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-4)] mb-4">How you felt</p>
        <div className="flex gap-1.5">
          {weekDays.map((_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full h-12 rounded-md transition-colors" style={{
                backgroundColor: moodByDay[i] ? `${MOOD_HEX[moodByDay[i]!]}25` : "var(--surface-2)",
                border: moodByDay[i] ? `1px solid ${MOOD_HEX[moodByDay[i]!]}30` : "1px solid transparent",
              }}>
                {moodByDay[i] && <div className="w-full h-full flex items-center justify-center text-[9px] font-mono" style={{ color: MOOD_HEX[moodByDay[i]!] }}>{moodByDay[i]![0]}</div>}
              </div>
              <span className="text-[9px] font-mono text-[var(--text-4)]">{weekdayInit[i]}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Movement 4 — reflection */}
      <section className="mb-6">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-4)] mb-3">Reflection</p>
        <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-5 mb-3">
          <textarea value={reflection} onChange={e => setReflection(e.target.value)}
            placeholder="If you could rerun this week with one thing changed, what would it be?"
            className="w-full bg-transparent font-serif italic text-[18px] leading-[1.6] text-[var(--text-2)] resize-none outline-none min-h-[80px] placeholder:text-[var(--text-4)]" />
        </div>
        <button onClick={handleSaveR} disabled={!reflection.trim() && !savedR}
          className="w-full py-3 rounded-xl text-[13px] font-semibold active:scale-[0.98] transition-all disabled:opacity-25"
          style={{ backgroundColor: savedR ? "var(--emerald)" : "var(--amber)", color: savedR ? "#fff" : "#0b0908" }}>
          {savedR ? "Saved" : "Save reflection"}
        </button>
      </section>

      {/* Movement 5 — counterfactual */}
      <section className="mb-10">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-4)] mb-3">Counterfactual</p>
        <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-5 mb-3">
          <textarea value={counterfactual} onChange={e => setCounterfactual(e.target.value)}
            placeholder="What would you change about this week?"
            className="w-full bg-transparent font-serif italic text-[16px] leading-[1.6] text-[var(--text-2)] resize-none outline-none min-h-[60px] placeholder:text-[var(--text-4)]" />
        </div>
        <button onClick={handleSaveC} disabled={!counterfactual.trim() && !savedC}
          className="w-full py-3 rounded-xl text-[13px] font-semibold active:scale-[0.98] transition-all disabled:opacity-25"
          style={{ backgroundColor: savedC ? "var(--emerald)" : "var(--violet)", color: "#fff" }}>
          {savedC ? "Saved" : "Save counterfactual"}
        </button>
      </section>

      {/* "You keep saying..." — patterns from past counterfactuals */}
      {pastCounterfactuals.length >= 2 && (
        <section className="mb-10 rounded-2xl border border-[var(--border)] p-5" style={{ background: "linear-gradient(145deg, rgba(177, 156, 255, 0.08), var(--surface) 60%)" }}>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--violet)] mb-4">You keep saying...</p>
          <div className="space-y-3">
            {pastCounterfactuals.map(c => (
              <div key={c.id} className="flex gap-3 items-start">
                <div className="w-1 h-1 rounded-full bg-[var(--violet)] mt-2 flex-shrink-0" />
                <div>
                  <p className="font-serif italic text-[14px] text-[var(--text-2)] leading-[1.5]">{c.body}</p>
                  <p className="text-[10px] font-mono text-[var(--text-5)] mt-0.5">{c.date}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Main page
// ═══════════════════════════════════════════════════════════════════════

export default function Page() {
  const [tab, setTab] = useState<Tab>("now");
  const [steps, setSteps] = useState<Step[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [weeklyTargets, setWeeklyTargets] = useState<WeeklyTarget[]>([]);
  const [dreams] = useState(SAMPLE_DREAMS);
  const [filterArea, setFilterArea] = useState<string | null>(null);
  const [showDone, setShowDone] = useState(false);
  const [editingStep, setEditingStep] = useState<Step | null>(null);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [groupBy, setGroupBy] = useState<"priority" | "plan">("priority");
  const [loaded, setLoaded] = useState(false);
  const { theme, toggle: toggleTheme } = useTheme();

  // ─── Persistence ─────────────────────────────────────────────────

  useEffect(() => {
    const state = loadState();
    if (state) {
      setSteps(state.steps ?? []);
      setAreas(state.areas ?? SAMPLE_AREAS);
      setHabits(state.habits ?? SAMPLE_HABITS);
      setPlans(state.plans ?? SAMPLE_PLANS);
      setJournal(state.journal ?? SAMPLE_JOURNAL);
      setWeeklyTargets(state.weeklyTargets ?? []);
    } else {
      setSteps(SAMPLE_STEPS); setAreas(SAMPLE_AREAS);
      setHabits(SAMPLE_HABITS); setPlans(SAMPLE_PLANS);
      setJournal(SAMPLE_JOURNAL);
    }
    setLoaded(true);
  }, []);

  // ─── Auto-persist on any state change ────────────────────────────

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ steps, areas, habits, plans, journal, weeklyTargets }));
  }, [loaded, steps, areas, habits, plans, journal, weeklyTargets]);

  // ─── Actions ─────────────────────────────────────────────────────

  const toggleStep = useCallback((id: string) => {
    setSteps(prev => prev.map(s => s.id !== id ? s : { ...s, done: !s.done, completedAt: !s.done ? todayStr() : undefined }));
  }, []);

  const addStep = useCallback((text: string, areaId: string | null, priority: number) => {
    setSteps(prev => {
      const maxOrder = prev.reduce((m, s) => Math.max(m, s.order), 0);
      return [...prev, { id: uid(), text, done: false, areaId, priority, createdAt: todayStr(), order: maxOrder + 1 }];
    });
  }, []);

  const updateStep = useCallback((updated: Step) => {
    setSteps(prev => prev.map(s => s.id === updated.id ? updated : s));
    setEditingStep(null);
  }, []);

  const deleteStep = useCallback((id: string) => {
    setSteps(prev => prev.filter(s => s.id !== id));
    setEditingStep(null);
  }, []);

  const updatePlanStep = useCallback((updated: Step) => {
    setPlans(prev => prev.map(p => {
      if (p.id !== updated.planId) return p;
      return { ...p, phases: p.phases.map(ph => ({ ...ph, steps: ph.steps.map(s => s.id === updated.id ? updated : s) })) };
    }));
    setEditingStep(null);
  }, []);

  const deletePlanStep = useCallback((stepId: string, planId: string) => {
    setPlans(prev => prev.map(p => {
      if (p.id !== planId) return p;
      return { ...p, phases: p.phases.map(ph => ({ ...ph, steps: ph.steps.filter(s => s.id !== stepId) })) };
    }));
    setEditingStep(null);
  }, []);

  const togglePlanStep = useCallback((planId: string, stepId: string) => {
    setPlans(prev => prev.map(p => {
      if (p.id !== planId) return p;
      return { ...p, phases: p.phases.map(ph => ({ ...ph, steps: ph.steps.map(s => s.id !== stepId ? s : { ...s, done: !s.done, completedAt: !s.done ? todayStr() : undefined }) })) };
    }));
  }, []);

  const togglePhaseExpanded = useCallback((planId: string, phaseId: string) => {
    setPlans(prev => prev.map(p => {
      if (p.id !== planId) return p;
      return { ...p, phases: p.phases.map(ph => ph.id !== phaseId ? ph : { ...ph, expanded: !ph.expanded }) };
    }));
  }, []);

  const toggleHabit = useCallback((id: string) => {
    const today = todayStr();
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      const wasDone = h.history[today] === true;
      const newHistory = { ...h.history, [today]: !wasDone };
      let streak = 0; const d = new Date();
      if (wasDone) d.setDate(d.getDate() - 1);
      for (let i = 0; i < 365; i++) {
        const ds = d.toISOString().split("T")[0];
        if ((ds === today ? !wasDone : h.history[ds])) { streak++; d.setDate(d.getDate() - 1); } else break;
      }
      return { ...h, history: newHistory, streak, bestStreak: Math.max(h.bestStreak, streak) };
    }));
  }, []);

  const addJournalEntry = useCallback((entry: JournalEntry) => {
    setJournal(prev => [entry, ...prev]);
  }, []);

  // ─── Keyboard shortcuts ──────────────────────────────────────────

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (editingStep || showJournalModal) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const tabKeys: Record<string, Tab> = { "1": "now", "2": "plans", "3": "habits", "4": "journal", "5": "review" };
      if (tabKeys[e.key]) { setTab(tabKeys[e.key]); e.preventDefault(); }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); document.querySelector<HTMLInputElement>('input[placeholder*="Add anything"]')?.focus(); }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [editingStep, showJournalModal]);

  // ─── Derived state ───────────────────────────────────────────────

  const today = todayStr();
  const allPlanSteps = useMemo(() => plans.flatMap(p => p.phases.flatMap(ph => ph.steps)), [plans]);
  const allSteps = useMemo(() => [...steps, ...allPlanSteps], [steps, allPlanSteps]);
  const doneToday = allSteps.filter(s => s.done && s.completedAt === today).length;
  const doneCount = allSteps.filter(s => s.done).length;
  const totalStreak = habits.reduce((a, h) => a + h.streak, 0);
  const inboxCount = steps.filter(s => s.areaId === null && !s.done).length;

  const filteredSteps = useMemo(() => {
    let list = [...steps, ...allPlanSteps];
    if (filterArea === "__inbox__") list = list.filter(s => s.areaId === null);
    else if (filterArea) list = list.filter(s => s.areaId === filterArea);
    if (!showDone) list = list.filter(s => !s.done);
    return list.sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      if (a.priority !== b.priority) return b.priority - a.priority;
      return a.order - b.order;
    });
  }, [steps, allPlanSteps, filterArea, showDone]);

  const urgentSteps = filteredSteps.filter(s => s.priority === 2 && !s.done);
  const nextStepsList = filteredSteps.filter(s => s.priority === 1 && !s.done);
  const backlogSteps = filteredSteps.filter(s => s.priority === 0 && !s.done);
  const doneSteps = showDone ? filteredSteps.filter(s => s.done) : [];

  const heroTask = useMemo(() => {
    const all = [...steps, ...allPlanSteps].filter(s => !s.done);
    return all.find(s => s.priority === 2) ?? all.find(s => s.priority === 1) ?? null;
  }, [steps, allPlanSteps]);
  const heroArea = heroTask ? areas.find(a => a.id === heroTask.areaId) : null;

  const activePlan = activePlanId ? plans.find(p => p.id === activePlanId) : null;

  const uncheckedHabits = habits.filter(h => h.history[today] !== true).length;
  const shapeParts: string[] = [];
  if (urgentSteps.length > 0) shapeParts.push(`${urgentSteps.length} urgent`);
  if (nextStepsList.length > 0) shapeParts.push(`${nextStepsList.length} up next`);
  if (uncheckedHabits > 0) shapeParts.push(`${uncheckedHabits} habit${uncheckedHabits > 1 ? "s" : ""} left`);
  const shapeLine = shapeParts.length > 0 ? shapeParts.join(" · ") : "Clear day.";

  const aiNudge = useMemo(() => {
    const stalePlan = plans.find(p => {
      const pSteps = p.phases.flatMap(ph => ph.steps);
      if (pSteps.every(s => s.done)) return false;
      const last = pSteps.filter(s => s.done && s.completedAt).sort((a, b) => (b.completedAt || "").localeCompare(a.completedAt || ""))[0];
      return last?.completedAt ? daysBetween(last.completedAt, todayStr()) >= 7 : daysBetween(p.createdAt, todayStr()) >= 7;
    });
    if (stalePlan) return `${stalePlan.title} hasn't moved in a week. 90 minutes today?`;
    const journalStreak = (() => { let s = 0; for (let i = 0; i < 30; i++) { const d = new Date(); d.setDate(d.getDate() - i); const ds = d.toISOString().split("T")[0]; if (journal.find(j => j.date === ds)) s++; else break; } return s; })();
    if (journalStreak >= 3) return `${journalStreak}-day journal streak. Keep it alive.`;
    if (uncheckedHabits === 0 && habits.length > 0) return "All habits checked. Now the hard stuff.";
    if (inboxCount >= 3) return `${inboxCount} items in inbox. 2 minutes to triage?`;
    if (urgentSteps.length === 0 && backlogSteps.length > 3) return "Nothing urgent. Good day for a backlog sweep.";
    return null;
  }, [plans, journal, uncheckedHabits, habits.length, inboxCount, urgentSteps.length, backlogSteps.length]);

  const stepsByPlan = useMemo(() => {
    const undone = filteredSteps.filter(s => !s.done);
    const groups: { planId: string | null; planTitle: string; planColor: string; steps: Step[] }[] = [];
    const planMap = new Map<string | null, Step[]>();
    for (const s of undone) {
      const key = s.planId ?? null;
      if (!planMap.has(key)) planMap.set(key, []);
      planMap.get(key)!.push(s);
    }
    for (const [planId, pSteps] of planMap) {
      const plan = planId ? plans.find(p => p.id === planId) : null;
      groups.push({ planId, planTitle: plan?.title ?? "Loose steps", planColor: plan?.color ?? "var(--text-3)", steps: pSteps });
    }
    return groups;
  }, [filteredSteps, plans]);

  const smartToggle = useCallback((id: string) => {
    const s = [...steps, ...allPlanSteps].find(x => x.id === id);
    if (s?.planId) togglePlanStep(s.planId, id); else toggleStep(id);
  }, [steps, allPlanSteps, togglePlanStep, toggleStep]);

  // ─── Loading ─────────────────────────────────────────────────────

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          className="w-4 h-4 border-[1.5px] border-[var(--amber)] border-t-transparent rounded-full" />
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // Now surface
  // ═══════════════════════════════════════════════════════════════════

  const nowSurface = (
    <div className="max-w-xl lg:max-w-[1100px] mx-auto px-4 lg:px-8 py-6 lg:py-8 pb-48">
      <Header doneToday={doneToday} theme={theme} onToggleTheme={toggleTheme} />
      <p className="text-[11px] font-mono text-[var(--text-4)] mb-4">{shapeLine}</p>
      <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1 mb-4 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button onClick={() => setFilterArea(null)} className="flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-mono transition-all"
          style={{ backgroundColor: filterArea === null ? "var(--text)" : "var(--surface)", color: filterArea === null ? "var(--bg)" : "var(--text-3)", border: filterArea === null ? "none" : "1px solid var(--border)" }}>All</button>
        <button onClick={() => setFilterArea(filterArea === "__inbox__" ? null : "__inbox__")} className="flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-mono transition-all"
          style={{ backgroundColor: filterArea === "__inbox__" ? "var(--text-3)" : "var(--surface)", color: filterArea === "__inbox__" ? "var(--bg)" : "var(--text-3)", border: filterArea === "__inbox__" ? "none" : "1px solid var(--border)" }}>Inbox{inboxCount > 0 ? ` (${inboxCount})` : ""}</button>
        {areas.map(a => (
          <button key={a.id} onClick={() => setFilterArea(filterArea === a.id ? null : a.id)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-mono transition-all whitespace-nowrap"
            style={filterArea === a.id ? { backgroundColor: a.color, color: "#0b0908" } : { backgroundColor: "var(--surface)", color: "var(--text-3)", border: "1px solid var(--border)" }}>{a.name}</button>
        ))}
      </div>
      <div className="flex items-center gap-5 text-[11px] font-mono text-[var(--text-3)] mb-4">
        <span className="flex items-center gap-1.5"><Zap size={11} className="text-[var(--amber)]" /> <span className="text-[var(--text)] font-semibold">{doneToday}</span> today</span>
        <span className="flex items-center gap-1.5"><CheckCircle2 size={11} className="text-[var(--emerald)]" /> <span className="text-[var(--text)] font-semibold">{doneCount}</span>/{allSteps.length}</span>
        {totalStreak > 0 && <span className="flex items-center gap-1.5"><Flame size={11} className="text-[var(--coral)]" /> <span className="text-[var(--text)] font-semibold">{totalStreak}</span> streak</span>}
      </div>

      <div className="lg:flex lg:gap-10">
        <div className="flex-1 min-w-0 lg:max-w-[720px]">
          {aiNudge && <p className="text-[11px] font-mono italic text-[var(--text-3)] mb-4 px-1">{aiNudge}</p>}
          {heroTask && heroArea && <RightNowBlock task={heroTask} area={heroArea} onOpen={() => setEditingStep(heroTask)} onTick={() => { if (heroTask.planId) togglePlanStep(heroTask.planId, heroTask.id); else toggleStep(heroTask.id); }} />}
          <div className="lg:hidden"><LifePulse areas={areas} plans={plans} allSteps={allSteps} /></div>
          <div className="lg:hidden mb-6"><HabitsStrip habits={habits} onToggle={toggleHabit} /></div>

          <InboxPulse count={inboxCount} onTap={() => setFilterArea("__inbox__")} />

          <div className="flex items-center gap-1.5 mb-3 px-1">
            {(["priority", "plan"] as const).map(g => (
              <button key={g} onClick={() => setGroupBy(g)} className="px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider rounded-md transition-all"
                style={{ backgroundColor: groupBy === g ? "var(--surface-3)" : "transparent", color: groupBy === g ? "var(--text)" : "var(--text-5)" }}>
                By {g}
              </button>
            ))}
          </div>

          {groupBy === "priority" ? (
            <div className="space-y-1">
              <StepSection label="Do now" color="var(--rose)" steps={urgentSteps} areas={areas} onToggle={smartToggle} onEdit={setEditingStep} />
              <StepSection label="Up next" color="var(--amber)" steps={nextStepsList} areas={areas} onToggle={smartToggle} onEdit={setEditingStep} />
              <StepSection label="Backlog" color="var(--text-4)" steps={backlogSteps} areas={areas} onToggle={smartToggle} onEdit={setEditingStep} />
            </div>
          ) : (
            <div className="space-y-1">
              {stepsByPlan.map(g => (
                <StepSection key={g.planId ?? "loose"} label={g.planTitle} color={g.planColor} steps={g.steps} areas={areas} onToggle={smartToggle} onEdit={setEditingStep} />
              ))}
            </div>
          )}

          {doneCount > 0 && (
            <div className="mt-2">
              <button onClick={() => setShowDone(!showDone)} className="flex items-center gap-2 px-3 py-2 text-[var(--text-5)] hover:text-[var(--text-3)] transition-colors">
                <CheckCircle2 size={12} /><span className="text-[9px] font-mono uppercase tracking-[0.2em]">Completed ({allSteps.filter(s => s.done).length})</span>
                <motion.div animate={{ rotate: showDone ? 180 : 0 }} transition={{ duration: 0.25 }}><ChevronDown size={12} /></motion.div>
              </button>
              <AnimatePresence mode="popLayout">
                {doneSteps.map(s => <StepRow key={s.id} step={s} area={areas.find(a => a.id === s.areaId)} onToggle={() => s.planId ? togglePlanStep(s.planId, s.id) : toggleStep(s.id)} onEdit={() => setEditingStep(s)} />)}
              </AnimatePresence>
            </div>
          )}

          {filteredSteps.filter(s => !s.done).length === 0 && <EmptyState icon={Sparkles} title={filterArea ? "All clear here." : "Nothing on your plate."} subtitle={filterArea ? undefined : "Capture something below."} />}
          <DreamsBanner dreams={dreams} />
        </div>

        <aside className="hidden lg:block w-[320px] flex-shrink-0">
          <div className="sticky top-8 space-y-5">
            <LifePulse areas={areas} plans={plans} allSteps={allSteps} />
            <HabitsStrip habits={habits} onToggle={toggleHabit} />
          </div>
        </aside>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════
  // Plans surface
  // ═══════════════════════════════════════════════════════════════════

  const plansSurface = activePlan ? (
    <PlanDetail plan={activePlan} areas={areas} onBack={() => setActivePlanId(null)}
      onToggleStep={togglePlanStep} onTogglePhase={togglePhaseExpanded} />
  ) : (
    <div className="max-w-xl mx-auto px-4 py-8 pb-48">
      <h1 className="font-serif text-[30px] leading-[1.05] font-semibold tracking-tight mb-8">Plans</h1>
      {plans.length > 0 ? (
        <div className="flex flex-col gap-3 lg:grid lg:grid-cols-2">
          {plans.map(p => <PlanCard key={p.id} plan={p} onOpen={() => setActivePlanId(p.id)} />)}
        </div>
      ) : (
        <EmptyState icon={Compass} title="No journeys yet." subtitle={`Start one with the capture bar — type a goal and tap "plan it."`} />
      )}
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════
  // Habits surface
  // ═══════════════════════════════════════════════════════════════════

  const habitsSurface = (
    <div className="max-w-xl mx-auto px-4 py-8 pb-48">
      <h1 className="font-serif text-[30px] leading-[1.05] font-semibold tracking-tight mb-8">Habits</h1>
      <HabitsStrip habits={habits} onToggle={toggleHabit} />
      <div className="mt-8">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-4)] mb-4">Best streaks</p>
        <div className="space-y-2">
          {habits.map(h => (
            <div key={h.id} className="flex items-center gap-3">
              <span className="text-[14px] flex-1">{h.name}</span>
              <span className="text-[11px] font-mono" style={{ color: h.color }}>Current: {h.streak}</span>
              <span className="text-[11px] font-mono text-[var(--text-4)]">Best: {h.bestStreak}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════
  // Journal surface
  // ═══════════════════════════════════════════════════════════════════

  const journalSurface = (
    <div className="max-w-xl mx-auto px-4 py-8 pb-48">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-[30px] leading-[1.05] font-semibold tracking-tight">Journal</h1>
        <button onClick={() => setShowJournalModal(true)} className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--surface)] border border-[var(--border)] text-[var(--text-3)] hover:text-[var(--text)] transition-colors" aria-label="New entry">
          <Plus size={16} strokeWidth={1.8} />
        </button>
      </div>
      {journal.length > 0
        ? journal.map(e => <JournalEntryCard key={e.id} entry={e} />)
        : <EmptyState icon={PenLine} title="Your first entry waits." />
      }
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════
  // Review surface
  // ═══════════════════════════════════════════════════════════════════

  const reviewSurface = <ReviewScreen areas={areas} steps={steps} plans={plans} habits={habits} journal={journal}
    weeklyTargets={weeklyTargets}
    onSaveReflection={(body) => addJournalEntry({ id: uid(), date: todayStr(), body, type: "Reflection", title: "Weekly reflection" })}
    onSaveCounterfactual={(body) => addJournalEntry({ id: uid(), date: todayStr(), body, type: "Counterfactual", title: "Counterfactual" })}
    onAddTarget={(text) => setWeeklyTargets(prev => [...prev, { id: uid(), text, weekOf: getMonday(), hit: false }])}
    onToggleTarget={(id) => setWeeklyTargets(prev => prev.map(t => t.id === id ? { ...t, hit: !t.hit } : t))} />;

  const surfaces: Record<Tab, React.ReactNode> = {
    now: nowSurface, plans: plansSurface, habits: habitsSurface,
    journal: journalSurface, review: reviewSurface,
  };

  // ═══════════════════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen relative safe-top">
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          {surfaces[tab]}
        </motion.div>
      </AnimatePresence>

      <div className="fixed bottom-0 inset-x-0 z-40">
        <div className="h-24 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/95 to-transparent pointer-events-none" />
        <div className="bg-[var(--bg)] px-4 pb-3">
          <div className="max-w-xl lg:max-w-[720px] mx-auto">
            <CaptureBar areas={areas} onAdd={addStep} onJournal={() => setShowJournalModal(true)} defaultAreaId={filterArea === "__inbox__" ? null : filterArea} />
          </div>
        </div>
        <BottomTabs active={tab} onChange={(t) => { setTab(t); setActivePlanId(null); }} />
      </div>

      <AnimatePresence>
        {editingStep && <EditDrawer step={editingStep} areas={areas}
          onSave={editingStep.planId ? updatePlanStep : updateStep}
          onDelete={() => editingStep.planId ? deletePlanStep(editingStep.id, editingStep.planId!) : deleteStep(editingStep.id)}
          onClose={() => setEditingStep(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showJournalModal && <JournalModal onClose={() => setShowJournalModal(false)} onSave={addJournalEntry} />}
      </AnimatePresence>
    </div>
  );
}
