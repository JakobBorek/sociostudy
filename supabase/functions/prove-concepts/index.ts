// Generates and grades concept-understanding questions from a student's notebook.
// Replaces strict gap-fill matching: tests understanding of subtopics, not exact words.
//
// Actions:
//   action: "generate" -> input { notes: string, count?: number, scopeLabel?: string }
//                          output { questions: [{ id, prompt, concept, hint }] }
//   action: "grade"    -> input { items: [{ id, prompt, concept, user_answer }] }
//                          output { results: [{ id, correct, score, feedback, model_answer }] }
//
// "correct" is true when score >= 3 (out of 4). Score reflects depth of understanding,
// not wording.

import { corsHeaders, guard } from "../_shared/guard.ts";
import { aiCall } from "../_shared/aiCall.ts";

interface GenBody {
  action: "generate";
  notes: string;
  count?: number;
  scopeLabel?: string;
  userGeminiKey?: string;
}
interface GradeBody {
  action: "grade";
  items: { id: string; prompt: string; concept: string; user_answer: string }[];
  userGeminiKey?: string;
}
type Body = GenBody | GradeBody;

const clip = (s: unknown, n: number) => String(s ?? "").slice(0, n);

async function callAI(
  prompt: string,
  user: { email?: string },
  userGeminiKey: string | undefined,
  system = "You output strict JSON only.",
) {
  const r = await aiCall({
    user,
    userGeminiKey,
    payload: {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    },
  });
  if (!r.ok) return { errResponse: r.response };
  const raw = r.data?.choices?.[0]?.message?.content ?? "{}";
  try {
    return { data: JSON.parse(raw) };
  } catch {
    return { data: {} };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const g = await guard<Body>(req, { maxBytes: 300_000 });
    if (!g.ok) return g.response;
    const body = g.body;

    if (body.action === "generate") {
      const notes = clip(body.notes, 60_000).trim();
      const count = Math.max(3, Math.min(12, Number(body.count) || 6));
      const scopeLabel = clip(body.scopeLabel, 200);
      if (notes.length < 50) {
        return new Response(
          JSON.stringify({ error: "Not enough notebook content to generate questions." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const prompt = `You are a Cambridge IGCSE Sociology (0495) tutor. From the student's notebook below, write ${count} short questions that test whether they UNDERSTAND the key subtopics — not their memory of exact wording.

Rules:
- Each question targets ONE concept actually present in the notes.
- Mix question types: define a concept, explain it in own words, give an example, contrast two ideas, identify a perspective.
- Keep prompts concise (under 25 words). They should be answerable in 1-3 sentences.
- Avoid "fill in the blank" style. No quoting the notebook verbatim.
- Cover different parts of the notes; do not repeat the same concept.

Return strict JSON:
{"questions":[{"id":"q1","prompt":"...","concept":"the concept being tested (2-6 words)","hint":"one short hint, optional"}]}

Scope: ${scopeLabel || "student notebook"}

Notebook:
"""
${notes}
"""`;

      const out = await callAI(prompt, g.user, body.userGeminiKey);
      if ("errResponse" in out) return out.errResponse;
      const questions = Array.isArray(out.data?.questions)
        ? out.data.questions
            .filter((q: any) => q && typeof q.prompt === "string")
            .map((q: any, i: number) => ({
              id: clip(q.id || `q${i + 1}`, 40),
              prompt: clip(q.prompt, 400),
              concept: clip(q.concept || "", 120),
              hint: clip(q.hint || "", 200),
            }))
            .slice(0, count)
        : [];
      if (questions.length === 0) {
        return new Response(JSON.stringify({ error: "Couldn't generate questions." }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ questions }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.action === "grade") {
      const items = Array.isArray(body.items) ? body.items.slice(0, 40) : [];
      if (items.length === 0) {
        return new Response(JSON.stringify({ error: "No items" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const cleaned = items.map((it) => ({
        id: clip(it.id, 40),
        prompt: clip(it.prompt, 400),
        concept: clip(it.concept, 120),
        user_answer: clip(it.user_answer, 1500),
      }));

      // Blanks fail immediately, no AI call needed.
      const results: { id: string; correct: boolean; score: number; feedback: string; model_answer: string }[] = [];
      const toGrade: typeof cleaned = [];
      for (const it of cleaned) {
        if (!it.user_answer.trim()) {
          results.push({ id: it.id, correct: false, score: 0, feedback: "Left blank.", model_answer: "" });
        } else {
          toGrade.push(it);
        }
      }

      if (toGrade.length > 0) {
        const prompt = `You are grading short answers from an IGCSE Sociology (0495) student. For each item, judge whether the student UNDERSTANDS the concept. Ignore spelling and exact wording — accept paraphrases, synonyms, and own-words explanations. Reward correct ideas even if briefly stated. Mark down only when the meaning is wrong, missing, or confused.

Score out of 4:
  4 = clear, accurate understanding
  3 = mostly right, minor gap
  2 = partial understanding, a key piece missing or muddled
  1 = some relevant idea but largely wrong
  0 = wrong, off-topic, or empty
"correct" = true when score >= 3.

Always return a "model_answer": one or two sentences a top student would write.
Feedback: under 25 words, friendly, specific to what was missing or strong.

Return strict JSON:
{"results":[{"id":"...","score":0-4,"correct":true|false,"feedback":"...","model_answer":"..."}]}

Items:
${JSON.stringify(toGrade, null, 2)}`;

        const out = await callAI(prompt, g.user, (body as any).userGeminiKey);
        if ("errResponse" in out) return out.errResponse;
        const map = new Map(
          (out.data?.results ?? []).map((r: any) => [
            String(r.id),
            {
              id: String(r.id),
              score: Math.max(0, Math.min(4, Number(r.score) || 0)),
              correct: Boolean(r.correct ?? (Number(r.score) || 0) >= 3),
              feedback: clip(r.feedback, 400),
              model_answer: clip(r.model_answer, 600),
            },
          ]),
        );
        for (const it of toGrade) {
          const r = map.get(it.id);
          results.push(
            r ?? { id: it.id, correct: false, score: 0, feedback: "Couldn't grade — try again.", model_answer: "" },
          );
        }
      }
      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
