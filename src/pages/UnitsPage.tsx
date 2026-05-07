import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, PlusCircle, GraduationCap } from "lucide-react";
import { useStudyData } from "@/contexts/StudyDataContext";
import { useProgress } from "@/hooks/useProgress";

export default function UnitsPage() {
  const { units, topics } = useStudyData();
  const { progress } = useProgress();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Unit Overview</h1>
        <Link
          to="/add-unit"
          className="flex items-center gap-2 rounded-lg gradient-amber px-4 py-2 text-sm font-medium text-accent-foreground transition-transform hover:scale-[1.02]"
        >
          <PlusCircle size={16} />
          Add Unit
        </Link>
      </div>
      <Link
        to="/exam-technique"
        className="flex items-center gap-4 rounded-xl border border-accent/30 bg-card p-5 card-hover group"
      >
        <div className="rounded-lg gradient-amber p-3 text-accent-foreground">
          <GraduationCap size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-display font-bold text-foreground">Exam Skills — Evaluate Answers</h2>
          <p className="text-sm text-muted-foreground">Learn to structure Discuss [8] & Evaluate [14] questions.</p>
        </div>
        <ChevronRight size={20} className="text-muted-foreground group-hover:text-accent transition-colors" />
      </Link>

      <div className="grid gap-4">
        {units.map((unit, i) => {
          const unitTopics = topics.filter((t) => t.unit === unit.id);
          const known = unitTopics.filter((t) => progress.knownCards.includes(t.id)).length;
          const isCustom = unit.id.startsWith("custom-");
          return (
            <motion.div
              key={unit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={`/units/${unit.id}`}
                className="flex items-center gap-4 rounded-xl bg-card border border-border p-6 card-hover group"
              >
                <span className="text-3xl">{unit.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-display font-bold text-foreground">{isCustom ? unit.title : `Unit ${unit.id}`}</h2>
                    {isCustom && (
                      <span className="text-[10px] uppercase tracking-wider bg-accent/20 text-accent px-2 py-0.5 rounded-full font-semibold">
                        Custom
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{isCustom ? unit.description : unit.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{unitTopics.length} topics · {known} mastered</p>
                </div>
                <ChevronRight size={20} className="text-muted-foreground group-hover:text-accent transition-colors" />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
