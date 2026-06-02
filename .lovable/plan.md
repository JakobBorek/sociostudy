## Goal

Restrict Lovable-paid AI to `jakob.borek@gmail.com` only. Everyone else either pastes their own Gemini API key (gets full AI) or runs in **free mode** with preset mock exams and no "Prove It".

---

## 1. Access model

Three runtime modes, decided by a new `useAiAccess()` hook:

| Mode | Who | Source |
|---|---|---|
| `lovable` | `jakob.borek@gmail.com` only | server check on profile email |
| `user-key` | anyone who pasted a Gemini key | `localStorage.user_gemini_key` |
| `free` | everyone else (signed in or not) | default |

Remove the old password / `ai_enabled` idea entirely — email is the only gate for paid AI. Signup stays open (no access code field).

## 2. Database

Migration:
- Drop the access-code / `ai_enabled` plan from previous discussion (not needed).
- No new columns. The edge functions check `auth.users.email === 'jakob.borek@gmail.com'` via JWT claims.

## 3. Edge functions (all 8 AI ones)

Each function:
1. Read optional `userGeminiKey` from request body.
2. If present → call Google Generative Language API directly with that key. Done.
3. Else → verify JWT, fetch user email, require it to equal `jakob.borek@gmail.com`. If yes → use existing Lovable AI path. If no → return `403 { error: 'ai_locked' }`.

## 4. Frontend

**New `src/hooks/useAiAccess.ts`** → `{ mode, userGeminiKey, isJakob }`.

**New `AiAccessDialog`** (opened from header + Settings):
- Tab 1: "Use your own Gemini key" — input + link to aistudio.google.com + Save/Remove.
- Tab 2: Info about free mode and what's disabled.
- No password tab.

**`AuthPage.tsx`** — remove `SITE_PASSWORD`, `ALWAYS_ALLOWED`, "Request access", access-code input. Plain email/password signup + signin.

**Every `supabase.functions.invoke(...)` AI call** wraps `useAiAccess()`:
- `lovable` or `user-key` → call edge function (pass `userGeminiKey` if set).
- `free` → don't call; trigger the free-mode fallback below.

## 5. Free-mode behavior

**Mock exams**: ship preset JSON papers bundled in the repo.
- `src/data/presetExams/<unitId>.json` for each existing unit.
- `src/data/presetExams/general.json` for one cross-unit paper.
- Mock-exam page: if `mode === 'free'`, load the preset for the current unit (or general) instead of calling `generate-mock-exam`. Grading in free mode = self-check against included answer key (no AI feedback), or simply show model answers after submission.

**"Prove It" feature**: hide entry points (buttons, menu items) when `mode === 'free'`. If a route is hit directly, show a locked card explaining: "Prove It needs AI. Add your Gemini key in Settings to unlock."

**Other AI features** (gap-fill check, sentence rewrite, PDF unit extraction, AI flashcards, answer-plan generator): show a small "AI locked" state with a button → opens `AiAccessDialog`. Static content (existing units, flashcards, quizzes) still works.

## 6. Settings page

Add an "AI access" section:
- Shows current mode badge.
- "Paste Gemini API key" input (saved to localStorage).
- "Remove key" button.
- Link to aistudio.google.com with one-line "free tier available" note.

## 7. Out of scope

- OpenAI / other providers.
- Per-user usage tracking.
- Encrypting the user's pasted key (kept in browser localStorage; documented in dialog).
- Generating the preset exam JSON content — I'll scaffold the files with a clear TODO structure (10 questions per unit, mark scheme, model answers) and you fill in the actual questions, OR I generate a first draft using AI on your machine before shipping. Confirm which you want.

---

## Files touched

- `supabase/migrations/<new>.sql` — none needed (skip).
- `supabase/functions/{8 ai functions}/index.ts` — add BYO-key + email gate.
- `src/hooks/useAiAccess.ts` — new.
- `src/components/AiAccessDialog.tsx` — new.
- `src/pages/AuthPage.tsx` — strip access-code flow.
- `src/pages/Settings.tsx` (or create) — AI access section.
- `src/data/presetExams/*.json` — new preset papers.
- Mock-exam page + "Prove It" page + each AI call site — branch on `mode`.
