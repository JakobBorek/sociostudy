// Transparently attach the user's pasted Gemini key (from localStorage) to every
// supabase.functions.invoke() call. Edge functions ignore the field when absent.
import { supabase } from "@/integrations/supabase/client";

const KEY = "user_gemini_key";
const orig = supabase.functions.invoke.bind(supabase.functions);

(supabase.functions as any).invoke = (fn: string, opts: any = {}) => {
  try {
    const k = localStorage.getItem(KEY);
    if (k && opts && typeof opts.body === "object" && opts.body !== null && !("userGeminiKey" in opts.body)) {
      opts = { ...opts, body: { ...opts.body, userGeminiKey: k } };
    }
  } catch {}
  return orig(fn, opts);
};
