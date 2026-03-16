import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { useStudyData } from "@/contexts/StudyDataContext";
import { useProgress } from "@/hooks/useProgress";
import Flashcard from "@/components/Flashcard";

export default function FlashcardsPage() {
  const { units, topics } = useStudyData();
  const [unitFilter, setUnitFilter] = useState<string>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const { progress, markCardKnown, markCardLearning, updateStreak } = useProgress();

  const filtered = useMemo(
    () => (unitFilter === "all" ? topics : topics.filter((t) => t.unit === unitFilter)),
    [unitFilter, topics]
  );

  const current = filtered[currentIndex];
  const knownInSet = filtered.filter((t) => progress.knownCards.includes(t.id)).length;

  const goNext = () => {
    if (currentIndex < filtered.length - 1) setCurrentIndex((i) => i + 1);
  };
  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const handleKnown = (id: string) => {
    markCardKnown(id);
    updateStreak();
    goNext();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Flashcards</h1>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-muted-foreground" />
          <select
            value={unitFilter}
            onChange={(e) => { setUnitFilter(e.target.value); setCurrentIndex(0); }}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Units</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>Unit {u.id} — {u.shortTitle}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{knownInSet} / {filtered.length} mastered</span>
          <span>Card {currentIndex + 1} of {filtered.length}</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full gradient-amber transition-all duration-500"
            style={{ width: `${(knownInSet / filtered.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Card */}
      {current && (
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Flashcard
              topic={current}
              onKnown={handleKnown}
              onLearning={markCardLearning}
              isKnown={progress.knownCards.includes(current.id)}
            />
          </motion.div>
        </AnimatePresence>
      )}

      {/* Nav buttons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="rounded-full bg-secondary p-3 text-secondary-foreground disabled:opacity-30 transition-colors hover:bg-secondary/80"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={goNext}
          disabled={currentIndex === filtered.length - 1}
          className="rounded-full bg-secondary p-3 text-secondary-foreground disabled:opacity-30 transition-colors hover:bg-secondary/80"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
