import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, guard } from "../_shared/guard.ts";
import { aiCall } from "../_shared/aiCall.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const g = await guard<{ content?: string; unitTitle?: string; unitIcon?: string; userGeminiKey?: string }>(req, { maxBytes: 500_000 });
    if (!g.ok) return g.response;
    const content = String(g.body.content ?? "").slice(0, 100_000);
    if (!content) {
      return new Response(JSON.stringify({ error: "Missing content" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are a study content extractor. Given raw study notes, extract structured study topics.

Each topic must have:
- term: The concept/method name
- definition: A concise definition (1-2 sentences)
- pros: Array of advantages/strengths (can be empty)
- cons: Array of disadvantages/limitations (can be empty)
- notes: Optional array of extra notes or examples

Return STRICT JSON: {"topics":[{"term":"...","definition":"...","pros":[],"cons":[],"notes":[]}]}. Extract ALL distinct concepts, methods, theories, or terms.`;

    const r = await aiCall({
      user: g.user,
      userGeminiKey: g.body.userGeminiKey,
      payload: {
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Extract study topics from these notes:\n\n${content}` },
        ],
        response_format: { type: "json_object" },
      },
    });
    if (!r.ok) return r.response;
    const raw = r.data?.choices?.[0]?.message?.content ?? "{}";
    let extracted: any;
    try { extracted = JSON.parse(raw); } catch {
      return new Response(JSON.stringify({ error: "No structured response from AI" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ topics: extracted.topics ?? [] }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-content error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
