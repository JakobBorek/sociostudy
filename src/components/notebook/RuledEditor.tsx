import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useRef, useState } from "react";
import {
  Bold, Italic, Underline as UnderlineIcon, Highlighter,
  List, ListOrdered, Heading1, Heading2, Heading3, MessageSquarePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const HIGHLIGHT_COLORS = [
  { name: "Yellow", value: "#fff3a3" },
  { name: "Green", value: "#bdf2c9" },
  { name: "Pink", value: "#ffc4dd" },
  { name: "Blue", value: "#c4dcff" },
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
      {tBtn(editor.isActive("heading", { level: 1 }), () => editor.chain().focus().toggleHeading({ level: 1 }).run(), <Heading1 size={16} />, "H1")}
      {tBtn(editor.isActive("heading", { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), <Heading2 size={16} />, "H2")}
      {tBtn(editor.isActive("heading", { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), <Heading3 size={16} />, "H3")}
      <div className="w-px h-5 bg-border mx-1" />
      {tBtn(editor.isActive("bold"), () => editor.chain().focus().toggleBold().run(), <Bold size={16} />, "Bold")}
      {tBtn(editor.isActive("italic"), () => editor.chain().focus().toggleItalic().run(), <Italic size={16} />, "Italic")}
      {tBtn(editor.isActive("underline"), () => editor.chain().focus().toggleUnderline().run(), <UnderlineIcon size={16} />, "Underline")}
      <div className="w-px h-5 bg-border mx-1" />
      <div className="flex items-center gap-0.5">
        <Highlighter
          size={14}
          className={markerColor ? "text-accent" : "text-muted-foreground"}
          style={markerColor ? { color: markerColor } : undefined}
        />
        {HIGHLIGHT_COLORS.map((c) => {
          const active = markerColor === c.value;
          return (
            <button
              key={c.value}
              type="button"
              title={active ? `Marker on — ${c.name} (click to turn off)` : `Marker: ${c.name}`}
              onClick={() => pickColor(c.value)}
              className={`h-5 w-5 rounded-full border transition hover:scale-110 ${
                active ? "ring-2 ring-offset-1 ring-accent border-accent scale-110" : "border-border"
              }`}
              style={{ background: c.value }}
            />
          );
        })}
        <button
          type="button"
          title="Turn marker off / remove highlight from selection"
          onClick={() => {
            const { empty } = editor.state.selection;
            if (!empty) editor.chain().focus().unsetHighlight().run();
            setMarkerColor(null);
          }}
          className="h-5 w-5 rounded-full border border-border bg-background text-xs"
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
