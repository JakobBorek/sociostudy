import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useStudyData } from "@/contexts/StudyDataContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Unit, StudyTopic } from "@/data/studyContent";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ClipboardList,
  ChevronDown,
  Sparkles,
  Loader2,
  Save,
  CheckCircle2,
  Lightbulb,
  History,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

/* ----------------------------- Learn data ----------------------------- */

interface LearnCard {
  tariff: number;
  command: string;
  title: string;
  wants: string;
  structure: string[];
  starters: string[];
  mistake: string;
}

const LEARN: LearnCard[] = [
  {
    tariff: 2,
    command: "Identify / Give",
    title: "Identify two · Give two examples",
    wants: "Two correct points. No explanation. 1 mark each.",
    structure: ["Point 1 — a few words", "Point 2 — a few words"],
    starters: ["One example is…", "Another is…"],
    mistake: "Wasting time explaining. Don't — just state both points.",
  },
  {
    tariff: 2,
    command: "Define",
    title: "Define the term",
    wants: "A clear definition. The second mark usually comes from a quick example.",
    structure: ["Defining sentence", "Short example to secure mark 2"],
    starters: ["___ is…", "For example, …"],
    mistake: "Vague or circular definitions (using the word inside itself).",
  },
  {
    tariff: 4,
    command: "Explain two",
    title: "Explain two…",
    wants: "Two developed points (point + development).",
    structure: ["Point 1 → develop", "Point 2 → develop"],
    starters: ["One reason is… This is because…", "Another reason is… This means that…"],
    mistake: "Stating points without developing them.",
  },
  {
    tariff: 6,
    command: "Explain three",
    title: "Explain three…",
    wants: "Three developed points. No conclusion needed.",
    structure: ["Point 1 → develop", "Point 2 → develop", "Point 3 → develop"],
    starters: ["Firstly… This is because…", "Secondly… This means that…", "Thirdly… As a result…"],
    mistake: "Only giving two points, or listing without developing.",
  },
  {
    tariff: 8,
    command: "Discuss",
    title: "Discuss the view that…",
    wants: "Three or more developed points with evidence. Banded marking.",
    structure: [
      "Brief opening on the view",
      "Paragraph 1 — point → explain → example/term",
      "Paragraph 2 — point → explain → example/term",
      "Paragraph 3 — point → explain → example/term",
      "Mini conclusion",
    ],
    starters: ["On one hand…", "A sociological example of this is…", "On the other hand…"],
    mistake: "Listing points without evidence or sociological vocabulary.",
  },
  {
    tariff: 10,
    command: "Evaluate the approach",
    title: "Evaluate (10) — two-sided + judgement",
    wants: "2 arguments FOR + 2 arguments AGAINST + a clear conclusion.",
    structure: [
      "FOR 1 → develop",
      "FOR 2 → develop",
      "AGAINST 1 → develop",
      "AGAINST 2 → develop",
      "Conclusion (which side is stronger and why)",
    ],
    starters: [
      "A strength of this approach is…",
      "However, a weakness is…",
      "Overall, … because…",
    ],
    mistake: "No conclusion = marks are capped. Always take a side.",
  },
  {
    tariff: 12,
    command: "Research methods design",
    title: "Research methods design (12)",
    wants:
      "Two primary methods + sampling + one secondary source, all applied to the topic with reasons.",
    structure: [
      "Primary method 1 — name → how you'd use it → sampling (who + how) → why it suits this topic",
      "Primary method 2 — name → how → sampling → why",
      "One secondary source — name → why useful",
    ],
    starters: ["I would use ___ because…", "I would select my sample by…"],
    mistake: "Naming methods without reasons, or not applying them to the topic.",
  },
  {
    tariff: 14,
    command: "Evaluate the view",
    title: "Evaluate the view that… (14) — the big essay",
    wants: "Three FOR, three AGAINST, plus a reasoned conclusion.",
    structure: [
      "FOR 1 → develop + evidence",
      "FOR 2 → develop + evidence",
      "FOR 3 → develop + evidence",
      "AGAINST 1 → develop + evidence",
      "AGAINST 2 → develop + evidence",
      "AGAINST 3 → develop + evidence",
      "Conclusion — clear reasoned judgement answering the view",
    ],
    starters: [
      "Firstly, supporters argue that…",
      "On the other hand, critics suggest…",
      "Overall, the view is (more/less) convincing because…",
    ],
    mistake: "Unbalanced sides, or a conclusion that doesn't take a side.",
  },
];

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

function slotsFor(tariff: number): string[] {
  switch (tariff) {
    case 2:
      return ["Point 1", "Point 2"];
    case 4:
      return ["Point 1 + development", "Point 2 + development"];
    case 6:
      return [
        "Point 1 + development",
        "Point 2 + development",
        "Point 3 + development",
      ];
    case 8:
      return ["Opening", "Point 1", "Point 2", "Point 3", "Mini conclusion"];
    case 10:
      return ["FOR 1", "FOR 2", "AGAINST 1", "AGAINST 2", "Conclusion"];
    case 12:
      return [
        "Primary method 1 (+ sampling)",
        "Primary method 2 (+ sampling)",
        "Secondary source",
      ];
    case 14:
      return [
        "FOR 1",
        "FOR 2",
        "FOR 3",
        "AGAINST 1",
        "AGAINST 2",
        "AGAINST 3",
        "Conclusion",
      ];
    default:
      return ["Point 1", "Point 2"];
  }
}

/* ============================================================ */
/*                            PAGE                               */
/* ============================================================ */

export default function PlanningPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="gradient-navy rounded-2xl p-6 text-primary-foreground">
        <h1 className="font-display text-3xl font-bold flex items-center gap-2">
          <ClipboardList /> Planning Answers — IGCSE Sociology 0495
        </h1>
        <p className="text-primary-foreground/70 text-sm mt-1">
          Not an exam. A guide to help you structure each type of answer before you write it.
        </p>
      </div>

      <Tabs defaultValue="learn" className="w-full">
        <TabsList>
          <TabsTrigger value="learn">Learn</TabsTrigger>
          <TabsTrigger value="plan">Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="learn" className="mt-4">
          <LearnTab />
        </TabsContent>
        <TabsContent value="plan" className="mt-4">
          <PlanTab />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

/* ----------------------------- LEARN TAB ----------------------------- */

function LearnTab() {
  const { units, topics } = useStudyData();
  const [openModel, setOpenModel] = useState<string | null>(null);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [modelByKey, setModelByKey] = useState<
    Record<string, { question: string; answer: string; unit_title: string }>
  >({});
  const [unitChoice, setUnitChoice] = useState<Record<string, string>>({});

  const askModel = async (card: LearnCard) => {
    const key = `${card.tariff}-${card.command}`;
    const unitId = unitChoice[key] ?? units[0]?.id;
    const unit = units.find((u) => u.id === unitId);
    if (!unit) return;
    setLoadingKey(key);
    try {
      const { data, error } = await supabase.functions.invoke("planning-assistant", {
        body: {
          mode: "model_answer",
          tariff: card.tariff,
          command: card.command,
          unit_title: unit.title,
          topic_context: unitToContext(unit, topics),
        },
      });
      if (error) throw error;
      setModelByKey((m) => ({
        ...m,
        [key]: {
          question: (data as any).question ?? "",
          answer: (data as any).answer ?? "",
          unit_title: unit.title,
        },
      }));
      setOpenModel(key);
    } catch (e) {
      toast({ title: "Couldn't generate model", description: (e as Error).message, variant: "destructive" });
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {LEARN.map((card) => {
        const key = `${card.tariff}-${card.command}`;
        const m = modelByKey[key];
        return (
          <div key={key} className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  {card.command}
                </div>
                <h3 className="font-display font-semibold text-base">{card.title}</h3>
              </div>
              <span className="shrink-0 rounded-md bg-accent/15 text-accent-foreground border border-accent px-2 py-0.5 text-xs font-bold">
                [{card.tariff}]
              </span>
            </div>

            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                What the examiner wants
              </div>
              <p className="text-sm">{card.wants}</p>
            </div>

            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-1 text-sm font-semibold text-accent">
                <ChevronDown size={14} /> See the skeleton
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 space-y-2">
                <ol className="list-decimal list-inside text-sm space-y-0.5">
                  {card.structure.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-2 mb-1">
                    Sentence starters
                  </div>
                  <ul className="text-sm italic space-y-0.5">
                    {card.starters.map((s, i) => (
                      <li key={i}>“{s}”</li>
                    ))}
                  </ul>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className="rounded-md bg-destructive/10 border border-destructive/30 p-2 text-xs">
              <span className="font-semibold">Common mistake:</span> {card.mistake}
            </div>

            <div className="border-t pt-3 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={unitChoice[key] ?? units[0]?.id ?? ""}
                  onChange={(e) =>
                    setUnitChoice((u) => ({ ...u, [key]: e.target.value }))
                  }
                  className="text-xs rounded-md border bg-background px-2 py-1"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      Unit {u.id} — {u.shortTitle}
                    </option>
                  ))}
                </select>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => askModel(card)}
                  disabled={loadingKey === key}
                >
                  {loadingKey === key ? (
                    <><Loader2 className="animate-spin" size={14} /> Writing…</>
                  ) : (
                    <><Sparkles size={14} /> Show model answer</>
                  )}
                </Button>
              </div>
              {m && openModel === key && (
                <div className="rounded-md bg-muted/40 border p-3 text-sm space-y-2">
                  <div className="font-semibold italic">{m.question}</div>
                  <p className="whitespace-pre-wrap leading-relaxed">{m.answer}</p>
                  <div className="text-xs text-muted-foreground">From {m.unit_title}</div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ----------------------------- PLAN TAB ----------------------------- */

function PlanTab() {
  const { units, topics } = useStudyData();
  const { user } = useAuth();

  const [unitId, setUnitId] = useState<string>(units[0]?.id ?? "");
  const [tariff, setTariff] = useState<number>(10);
  const [question, setQuestion] = useState("");
  const [plan, setPlan] = useState<Record<string, string>>({});
  const [suggestedPoints, setSuggestedPoints] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ feedback: string; missing: string[] } | null>(null);
  const [loading, setLoading] = useState<"" | "question" | "points" | "check" | "save">("");
  const [saved, setSaved] = useState<any[]>([]);
  const [showSaved, setShowSaved] = useState(false);

  const unit = useMemo(() => units.find((u) => u.id === unitId), [units, unitId]);
  const context = useMemo(() => (unit ? unitToContext(unit, topics) : ""), [unit, topics]);
  const slots = useMemo(() => slotsFor(tariff), [tariff]);

  // Reset plan slots when tariff changes
  useEffect(() => {
    setPlan({});
    setFeedback(null);
  }, [tariff]);

  // Load saved plans
  useEffect(() => {
    if (!user) return;
    supabase
      .from("answer_plans")
      .select("id, unit_id, unit_title, tariff, question, plan, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => setSaved(data ?? []));
  }, [user, loading]);

  const suggestQuestion = async () => {
    if (!unit) return;
    setLoading("question");
    try {
      const { data, error } = await supabase.functions.invoke("planning-assistant", {
        body: { mode: "suggest_question", tariff, unit_title: unit.title, topic_context: context },
      });
      if (error) throw error;
      setQuestion((data as any).question ?? "");
      setSuggestedPoints([]);
      setFeedback(null);
    } catch (e) {
      toast({ title: "Couldn't suggest", description: (e as Error).message, variant: "destructive" });
    } finally {
      setLoading("");
    }
  };

  const suggestPoints = async () => {
    if (!question.trim() || !unit) return;
    setLoading("points");
    try {
      const { data, error } = await supabase.functions.invoke("planning-assistant", {
        body: { mode: "suggest_points", tariff, question, topic_context: context },
      });
      if (error) throw error;
      setSuggestedPoints((data as any).points ?? []);
    } catch (e) {
      toast({ title: "Couldn't suggest points", description: (e as Error).message, variant: "destructive" });
    } finally {
      setLoading("");
    }
  };

  const checkPlan = async () => {
    if (!question.trim()) return;
    setLoading("check");
    try {
      const { data, error } = await supabase.functions.invoke("planning-assistant", {
        body: { mode: "check_plan", tariff, question, plan },
      });
      if (error) throw error;
      setFeedback({
        feedback: (data as any).feedback ?? "",
        missing: (data as any).missing ?? [],
      });
    } catch (e) {
      toast({ title: "Couldn't check plan", description: (e as Error).message, variant: "destructive" });
    } finally {
      setLoading("");
    }
  };

  const savePlan = async () => {
    if (!user || !question.trim()) return;
    setLoading("save");
    try {
      const { error } = await supabase.from("answer_plans").insert({
        user_id: user.id,
        unit_id: unit?.id ?? null,
        unit_title: unit?.title ?? null,
        tariff,
        command: LEARN.find((l) => l.tariff === tariff)?.command ?? null,
        question,
        plan,
      });
      if (error) throw error;
      toast({ title: "Plan saved", description: "Find it under Saved plans." });
    } catch (e) {
      toast({ title: "Couldn't save", description: (e as Error).message, variant: "destructive" });
    } finally {
      setLoading("");
    }
  };

  const loadSaved = (s: any) => {
    setUnitId(s.unit_id ?? units[0]?.id ?? "");
    setTariff(s.tariff);
    setQuestion(s.question);
    setPlan(s.plan ?? {});
    setShowSaved(false);
    setFeedback(null);
  };

  const tariffs = [2, 4, 6, 8, 10, 12, 14];

  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-6">
      <div className="space-y-4">
        {/* Setup */}
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Unit</label>
              <select
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm mt-1"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.id}>Unit {u.id} — {u.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tariff</label>
              <div className="flex gap-1 mt-1 flex-wrap">
                {tariffs.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTariff(t)}
                    className={`text-xs font-bold rounded px-2 py-1 border ${
                      tariff === t
                        ? "bg-accent text-accent-foreground border-accent"
                        : "bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    [{t}]
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Question</label>
            <div className="flex gap-2 mt-1">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type or paste a question, or get one suggested…"
                className="flex-1"
              />
              <Button variant="secondary" onClick={suggestQuestion} disabled={loading === "question"}>
                {loading === "question" ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                Suggest
              </Button>
            </div>
          </div>
        </div>

        {/* Skeleton slots */}
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold">Your plan — bullets only</h3>
            <span className="text-xs text-muted-foreground">
              {slots.length} slots for [{tariff}]
            </span>
          </div>
          <div className="space-y-2">
            {slots.map((slot) => (
              <div key={slot} className="flex gap-2 items-start">
                <div className="shrink-0 w-44 text-xs font-semibold rounded-md bg-muted px-2 py-2 text-muted-foreground">
                  {slot}
                </div>
                <Textarea
                  value={plan[slot] ?? ""}
                  onChange={(e) => setPlan((p) => ({ ...p, [slot]: e.target.value }))}
                  rows={2}
                  placeholder="A short point or phrase…"
                  className="flex-1"
                />
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button onClick={suggestPoints} variant="secondary" disabled={loading === "points" || !question.trim()}>
              {loading === "points" ? <Loader2 className="animate-spin" size={14} /> : <Lightbulb size={14} />}
              Suggest points
            </Button>
            <Button onClick={checkPlan} disabled={loading === "check" || !question.trim()}>
              {loading === "check" ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
              Check my plan
            </Button>
            <Button onClick={savePlan} variant="outline" disabled={loading === "save" || !question.trim()}>
              {loading === "save" ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
              Save plan
            </Button>
          </div>

          {suggestedPoints.length > 0 && (
            <div className="rounded-md bg-accent/10 border border-accent/30 p-3 space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wide text-accent">
                Possible points from {unit?.title}
              </div>
              <ul className="text-sm list-disc list-inside space-y-0.5">
                {suggestedPoints.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground italic mt-1">
                Pick the ones that fit. Word them yourself.
              </p>
            </div>
          )}

          {feedback && (
            <div className="rounded-md bg-success/10 border border-success/30 p-3 space-y-2 text-sm">
              <div className="font-semibold flex items-center gap-1 text-success">
                <CheckCircle2 size={14} /> Coverage check
              </div>
              <p>{feedback.feedback}</p>
              {feedback.missing.length > 0 && (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mt-2">
                    Missing
                  </div>
                  <ul className="list-disc list-inside text-xs">
                    {feedback.missing.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-xs text-muted-foreground italic">
                This checks coverage only, not writing quality.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Side: skeleton reference + saved */}
      <aside className="space-y-4">
        <div className="rounded-xl border bg-card p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Skeleton for [{tariff}]</div>
          <ol className="list-decimal list-inside text-sm space-y-0.5">
            {(LEARN.find((l) => l.tariff === tariff)?.structure ?? []).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <Button variant="ghost" size="sm" onClick={() => setShowSaved((s) => !s)} className="w-full justify-start">
            <History size={14} /> {showSaved ? "Hide" : "Saved plans"} ({saved.length})
          </Button>
          {showSaved && (
            <ul className="mt-2 divide-y">
              {saved.length === 0 && (
                <li className="text-xs text-muted-foreground py-2">No saved plans yet.</li>
              )}
              {saved.map((s) => (
                <li key={s.id} className="py-2">
                  <button onClick={() => loadSaved(s)} className="text-left w-full hover:bg-muted/40 rounded p-1">
                    <div className="text-xs font-bold">[{s.tariff}] · Unit {s.unit_id}</div>
                    <div className="text-xs truncate">{s.question}</div>
                    <div className="text-[10px] text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
