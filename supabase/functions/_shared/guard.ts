// Shared auth + payload-size guard for edge functions.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

export type GuardResult<T> =
  | { ok: true; body: T; user: { id: string; email?: string } }
  | { ok: false; response: Response };

/**
 * Authenticates the caller via Supabase JWT and enforces a max JSON body size.
 * Returns either the parsed body + user, or a Response to short-circuit with.
 */
export async function guard<T = unknown>(
  req: Request,
  opts: { maxBytes?: number } = {},
): Promise<GuardResult<T>> {
  const maxBytes = opts.maxBytes ?? 200_000; // 200 KB default

  // 1. Auth
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { ok: false, response: json(401, { error: "Unauthorized" }) };
  }
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
  );
  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    return { ok: false, response: json(401, { error: "Unauthorized" }) };
  }

  // 2. Size guard
  const raw = await req.text();
  if (raw.length > maxBytes) {
    return { ok: false, response: json(413, { error: "Payload too large" }) };
  }

  // 3. Parse
  let body: T;
  try {
    body = raw ? (JSON.parse(raw) as T) : ({} as T);
  } catch {
    return { ok: false, response: json(400, { error: "Invalid JSON body" }) };
  }

  return { ok: true, body, user: { id: data.user.id, email: data.user.email ?? undefined } };
}
