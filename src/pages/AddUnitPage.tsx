import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, FileText, Loader2, Sparkles, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCustomUnits } from "@/hooks/useCustomUnits";
import type { Unit, StudyTopic } from "@/data/studyContent";
import { toast } from "@/hooks/use-toast";

const ICON_OPTIONS = ["📖", "📝", "🧪", "🔬", "📊", "🧠", "💡", "📚", "🎓", "🌍", "⚖️", "🏛️"];

export default function AddUnitPage() {
  const navigate = useNavigate();
  const { addUnit } = useCustomUnits();
  const [unitTitle, setUnitTitle] = useState("");
  const [unitIcon, setUnitIcon] = useState("📖");
  const [content, setContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const extractPdfText = async (file: File): Promise<string> => {
    const pdfjs: any = await import("pdfjs-dist");
    // @ts-ignore
    const workerSrc = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
    pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
    const buf = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: buf }).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const tc = await page.getTextContent();
      fullText += tc.items.map((it: any) => it.str).join(" ") + "\n\n";
    }
    return fullText;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    if (file.type.startsWith("text/") || file.name.endsWith(".md") || file.name.endsWith(".txt")) {
      const text = await file.text();
      setContent((prev) => (prev ? prev + "\n\n" + text : text));
    } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      try {
        toast({ title: "Reading PDF…", description: "Extracting text from the PDF." });
        const text = await extractPdfText(file);
        if (!text.trim()) {
          toast({ title: "Empty PDF", description: "Couldn't extract text. The PDF may be scanned images.", variant: "destructive" });
          return;
        }
        setContent((prev) => (prev ? prev + "\n\n" + text : text));
        toast({ title: "PDF loaded", description: `Extracted ${text.length} characters.` });
      } catch (err: any) {
        toast({ title: "PDF error", description: err.message || "Could not read PDF.", variant: "destructive" });
      }
    } else if (file.type.startsWith("image/")) {
      // Convert image to base64 and send for extraction
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setContent((prev) => (prev ? prev + "\n\n[Image uploaded: " + file.name + "]\n" + base64 : "[Image uploaded: " + file.name + "]\n" + base64));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!unitTitle.trim()) {
      toast({ title: "Missing title", description: "Please enter a unit title.", variant: "destructive" });
      return;
    }
    if (!content.trim()) {
      toast({ title: "Missing content", description: "Please add some notes or upload a file.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke("extract-content", {
        body: { content: content.slice(0, 15000), unitTitle, unitIcon },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const extractedTopics = data.topics;
      if (!extractedTopics || extractedTopics.length === 0) {
        toast({ title: "No topics found", description: "The AI couldn't extract any topics. Try adding more detailed notes.", variant: "destructive" });
        setIsProcessing(false);
        return;
      }

      // Generate a unique unit ID
      const unitId = `custom-${Date.now()}`;

      const newUnit: Unit = {
        id: unitId,
        title: unitTitle,
        shortTitle: unitTitle.length > 15 ? unitTitle.slice(0, 15) + "…" : unitTitle,
        description: `${extractedTopics.length} AI-extracted topics`,
        icon: unitIcon,
      };

      const newTopics: StudyTopic[] = extractedTopics.map((t: any, i: number) => ({
        id: `${unitId}-${i}`,
        term: t.term,
        definition: t.definition,
        pros: t.pros || [],
        cons: t.cons || [],
        notes: t.notes || [],
        unit: unitId,
      }));

      addUnit(newUnit, newTopics);

      toast({
        title: "Unit created! ✨",
        description: `"${unitTitle}" with ${newTopics.length} topics added to your study materials.`,
      });

      navigate("/units");
    } catch (err: any) {
      console.error("Error extracting content:", err);
      toast({
        title: "Extraction failed",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="text-accent" size={24} />
          Add New Unit
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Paste your notes or upload a file — AI will extract flashcards, quiz questions & more.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl bg-card border border-border p-6 space-y-5"
      >
        {/* Unit title */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Unit Title</label>
          <input
            type="text"
            value={unitTitle}
            onChange={(e) => setUnitTitle(e.target.value)}
            placeholder="e.g. Education, Crime & Deviance, Family..."
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Icon picker */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Icon</label>
          <div className="flex flex-wrap gap-2">
            {ICON_OPTIONS.map((icon) => (
              <button
                key={icon}
                onClick={() => setUnitIcon(icon)}
                className={`text-2xl p-2 rounded-lg transition-all ${
                  unitIcon === icon
                    ? "bg-accent/20 ring-2 ring-accent scale-110"
                    : "bg-secondary hover:bg-secondary/80"
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* File upload */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Upload Notes</label>
          <label className="flex items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border p-6 cursor-pointer hover:border-accent hover:bg-accent/5 transition-colors">
            <Upload size={20} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {fileName ? fileName : "Drop a .txt, .md, .pdf, or image file here"}
            </span>
            <input
              type="file"
              accept=".txt,.md,.csv,.pdf,image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          {fileName && (
            <button
              onClick={() => { setFileName(null); }}
              className="mt-1 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <X size={12} /> Remove file
            </button>
          )}
        </div>

        {/* Text area */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">
            <FileText size={14} className="inline mr-1" />
            Notes Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your study notes here... The AI will extract terms, definitions, advantages, and disadvantages automatically."
            rows={10}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
          />
          <p className="text-xs text-muted-foreground mt-1">{content.length} / 15,000 characters</p>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isProcessing || !unitTitle.trim() || !content.trim()}
          className="w-full gradient-amber rounded-lg py-3 font-display font-bold text-accent-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Extracting topics…
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Extract & Create Unit
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
