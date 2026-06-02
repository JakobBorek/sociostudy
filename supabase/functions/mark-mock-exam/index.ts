// Marks an IGCSE Sociology 0495 mock-exam attempt against the official-style mark scheme.
// Input: { paper, answers: { [partId]: string }, topic_context }
// Output: { grades: { [partId]: { awarded, marks, command, reason, sentences: [{text,issue}] } }, total_awarded, total_available }

import { corsHeaders, guard } from "../_shared/guard.ts";


const SYSTEM = `You are a senior Cambridge IGCSE Sociology 0495 examiner.
You mark answers using levels-of-response mark schemes appropriate to the command word and tariff:
- Identify / Give (1–2): 1 mark per correct point, no development needed.
- Define (2): clear correct definition = 2; partial = 1; wrong = 0.
- Explain (4/6/12): point + development + (sometimes) example. Two/three developed points expected for 4/6; for 12 marks expect two primary methods with sampling + one secondary source, each developed.
- Discuss (8) / Evaluate (10/14): banded. Top band needs balanced points (for AND against), evidence/examples, and a clear conclusion.
Assess AO1 (knowledge), AO2 (application to the source/context), AO3 (analysis/evaluation).
Be fair but rigorous. Reward sociological concepts and examples.
Output STRICT JSON only.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const g = await guard<{ paper?: any; answers?: Record<string, string>; topic_context?: string }>(
      req,
      { maxBytes: 500_000 },
    );
    if (!g.ok) return g.response;
    const { paper, answers } = g.body;
    const topic_context = String(g.body.topic_context ?? "").slice(0, 8000);
    // Clip individual answers to prevent abuse
    const trimmedAnswers: Record<string, string> = {};
    for (const [k, v] of Object.entries(answers ?? {})) {
      trimmedAnswers[String(k).slice(0, 50)] = String(v ?? "").slice(0, 10_000);
    }
    const safeAnswers = trimmedAnswers;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("Missing LOVABLE_API_KEY");


    // Flatten the parts the student actually answered.
    const items: { id: string; label: string; command: string; marks: number; prompt: string; source?: string; answer: string }[] = [];
    for (const q of paper?.questions ?? []) {
      const src = q?.source ? `${q.source.title || "Source"}: ${q.source.text || ""}` : undefined;
      for (const p of q?.parts ?? []) {
        const a = (safeAnswers?.[p.id] ?? "").trim();
        if (!a) continue;
        items.push({ id: p.id, label: p.label, command: p.command, marks: p.marks, prompt: p.prompt, source: src, answer: a });
      }
    }

    if (items.length === 0) {
      return new Response(JSON.stringify({ grades: {}, total_awarded: 0, total_available: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const user = `Unit notes (reference material the answer should be consistent with):
"""
${(topic_context || "").slice(0, 4000)}
"""

Mark each of the following answers. For EACH item return:
- awarded: integer (0..marks)
- reason: ONE concise sentence on why marks were lost (or "Full marks." if awarded == marks)
- sentences: array of { "text": "<exact sentence from the student's answer>", "issue": "<short reason this sentence loses or weakens marks>" }
  Include ONLY sentences that lose marks, are vague, off-topic, or need rewriting. Copy them verbatim from the answer. Empty array if the answer is full marks.

Items:
${JSON.stringify(items, null, 2)}

Return STRICT JSON exactly as:
{ "grades": { "<id>": { "awarded": n, "reason": "...", "sentences": [...] } } }`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": LOVABLE_API_KEY },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: user },
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

    const json = await aiRes.json();
    const raw = json?.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw);
    const rawGrades = parsed?.grades ?? {};

    // Decorate with marks/command for the client.
    const grades: Record<string, { awarded: number; marks: number; command: string; reason: string; sentences: { text: string; issue: string }[] }> = {};
    let total_awarded = 0;
    let total_available = 0;
    for (const it of items) {
      const g = rawGrades[it.id] ?? { awarded: 0, reason: "Not marked.", sentences: [] };
      const awarded = Math.max(0, Math.min(it.marks, Number(g.awarded ?? 0)));
      grades[it.id] = {
        awarded,
        marks: it.marks,
        command: it.command,
        reason: g.reason || (awarded === it.marks ? "Full marks." : "—"),
        sentences: Array.isArray(g.sentences) ? g.sentences.slice(0, 6) : [],
      };
      total_awarded += awarded;
      total_available += it.marks;
    }

    return new Response(JSON.stringify({ grades, total_awarded, total_available }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
