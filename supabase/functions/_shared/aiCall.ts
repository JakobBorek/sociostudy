// Unified AI call helper for edge functions.
// Routes to Lovable AI Gateway (owner only) or to Google's OpenAI-compatible
// Gemini endpoint when the caller supplies their own API key.

import { corsHeaders } from "./guard.ts";

const OWNER_EMAIL = "jakob.borek@gmail.com";

export type OpenAIPayload = {
  model: string;
  messages: { role: string; content: string }[];
  response_format?: { type: string };
  temperature?: number;
  [k: string]: unknown;
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function mapModelForGoogle(model: string): string {
  // Google's OpenAI-compatible endpoint expects names like "gemini-2.5-flash".
  // Strip "google/" prefix and remap preview names that aren't publicly served.
  const m = model.replace(/^google\//, "");
  if (m === "gemini-3-flash-preview") return "gemini-2.5-flash";
  return m;
}

export interface AiCallOpts {
  user?: { email?: string };
  userGeminiKey?: string | null;
  payload: OpenAIPayload;
}

export interface AiCallResult {
  ok: true;
  data: any;
}
export interface AiCallError {
  ok: false;
  response: Response;
}

export async function aiCall(opts: AiCallOpts): Promise<AiCallResult | AiCallError> {
  const { user, userGeminiKey, payload } = opts;

  if (userGeminiKey && userGeminiKey.trim()) {
    const body = { ...payload, model: mapModelForGoogle(payload.model) };
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userGeminiKey.trim()}`,
        },
        body: JSON.stringify(body),
      },
    );
    if (res.status === 401 || res.status === 403)
      return { ok: false, response: json(401, { error: "Your Gemini API key was rejected. Check it in AI access settings." }) };
    if (res.status === 429)
      return { ok: false, response: json(429, { error: "Gemini rate limit — try again shortly." }) };
    if (!res.ok)
      return { ok: false, response: json(res.status, { error: `Gemini ${res.status}: ${await res.text()}` }) };
    return { ok: true, data: await res.json() };
  }

  // Lovable AI path — owner only.
  if ((user?.email ?? "").toLowerCase() !== OWNER_EMAIL) {
    return {
      ok: false,
      response: json(403, {
        error: "ai_locked",
        message:
          "This AI feature is restricted. Add your own free Google Gemini API key in AI access to unlock it.",
      }),
    };
  }

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY)
    return { ok: false, response: json(500, { error: "Missing LOVABLE_API_KEY" }) };

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": LOVABLE_API_KEY },
    body: JSON.stringify(payload),
  });
  if (res.status === 429)
    return { ok: false, response: json(429, { error: "Rate limit — try again shortly." }) };
  if (res.status === 402)
    return { ok: false, response: json(402, { error: "Lovable AI credits exhausted." }) };
  if (!res.ok)
    return { ok: false, response: json(res.status, { error: `AI ${res.status}: ${await res.text()}` }) };
  return { ok: true, data: await res.json() };
}
