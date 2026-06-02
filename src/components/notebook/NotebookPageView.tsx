import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { RuledEditor } from "./RuledEditor";
import type { Unit, StudyTopic } from "@/data/studyContent";
import { seedDocFromUnit } from "@/lib/notebookSeed";
import { Button } from "@/components/ui/button";
import { Trash2, MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Annotation {
  id: string;
  unit_id: string;
  type: string;
  text: string | null;
  comment: string | null;
  created_at: string;
}

interface Props {
  unit: Unit;
  topics: StudyTopic[];
  editable?: boolean;
}

export function NotebookPageView({ unit, topics, editable = true }: Props) {
  const { user } = useAuth();
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Annotation[]>([]);
  const saveTimer = useRef<number | null>(null);
  const seedDoc = useMemo(() => seedDocFromUnit(unit, topics), [unit, topics]);

  // Load notebook page + comments
  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      setLoading(true);
      const { data: page } = await supabase
        .from("notebook_pages")
        .select("content")
        .eq("user_id", user.id)
        .eq("unit_id", unit.id)
        .maybeSingle();
      if (!active) return;
      const content = page?.content && Object.keys(page.content).length ? page.content : seedDoc;
      setDoc(content);

      const { data: anns } = await supabase
        .from("annotations")
        .select("*")
        .eq("user_id", user.id)
        .eq("unit_id", unit.id)
        .eq("type", "comment")
        .order("created_at", { ascending: true });
      if (!active) return;
      setComments((anns ?? []) as Annotation[]);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user, unit.id, seedDoc]);

  const persist = (next: any) => {
    if (!user) return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(async () => {
      const { error } = await supabase
        .from("notebook_pages")
        .upsert(
          { user_id: user.id, unit_id: unit.id, content: next },
          { onConflict: "user_id,unit_id" },
        );
      if (error) console.error("notebook save", error);
    }, 700);
  };

  const handleChange = (next: any) => {
    setDoc(next);
    persist(next);
  };

  const addComment = async (selectedText: string, from: number, to: number) => {
    if (!user) return;
    const comment = window.prompt(`Add a note about "${selectedText.slice(0, 60)}":`);
    if (!comment) return;
    const { data, error } = await supabase
      .from("annotations")
      .insert({
        user_id: user.id,
        unit_id: unit.id,
        type: "comment",
        range_from: from,
        range_to: to,
        text: selectedText,
        comment,
      })
      .select()
      .single();
    if (error) return toast({ title: "Couldn't save comment", description: error.message, variant: "destructive" });
    setComments((c) => [...c, data as Annotation]);
  };

  const deleteComment = async (id: string) => {
    if (!user) return;
    await supabase.from("annotations").delete().eq("id", id).eq("user_id", user.id);
    setComments((c) => c.filter((x) => x.id !== id));
  };

  if (loading || !doc) {
    return <div className="p-6 text-muted-foreground">Loading notebook page…</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">
      <RuledEditor
        initialContent={doc}
        onChange={handleChange}
        onAddComment={editable ? addComment : undefined}
        editable={editable}
      />
      <aside className="space-y-2 lg:sticky lg:top-20">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
          <MessageSquare size={12} /> Margin notes
        </h3>
        {comments.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">Select text in your notebook and click "Comment" to add a sticky note here.</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="rounded-lg border-l-4 border-accent bg-accent/10 p-3 text-sm shadow-sm">
              {c.text && (
                <p className="text-xs text-muted-foreground italic mb-1 line-clamp-2">"{c.text}"</p>
              )}
              <p className="text-foreground whitespace-pre-wrap">{c.comment}</p>
              {editable && (
                <button
                  onClick={() => deleteComment(c.id)}
                  className="mt-2 text-xs text-muted-foreground hover:text-destructive inline-flex items-center gap-1"
                >
                  <Trash2 size={12} /> remove
                </button>
              )}
            </div>
          ))
        )}
      </aside>
    </div>
  );
}
