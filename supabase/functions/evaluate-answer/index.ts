import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
    const { question, marks, answer } = await req.json();
    if (!question || !answer || marks !== 10) {
      return new Response(JSON.stringify({ error: "Invalid input — expected marks: 10" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const rubric = RUBRIC_10;
    const systemPrompt = `You are a strict Cambridge IGCSE Sociology examiner. Mark the student's answer using this rubric:\n\n${rubric}\n\nBe concise. Keep feedback under 120 words.`;

    const userPrompt = `Question (${marks} marks): ${question}\n\nStudent answer:\n${answer}\n\nMark it now.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        max_tokens: 400,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "submit_mark",
            description: "Submit the mark and feedback for the student's answer.",
            parameters: {
              type: "object",
              properties: {
                mark: { type: "integer", description: `Mark awarded out of ${marks}.` },
                level: { type: "string", description: "Level band, e.g. 'Level 3 (7-8)'." },
                strengths: { type: "string", description: "Brief: what worked. Max 2 sentences." },
                improvements: { type: "string", description: "Brief: how to improve to reach top band. Max 3 sentences." },
              },
              required: ["mark", "level", "strengths", "improvements"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "submit_mark" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to your workspace." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "No structured response from AI" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const result = JSON.parse(toolCall.function.arguments);
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
