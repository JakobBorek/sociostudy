import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStudyData } from "@/contexts/StudyDataContext";
import { NotebookPageView } from "@/components/notebook/NotebookPageView";
import { Button } from "@/components/ui/button";
import { BookOpen, NotebookPen } from "lucide-react";

export default function NotebookPage() {
  const { units, topics } = useStudyData();
  const [activeUnit, setActiveUnit] = useState<string>(units[0]?.id ?? "");

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="gradient-navy rounded-2xl p-6 text-primary-foreground">
        <h1 className="font-display text-3xl font-bold flex items-center gap-2">
          <NotebookPen /> Notebook
        </h1>
        <p className="text-primary-foreground/70 text-sm mt-1">
          Your personal IGCSE (0495) Sociology textbook — read, annotate, highlight, and make it yours.
        </p>
      </div>

      <Tabs defaultValue="notebook" className="w-full">
        <TabsList>
          <TabsTrigger value="sources" className="gap-2"><BookOpen size={14} /> Sources</TabsTrigger>
          <TabsTrigger value="notebook" className="gap-2"><NotebookPen size={14} /> Notebook</TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="mt-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {units.map((u) => {
              const count = topics.filter((t) => t.unit === u.id).length;
              return (
                <div key={u.id} className="rounded-xl border bg-card p-4 card-hover">
                  <div className="text-3xl mb-2">{u.icon}</div>
                  <div className="text-xs uppercase text-muted-foreground tracking-wide">Unit {u.id}</div>
                  <h3 className="font-display font-semibold text-base mt-1">{u.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{u.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">{count} topics</p>
                  <Button
                    size="sm"
                    className="mt-3 w-full"
                    onClick={() => {
                      setActiveUnit(u.id);
                      const trigger = document.querySelector<HTMLElement>('[role="tab"][value="notebook"]');
                      trigger?.click();
                    }}
                  >
                    Open in notebook
                  </Button>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="notebook" className="mt-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {units.map((u) => (
              <button
                key={u.id}
                onClick={() => setActiveUnit(u.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 ${
                  activeUnit === u.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card hover:bg-muted border-border"
                }`}
              >
                <span>{u.icon}</span>
                <span className="font-bold tabular-nums">{u.id}</span>
                <span className="opacity-80">{u.shortTitle}</span>
              </button>
            ))}
          </div>

          {units
            .filter((u) => u.id === activeUnit)
            .map((u) => (
              <NotebookPageView key={u.id} unit={u} topics={topics} />
            ))}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
