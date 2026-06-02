import type { StudyTopic, Unit } from "@/data/studyContent";

/**
 * Build a TipTap-compatible JSON doc with full-prose chapter text for a unit.
 * Renders each topic as a heading + a paragraph of definition, then optional
 * prose paragraphs combining pros, cons and notes.
 */
export function seedDocFromUnit(unit: Unit, topics: StudyTopic[]) {
  const unitTopics = topics.filter((t) => t.unit === unit.id);
  const content: any[] = [
    { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: unit.title }] },
    { type: "paragraph", content: [{ type: "text", text: unit.description }] },
  ];

  for (const t of unitTopics) {
    content.push({ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: t.term }] });
    content.push({ type: "paragraph", content: [{ type: "text", text: t.definition }] });

    if (t.pros?.length) {
      const prosText = `Sociologists who support this view argue several strengths. ${t.pros.join(" Additionally, ")}.`;
      content.push({ type: "paragraph", content: [{ type: "text", text: prosText }] });
    }
    if (t.cons?.length) {
      const consText = `However, this perspective has been criticised. ${t.cons.join(" Furthermore, ")}.`;
      content.push({ type: "paragraph", content: [{ type: "text", text: consText }] });
    }
    if (t.notes?.length) {
      for (const n of t.notes) {
        content.push({ type: "paragraph", content: [{ type: "text", text: n }] });
      }
    }
  }

  return { type: "doc", content };
}
