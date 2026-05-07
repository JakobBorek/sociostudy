import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, RotateCcw, PenLine, Loader2 } from "lucide-react";
import { type QuizQuestion } from "@/data/studyContent";
import { useStudyData } from "@/contexts/StudyDataContext";
import { useProgress } from "@/hooks/useProgress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Phase = "setup" | "quiz" | "results" | "eval-setup" | "eval-write" | "eval-result";
type Mode = "mcq" | "evaluate";
type EvalMarks = 8 | 14;

const EVAL_QUESTIONS: Record<EvalMarks, { id: string; question: string }[]> = {
  8: [
    { id: "d1", question: "Discuss how family functions have changed over time. Your answer should include at least three developed points with evidence." },
    { id: "d2", question: "Discuss reasons why some students from minority backgrounds may underachieve at school. Your answer should include at least three developed points with evidence." },
  ],
  14: [
    { id: "e1", question: "Evaluate the view that the nuclear family is the best family type for modern society. Include at least three arguments for, three against, and a conclusion." },
    { id: "e2", question: "Evaluate the view that informal social control is more effective than formal social control. Include at least three arguments for, three against, and a conclusion." },
  ],
};

interface EvalResult {
  mark: number;
  outOf: number;
  level: string;
  strengths: string;
  improvements: string;
}

export default function QuizPage() {
  const { units, topics } = useStudyData();
  const [mode, setMode] = useState<Mode>("mcq");
  const [phase, setPhase] = useState<Phase>("setup");
  // evaluate state
  const [evalMarks, setEvalMarks] = useState<EvalMarks>(8);
  const [evalQ, setEvalQ] = useState<{ id: string; question: string } | null>(null);
  const [evalAnswer, setEvalAnswer] = useState("");
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalResult, setEvalResult] = useState<EvalResult | null>(null);
  const [unitFilter, setUnitFilter] = useState<string>("");
  const [questionCount, setQuestionCount] = useState(10);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ questionId: string; chosen: string; correct: string; isCorrect: boolean }[]>([]);
  const { addQuizScore, updateStreak } = useProgress();

  const startQuiz = () => {
    // Generate quiz from merged topics (built-in + custom)
    const filtered = unitFilter ? topics.filter(t => t.unit === unitFilter) : topics;
    const all = generateQuizFromTopics(filtered);
    setQuestions(all.slice(0, questionCount));
    setCurrentQ(0);
    setAnswers([]);
    setSelected(null);
    setPhase("quiz");
    updateStreak();
  };

  const handleAnswer = (option: string) => {
    if (selected) return;
    setSelected(option);
    const q = questions[currentQ];
    setAnswers((a) => [...a, { questionId: q.id, chosen: option, correct: q.correctAnswer, isCorrect: option === q.correctAnswer }]);
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((i) => i + 1);
      setSelected(null);
    } else {
      const finalScore = answers.filter(a => a.isCorrect).length;
      addQuizScore(finalScore, questions.length, unitFilter || "all");
      setPhase("results");
    }
  };

  const q = questions[currentQ];
  const score = answers.filter((a) => a.isCorrect).length;

  const startEval = () => {
    const pool = EVAL_QUESTIONS[evalMarks];
    setEvalQ(pool[Math.floor(Math.random() * pool.length)]);
    setEvalAnswer("");
    setEvalResult(null);
    setPhase("eval-write");
    updateStreak();
  };

  const submitEval = async () => {
    if (!evalQ || evalAnswer.trim().length < 30) {
      toast.error("Write a longer answer before submitting.");
      return;
    }
    setEvalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("evaluate-answer", {
        body: { question: evalQ.question, marks: evalMarks, answer: evalAnswer },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setEvalResult(data as EvalResult);
      setPhase("eval-result");
    } catch (e: any) {
      toast.error(e?.message || "Failed to mark your answer.");
    } finally {
      setEvalLoading(false);
    }
  };

  // ===== EVALUATE MODE =====
  if (mode === "evaluate" && (phase === "setup" || phase === "eval-setup")) {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <ModeToggle mode={mode} setMode={(m) => { setMode(m); setPhase("setup"); }} />
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <PenLine className="text-accent" /> Evaluate Practice
        </h1>
        <div className="rounded-xl bg-card border border-border p-6 space-y-5">
          <p className="text-sm text-muted-foreground">
            Practice IGCSE Sociology long-answer questions. AI marks your answer using the official Cambridge rubric.
          </p>
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Question type</label>
            <div className="flex gap-2">
              {([8, 14] as EvalMarks[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setEvalMarks(m)}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                    evalMarks === m ? "gradient-amber text-accent-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {m === 8 ? "Discuss · 8 marks" : "Evaluate · 14 marks"}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={startEval}
            className="w-full gradient-amber rounded-lg py-3 font-display font-bold text-accent-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Start Practice
          </button>
        </div>
      </div>
    );
  }

  if (mode === "evaluate" && phase === "eval-write" && evalQ) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{evalMarks === 8 ? "Discuss" : "Evaluate"} · {evalMarks} marks</span>
          <span>{evalAnswer.trim().split(/\s+/).filter(Boolean).length} words</span>
        </div>
        <div className="rounded-xl bg-card border border-border p-6">
          <h2 className="font-display text-lg font-bold text-foreground">{evalQ.question}</h2>
        </div>
        <textarea
          value={evalAnswer}
          onChange={(e) => setEvalAnswer(e.target.value)}
          placeholder="Write your answer here. Use clear paragraphs for each point and include sociological concepts, evidence, and examples..."
          className="w-full min-h-[300px] rounded-xl border border-border bg-background p-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setPhase("setup")}
            className="rounded-lg bg-secondary px-4 py-3 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
          >
            Cancel
          </button>
          <button
            onClick={submitEval}
            disabled={evalLoading}
            className="flex-1 gradient-amber rounded-lg py-3 font-display font-bold text-accent-foreground transition-transform hover:scale-[1.02] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {evalLoading ? <><Loader2 className="animate-spin" size={18} /> Marking...</> : "Submit for marking"}
          </button>
        </div>
      </div>
    );
  }

  if (mode === "evaluate" && phase === "eval-result" && evalResult && evalQ) {
    const pct = evalResult.mark / evalResult.outOf;
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="gradient-navy rounded-2xl p-8 text-center text-primary-foreground"
        >
          <p className="text-sm uppercase tracking-wider text-primary-foreground/60 mb-2">{evalResult.level}</p>
          <p className="font-display text-5xl font-bold text-gradient mb-1">
            {evalResult.mark}/{evalResult.outOf}
          </p>
          <p className="text-primary-foreground/70 text-sm">
            {pct >= 0.85 ? "Excellent! 🎉" : pct >= 0.6 ? "Solid attempt 💪" : "Keep practising 📚"}
          </p>
        </motion.div>
        <div className="rounded-xl bg-card border border-border p-5 space-y-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Question</p>
          <p className="text-sm text-foreground">{evalQ.question}</p>
        </div>
        <div className="rounded-xl bg-success/5 border border-success/20 p-5">
          <p className="font-display font-semibold text-foreground mb-1">Strengths</p>
          <p className="text-sm text-muted-foreground">{evalResult.strengths}</p>
        </div>
        <div className="rounded-xl bg-accent/5 border border-accent/20 p-5">
          <p className="font-display font-semibold text-foreground mb-1">How to improve</p>
          <p className="text-sm text-muted-foreground">{evalResult.improvements}</p>
        </div>
        <button
          onClick={() => setPhase("setup")}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-secondary py-3 font-medium text-secondary-foreground hover:bg-secondary/80"
        >
          <RotateCcw size={18} /> Try another
        </button>
      </div>
    );
  }

  if (phase === "setup") {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <ModeToggle mode={mode} setMode={(m) => { setMode(m); setPhase("setup"); }} />
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <Brain className="text-accent" /> Quiz Mode
        </h1>

        <div className="rounded-xl bg-card border border-border p-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Unit</label>
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All Units</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>Unit {u.id} — {u.shortTitle}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Questions</label>
            <div className="flex gap-2">
              {[5, 10, 20].map((n) => (
                <button
                  key={n}
                  onClick={() => setQuestionCount(n)}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                    questionCount === n
                      ? "gradient-amber text-accent-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startQuiz}
            className="w-full gradient-amber rounded-lg py-3 font-display font-bold text-accent-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  if (phase === "results") {
    const wrong = answers.filter((a) => !a.isCorrect);
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="gradient-navy rounded-2xl p-8 text-center text-primary-foreground"
        >
          <p className="text-sm uppercase tracking-wider text-primary-foreground/60 mb-2">Your Score</p>
          <p className="font-display text-5xl font-bold text-gradient mb-1">
            {score}/{questions.length}
          </p>
          <p className="text-primary-foreground/70 text-sm">
            {score === questions.length ? "Perfect! 🎉" : score >= questions.length * 0.7 ? "Great job! 💪" : "Keep studying! 📚"}
          </p>
        </motion.div>

        {wrong.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-display font-semibold text-foreground">Review Wrong Answers</h3>
            {wrong.map((a, i) => {
              const question = questions.find((q) => q.id === a.questionId);
              return (
                <motion.div
                  key={a.questionId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-xl bg-card border border-destructive/20 p-4"
                >
                  <p className="text-sm font-medium text-foreground mb-2">{question?.question}</p>
                  <p className="text-sm text-destructive">Your answer: {a.chosen}</p>
                  <p className="text-sm text-success">Correct: {a.correct}</p>
                </motion.div>
              );
            })}
          </div>
        )}

        <button
          onClick={() => setPhase("setup")}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-secondary py-3 font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
        >
          <RotateCcw size={18} /> Try Again
        </button>
      </div>
    );
  }

  // Quiz phase
  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Question {currentQ + 1} of {questions.length}</span>
        <span className="font-display font-bold text-accent">{score} correct</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full gradient-amber transition-all duration-300"
          style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
        />
      </div>

      {q && (
        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="space-y-4"
          >
            <div className="rounded-xl bg-card border border-border p-6">
              <h2 className="font-display text-lg font-bold text-foreground">{q.question}</h2>
            </div>

            <div className="space-y-3">
              {q.options.map((option) => {
                let style = "bg-card border-border text-foreground hover:border-accent";
                if (selected) {
                  if (option === q.correctAnswer) style = "bg-success/10 border-success text-foreground";
                  else if (option === selected) style = "bg-destructive/10 border-destructive text-foreground";
                  else style = "bg-card border-border text-muted-foreground opacity-60";
                }
                return (
                  <button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    disabled={!!selected}
                    className={`w-full text-left rounded-xl border-2 p-4 text-sm transition-all ${style}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {selected && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={nextQuestion}
                className="w-full gradient-amber rounded-lg py-3 font-display font-bold text-accent-foreground transition-transform hover:scale-[1.02]"
              >
                {currentQ < questions.length - 1 ? "Next Question" : "See Results"}
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

// Local quiz generator that works with any topics array
import { shuffleArray, type StudyTopic } from "@/data/studyContent";

function generateQuizFromTopics(topicsList: StudyTopic[]): QuizQuestion[] {
  const questions: QuizQuestion[] = [];

  topicsList.forEach((topic) => {
    questions.push({
      id: `${topic.id}-def`,
      question: `What is ${topic.term}?`,
      correctAnswer: topic.definition,
      options: generateOptions(topic.definition, topicsList.filter(t => t.id !== topic.id).map(t => t.definition)),
      topicId: topic.id,
      unit: topic.unit,
    });

    if (topic.pros.length > 0) {
      const correctPro = topic.pros[0];
      questions.push({
        id: `${topic.id}-pro`,
        question: `Which is an advantage of ${topic.term}?`,
        correctAnswer: correctPro,
        options: generateOptions(correctPro, [
          ...topicsList.flatMap(t => t.cons),
          ...topicsList.filter(t => t.id !== topic.id).flatMap(t => t.pros),
        ]),
        topicId: topic.id,
        unit: topic.unit,
      });
    }

    if (topic.cons.length > 0) {
      const correctCon = topic.cons[0];
      questions.push({
        id: `${topic.id}-con`,
        question: `Which is a disadvantage of ${topic.term}?`,
        correctAnswer: correctCon,
        options: generateOptions(correctCon, [
          ...topicsList.flatMap(t => t.pros),
          ...topicsList.filter(t => t.id !== topic.id).flatMap(t => t.cons),
        ]),
        topicId: topic.id,
        unit: topic.unit,
      });
    }
  });

  return shuffleArray(questions);
}

function generateOptions(correct: string, pool: string[]): string[] {
  const unique = [...new Set(pool.filter(o => o !== correct))];
  const wrong = shuffleArray(unique).slice(0, 3);
  while (wrong.length < 3) {
    wrong.push("None of the above");
  }
  return shuffleArray([correct, ...wrong]);
}

function ModeToggle({ mode, setMode }: { mode: Mode; setMode: (m: Mode) => void }) {
  return (
    <div className="flex gap-2 rounded-lg bg-secondary p-1">
      {([
        { v: "mcq" as Mode, label: "Multiple choice" },
        { v: "evaluate" as Mode, label: "Evaluate practice" },
      ]).map((opt) => (
        <button
          key={opt.v}
          onClick={() => setMode(opt.v)}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            mode === opt.v ? "gradient-amber text-accent-foreground" : "text-secondary-foreground hover:bg-background/50"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

