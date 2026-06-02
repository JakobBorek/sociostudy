import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useStudyData } from "@/contexts/StudyDataContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { seedDocFromUnit } from "@/lib/notebookSeed";
import type { Unit, StudyTopic } from "@/data/studyContent";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Loader2, Sparkles, Pencil, CheckCircle2, RotateCw, ChevronLeft, History, Lock, Globe } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAiAccess } from "@/hooks/useAiAccess";
import { getPresetPaper } from "@/data/presetExams";
import AiAccessDialog from "@/components/AiAccessDialog";

/* ----------------------------- Types ----------------------------- */
interface Part {
  id: string;
  label: string;
  marks: number;
  command: string;
  prompt: string;
}
interface Question {
  number: number;
  heading: string;
  source?: { title: string; text: string };
  parts: Part[];
}
interface Paper {
  title: string;
  instructions: string;
  questions: Question[];
}
interface Grade {
  awarded: number;
  marks: number;
  command: string;
  reason: string;
  sentences: { text: string; issue: string }[];
}
type GradeMap = Record<string, Grade>;

/* ----------------------------- Helpers ----------------------------- */
function unitToContext(unit: Unit, topics: StudyTopic[]): string {
  const ts = topics.filter((t) => t.unit === unit.id);
  const lines: string[] = [`# ${unit.title}`, unit.description, ""];
  for (const t of ts) {
    lines.push(`## ${t.term}`);
    lines.push(t.definition);
    if (t.pros?.length) lines.push(`Strengths: ${t.pros.join("; ")}`);
    if (t.cons?.length) lines.push(`Limitations: ${t.cons.join("; ")}`);
    if (t.notes?.length) lines.push(t.notes.join(" "));
    lines.push("");
  }
  return lines.join("\n");
}

function splitSentences(text: string): string[] {
  return text.replace(/\s+/g, " ").match(/[^.!?]+[.!?]?/g)?.map((s) => s.trim()).filter(Boolean) ?? [];
}

/* ----------------------------- Page ----------------------------- */
export default function MockExamPage() {
  const { units, topics } = useStudyData();
  const { user } = useAuth();

  const { mode } = useAiAccess();
  const isFree = mode === "free";

  const [unitIds, setUnitIds] = useState<string[]>([]);
  const [paper, setPaper] = useState<Paper | null>(null);
  const [examId, setExamId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [grades, setGrades] = useState<GradeMap>({});
  const [marking, setMarking] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);

  const selectedUnits = useMemo(
    () => units.filter((u) => unitIds.includes(u.id)),
    [units, unitIds],
  );
  const context = useMemo(
    () => selectedUnits.map((u) => unitToContext(u, topics)).join("\n\n---\n\n"),
    [selectedUnits, topics],
  );
  const primaryUnit = selectedUnits[0] ?? null;
  const toggleUnit = (id: string) =>
    setUnitIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const pickPreset = (id: string, title: string) => {
    const p = getPresetPaper(id) as unknown as Paper;
    setUnitIds([id]);
    setPaper(p);
    setAnswers({});
    setGrades({});
    setExamId(null);
  };

  /* ---------- Load history ---------- */
  useEffect(() => {
    if (!user || isFree) return;
    supabase
      .from("mock_exams")
      .select("id, unit_id, unit_title, total_awarded, total_available, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => setHistory(data ?? []));
  }, [user, examId, grades]);

  /* ---------- Generate paper ---------- */
  const generate = async () => {
    if (selectedUnits.length === 0 || !user) return;
    setGenerating(true);
    setPaper(null);
    setAnswers({});
    setGrades({});
    setExamId(null);
    try {
      const ids = selectedUnits.map((u) => u.id);
      const titles = selectedUnits.map((u) => u.title);
      const { data, error } = await supabase.functions.invoke("generate-mock-exam", {
        body: { unit_id: ids, unit_title: titles, topic_context: context },
      });
      if (error) throw error;
      const p = (data as any).paper as Paper;
      setPaper(p);
      const { data: row, error: insErr } = await supabase
        .from("mock_exams")
        .insert({
          user_id: user.id,
          unit_id: ids.join(","),
          unit_title: titles.join(" + "),
          paper: p as any,
          answers: {},
          grades: {},
          status: "in_progress",
        })
        .select("id")
        .single();
      if (insErr) throw insErr;
      setExamId(row.id);
    } catch (e) {
      toast({ title: "Couldn't generate paper", description: (e as Error).message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  /* ---------- Save answers (debounced) ---------- */
  useEffect(() => {
    if (!examId) return;
    const t = setTimeout(() => {
      supabase.from("mock_exams").update({ answers }).eq("id", examId);
    }, 800);
    return () => clearTimeout(t);
  }, [answers, examId]);

  /* ---------- Mark ---------- */
  const mark = async () => {
    if (!paper || !examId) return;
    setMarking(true);
    try {
      const { data, error } = await supabase.functions.invoke("mark-mock-exam", {
        body: { paper, answers, topic_context: context },
      });
      if (error) throw error;
      const g = (data as any).grades as GradeMap;
      const total_awarded = (data as any).total_awarded as number;
      const total_available = (data as any).total_available as number;
      setGrades(g);
      await supabase
        .from("mock_exams")
        .update({ grades: g as any, total_awarded, total_available, status: "marked" })
        .eq("id", examId);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      toast({ title: "Couldn't mark paper", description: (e as Error).message, variant: "destructive" });
    } finally {
      setMarking(false);
    }
  };

  /* ---------- Rewrite a sentence ---------- */
  const rewrite = async (part: Part, sentence: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("rewrite-exam-sentence", {
        body: {
          question_prompt: part.prompt,
          command: part.command,
          marks: part.marks,
          original_answer: answers[part.id] ?? "",
          sentence,
          topic_context: context,
        },
      });
      if (error) throw error;
      const rw = ((data as any).rewrite ?? "").trim();
      if (!rw) return;
      setAnswers((a) => {
        const cur = a[part.id] ?? "";
        const next = cur.includes(sentence) ? cur.replace(sentence, rw) : `${cur} ${rw}`.trim();
        return { ...a, [part.id]: next };
      });
      toast({ title: "Suggested edit applied", description: "Reread it then Re-analyze." });
    } catch (e) {
      toast({ title: "Couldn't rewrite", description: (e as Error).message, variant: "destructive" });
    }
  };

  const totals = useMemo(() => {
    if (!paper) return { awarded: 0, available: 0 };
    let awarded = 0;
    let available = 0;
    for (const q of paper.questions) for (const p of q.parts) {
      available += p.marks;
      if (grades[p.id]) awarded += grades[p.id].awarded;
    }
    return { awarded, available };
  }, [paper, grades]);

  const hasGrades = Object.keys(grades).length > 0;

  /* ----------------------------- Unit picker ----------------------------- */
  if (unitIds.length === 0 || !paper) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="gradient-navy rounded-2xl p-6 text-primary-foreground">
          <h1 className="font-display text-3xl font-bold flex items-center gap-2">
            <FileText /> Mock Exam — IGCSE Sociology 0495
          </h1>
          <p className="text-primary-foreground/70 text-sm mt-1">
            {isFree
              ? "Pick a unit (or the general paper) to open a pre-set Paper 1-style mock with real command words and mark tariffs. Add your own Gemini API key in settings to unlock AI marking."
              : "Pick one or more units. We generate a full Paper 1-style mock with real command words and mark tariffs, then mark it like an examiner."}
          </p>
        </div>

        {isFree && (
          <div className="rounded-xl border border-accent/40 bg-accent/5 p-4 flex items-start gap-3">
            <Lock size={18} className="text-accent mt-0.5 shrink-0" />
            <div className="flex-1 text-sm">
              <p className="font-semibold">Pre-set practice papers</p>
              <p className="text-muted-foreground mt-0.5">
                You're on the free plan — AI generation and AI marking are off. You still get one ready-made Paper 1 mock per unit, plus a general mixed paper. You can write answers and self-mark.
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => setAiDialogOpen(true)}>
              Add API key
            </Button>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-semibold">
              {isFree
                ? "Choose a paper"
                : <>Choose units {unitIds.length > 0 && <span className="text-muted-foreground text-sm">({unitIds.length} selected)</span>}</>}
            </h2>
            {!isFree && (
              <Button variant="ghost" size="sm" onClick={() => setShowHistory((s) => !s)}>
                <History size={14} /> {showHistory ? "Hide" : "Past attempts"}
              </Button>
            )}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {units.map((u) => {
              const active = unitIds.includes(u.id);
              return (
                <button
                  key={u.id}
                  onClick={() => (isFree ? pickPreset(u.id, u.title) : toggleUnit(u.id))}
                  className={`text-left rounded-xl border bg-card p-4 card-hover transition ${
                    active ? "ring-2 ring-accent border-accent" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="text-3xl mb-2">{u.icon}</div>
                    {active && <CheckCircle2 size={18} className="text-accent" />}
                  </div>
                  <div className="text-xs uppercase text-muted-foreground tracking-wide">Unit {u.id}</div>
                  <h3 className="font-display font-semibold text-base mt-1">{u.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{u.description}</p>
                </button>
              );
            })}
            {isFree && (
              <button
                onClick={() => pickPreset("general", "General Mixed Paper")}
                className="text-left rounded-xl border-2 border-dashed border-accent/50 bg-card p-4 card-hover transition"
              >
                <div className="text-3xl mb-2"><Globe size={28} className="text-accent" /></div>
                <div className="text-xs uppercase text-muted-foreground tracking-wide">General</div>
                <h3 className="font-display font-semibold text-base mt-1">Mixed Paper 1 Mock</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  A blended practice paper covering theory, identity and inequality.
                </p>
              </button>
            )}
          </div>
        </div>

        {!isFree && unitIds.length > 0 && (
          <div className="flex justify-end">
            <Button onClick={generate} disabled={generating} size="lg">
              {generating ? <><Loader2 className="animate-spin" size={16} /> Generating paper…</> : <><Sparkles size={16} /> Generate Mock Paper</>}
            </Button>
          </div>
        )}

        {!isFree && showHistory && (
          <div className="rounded-xl border bg-card p-4">
            <h3 className="font-semibold mb-2">Your past attempts</h3>
            {history.length === 0 && <p className="text-sm text-muted-foreground">No attempts yet.</p>}
            <ul className="divide-y">
              {history.map((h) => (
                <li key={h.id} className="py-2 flex justify-between items-center text-sm">
                  <div>
                    <div className="font-medium">Unit {h.unit_id} — {h.unit_title}</div>
                    <div className="text-xs text-muted-foreground">{new Date(h.created_at).toLocaleString()}</div>
                  </div>
                  <div className="font-semibold">
                    {h.status === "marked" ? `${h.total_awarded ?? 0} / ${h.total_available ?? 0}` : "Unmarked"}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <AiAccessDialog open={aiDialogOpen} onOpenChange={setAiDialogOpen} />
      </motion.div>
    );
  }

  /* ----------------------------- Paper view ----------------------------- */
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => { setPaper(null); setUnitIds([]); }}>
            <ChevronLeft size={14} /> New paper
          </Button>
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">{primaryUnit?.id}{selectedUnits.length > 1 ? ` +${selectedUnits.length - 1}` : ""} — {primaryUnit?.shortTitle}</div>
            <h1 className="font-display text-xl font-bold">{paper.title}</h1>
          </div>
        </div>
        {hasGrades && (
          <div className="rounded-lg bg-accent/10 border border-accent px-3 py-1.5 text-sm font-bold text-accent-foreground">
            Score: {totals.awarded} / {totals.available}
          </div>
        )}
      </div>

      {/* Exam paper */}
      <div className="rounded-xl border-2 bg-[hsl(0_0%_98%)] p-6 md:p-10 shadow-sm space-y-8 font-serif text-foreground">
        <div className="text-center border-b pb-4">
          <div className="text-xs tracking-[0.3em] uppercase text-muted-foreground">Cambridge IGCSE Sociology 0495</div>
          <h2 className="font-display text-2xl font-bold mt-1">{paper.title}</h2>
          <p className="text-sm italic mt-1">{paper.instructions}</p>
        </div>

        {paper.questions.map((q) => (
          <section key={q.number} className="space-y-4">
            <h3 className="font-display text-lg font-bold border-b pb-1">{q.heading}</h3>

            {q.source && (
              <div className="rounded border-l-4 border-accent bg-card/60 p-3 text-sm">
                <div className="font-semibold mb-1">{q.source.title}</div>
                <p className="leading-relaxed">{q.source.text}</p>
              </div>
            )}

            <ol className="space-y-5">
              {q.parts.map((p) => (
                <PartView
                  key={p.id}
                  part={p}
                  value={answers[p.id] ?? ""}
                  onChange={(v) => setAnswers((a) => ({ ...a, [p.id]: v }))}
                  grade={grades[p.id]}
                  onRewrite={(s) => rewrite(p, s)}
                />
              ))}
            </ol>
          </section>
        ))}
      </div>

      {/* Sticky action bar */}
      <div className="sticky bottom-3 z-20 flex justify-end gap-2">
        {hasGrades && (
          <div className="px-3 py-1.5 rounded-lg bg-success/15 text-success text-sm font-semibold flex items-center gap-1">
            <CheckCircle2 size={14} /> Marked
          </div>
        )}
        {isFree ? (
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-sm font-medium flex items-center gap-1">
              <Lock size={14} /> AI marking locked
            </div>
            <Button size="lg" variant="outline" onClick={() => setAiDialogOpen(true)}>
              Add API key to mark
            </Button>
          </div>
        ) : (
          <Button onClick={mark} disabled={marking} size="lg">
            {marking ? <><Loader2 className="animate-spin" size={16} /> Marking…</> : hasGrades ? <><RotateCw size={14} /> Re-analyze</> : "Evaluate"}
          </Button>
        )}
      </div>
      <AiAccessDialog open={aiDialogOpen} onOpenChange={setAiDialogOpen} />
    </motion.div>
  );
}

/* ----------------------------- Part renderer ----------------------------- */
function PartView({
  part,
  value,
  onChange,
  grade,
  onRewrite,
}: {
  part: Part;
  value: string;
  onChange: (v: string) => void;
  grade?: Grade;
  onRewrite: (sentence: string) => void;
}) {
  const flagged = new Map<string, string>();
  for (const s of grade?.sentences ?? []) flagged.set(s.text.trim(), s.issue);
  const sentences = grade ? splitSentences(value) : [];

  const rows = Math.min(12, Math.max(2, Math.ceil((part.marks * 1.5))));

  return (
    <li className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="leading-snug">
          <span className="font-semibold mr-2">{part.label}</span>
          <span>{part.prompt}</span>
        </div>
        <div className="shrink-0 text-sm font-semibold text-muted-foreground">[{part.marks}]</div>
      </div>

      {!grade && (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder="Your answer…"
          className="font-sans bg-white border-2 border-dashed border-muted-foreground/30 focus-visible:border-accent"
        />
      )}

      {grade && (
        <div className="space-y-2">
          <div className="rounded-md border bg-white p-3 font-sans text-sm leading-relaxed">
            {sentences.length === 0 ? (
              <span className="text-muted-foreground italic">No answer.</span>
            ) : (
              sentences.map((s, i) => {
                const issue = flagged.get(s) ?? flagged.get(s.replace(/[.!?]$/, ""));
                if (!issue) return <span key={i}>{s} </span>;
                return (
                  <span key={i} className="inline">
                    <span className="underline decoration-destructive decoration-wavy underline-offset-4" title={issue}>
                      {s}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRewrite(s)}
                      title={`Suggest edit: ${issue}`}
                      className="inline-flex items-center justify-center align-baseline mx-1 h-5 w-5 rounded-full bg-accent text-accent-foreground hover:scale-110 transition"
                    >
                      <Pencil size={11} />
                    </button>{" "}
                  </span>
                );
              })
            )}
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className={`font-semibold ${grade.awarded === grade.marks ? "text-success" : "text-destructive"}`}>
              {grade.awarded} / {grade.marks} — {grade.reason}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange(value)} /* trigger re-render */
              className="text-xs"
              tabIndex={-1}
              aria-hidden
            />
          </div>
          {/* Re-edit answer */}
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
            className="font-sans bg-white border border-muted-foreground/20"
            placeholder="Edit your answer then Re-analyze…"
          />
        </div>
      )}
    </li>
  );
}
