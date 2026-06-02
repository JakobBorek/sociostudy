import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAiAccess } from "@/hooks/useAiAccess";
import { ExternalLink, Key, Sparkles, ShieldCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AiAccessDialog({ open, onOpenChange }: Props) {
  const { mode, userGeminiKey, isOwner, saveKey } = useAiAccess();
  const [draft, setDraft] = useState(userGeminiKey);

  useEffect(() => {
    if (open) setDraft(userGeminiKey);
  }, [open, userGeminiKey]);

  const save = () => {
    saveKey(draft);
    toast({
      title: draft.trim() ? "Gemini key saved" : "Gemini key removed",
      description: draft.trim()
        ? "AI features are now unlocked using your own key."
        : "You're back in free mode.",
    });
    onOpenChange(false);
  };

  const badge =
    mode === "lovable" ? (
      <span className="inline-flex items-center gap-1 text-xs font-semibold rounded-full bg-accent/20 text-accent px-2 py-0.5">
        <ShieldCheck size={12} /> Owner access
      </span>
    ) : mode === "user-key" ? (
      <span className="inline-flex items-center gap-1 text-xs font-semibold rounded-full bg-primary/15 text-primary px-2 py-0.5">
        <Sparkles size={12} /> Using your key
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-xs font-semibold rounded-full bg-muted text-muted-foreground px-2 py-0.5">
        Free mode
      </span>
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key size={18} /> AI access
          </DialogTitle>
          <DialogDescription>
            Current status: {badge}
          </DialogDescription>
        </DialogHeader>

        {isOwner ? (
          <p className="text-sm text-muted-foreground">
            You're the site owner. All AI features run on the shared account — no key needed.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gem-key">Google Gemini API key</Label>
              <Input
                id="gem-key"
                type="password"
                placeholder="AIza..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Stored only in your browser. Used directly to call Google's Gemini API.
                Get a free key at{" "}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary inline-flex items-center gap-1 underline"
                >
                  aistudio.google.com <ExternalLink size={12} />
                </a>
                .
              </p>
            </div>

            <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">Without a key (free mode):</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Mock exams use a set of pre-made papers (one per unit + a general one).</li>
                <li>Prove It, AI marking, and AI feedback are hidden.</li>
                <li>Flashcards, quizzes, notebook and unit pages all still work.</li>
              </ul>
            </div>

            <div className="flex justify-between gap-2">
              {userGeminiKey && (
                <Button variant="ghost" onClick={() => { saveKey(""); setDraft(""); toast({ title: "Key removed" }); onOpenChange(false); }}>
                  Remove key
                </Button>
              )}
              <div className="ml-auto flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button onClick={save}>Save</Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
