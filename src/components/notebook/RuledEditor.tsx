import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useRef, useState } from "react";
import {
  Bold, Italic, Underline as UnderlineIcon, Highlighter,
  List, ListOrdered, Heading1, Heading2, Heading3, MessageSquarePlus,
  Undo2, Redo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Word-style 15-colour highlight palette (5 per row × 3 rows)
const HIGHLIGHT_COLORS = [
  { name: "Yellow", value: "#FFFF00" },
  { name: "Bright Green", value: "#7CFC00" },
  { name: "Turquoise", value: "#80FFFF" },
  { name: "Pink", value: "#FF40FF" },
  { name: "Blue", value: "#0000FF" },
  { name: "Red", value: "#E53935" },
  { name: "Dark Blue", value: "#000080" },
  { name: "Teal", value: "#3F8C99" },
  { name: "Green", value: "#2E7D32" },
  { name: "Violet", value: "#7B1FA2" },
  { name: "Dark Red", value: "#7A1410" },
  { name: "Olive", value: "#808000" },
  { name: "Gray", value: "#8C8C8C" },
  { name: "Light Gray", value: "#C7C7C7" },
  { name: "Black", value: "#000000" },
];

interface Props {
  initialContent: any;
  onChange: (doc: any) => void;
  onAddComment?: (selectedText: string, from: number, to: number) => void;
  editable?: boolean;
}

export function RuledEditor({ initialContent, onChange, onAddComment, editable = true }: Props) {
  // Active marker color — when set, any text you select is auto-highlighted with this color.
  const [markerColor, setMarkerColor] = useState<string | null>(null);
  const markerColorRef = useRef<string | null>(null);
  useEffect(() => { markerColorRef.current = markerColor; }, [markerColor]);

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
      editor.chain().setHighlight({ color }).setTextSelection(to).run();
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
}: {
  editor: Editor;
  onAddComment?: (t: string, f: number, to: number) => void;
  markerColor: string | null;
  setMarkerColor: (c: string | null) => void;
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
      editor.chain().focus().setHighlight({ color }).run();
    }
    // Toggle marker mode for subsequent selections.
    setMarkerColor(markerColor === color ? null : color);
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
      <div className="flex items-center gap-1.5">
        <Highlighter
          size={14}
          className={markerColor ? "text-accent" : "text-muted-foreground"}
          style={markerColor ? { color: markerColor } : undefined}
        />
        <div className="grid grid-cols-5 gap-0.5">
          {HIGHLIGHT_COLORS.map((c) => {
            const active = markerColor === c.value;
            return (
              <button
                key={c.value}
                type="button"
                title={active ? `Marker on — ${c.name} (click to turn off)` : `Marker: ${c.name}`}
                onClick={() => pickColor(c.value)}
                className={`h-4 w-4 rounded-sm border transition hover:scale-110 ${
                  active ? "ring-2 ring-offset-1 ring-accent border-accent scale-110" : "border-border/60"
                }`}
                style={{ background: c.value }}
              />
            );
          })}
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
