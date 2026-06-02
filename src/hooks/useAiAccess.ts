import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";

export type AiMode = "lovable" | "user-key" | "free";

const KEY = "user_gemini_key";
const OWNER_EMAIL = "jakob.borek@gmail.com";

function readKey(): string {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

export function useAiAccess() {
  const { user } = useAuth();
  const [userGeminiKey, setUserGeminiKey] = useState<string>(() => readKey());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setUserGeminiKey(readKey());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const refresh = useCallback(() => setUserGeminiKey(readKey()), []);

  const saveKey = useCallback((k: string) => {
    const v = k.trim();
    if (v) localStorage.setItem(KEY, v);
    else localStorage.removeItem(KEY);
    setUserGeminiKey(v);
  }, []);

  const isOwner = (user?.email ?? "").toLowerCase() === OWNER_EMAIL;
  const mode: AiMode = isOwner ? "lovable" : userGeminiKey ? "user-key" : "free";

  return { mode, userGeminiKey, isOwner, saveKey, refresh };
}

/** Build a body augmentation for AI edge function calls. */
export function aiBody(base: Record<string, unknown>, userGeminiKey: string) {
  return userGeminiKey ? { ...base, userGeminiKey } : base;
}
