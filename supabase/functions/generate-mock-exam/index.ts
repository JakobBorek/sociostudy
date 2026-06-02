// Generates a Cambridge IGCSE Sociology 0495 Paper 1-style mock exam
// tailored to one of the app's units, using Lovable AI.
//
// Input: { unit_id: string, unit_title: string, topic_context: string }
// Output: { paper: PaperJSON }

import { corsHeaders, guard } from "../_shared/guard.ts";


const SYSTEM = `You are a Cambridge IGCSE Sociology 0495 Paper 1 examiner and item writer.
You write authentic exam questions in EXACTLY the official format and mark tariffs.
You only use content from the unit notes the user provides. Do NOT invent off-syllabus material.
Output STRICT JSON only — no prose, no markdown fences.`;

const SCHEMA_PROMPT = `Return JSON with this exact shape:

{
  "title": "string e.g. 'Mock Paper 1 — Unit 2.2 Social Control'",
  "instructions": "Answer Question 1 and ONE of Questions 2 or 3.",
  "questions": [
    {
      "number": 1,
      "heading": "Question 1 — Research methods (compulsory)",
      "source": {
        "title": "string e.g. 'Source A: Study of teenage gangs'",
        "text": "A short 80–140 word fictional study description with a method, sample, finding."
      },
      "parts": [
        { "id": "1a-i",  "label": "(a)(i)",  "marks": 2,  "command": "Identify",  "prompt": "From the source, identify two ..." },
        { "id": "1a-ii", "label": "(a)(ii)", "marks": 4,  "command": "Explain",   "prompt": "Using the source, explain two reasons ..." },
        { "id": "1a-iii","label": "(a)(iii)","marks": 6,  "command": "Explain",   "prompt": "Using the source, explain three reasons ..." },
        { "id": "1b",    "label": "(b)",     "marks": 2,  "command": "Identify",  "prompt": "Identify two ..." },
        { "id": "1c",    "label": "(c)",     "marks": 4,  "command": "Explain",   "prompt": "Explain one strength and one limitation of ..." },
        { "id": "1d",    "label": "(d)",     "marks": 10, "command": "Evaluate",  "prompt": "Evaluate ... (two for, two against, conclusion)" },
        { "id": "1e",    "label": "(e)",     "marks": 12, "command": "Explain",   "prompt": "Explain the research methods and evidence you would choose to investigate ... (two primary methods with sampling + one secondary source)" }
      ]
    },
    {
      "number": 2,
      "heading": "Question 2",
      "parts": [
        { "id": "2a-i",  "label": "(a)(i)",  "marks": 2,  "command": "Define",   "prompt": "Define the term ..." },
        { "id": "2a-ii", "label": "(a)(ii)", "marks": 2,  "command": "Define",   "prompt": "Define the term ..." },
        { "id": "2b",    "label": "(b)",     "marks": 2,  "command": "Give",     "prompt": "Give two examples of ..." },
        { "id": "2c",    "label": "(c)",     "marks": 6,  "command": "Explain",  "prompt": "Explain three reasons ..." },
        { "id": "2d",    "label": "(d)",     "marks": 6,  "command": "Explain",  "prompt": "Explain three ways ..." },
        { "id": "2e",    "label": "(e)",     "marks": 8,  "command": "Discuss",  "prompt": "Discuss the view that ..." },
        { "id": "2f",    "label": "(f)",     "marks": 14, "command": "Evaluate", "prompt": "Evaluate the view that ... (three for, three against, conclusion)" }
      ]
    },
    {
      "number": 3,
      "heading": "Question 3",
      "parts": [
        { "id": "3a-i",  "label": "(a)(i)",  "marks": 2,  "command": "Define",   "prompt": "Define the term ..." },
        { "id": "3a-ii", "label": "(a)(ii)", "marks": 2,  "command": "Define",   "prompt": "Define the term ..." },
        { "id": "3b",    "label": "(b)",     "marks": 2,  "command": "Give",     "prompt": "Give two examples of ..." },
        { "id": "3c",    "label": "(c)",     "marks": 6,  "command": "Explain",  "prompt": "Explain three reasons ..." },
        { "id": "3d",    "label": "(d)",     "marks": 6,  "command": "Explain",  "prompt": "Explain three ways ..." },
        { "id": "3e",    "label": "(e)",     "marks": 8,  "command": "Discuss",  "prompt": "Discuss the view that ..." },
        { "id": "3f",    "label": "(f)",     "marks": 14, "command": "Evaluate", "prompt": "Evaluate the view that ... (three for, three against, conclusion)" }
      ]
    }
  ]
}

Rules:
- Use the EXACT command words and mark tariffs above. Do not change them.
- Question 1 must focus on RESEARCH METHODS and include a short Source paragraph.
- Questions 2 and 3 must be drawn from the unit's topic content (not methods), each with a different angle.
- Prompts must be specific, exam-style, and grounded in the unit notes.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const g = await guard<{
      unit_id?: string | string[];
      unit_title?: string | string[];
      topic_context?: string;
    }>(req, { maxBytes: 200_000 });
    if (!g.ok) return g.response;
    const idsArr = Array.isArray(g.body.unit_id) ? g.body.unit_id : [g.body.unit_id ?? ""];
    const titlesArr = Array.isArray(g.body.unit_title) ? g.body.unit_title : [g.body.unit_title ?? ""];
    const unit_id = idsArr.filter(Boolean).join(", ").slice(0, 300);
    const unit_title = titlesArr.filter(Boolean).join(" + ").slice(0, 400);
    const topic_context = String(g.body.topic_context ?? "").slice(0, 24_000);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("Missing LOVABLE_API_KEY");

    const multi = idsArr.filter(Boolean).length > 1;
    const user = `Units: ${unit_id} — ${unit_title}

${multi ? "The student picked MULTIPLE units. Draw Question 2 from one unit and Question 3 from a different unit. Question 1 (research methods) may use any of them." : ""}

Unit notes / topic content the student has studied:
"""
${topic_context.slice(0, 16000)}
"""

${SCHEMA_PROMPT}`;

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
    const paper = JSON.parse(raw);

    return new Response(JSON.stringify({ paper }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
