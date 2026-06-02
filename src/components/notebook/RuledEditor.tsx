import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useRef, useState } from "react";
import {
  Bold, Italic, Underline as UnderlineIcon, Highlighter,
  List, ListOrdered, Heading1, Heading2, Heading3, MessageSquarePlus,
  Undo2, Redo2, Plus, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Minimal default highlight palette — users can add their own colours.
const DEFAULT_HIGHLIGHT_COLORS = [
  { name: "Yellow", value: "#FFFF00" },
  { name: "Green", value: "#7CFC00" },
  { name: "Red", value: "#FF6B6B" },
  { name: "Blue", value: "#5B8DEF" },
  { name: "Pink", value: "#FF40FF" },
];

const CUSTOM_COLORS_KEY = "notebook.customHighlightColors";

// Convert hex (#RRGGBB) + opacity 0..1 → rgba string
function hexToRgba(hex: string, opacity: number) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

interface Props {
  initialContent: any;
  onChange: (doc: any) => void;
  onAddComment?: (selectedText: string, from: number, to: number) => void;
  editable?: boolean;
}

export function RuledEditor({ initialContent, onChange, onAddComment, editable = true }: Props) {
  // Active marker color — when set, any text you select is auto-highlighted with this color.
  const [markerColor, setMarkerColor] = useState<string | null>(null);
  const [markerOpacity, setMarkerOpacity] = useState<number>(1);
  const markerColorRef = useRef<string | null>(null);
  const markerOpacityRef = useRef<number>(1);
  useEffect(() => { markerColorRef.current = markerColor; }, [markerColor]);
  useEffect(() => { markerOpacityRef.current = markerOpacity; }, [markerOpacity]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({ placeholder: "Start writing your notes…" }),
    ],
    content: initialContent,
    editable,
    editorProps: {
      attributes: {
        class: "notebook-prose focus:outline-none min-h-[600px]",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
  });

  // Marker behaviour: when marker is on and the user finishes selecting text,
  // highlight that range automatically. We listen on mouseup/keyup so the
  // selection has settled before we mutate it.
  useEffect(() => {
    if (!editor) return;
    const dom = editor.view.dom as HTMLElement;
    const applyIfSelected = () => {
      const color = markerColorRef.current;
      if (!color) return;
      const { from, to, empty } = editor.state.selection;
      if (empty || from === to) return;
      const applied = hexToRgba(color, markerOpacityRef.current);
      editor.chain().setHighlight({ color: applied }).setTextSelection(to).run();
    };
    const onMouseUp = () => setTimeout(applyIfSelected, 0);
    const onKeyUp = (e: KeyboardEvent) => {
      // Only react to selection-extending keys
      if (e.shiftKey || e.key.startsWith("Arrow") || e.key === "Home" || e.key === "End") {
        setTimeout(applyIfSelected, 0);
      }
    };
    dom.addEventListener("mouseup", onMouseUp);
    dom.addEventListener("keyup", onKeyUp);
    return () => {
      dom.removeEventListener("mouseup", onMouseUp);
      dom.removeEventListener("keyup", onKeyUp);
    };
  }, [editor]);

  // Reload content if initialContent changes (switching units / restore)
  const lastRef = useRef<any>(initialContent);
  useEffect(() => {
    if (editor && initialContent && initialContent !== lastRef.current) {
      editor.commands.setContent(initialContent, { emitUpdate: false });
      lastRef.current = initialContent;
    }
  }, [initialContent, editor]);

  if (!editor) return null;

  return (
    <div className="space-y-3">
      {editable && (
        <Toolbar
          editor={editor}
          onAddComment={onAddComment}
          markerColor={markerColor}
          setMarkerColor={setMarkerColor}
          markerOpacity={markerOpacity}
          setMarkerOpacity={setMarkerOpacity}
        />
      )}
      <div
        className="ruled-page"
        style={markerColor ? { cursor: "crosshair" } : undefined}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function Toolbar({
  editor,
  onAddComment,
  markerColor,
  setMarkerColor,
  markerOpacity,
  setMarkerOpacity,
}: {
  editor: Editor;
  onAddComment?: (t: string, f: number, to: number) => void;
  markerColor: string | null;
  setMarkerColor: (c: string | null) => void;
  markerOpacity: number;
  setMarkerOpacity: (n: number) => void;
}) {
  const tBtn = (active: boolean, onClick: () => void, icon: React.ReactNode, label: string) => (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="sm"
      onClick={onClick}
      title={label}
      className="h-8 px-2"
    >
      {icon}
    </Button>
  );

  const addComment = () => {
    const { from, to, empty } = editor.state.selection;
    if (empty) return;
    const text = editor.state.doc.textBetween(from, to, " ");
    onAddComment?.(text, from, to);
  };

  const pickColor = (color: string) => {
    // If a range is already selected, highlight it right now.
    const { from, to, empty } = editor.state.selection;
    if (!empty && from !== to) {
      editor.chain().focus().setHighlight({ color: hexToRgba(color, markerOpacity) }).run();
    }
    // Toggle marker mode for subsequent selections.
    setMarkerColor(markerColor === color ? null : color);
  };

  const setCustomColor = (color: string) => {
    const { from, to, empty } = editor.state.selection;
    if (!empty && from !== to) {
      editor.chain().focus().setHighlight({ color: hexToRgba(color, markerOpacity) }).run();
    }
    setMarkerColor(color);
  };

  return (
    <div className="sticky top-16 z-10 flex flex-wrap items-center gap-1 rounded-lg border bg-card/95 backdrop-blur px-2 py-1.5 shadow-sm">
      {tBtn(false, () => editor.chain().focus().undo().run(), <Undo2 size={16} />, "Undo")}
      {tBtn(false, () => editor.chain().focus().redo().run(), <Redo2 size={16} />, "Redo")}
      <div className="w-px h-5 bg-border mx-1" />
      {tBtn(editor.isActive("heading", { level: 1 }), () => editor.chain().focus().toggleHeading({ level: 1 }).run(), <Heading1 size={16} />, "H1")}
      {tBtn(editor.isActive("heading", { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), <Heading2 size={16} />, "H2")}
      {tBtn(editor.isActive("heading", { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), <Heading3 size={16} />, "H3")}
      <div className="w-px h-5 bg-border mx-1" />
      {tBtn(editor.isActive("bold"), () => editor.chain().focus().toggleBold().run(), <Bold size={16} />, "Bold")}
      {tBtn(editor.isActive("italic"), () => editor.chain().focus().toggleItalic().run(), <Italic size={16} />, "Italic")}
      {tBtn(editor.isActive("underline"), () => editor.chain().focus().toggleUnderline().run(), <UnderlineIcon size={16} />, "Underline")}
      <div className="w-px h-5 bg-border mx-1" />
      <HighlightControls
        editor={editor}
        markerColor={markerColor}
        setMarkerColor={setMarkerColor}
        markerOpacity={markerOpacity}
        setMarkerOpacity={setMarkerOpacity}
        pickColor={pickColor}
        setCustomColor={setCustomColor}
      />
      <div className="w-px h-5 bg-border mx-1" />
      {tBtn(editor.isActive("bulletList"), () => editor.chain().focus().toggleBulletList().run(), <List size={16} />, "Bullet list")}
      {tBtn(editor.isActive("orderedList"), () => editor.chain().focus().toggleOrderedList().run(), <ListOrdered size={16} />, "Numbered list")}
      {onAddComment && (
        <>
          <div className="w-px h-5 bg-border mx-1" />
          <Button type="button" variant="ghost" size="sm" onClick={addComment} className="h-8 px-2 gap-1" title="Add comment to selection">
            <MessageSquarePlus size={16} />
            <span className="text-xs">Comment</span>
          </Button>
        </>
      )}
    </div>
  );
}

function HighlightControls({
  editor,
  markerColor,
  setMarkerColor,
  markerOpacity,
  setMarkerOpacity,
  pickColor,
  setCustomColor,
}: {
  editor: Editor;
  markerColor: string | null;
  setMarkerColor: (c: string | null) => void;
  markerOpacity: number;
  setMarkerOpacity: (n: number) => void;
  pickColor: (c: string) => void;
  setCustomColor: (c: string) => void;
}) {
  const [customColors, setCustomColors] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(CUSTOM_COLORS_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_COLORS_KEY, JSON.stringify(customColors));
    } catch {
      /* ignore */
    }
  }, [customColors]);

  const allPresets = [
    ...DEFAULT_HIGHLIGHT_COLORS,
    ...customColors.map((v) => ({ name: v, value: v, custom: true as const })),
  ];

  const addCurrentToPresets = () => {
    if (!markerColor) return;
    const v = markerColor.toLowerCase();
    if (DEFAULT_HIGHLIGHT_COLORS.some((c) => c.value.toLowerCase() === v)) return;
    if (customColors.map((c) => c.toLowerCase()).includes(v)) return;
    setCustomColors([...customColors, markerColor]);
  };

  const removeCustom = (value: string) => {
    setCustomColors(customColors.filter((c) => c !== value));
  };

  const canAdd =
    !!markerColor &&
    !DEFAULT_HIGHLIGHT_COLORS.some((c) => c.value.toLowerCase() === markerColor.toLowerCase()) &&
    !customColors.map((c) => c.toLowerCase()).includes(markerColor.toLowerCase());

  return (
    <div className="flex items-center gap-1.5">
      <Highlighter
        size={14}
        className={markerColor ? "text-accent" : "text-muted-foreground"}
        style={markerColor ? { color: markerColor } : undefined}
      />
      <div className="flex flex-wrap items-center gap-0.5 max-w-[220px]">
        {allPresets.map((c: any) => {
          const active = markerColor === c.value;
          return (
            <div key={c.value} className="relative group">
              <button
                type="button"
                title={
                  active
                    ? `Marker on — ${c.name} (click to turn off)`
                    : `Marker: ${c.name}${c.custom ? " (right-click to remove)" : ""}`
                }
                onClick={() => pickColor(c.value)}
                onContextMenu={(e) => {
                  if (c.custom) {
                    e.preventDefault();
                    removeCustom(c.value);
                  }
                }}
                className={`h-4 w-4 rounded-sm border transition hover:scale-110 ${
                  active
                    ? "ring-2 ring-offset-1 ring-accent border-accent scale-110"
                    : "border-border/60"
                }`}
                style={{ background: c.value }}
              />
              {c.custom && (
                <button
                  type="button"
                  title="Remove custom colour"
                  onClick={() => removeCustom(c.value)}
                  className="absolute -top-1 -right-1 hidden group-hover:flex h-3 w-3 rounded-full bg-background border border-border items-center justify-center text-[8px]"
                >
                  <X size={8} />
                </button>
              )}
            </div>
          );
        })}
      </div>
      <label
        title="Pick an exact colour"
        className="relative h-5 w-5 rounded-sm border border-border/60 overflow-hidden cursor-pointer"
        style={{
          background:
            "conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
        }}
      >
        <input
          type="color"
          value={markerColor && markerColor.startsWith("#") ? markerColor : "#ffff00"}
          onChange={(e) => setCustomColor(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </label>
      <button
        type="button"
        title={canAdd ? "Save current colour to presets" : "Pick a new colour first"}
        onClick={addCurrentToPresets}
        disabled={!canAdd}
        className="h-5 w-5 rounded-sm border border-border/60 bg-background flex items-center justify-center disabled:opacity-40 hover:bg-muted"
      >
        <Plus size={12} />
      </button>
      <div className="flex items-center gap-1 ml-1">
        <span className="text-[10px] text-muted-foreground">Opacity</span>
        <input
          type="range"
          min={10}
          max={100}
          step={5}
          value={Math.round(markerOpacity * 100)}
          onChange={(e) => setMarkerOpacity(Number(e.target.value) / 100)}
          className="w-16 accent-accent"
          title={`Opacity ${Math.round(markerOpacity * 100)}%`}
        />
      </div>
      <button
        type="button"
        title="Turn marker off / remove highlight from selection"
        onClick={() => {
          const { empty } = editor.state.selection;
          if (!empty) editor.chain().focus().unsetHighlight().run();
          setMarkerColor(null);
        }}
        className="h-5 w-5 rounded-full border border-border bg-background text-xs flex items-center justify-center"
      >
        ✕
      </button>
      {markerColor && (
        <span className="ml-1 text-[10px] font-semibold uppercase tracking-wide text-accent">
          Marker on
        </span>
      )}
    </div>
  );
}
