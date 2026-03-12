import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown, ArrowLeft } from "lucide-react";
import { units, topics } from "@/data/studyContent";

export default function UnitDetail() {
  const { unitId } = useParams();
  const unit = units.find((u) => u.id === unitId);
  const unitTopics = topics.filter((t) => t.unit === unitId);
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!unit) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Unit not found.</p>
        <Link to="/units" className="text-accent underline text-sm mt-2 inline-block">Back to Units</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/units" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={16} /> Back to Units
      </Link>

      <div className="gradient-navy rounded-2xl p-6 text-primary-foreground">
        <span className="text-3xl mb-2 block">{unit.icon}</span>
        <h1 className="font-display text-2xl font-bold">Unit {unit.id}</h1>
        <p className="text-primary-foreground/70 text-sm mt-1">{unit.title}</p>
        <p className="text-primary-foreground/50 text-xs mt-2">{unitTopics.length} topics</p>
      </div>

      <div className="space-y-3">
        {unitTopics.map((topic, i) => (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl bg-card border border-border overflow-hidden"
          >
            <button
              onClick={() => setExpanded(expanded === topic.id ? null : topic.id)}
              className="w-full flex items-center justify-between p-5 text-left"
            >
              <h3 className="font-display font-semibold text-foreground">{topic.term}</h3>
              <ChevronDown
                size={18}
                className={`text-muted-foreground transition-transform ${expanded === topic.id ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence>
              {expanded === topic.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 space-y-3">
                    <p className="text-sm text-muted-foreground">{topic.definition}</p>

                    {topic.pros.length > 0 && (
                      <div className="rounded-lg bg-success/5 border border-success/20 p-3">
                        <p className="text-xs font-semibold text-success uppercase tracking-wider mb-2">Advantages</p>
                        <ul className="space-y-1">
                          {topic.pros.map((pro, j) => (
                            <li key={j} className="text-sm text-foreground flex items-start gap-1.5">
                              <span className="text-success mt-0.5">✓</span> {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {topic.cons.length > 0 && (
                      <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-3">
                        <p className="text-xs font-semibold text-destructive uppercase tracking-wider mb-2">Disadvantages</p>
                        <ul className="space-y-1">
                          {topic.cons.map((con, j) => (
                            <li key={j} className="text-sm text-foreground flex items-start gap-1.5">
                              <span className="text-destructive mt-0.5">✗</span> {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {topic.notes && topic.notes.length > 0 && (
                      <div className="rounded-lg bg-accent/10 border border-accent/20 p-3">
                        <p className="text-xs font-semibold text-accent-foreground uppercase tracking-wider mb-1">Notes</p>
                        {topic.notes.map((note, j) => (
                          <p key={j} className="text-sm text-muted-foreground">{note}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
