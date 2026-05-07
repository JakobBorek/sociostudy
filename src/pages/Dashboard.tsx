import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Brain, GraduationCap, Layers, TrendingUp, Flame } from "lucide-react";
import { useStudyData } from "@/contexts/StudyDataContext";
import { useProgress } from "@/hooks/useProgress";

export default function Dashboard() {
  const { units, topics } = useStudyData();
  const { progress } = useProgress();
  const totalTopics = topics.length;
  const knownCount = progress.knownCards.length;
  const masteryPercent = totalTopics > 0 ? Math.round((knownCount / totalTopics) * 100) : 0;

  const unitMastery = units.map((unit) => {
    const unitTopics = topics.filter((t) => t.unit === unit.id);
    const known = unitTopics.filter((t) => progress.knownCards.includes(t.id)).length;
    return { ...unit, total: unitTopics.length, known, percent: unitTopics.length > 0 ? Math.round((known / unitTopics.length) * 100) : 0 };
  });

  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-navy rounded-2xl p-8 text-primary-foreground"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold mb-2">
              Welcome to <span className="text-gradient">SocioStudy</span>
            </h1>
            <p className="text-primary-foreground/70 text-sm">
              A-Level Sociology revision — {totalTopics} topics across {units.length} units
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-sidebar-accent px-4 py-3">
            <Flame className="text-accent" size={24} />
            <div>
              <p className="text-2xl font-display font-bold text-accent">{progress.streak}</p>
              <p className="text-xs text-primary-foreground/60">day streak</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Topics Mastered", value: `${knownCount}/${totalTopics}`, icon: TrendingUp },
          { label: "Overall Mastery", value: `${masteryPercent}%`, icon: Brain },
          { label: "Quizzes Taken", value: progress.quizScores.length, icon: BookOpen },
          { label: "Still Learning", value: progress.learningCards.length, icon: Layers },
        ].map(({ label, value, icon: Icon }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl bg-card border border-border p-5 card-hover"
          >
            <Icon size={20} className="text-accent mb-2" />
            <p className="font-display text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Unit mastery */}
      <div>
        <h2 className="font-display text-xl font-bold text-foreground mb-4">Unit Progress</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {unitMastery.map((unit, i) => (
            <motion.div
              key={unit.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={`/units/${unit.id}`}
                className="block rounded-xl bg-card border border-border p-5 card-hover"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{unit.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-foreground text-sm truncate">
                      Unit {unit.id} — {unit.shortTitle}
                    </h3>
                    <p className="text-xs text-muted-foreground">{unit.known}/{unit.total} mastered</p>
                  </div>
                  <span className="font-display font-bold text-accent text-lg">{unit.percent}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full gradient-amber"
                    initial={{ width: 0 }}
                    animate={{ width: `${unit.percent}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Exam technique highlight */}
      <Link
        to="/exam-technique"
        className="block rounded-xl border border-accent/30 bg-card p-5 card-hover"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-lg gradient-amber p-3 text-accent-foreground">
            <GraduationCap size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-foreground">How to write Evaluate answers</p>
            <p className="text-xs text-muted-foreground">IGCSE exam technique for Discuss [8] & Evaluate [14] questions.</p>
          </div>
        </div>
      </Link>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          to="/flashcards"
          className="gradient-amber rounded-xl p-6 text-accent-foreground card-hover flex items-center gap-3"
        >
          <Layers size={24} />
          <div>
            <p className="font-display font-bold">Flashcards</p>
            <p className="text-xs opacity-80">Review all topics</p>
          </div>
        </Link>
        <Link
          to="/quiz"
          className="gradient-navy rounded-xl p-6 text-primary-foreground card-hover flex items-center gap-3"
        >
          <Brain size={24} />
          <div>
            <p className="font-display font-bold">Start Quiz</p>
            <p className="text-xs opacity-80">Test your knowledge</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
