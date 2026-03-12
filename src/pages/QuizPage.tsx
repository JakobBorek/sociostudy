import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, RotateCcw } from "lucide-react";
import { generateQuizQuestions, units, QuizQuestion } from "@/data/studyContent";
import { useProgress } from "@/hooks/useProgress";

type Phase = "setup" | "quiz" | "results";

export default function QuizPage() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [unitFilter, setUnitFilter] = useState<string>("");
  const [questionCount, setQuestionCount] = useState(10);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ questionId: string; chosen: string; correct: string; isCorrect: boolean }[]>([]);
  const { addQuizScore, updateStreak } = useProgress();

  const startQuiz = () => {
    const all = generateQuizQuestions(unitFilter || undefined);
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
      const score = answers.filter((a) => a.isCorrect).length + (selected === questions[currentQ]?.correctAnswer ? 0 : 0);
      // Score already tracked in answers
      const finalScore = answers.filter(a => a.isCorrect).length;
      addQuizScore(finalScore, questions.length, unitFilter || "all");
      setPhase("results");
    }
  };

  const q = questions[currentQ];
  const score = answers.filter((a) => a.isCorrect).length;

  if (phase === "setup") {
    return (
      <div className="max-w-md mx-auto space-y-6">
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
