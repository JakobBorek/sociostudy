import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useStudyData } from "@/contexts/StudyDataContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { buildGapFill, mergeDocs, type Segment } from "@/lib/gapFill";
import { seedDocFromUnit } from "@/lib/notebookSeed";
import { Button } from "@/components/ui/button";
import { Trophy, RotateCcw, CheckCircle2, XCircle, BookOpen, Lock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Scope = { kind: "unit"; unitId: string } | { kind: "all" };
type GradeMap = Record<string, { correct: boolean; reason: string }>;

export default function ProvePage() {
  const { units, topics } = useStudyData();
  const { user } = useAuth();
  const [scope, setScope] = useState<Scope | null>(null);
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [grades, setGrades] = useState<GradeMap>({});
  const [grading, setGrading] = useState(false);
  const [retryOnly, setRetryOnly] = useState(false);

  // Load notebook content when scope is chosen
  useEffect(() => {
    if (!scope || !user) return;
    let active = true;
    (async () => {
      setLoading(true);
      setAnswers({});
      setGrades({});
      setRetryOnly(false);

      if (scope.kind === "unit") {
        const unit = units.find((u) => u.id === scope.unitId)!;
        const { data } = await supabase
          .from("notebook_pages")
          .select("content")
          .eq("user_id", user.id)
          .eq("unit_id", scope.unitId)
          .maybeSingle();
        const content =
          data?.content && Object.keys(data.content).length ? data.content : seedDocFromUnit(unit, topics);
        if (active) setDoc(content);
      } else {
        const { data } = await supabase
          .from("notebook_pages")
          .select("unit_id, content")
          .eq("user_id", user.id);
        const map = new Map((data ?? []).map((r) => [r.unit_id, r.content]));
        const merged = mergeDocs(
          units.map((u) => ({
            unit: u.id,
            doc: map.get(u.id) ?? seedDocFromUnit(u, topics),
          })),
        );
        if (active) setDoc(merged);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [scope, user, units, topics]);

  const { segments, blanks } = useMemo(
    () => (doc ? buildGapFill(doc, { density: scope?.kind === "all" ? 9 : 7 }) : { segments: [], blanks: [] }),
    [doc, scope],
  );

  const visibleBlankIds = useMemo(() => {
    if (!retryOnly) return new Set(blanks.map((b) => b.id));
    return new Set(blanks.filter((b) => grades[b.id] && !grades[b.id].correct).map((b) => b.id));
  }, [blanks, grades, retryOnly]);

  const submit = async () => {
    if (blanks.length === 0) return;
    setGrading(true);
    try {
      const items = blanks
        .filter((b) => !retryOnly || (grades[b.id] && !grades[b.id].correct))
        .map((b) => ({
          id: b.id,
          expected: b.expected,
          user_answer: answers[b.id] ?? "",
          context: b.context,
        }));
      const { data, error } = await supabase.functions.invoke("check-gap-fill", { body: { items } });
      if (error) throw error;
      const next: GradeMap = { ...grades };
      for (const r of (data as any).results ?? []) next[r.id] = { correct: r.correct, reason: r.reason };
      setGrades(next);

      // Persist attempt
      const total = items.length;
      const correct = items.filter((it) => next[it.id]?.correct).length;
      await supabase.from("gap_fill_answers").upsert(
        {
          user_id: user!.id,
          topic_id: scope?.kind === "unit" ? `unit:${scope.unitId}` : "all",
          answers: { answers, grades: next, score: correct, total },
        },
        { onConflict: "user_id,topic_id" },
      );
    } catch (e) {
      toast({ title: "Couldn't grade answers", description: (e as Error).message, variant: "destructive" });
    } finally {
      setGrading(false);
    }
  };

  const stats = useMemo(() => {
    const graded = Object.values(grades);
    return { total: blanks.length, graded: graded.length, correct: graded.filter((g) => g.correct).length };
  }, [blanks, grades]);

  /* ----------------- Scope picker ----------------- */
  if (!scope) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="gradient-navy rounded-2xl p-6 text-primary-foreground">
          <h1 className="font-display text-3xl font-bold flex items-center gap-2">
            <Trophy /> Prove Your Knowledge
          </h1>
          <p className="text-primary-foreground/70 text-sm mt-1">
            Your notebook turns into a fill-in-the-blanks. Type the missing words and we'll grade them with AI.
          </p>
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold mb-3">Choose a scope</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {units.map((u) => (
              <button
                key={u.id}
                onClick={() => setScope({ kind: "unit", unitId: u.id })}
                className="text-left rounded-xl border bg-card p-4 card-hover"
              >
                <div className="text-3xl mb-2">{u.icon}</div>
                <div className="text-xs uppercase text-muted-foreground tracking-wide">Unit {u.id}</div>
                <h3 className="font-display font-semibold text-base mt-1">{u.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{u.description}</p>
              </button>
            ))}
            <button
              onClick={() => setScope({ kind: "all" })}
              className="text-left rounded-xl border-2 border-accent bg-accent/10 p-4 card-hover"
            >
              <div className="text-3xl mb-2">🔒</div>
              <div className="text-xs uppercase text-accent-foreground/80 font-semibold tracking-wide">Lock-in mode</div>
              <h3 className="font-display font-semibold text-base mt-1">Whole Notebook</h3>
              <p className="text-xs text-muted-foreground mt-1">Every unit, one giant gap-fill. Prove you know it cold.</p>
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  /* ----------------- Quiz view ----------------- */
  const scopeLabel =
    scope.kind === "all" ? "Whole Notebook" : `Unit ${scope.unitId} — ${units.find((u) => u.id === scope.unitId)?.shortTitle ?? ""}`;
  const hasGrades = Object.keys(grades).length > 0;
  const allCorrect = hasGrades && stats.correct === stats.total;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Prove Your Knowledge</div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            {scope.kind === "all" ? <Lock size={18} /> : <BookOpen size={18} />} {scopeLabel}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {hasGrades && (
            <div className="rounded-lg bg-card border px-3 py-1.5 text-sm font-semibold">
              {stats.correct} / {stats.graded}
            </div>
          )}
          <Button variant="outline" size="sm" onClick={() => setScope(null)}>Change scope</Button>
        </div>
      </div>

      {loading || !doc ? (
        <div className="ruled-page text-muted-foreground">Loading your notebook…</div>
      ) : blanks.length === 0 ? (
        <div className="ruled-page text-muted-foreground">
          There isn't enough content in this notebook page yet to make blanks. Open the Notebook and add some text first.
        </div>
      ) : (
        <div className="ruled-page">
          <div className="notebook-prose">
            {renderSegments(segments, {
              visibleBlankIds,
              answers,
              setAnswers,
              grades,
            })}
          </div>
        </div>
      )}

      {blanks.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 sticky bottom-3 z-20">
          <p className="text-xs text-muted-foreground">
            {retryOnly ? "Showing only the ones you got wrong." : `${blanks.length} blanks total.`}
          </p>
          <div className="flex gap-2">
            {hasGrades && !allCorrect && (
              <Button
                variant="outline"
                onClick={() => {
                  setRetryOnly(true);
                  const wrongIds = blanks.filter((b) => grades[b.id] && !grades[b.id].correct).map((b) => b.id);
                  setAnswers((a) => {
                    const next = { ...a };
                    for (const id of wrongIds) next[id] = "";
                    return next;
                  });
                }}
              >
                <RotateCcw size={14} /> Retry wrong ones
              </Button>
            )}
            {hasGrades && allCorrect && (
              <div className="px-3 py-1.5 rounded-lg bg-success/15 text-success text-sm font-semibold flex items-center gap-1">
                <CheckCircle2 size={14} /> Locked in!
              </div>
            )}
            <Button onClick={submit} disabled={grading}>
              {grading ? "Grading…" : hasGrades ? "Re-check" : "Submit answers"}
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ----------------- Renderer ----------------- */
function renderSegments(
  segments: Segment[],
  ctx: {
    visibleBlankIds: Set<string>;
    answers: Record<string, string>;
    setAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    grades: GradeMap;
  },
) {
  const out: React.ReactNode[] = [];
  let buf: React.ReactNode[] = [];
  let idx = 0;

  const flushBuf = () => {
    if (buf.length === 0) return;
    out.push(<p key={`p${idx++}`}>{buf}</p>);
    buf = [];
  };

  segments.forEach((seg, i) => {
    if (seg.kind === "break") {
      flushBuf();
    } else if (seg.kind === "heading") {
      flushBuf();
      const H = (`h${seg.level}` as unknown) as keyof JSX.IntrinsicElements;
      out.push(<H key={`h${idx++}`}>{seg.text}</H>);
    } else if (seg.kind === "text") {
      buf.push(<span key={i}>{seg.text}</span>);
    } else if (seg.kind === "blank") {
      if (!ctx.visibleBlankIds.has(seg.id)) {
        // Already correct — show the word in green so they see what it was.
        const grade = ctx.grades[seg.id];
        buf.push(
          <span
            key={i}
            className="inline-block px-1 mx-0.5 rounded text-success border-b-2 border-success/40"
            title={grade?.reason}
          >
            {ctx.answers[seg.id] || seg.expected}
          </span>,
        );
        return;
      }
      buf.push(<Blank key={i} seg={seg} ctx={ctx} />);
    }
  });
  flushBuf();
  return out;
}

function Blank({
  seg,
  ctx,
}: {
  seg: Extract<Segment, { kind: "blank" }>;
  ctx: { answers: Record<string, string>; setAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>; grades: GradeMap };
}) {
  const value = ctx.answers[seg.id] ?? "";
  const grade = ctx.grades[seg.id];
  const ref = useRef<HTMLInputElement>(null);
  // Auto width based on expected length (min 5ch)
  const widthCh = Math.max(seg.expected.length + 2, 6);

  const stateClass = grade
    ? grade.correct
      ? "border-success text-success"
      : "border-destructive text-destructive"
    : "border-[hsl(210_80%_50%)] text-foreground";

  return (
    <span className="inline-flex items-baseline mx-0.5 align-baseline">
      <input
        ref={ref}
        value={value}
        onChange={(e) => ctx.setAnswers((a) => ({ ...a, [seg.id]: e.target.value }))}
        title={grade?.reason}
        className={`bg-transparent outline-none border-0 border-b-2 px-1 text-center font-medium ${stateClass}`}
        style={{ width: `${widthCh}ch`, lineHeight: "28px" }}
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />
      {grade && (
        <span className="ml-1">
          {grade.correct ? (
            <CheckCircle2 size={14} className="text-success" />
          ) : (
            <XCircle size={14} className="text-destructive" />
          )}
        </span>
      )}
    </span>
  );
}
