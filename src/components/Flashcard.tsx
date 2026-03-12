import { useState } from "react";
import { motion } from "framer-motion";
import { Check, RotateCcw } from "lucide-react";
import { StudyTopic } from "@/data/studyContent";

interface FlashcardProps {
  topic: StudyTopic;
  onKnown: (id: string) => void;
  onLearning: (id: string) => void;
  isKnown: boolean;
}

export default function Flashcard({ topic, onKnown, onLearning, isKnown }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="perspective-1000 w-full max-w-lg mx-auto" style={{ perspective: "1000px" }}>
      <motion.div
        className="relative w-full cursor-pointer"
        style={{ transformStyle: "preserve-3d", minHeight: "320px" }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 25 }}
        onClick={() => setFlipped(!flipped)}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-xl bg-card border border-border p-8 flex flex-col items-center justify-center shadow-md card-hover"
          style={{ backfaceVisibility: "hidden" }}
        >
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
            Tap to reveal
          </p>
          <h3 className="font-display text-2xl font-bold text-foreground text-center">
            {topic.term}
          </h3>
          <span className="mt-4 inline-block rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-accent-foreground">
            Unit {topic.unit}
          </span>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-xl bg-card border border-border p-6 flex flex-col shadow-md overflow-auto"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <h4 className="font-display text-lg font-bold text-foreground mb-3">{topic.term}</h4>
          <p className="text-sm text-muted-foreground mb-4">{topic.definition}</p>

          {topic.pros.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-success uppercase tracking-wider mb-1">Pros</p>
              <ul className="space-y-1">
                {topic.pros.map((pro, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-1.5">
                    <span className="text-success mt-0.5">✓</span> {pro}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {topic.cons.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-destructive uppercase tracking-wider mb-1">Cons</p>
              <ul className="space-y-1">
                {topic.cons.map((con, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-1.5">
                    <span className="text-destructive mt-0.5">✗</span> {con}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </motion.div>

      {/* Action buttons below the card */}
      <div className="flex justify-center gap-3 mt-6">
        <button
          onClick={(e) => { e.stopPropagation(); onLearning(topic.id); }}
          className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
        >
          <RotateCcw size={16} /> Still Learning
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onKnown(topic.id); }}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            isKnown
              ? "bg-success text-success-foreground"
              : "gradient-amber text-accent-foreground"
          }`}
        >
          <Check size={16} /> {isKnown ? "Known ✓" : "I Know This"}
        </button>
      </div>
    </div>
  );
}
