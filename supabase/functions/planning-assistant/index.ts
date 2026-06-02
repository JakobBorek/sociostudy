// Planning helper for IGCSE 0495 — generates practice questions, suggests
// points from unit notes, checks plan coverage (NOT marked), and writes
// model answers for the Learn tab.
//
// modes:
//   "suggest_question"  -> { tariff, unit_title, topic_context } -> { question, command }
//   "suggest_points"    -> { question, tariff, topic_context }   -> { points: string[] }
//   "check_plan"        -> { question, tariff, plan }            -> { feedback, missing: string[] }
//   "model_answer"      -> { tariff, command, topic_context, unit_title } -> { question, answer }

import { corsHeaders, guard } from "../_shared/guard.ts";

const SYSTEM = `You are a friendly Cambridge IGCSE Sociology 0495 study coach for a Grade 9 / Year 10 student.
You explain things simply, in a few sentences, and you use authentic 0495 command words and mark tariffs.
You ONLY use the provided unit notes for sociological content — never invent off-syllabus material.
Output STRICT JSON only — no prose, no markdown fences.`;

type Mode = "suggest_question" | "suggest_points" | "check_plan" | "model_answer";

interface Body {
  mode: Mode;
  tariff?: number;
  command?: string;
  question?: string;
  unit_title?: string;
  topic_context?: string;
  plan?: Record<string, string>;
}

function userPrompt(b: Body): string {
  const ctx = (b.topic_context ?? "").slice(0, 6000);
  switch (b.mode) {
    case "suggest_question":
      return `Write ONE authentic 0495 Paper 1 practice question worth [${b.tariff}] marks
on the unit "${b.unit_title}".
Use the exact command word for the tariff:
  [2] Identify/Give/Define · [4] Explain two · [6] Explain three · [8] Discuss the view that · [10] Evaluate the approach · [12] Research methods design · [14] Evaluate the view that

Unit notes:
"""
${ctx}
"""

Return JSON: { "question": "...", "command": "..." }`;
    case "suggest_points":
      return `Question: "${b.question}" [${b.tariff} marks]

From these unit notes, list 4–7 SHORT bullet points (max ~10 words each) the student could use as planning points.
For two-sided tariffs (8/10/14) include both for AND against points.
Don't write full sentences — just the point.

Unit notes:
"""
${ctx}
"""

Return JSON: { "points": ["...", "..."] }`;
    case "check_plan": {
      const plan = b.plan ?? {};
      const planText = Object.entries(plan)
        .map(([slot, v]) => `- ${slot}: ${v?.trim() || "(empty)"}`)
        .join("\n");
      return `Question: "${b.question}" [${b.tariff} marks]

Student's plan (bullets only — NOT marked for writing quality):
${planText}

Check COVERAGE and BALANCE only:
- Does the plan have the right number of points for this tariff?
- For 8/10/14 mark questions: is it two-sided?
- For 10 and 14: is there a conclusion?
- For 12: are there 2 primary methods + sampling + 1 secondary source?

Be encouraging and short (2–4 sentences). Then list any missing slots.

Return JSON: { "feedback": "...", "missing": ["..."] }`;
    }
    case "model_answer":
      return `Write a tight, memorable model answer a top student would write for a [${b.tariff}]-mark
"${b.command}" question on the unit "${b.unit_title}".
First invent one realistic 0495-style question for this tariff, then answer it.
Length must match the tariff (don't pad). Use sociological vocabulary.

Unit notes (use these for content):
"""
${ctx}
"""

Return JSON: { "question": "...", "answer": "..." }`;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const g = await guard<Body>(req, { maxBytes: 64_000 });
    if (!g.ok) return g.response;
    const b = g.body;
    if (!b.mode) throw new Error("Missing mode");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("Missing LOVABLE_API_KEY");

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": LOVABLE_API_KEY },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userPrompt(b) },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (aiRes.status === 429)
      return new Response(JSON.stringify({ error: "Rate limit — try again shortly." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    if (aiRes.status === 402)
      return new Response(JSON.stringify({ error: "Lovable AI credits exhausted." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    if (!aiRes.ok) throw new Error(`AI ${aiRes.status}: ${await aiRes.text()}`);

    const data = await aiRes.json();
    const raw = data?.choices?.[0]?.message?.content ?? "{}";
    const out = JSON.parse(raw);
    return new Response(JSON.stringify(out), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
