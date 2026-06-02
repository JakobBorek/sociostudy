import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, guard } from "../_shared/guard.ts";
import { aiCall } from "../_shared/aiCall.ts";

const RUBRIC_10 = `EVALUATE [10 marks] — Cambridge IGCSE Sociology Part (e) rubric.
Question style: "Evaluate the extent to which..." (e.g. nuclear family is the most important type of family structure in modern UK society).

Levels (BEST FIT — answer needs MOST qualities of a level, not all):
- L3 8-10: Strong evaluation. Two+ contrasting perspectives (e.g. functionalist vs feminist). Considers multiple family types (nuclear, extended, lone-parent, same-sex, cohabiting, blended). Specific evidence/research (Murdock, Oakley, Parsons, statistics). Balanced strengths AND limitations. Reasoned, supported conclusion. Accurate sociological terminology. Fluent structure.
- L2 5-7: Competent. 1-2 perspectives, at least one alternative family type, some evidence (may lack named research), some attempt at balance (may be slightly one-sided), conclusion present but not fully reasoned. Mostly accurate terminology.
- L1 1-4: Basic. One perspective or superficial. Little/no alternative family types. Few examples. One-sided, no balance. No/unsupported conclusion. Loose terminology.
- 0: No answer or irrelevant.

CRITICAL RULES:
1. Best fit, not checklist. Most qualities of a band = that band, even if one element is weaker.
2. Accept alternative wording (e.g. "functionalists see nuclear family as ideal" = "Murdock argues universal functions").
3. Balance required for marks ABOVE 5. One-sided answers max out at 5 (top of L2).
4. Two-sided + conclusion = threshold for 8+ (L3).
5. Mark for what IS there, no penalty deductions for omissions.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const g = await guard<{ question?: string; marks?: number; answer?: string; userGeminiKey?: string }>(req, { maxBytes: 32_000 });
    if (!g.ok) return g.response;
    const question = String(g.body.question ?? "").slice(0, 2000);
    const answer = String(g.body.answer ?? "").slice(0, 8000);
    const marks = Number(g.body.marks ?? 0);
    if (!question || !answer || marks !== 10) {
      return new Response(JSON.stringify({ error: "Invalid input — expected marks: 10" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rubric = RUBRIC_10;
    const systemPrompt = `You are a strict Cambridge IGCSE Sociology examiner. Mark the student's answer using this rubric:\n\n${rubric}\n\nBe concise. Keep feedback under 120 words. Output STRICT JSON: {"mark":int,"level":"string","strengths":"string","improvements":"string"}.`;

    const userPrompt = `Question (${marks} marks): ${question}\n\nStudent answer:\n${answer}\n\nMark it now.`;

    const r = await aiCall({
      user: g.user,
      userGeminiKey: g.body.userGeminiKey,
      payload: {
        model: "google/gemini-3-flash-preview",
        max_tokens: 400,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      },
    });
    if (!r.ok) return r.response;
    const raw = r.data?.choices?.[0]?.message?.content ?? "{}";
    let result: any;
    try { result = JSON.parse(raw); } catch {
      return new Response(JSON.stringify({ error: "No structured response from AI" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // clamp
    result.mark = Math.max(0, Math.min(marks, Math.round(result.mark)));
    return new Response(JSON.stringify({ ...result, outOf: marks }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("evaluate-answer error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
