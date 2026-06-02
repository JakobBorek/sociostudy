// Rewrites a single sentence from a student's exam answer into a model-answer sentence
// that would earn full marks at IGCSE Sociology 0495.
// Input: { question_prompt, command, marks, original_answer, sentence, topic_context }
// Output: { rewrite: string }

import { corsHeaders, guard } from "../_shared/guard.ts";
import { aiCall } from "../_shared/aiCall.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const g = await guard<{
      question_prompt?: string;
      command?: string;
      marks?: number;
      original_answer?: string;
      sentence?: string;
      topic_context?: string;
      userGeminiKey?: string;
      tune?: "simpler" | "shorter" | "longer";
      previous?: string;
    }>(req, { maxBytes: 64_000 });
    if (!g.ok) return g.response;
    const clip = (s: unknown, n: number) => String(s ?? "").slice(0, n);
    const question_prompt = clip(g.body.question_prompt, 1000);
    const command = clip(g.body.command, 40);
    const marks = Number(g.body.marks ?? 0);
    const original_answer = clip(g.body.original_answer, 8000);
    const sentence = clip(g.body.sentence, 1500);
    const topic_context = clip(g.body.topic_context, 4000);
    const tune = (["simpler", "shorter", "longer"] as const).includes(g.body.tune as any) ? g.body.tune : null;
    const previous = clip(g.body.previous, 1500);
    if (!sentence || !question_prompt) {
      return new Response(JSON.stringify({ error: "Missing sentence or question_prompt" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }


    const sys = `You are an IGCSE Sociology 0495 examiner-tutor.
Rewrite ONE sentence in a student's exam answer into a tight, exam-length model sentence (or at most two short sentences) that would earn full marks for that question.
LANGUAGE LEVEL: write at HIGH B2 / low B1+ English — clear, direct, accessible. Do NOT use C2 / overly formal / literary vocabulary. The student must be able to absorb the FEEDBACK, not learn new words. Prefer common everyday verbs and connectives ("because", "for example", "this shows", "however") over fancy ones ("thereby", "ergo", "notwithstanding"). Keep sociological key terms (e.g. norms, socialisation, sub-culture, stratification) — those are the subject vocabulary and must stay.
Keep it MEMORABLE — short, precise, uses the needed sociological term, and adds the development/example/evaluation the original was missing.
Do NOT pad. Do NOT write a paragraph. Output only the rewritten sentence(s), no quotes, no explanation.`;

    const tuneInstruction = tune === "simpler"
      ? `\n\nTUNE: produce a SIMPLER version than the previous suggestion. Use easier words (B1 level), shorter clauses, and the most basic sentence structure that still earns the marks. Keep sociological key terms.`
      : tune === "shorter"
      ? `\n\nTUNE: produce a SHORTER version than the previous suggestion. Aim for one tight sentence. Remove every word that isn't doing exam work.`
      : tune === "longer"
      ? `\n\nTUNE: produce a slightly LONGER version than the previous suggestion. Add one extra developed point or a brief example/evaluation that fits the command word and tariff. Still at most two sentences.`
      : "";

    const user = `Question (${marks} marks, command word: ${command}):
${question_prompt}

Unit context:
"""
${(topic_context || "").slice(0, 2000)}
"""

Student's full answer:
"""
${original_answer}
"""

Sentence to rewrite:
"${sentence}"${previous ? `\n\nPrevious suggestion (do NOT repeat it verbatim — change it per the TUNE instruction):\n"${previous}"` : ""}${tuneInstruction}`;

    const r = await aiCall({
      user: g.user,
      userGeminiKey: g.body.userGeminiKey,
      payload: {
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: user },
        ],
      },
    });
    if (!r.ok) return r.response;
    const rewrite = (r.data?.choices?.[0]?.message?.content ?? "").trim();
    return new Response(JSON.stringify({ rewrite }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
