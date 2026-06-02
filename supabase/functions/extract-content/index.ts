import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, guard } from "../_shared/guard.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const g = await guard<{ content?: string; unitTitle?: string; unitIcon?: string }>(req, { maxBytes: 500_000 });
    if (!g.ok) return g.response;
    const content = String(g.body.content ?? "").slice(0, 100_000);
    const unitTitle = String(g.body.unitTitle ?? "").slice(0, 200);
    if (!content) {
      return new Response(JSON.stringify({ error: "Missing content" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a study content extractor. Given raw study notes, extract structured study topics.

Each topic must have:
- term: The concept/method name
- definition: A concise definition (1-2 sentences)
- pros: Array of advantages/strengths (can be empty)
- cons: Array of disadvantages/limitations (can be empty)
- notes: Optional array of extra notes or examples

Return a JSON array of topics using the tool provided. Extract ALL distinct concepts, methods, theories, or terms from the notes. Be thorough but concise.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Extract study topics from these notes:\n\n${content}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_topics",
              description: "Return extracted study topics from notes",
              parameters: {
                type: "object",
                properties: {
                  topics: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        term: { type: "string" },
                        definition: { type: "string" },
                        pros: { type: "array", items: { type: "string" } },
                        cons: { type: "array", items: { type: "string" } },
                        notes: { type: "array", items: { type: "string" } },
                      },
                      required: ["term", "definition", "pros", "cons"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["topics"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_topics" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "No structured response from AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const extracted = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify({ topics: extracted.topics }), {
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
