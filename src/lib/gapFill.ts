// Build a fill-in-the-blank version of a TipTap document by blanking
// individual content words (never whole sentences).

export type Segment =
  | { kind: "text"; text: string }
  | { kind: "break" }
  | { kind: "heading"; level: number; text: string }
  | { kind: "blank"; id: string; expected: string; context: string };

const STOP = new Set([
  "the","and","that","with","from","this","they","have","been","were","their","which","would",
  "could","should","because","there","these","those","into","when","what","while","also","such",
  "than","then","each","other","more","most","some","many","much","very","both","over","under",
  "about","through","before","after","between","among","being","does","done","made","make","makes",
  "your","yours","you're","you","will","just","like","only","upon","onto","without","within",
  "another","sociologists","sociology","example","examples","argue","argues","argued","view","views",
  "people","society","societies","group","groups","family","families","social","cultural",
]);

const isWordLike = (w: string) => /^[A-Za-z][A-Za-z'-]+$/.test(w);

/**
 * Walk a TipTap doc and produce a stream of segments. Every ~Nth eligible word
 * becomes a blank. Returns segments + the blank list for grading.
 */
export function buildGapFill(doc: any, opts: { density?: number } = {}) {
  const density = opts.density ?? 7; // 1-in-N eligible words becomes a blank
  const segments: Segment[] = [];
  const blanks: { id: string; expected: string; context: string }[] = [];
  let blankCounter = 0;
  let eligibleSeen = 0;
  // Track per-paragraph buffer to build context sentence
  if (!doc?.content) return { segments, blanks };

  const flushTextWithBlanks = (text: string, contextSentence: string) => {
    // Tokenize keeping whitespace/punctuation
    const tokens = text.split(/(\s+|[^A-Za-z0-9'\s-]+)/g).filter((t) => t !== "");
    for (const tok of tokens) {
      if (isWordLike(tok) && tok.length >= 5 && !STOP.has(tok.toLowerCase())) {
        eligibleSeen++;
        if (eligibleSeen % density === 0) {
          const id = `b${blankCounter++}`;
          const expected = tok;
          segments.push({ kind: "blank", id, expected, context: contextSentence });
          blanks.push({ id, expected, context: contextSentence });
          continue;
        }
      }
      segments.push({ kind: "text", text: tok });
    }
  };

  for (const node of doc.content) {
    if (node.type === "heading") {
      const text = collectText(node);
      segments.push({ kind: "heading", level: node.attrs?.level ?? 2, text });
      segments.push({ kind: "break" });
      continue;
    }
    if (node.type === "paragraph" || node.type === "blockquote") {
      const text = collectText(node);
      if (!text.trim()) {
        segments.push({ kind: "break" });
        continue;
      }
      // Use the whole paragraph as the context for any blank inside it.
      flushTextWithBlanks(text, text);
      segments.push({ kind: "break" });
      continue;
    }
    if (node.type === "bulletList" || node.type === "orderedList") {
      const ordered = node.type === "orderedList";
      let i = 1;
      for (const li of node.content ?? []) {
        const text = collectText(li);
        segments.push({ kind: "text", text: ordered ? `${i++}. ` : "• " });
        flushTextWithBlanks(text, text);
        segments.push({ kind: "break" });
      }
    }
  }

  return { segments, blanks };
}

function collectText(node: any): string {
  if (!node) return "";
  if (typeof node.text === "string") return node.text;
  if (Array.isArray(node.content)) {
    return node.content.map(collectText).join("");
  }
  return "";
}

export function mergeDocs(docs: { unit: string; doc: any }[]) {
  const content: any[] = [];
  for (const { unit, doc } of docs) {
    if (!doc?.content) continue;
    content.push({
      type: "heading",
      attrs: { level: 1 },
      content: [{ type: "text", text: `Unit ${unit}` }],
    });
    for (const n of doc.content) content.push(n);
  }
  return { type: "doc", content };
}
