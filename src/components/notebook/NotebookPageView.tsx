import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { RuledEditor } from "./RuledEditor";
import type { Unit, StudyTopic } from "@/data/studyContent";
import { seedDocFromUnit } from "@/lib/notebookSeed";
import { Button } from "@/components/ui/button";
import { Trash2, MessageSquare, History, RotateCcw, Camera, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Annotation {
  id: string;
  unit_id: string;
  type: string;
  text: string | null;
  comment: string | null;
  created_at: string;
}

interface Version {
  id: string;
  unit_id: string;
  content: any;
  label: string | null;
  created_at: string;
}

interface Props {
  unit: Unit;
  topics: StudyTopic[];
  editable?: boolean;
}

// Snapshot at most this often per unit (ms)
const MIN_SNAPSHOT_GAP = 2 * 60 * 1000;
// Keep this many versions per unit
const MAX_VERSIONS = 50;

export function NotebookPageView({ unit, topics, editable = true }: Props) {
  const { user } = useAuth();
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Annotation[]>([]);
  const saveTimer = useRef<number | null>(null);
  const lastSnapshotAt = useRef<number>(0);
  const lastSnapshotContent = useRef<string>("");
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
      lastSnapshotContent.current = JSON.stringify(content);
      lastSnapshotAt.current = Date.now();

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

  const snapshot = async (content: any, label?: string) => {
    if (!user) return;
    const serialized = JSON.stringify(content);
    if (serialized === lastSnapshotContent.current) return;
    lastSnapshotContent.current = serialized;
    lastSnapshotAt.current = Date.now();
    const { error } = await supabase.from("notebook_versions").insert({
      user_id: user.id,
      unit_id: unit.id,
      content,
      label: label ?? null,
    });
    if (error) {
      console.error("snapshot", error);
      return;
    }
    // Prune to MAX_VERSIONS
    const { data: ids } = await supabase
      .from("notebook_versions")
      .select("id")
      .eq("user_id", user.id)
      .eq("unit_id", unit.id)
      .order("created_at", { ascending: false });
    if (ids && ids.length > MAX_VERSIONS) {
      const toDelete = ids.slice(MAX_VERSIONS).map((r) => r.id);
      await supabase.from("notebook_versions").delete().in("id", toDelete);
    }
  };

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
      // Throttled auto-snapshot
      if (Date.now() - lastSnapshotAt.current >= MIN_SNAPSHOT_GAP) {
        snapshot(next);
      }
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

  const restoreVersion = (content: any) => {
    setDoc(content);
    persist(content);
    toast({ title: "Version restored", description: "Your notebook now shows this earlier version." });
  };

  const saveSnapshotNow = async () => {
    if (!doc) return;
    const label = window.prompt("Label this snapshot (optional):") || undefined;
    // Force-snapshot by resetting the dedupe key
    lastSnapshotContent.current = "";
    await snapshot(doc, label);
    toast({ title: "Snapshot saved" });
  };

  if (loading || !doc) {
    return <div className="p-6 text-muted-foreground">Loading notebook page…</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">
      <div className="space-y-2">
        {editable && (
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={saveSnapshotNow} className="gap-1">
              <Camera size={14} /> Save snapshot
            </Button>
            <VersionHistoryDialog
              unitId={unit.id}
              unitTitle={unit.title}
              onRestore={restoreVersion}
            />
          </div>
        )}
        <RuledEditor
          initialContent={doc}
          onChange={handleChange}
          onAddComment={editable ? addComment : undefined}
          editable={editable}
        />
      </div>
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

/* ----------------------------- Version history ----------------------------- */

function VersionHistoryDialog({
  unitId,
  unitTitle,
  onRestore,
}: {
  unitId: string;
  unitTitle: string;
  onRestore: (content: any) => void;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);
  const [selected, setSelected] = useState<Version | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    setLoading(true);
    supabase
      .from("notebook_versions")
      .select("id, unit_id, content, label, created_at")
      .eq("user_id", user.id)
      .eq("unit_id", unitId)
      .order("created_at", { ascending: false })
      .limit(MAX_VERSIONS)
      .then(({ data }) => {
        const list = (data ?? []) as Version[];
        setVersions(list);
        setSelected(list[0] ?? null);
        setLoading(false);
      });
  }, [open, user, unitId]);

  const deleteVersion = async (id: string) => {
    if (!user) return;
    await supabase.from("notebook_versions").delete().eq("id", id).eq("user_id", user.id);
    setVersions((v) => v.filter((x) => x.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const previewText = useMemo(() => {
    if (!selected?.content) return "";
    return extractText(selected.content).slice(0, 4000);
  }, [selected]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <History size={14} /> Version history
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History size={16} /> {unitTitle} — version history
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-muted-foreground text-sm py-8 text-center">Loading…</div>
        ) : versions.length === 0 ? (
          <div className="text-muted-foreground text-sm py-8 text-center">
            No snapshots yet. Snapshots are saved automatically every couple of minutes while you write, or use "Save snapshot".
          </div>
        ) : (
          <div className="grid grid-cols-[220px_1fr] gap-4 max-h-[60vh]">
            <ul className="overflow-y-auto pr-1 space-y-1 border-r">
              {versions.map((v, idx) => {
                const active = selected?.id === v.id;
                return (
                  <li key={v.id}>
                    <button
                      onClick={() => setSelected(v)}
                      className={`w-full text-left rounded-md px-2 py-2 text-xs transition ${
                        active ? "bg-accent/15 border border-accent" : "hover:bg-muted"
                      }`}
                    >
                      <div className="font-semibold">
                        {idx === 0 ? "Latest snapshot" : new Date(v.created_at).toLocaleString()}
                      </div>
                      {idx === 0 && (
                        <div className="text-[10px] text-muted-foreground">
                          {new Date(v.created_at).toLocaleString()}
                        </div>
                      )}
                      {v.label && (
                        <div className="text-[10px] italic text-accent-foreground/80 mt-0.5">
                          "{v.label}"
                        </div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="overflow-y-auto space-y-3">
              {selected ? (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Eye size={12} /> Preview
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteVersion(selected.id)}
                        className="text-destructive gap-1"
                      >
                        <Trash2 size={14} /> Delete
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          onRestore(selected.content);
                          setOpen(false);
                        }}
                        className="gap-1"
                      >
                        <RotateCcw size={14} /> Restore this version
                      </Button>
                    </div>
                  </div>
                  <div className="rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-wrap leading-relaxed font-serif max-h-[50vh] overflow-y-auto">
                    {previewText || <span className="italic text-muted-foreground">(empty page)</span>}
                  </div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">Pick a snapshot from the list.</div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* Extract plain text from a TipTap/ProseMirror JSON doc for preview */
function extractText(node: any): string {
  if (!node) return "";
  if (typeof node.text === "string") return node.text;
  const children = Array.isArray(node.content) ? node.content : [];
  const isBlock = node.type && !["text"].includes(node.type);
  const inner = children.map(extractText).join("");
  return isBlock ? inner + "\n" : inner;
}
