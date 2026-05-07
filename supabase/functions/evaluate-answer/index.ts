import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RUBRIC_8 = `DISCUSS [8 marks] — Cambridge IGCSE Sociology rubric.
Levels (best fit):
- L3 7-8: 3 distinct well-developed points, each with sociological concepts/theory + evidence/examples + analysis. Clear paragraphing. 8 if all three equally strong; 7 if one weaker.
- L2 4-6: Some sociological knowledge, most points have some evidence/analysis, partial development.
- L1 1-3: Descriptive, vague, little/no evidence or sociological language.
- 0: no creditable response.
Do NOT credit evaluation/criticism — question is "Discuss", not "Evaluate".`;

const RUBRIC_14 = `EVALUATE [14 marks] — Cambridge IGCSE Sociology rubric.
Levels (best fit):
- L4 12-14: 3 developed FOR + 3 developed AGAINST + conclusion with judgement. Strong sociological theory/concepts/sociologists throughout. Balanced.
- L3 8-11: Both sides covered; 1-2 developed points each side OR mix of developed/partial; some theory; may have conclusion.
- L2 4-7: Attempts both sides but unbalanced; partial development; limited theory.
- L1 1-3: Largely one-sided, list-like, minimal evidence, no judgement.
- 0: no creditable response.
CRITICAL RULE: A one-sided answer (only FOR or only AGAINST) cannot score higher than 6 marks no matter how good.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { question, marks, answer } = await req.json();
    if (!question || !answer || (marks !== 8 && marks !== 14)) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const rubric = marks === 8 ? RUBRIC_8 : RUBRIC_14;
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
