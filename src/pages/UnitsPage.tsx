import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { units, topics } from "@/data/studyContent";
import { useProgress } from "@/hooks/useProgress";

export default function UnitsPage() {
  const { progress } = useProgress();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Unit Overview</h1>
      <div className="grid gap-4">
        {units.map((unit, i) => {
          const unitTopics = topics.filter((t) => t.unit === unit.id);
          const known = unitTopics.filter((t) => progress.knownCards.includes(t.id)).length;
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
                  <h2 className="font-display font-bold text-foreground">Unit {unit.id}</h2>
                  <p className="text-sm text-muted-foreground">{unit.title}</p>
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
