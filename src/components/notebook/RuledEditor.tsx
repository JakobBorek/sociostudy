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
