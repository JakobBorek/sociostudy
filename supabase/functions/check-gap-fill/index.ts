// Grades fill-in-the-blank answers from the user's notebook using Lovable AI.
// Input: { items: [{ id, expected, user_answer, context }] }
// Output: { results: [{ id, correct, reason }] }

import { corsHeaders, guard } from "../_shared/guard.ts";

interface Item {
  id: string;
  expected: string;
  user_answer: string;
  context: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const g = await guard<{ items: Item[] }>(req, { maxBytes: 200_000 });
    if (!g.ok) return g.response;
    let { items } = g.body;
    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "No items" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (items.length > 200) {
      return new Response(JSON.stringify({ error: "Too many items (max 200)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const clip = (s: unknown, n: number) => String(s ?? "").slice(0, n);
    items = items.map((it) => ({
      id: clip(it.id, 100),
      expected: clip(it.expected, 200),
      user_answer: clip(it.user_answer, 200),
      context: clip(it.context, 1000),
    }));


    // Fast-path obvious matches locally; only send the ambiguous ones to AI.
    const norm = (s: string) =>
      (s || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim();

    const results: { id: string; correct: boolean; reason: string }[] = [];
    const toGrade: Item[] = [];

    for (const item of items) {
      const u = norm(item.user_answer);
      const e = norm(item.expected);
      if (!u) {
        results.push({ id: item.id, correct: false, reason: "Left blank" });
        continue;
      }
      if (u === e) {
        results.push({ id: item.id, correct: true, reason: "Exact match" });
        continue;
      }
      // Stem-ish match (plural/-ing/-ed)
      const strip = (s: string) => s.replace(/(ies|es|s|ing|ed)$/i, "");
      if (strip(u) === strip(e) && Math.min(u.length, e.length) >= 4) {
        results.push({ id: item.id, correct: true, reason: "Word-form match" });
        continue;
      }
      toGrade.push(item);
    }

    if (toGrade.length > 0) {
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) {
        // Without AI fall back to strict-fail for the remainder
        for (const it of toGrade) {
          results.push({ id: it.id, correct: false, reason: "Doesn't match expected term" });
        }
      } else {
        const prompt = `You are grading a sociology student's fill-in-the-blank revision answers. For each item, the student's notebook had a word blanked out and they typed an answer. Accept reasonable synonyms, near-synonyms, and minor spelling slips. Reject answers that mean something different.

Return strict JSON: {"results":[{"id":"...","correct":true|false,"reason":"short reason"}]}.

Items:
${JSON.stringify(toGrade, null, 2)}`;

        const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": LOVABLE_API_KEY,
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: "You output strict JSON only." },
              { role: "user", content: prompt },
            ],
            response_format: { type: "json_object" },
          }),
        });

        if (aiRes.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit — try again shortly." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (aiRes.status === 402) {
          return new Response(JSON.stringify({ error: "Lovable AI credits exhausted." }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (!aiRes.ok) {
          const err = await aiRes.text();
          throw new Error(`AI error ${aiRes.status}: ${err}`);
        }

        const json = await aiRes.json();
        const raw = json?.choices?.[0]?.message?.content ?? "{}";
        let parsed: { results?: { id: string; correct: boolean; reason: string }[] } = {};
        try {
          parsed = JSON.parse(raw);
        } catch {
          parsed = {};
        }
        const map = new Map((parsed.results ?? []).map((r) => [r.id, r]));
        for (const it of toGrade) {
          const r = map.get(it.id);
          results.push(
            r ?? { id: it.id, correct: false, reason: "Couldn't verify — try again" },
          );
        }
      }
    }

    return new Response(JSON.stringify({ results }), {
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
