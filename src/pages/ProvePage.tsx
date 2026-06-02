import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useStudyData } from "@/contexts/StudyDataContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { mergeDocs } from "@/lib/gapFill";
import { seedDocFromUnit } from "@/lib/notebookSeed";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Trophy,
  RotateCcw,
  CheckCircle2,
  XCircle,
  BookOpen,
  Lock,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Scope = { kind: "unit"; unitId: string } | { kind: "all" };
type Question = { id: string; prompt: string; concept: string; hint?: string };
type Grade = { correct: boolean; score: number; feedback: string; model_answer: string };
type GradeMap = Record<string, Grade>;

/* ----------------- Helpers ----------------- */
function docToPlainText(doc: any): string {
  if (!doc?.content) return "";
  const lines: string[] = [];
  const collect = (n: any): string => {
    if (!n) return "";
    if (typeof n.text === "string") return n.text;
    if (Array.isArray(n.content)) return n.content.map(collect).join("");
    return "";
  };
  for (const node of doc.content) {
    if (node.type === "heading") {
      const t = collect(node).trim();
      if (t) lines.push(`\n## ${t}`);
    } else if (node.type === "paragraph" || node.type === "blockquote") {
      const t = collect(node).trim();
      if (t) lines.push(t);
    } else if (node.type === "bulletList" || node.type === "orderedList") {
      const ordered = node.type === "orderedList";
      let i = 1;
      for (const li of node.content ?? []) {
        const t = collect(li).trim();
        if (t) lines.push(`${ordered ? `${i++}.` : "-"} ${t}`);
      }
    }
  }
  return lines.join("\n").trim();
}

export default function ProvePage() {
  const { units, topics } = useStudyData();
  const { user } = useAuth();
  const [scope, setScope] = useState<Scope | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [grading, setGrading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [grades, setGrades] = useState<GradeMap>({});
  const [retryOnly, setRetryOnly] = useState(false);

  // When scope changes, load notes and ask the AI for concept questions.
  useEffect(() => {
    if (!scope || !user) return;
    let active = true;
    (async () => {
      setLoading(true);
      setGenerating(true);
      setQuestions([]);
      setAnswers({});
      setGrades({});
      setRetryOnly(false);
      try {
        let plain = "";
        let scopeLabel = "";
        if (scope.kind === "unit") {
          const unit = units.find((u) => u.id === scope.unitId)!;
          const { data } = await supabase
            .from("notebook_pages")
            .select("content")
            .eq("user_id", user.id)
            .eq("unit_id", scope.unitId)
            .maybeSingle();
          const content =
            data?.content && Object.keys(data.content as any).length
              ? data.content
              : seedDocFromUnit(unit, topics);
          plain = docToPlainText(content);
          scopeLabel = `Unit ${unit.id} — ${unit.title}`;
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
          plain = docToPlainText(merged);
          scopeLabel = "Whole Notebook (all units)";
        }

        if (!active) return;
        if (!plain || plain.length < 50) {
          toast({
            title: "Not enough notebook content",
            description: "Open the Notebook and add some text first.",
            variant: "destructive",
          });
          setQuestions([]);
          return;
        }

        const { data, error } = await supabase.functions.invoke("prove-concepts", {
          body: {
            action: "generate",
            notes: plain,
            count: scope.kind === "all" ? 10 : 6,
            scopeLabel,
          },
        });
        if (error) throw error;
        if (active) setQuestions((data as any).questions ?? []);
      } catch (e) {
        toast({
          title: "Couldn't generate questions",
          description: (e as Error).message,
          variant: "destructive",
        });
      } finally {
        if (active) {
          setLoading(false);
          setGenerating(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [scope, user, units, topics]);

  const visibleQuestions = useMemo(() => {
    if (!retryOnly) return questions;
    return questions.filter((q) => grades[q.id] && !grades[q.id].correct);
  }, [questions, grades, retryOnly]);

  const stats = useMemo(() => {
    const graded = Object.values(grades);
    return {
      total: questions.length,
      graded: graded.length,
      correct: graded.filter((g) => g.correct).length,
    };
  }, [questions, grades]);

  const submit = async () => {
    const pool = retryOnly ? visibleQuestions : questions;
    if (pool.length === 0) return;
    setGrading(true);
    try {
      const items = pool.map((q) => ({
        id: q.id,
        prompt: q.prompt,
        concept: q.concept,
        user_answer: answers[q.id] ?? "",
      }));
      const { data, error } = await supabase.functions.invoke("prove-concepts", {
        body: { action: "grade", items },
      });
      if (error) throw error;
      const next: GradeMap = { ...grades };
      for (const r of (data as any).results ?? []) next[r.id] = r;
      setGrades(next);

      const total = items.length;
      const correct = items.filter((it) => next[it.id]?.correct).length;
      await supabase.from("gap_fill_answers").upsert(
        {
          user_id: user!.id,
          topic_id: scope?.kind === "unit" ? `unit:${scope.unitId}` : "all",
          answers: { questions, answers, grades: next, score: correct, total },
        },
        { onConflict: "user_id,topic_id" },
      );
    } catch (e) {
      toast({
        title: "Couldn't grade answers",
        description: (e as Error).message,
        variant: "destructive",
      });
    } finally {
      setGrading(false);
    }
  };

  /* ----------------- Scope picker ----------------- */
  if (!scope) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="gradient-navy rounded-2xl p-6 text-primary-foreground">
          <h1 className="font-display text-3xl font-bold flex items-center gap-2">
            <Trophy /> Prove Your Knowledge
          </h1>
          <p className="text-primary-foreground/70 text-sm mt-1">
            Short concept questions from your notebook. Answer in your own words — the AI marks for understanding, not exact wording.
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
              <div className="text-xs uppercase text-accent-foreground/80 font-semibold tracking-wide">
                Lock-in mode
              </div>
              <h3 className="font-display font-semibold text-base mt-1">Whole Notebook</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Concept questions drawn from every unit. Prove you know it cold.
              </p>
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  /* ----------------- Quiz view ----------------- */
  const scopeLabel =
    scope.kind === "all"
      ? "Whole Notebook"
      : `Unit ${scope.unitId} — ${units.find((u) => u.id === scope.unitId)?.shortTitle ?? ""}`;
  const hasGrades = Object.keys(grades).length > 0;
  const allCorrect = hasGrades && stats.correct === stats.total && stats.total > 0;

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
          <Button variant="outline" size="sm" onClick={() => setScope(null)}>
            Change scope
          </Button>
        </div>
      </div>

      {loading || generating ? (
        <div className="ruled-page text-muted-foreground flex items-center gap-2">
          <Sparkles size={16} className="animate-pulse" />
          Reading your notebook and writing questions…
        </div>
      ) : questions.length === 0 ? (
        <div className="ruled-page text-muted-foreground">
          No questions yet. Add some content to your notebook for this scope and try again.
        </div>
      ) : (
        <div className="space-y-3">
          {visibleQuestions.map((q, i) => {
            const grade = grades[q.id];
            const borderClass = grade
              ? grade.correct
                ? "border-success/60"
                : "border-destructive/60"
              : "border-border";
            return (
              <div key={q.id} className={`rounded-xl border ${borderClass} bg-card p-4 space-y-2`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Question {i + 1}
                      {q.concept ? ` · ${q.concept}` : ""}
                    </div>
                    <p className="font-display font-semibold text-base mt-0.5">{q.prompt}</p>
                  </div>
                  {grade && (
                    <div className="flex items-center gap-1 text-xs font-semibold">
                      {grade.correct ? (
                        <CheckCircle2 size={16} className="text-success" />
                      ) : (
                        <XCircle size={16} className="text-destructive" />
                      )}
                      <span>{grade.score}/4</span>
                    </div>
                  )}
                </div>

                <Textarea
                  value={answers[q.id] ?? ""}
                  onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                  placeholder="Answer in your own words — 1 to 3 sentences."
                  rows={3}
                  className="resize-y"
                />

                {q.hint && !grade && (
                  <div className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <Lightbulb size={12} className="mt-0.5 shrink-0" />
                    <span>{q.hint}</span>
                  </div>
                )}

                {grade && (
                  <div className="space-y-1.5 text-sm">
                    <p className={grade.correct ? "text-success" : "text-destructive"}>{grade.feedback}</p>
                    {grade.model_answer && (
                      <div className="rounded-md bg-muted/60 p-2 text-xs">
                        <span className="font-semibold text-muted-foreground">Model answer: </span>
                        {grade.model_answer}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {questions.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 sticky bottom-3 z-20">
          <p className="text-xs text-muted-foreground">
            {retryOnly
              ? "Showing only the ones you got wrong."
              : `${questions.length} questions · graded on understanding, not wording.`}
          </p>
          <div className="flex gap-2">
            {hasGrades && !allCorrect && (
              <Button
                variant="outline"
                onClick={() => {
                  setRetryOnly(true);
                  const wrongIds = questions
                    .filter((q) => grades[q.id] && !grades[q.id].correct)
                    .map((q) => q.id);
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
