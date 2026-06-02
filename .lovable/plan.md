## SocioStudy: Accounts + Notebook Expansion

Big scope — splitting into clear phases. Existing features (units, flashcards, quizzes, exam skills) stay untouched; we extend.

### Phase 1 — Auth & Cloud Persistence
- Enable Supabase email/password auth (no auto-confirm, with "stay logged in" checkbox controlling session persistence).
- Add `/auth` page (sign in / sign up tabs) and a user menu in the header (avatar + sign out).
- Protect app routes behind auth (redirect to `/auth` if no session).
- New DB tables (all RLS-scoped to `auth.uid()`):
  - `profiles` (user_id, display_name)
  - `notebook_pages` (user_id, unit_id, content JSONB — TipTap doc) — one editable page per unit
  - `annotations` (user_id, unit_id, type: highlight|underline|comment, range, color, text)
  - `gap_fill_answers` (user_id, topic_id, answers JSONB)
  - `exam_attempts` (user_id, question_id, answer, score, feedback, created_at)
- Migrate existing localStorage progress (`useProgress`, custom units) → keep local fallback, sync to cloud when logged in.

### Phase 2 — "IGCSE (0495)" rename
- Global find/replace of "A-Level" / "A Level" → "IGCSE (0495)" across pages, headings, meta.

### Phase 3 — Notebook section (new nav item 📓 Notebook)
Route `/notebook` with two tabs:
- **Sources tab**: grid of all units (built-in + custom) with "Add to notebook" → seeds that unit's notebook page with generated prose from its topics.
- **Notebook tab**: single continuous scroll of all unit pages in order, each rendered as a ruled-notebook page.

### Phase 4 — Notebook editor (ruled paper + rich text + annotations)
- TipTap editor (already a sensible React fit) with:
  - Ruled-paper CSS: white page, faint blue horizontal lines (`repeating-linear-gradient`), 28px line-height locked to grid, comfortable serif/sans body.
  - Toolbar: H1/H2/H3, bold, italic, bullet list, numbered list.
  - Custom marks: `highlight` (color picker: yellow/green/pink/blue), `underline`.
  - Comment system: select text → "Add comment" → stores annotation with text range; renders margin sticky-note aligned to the line, click to expand/edit.
- Auto-save (debounced 800 ms) to `notebook_pages` and `annotations`.

### Phase 5 — Prose generation for textbook view
- Use existing `extract-content` edge function pattern + Lovable AI (`google/gemini-2.5-flash`) to convert each unit's topic list into flowing textbook prose. Cache results in `notebook_pages.content` per user on first open (or pre-seed unit-level shared prose in a `unit_prose` public-read table to avoid regenerating per user).

### Technical Notes
- Stack: TipTap (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-highlight`, `@tiptap/extension-underline`) + custom comment extension.
- Auth pattern: `onAuthStateChange` + `getUser()`, session persistence toggled via `supabase.auth` storage option (we'll persist always — "stay logged in" controls whether we set a longer expiry hint; default true).
- All new tables include explicit `GRANT` + RLS scoped to `auth.uid() = user_id`.
- Existing `useProgress` / `useCustomUnits` localStorage hooks stay as offline fallback; new `useCloudSync` hook mirrors to Supabase when authed.

### Open Questions
1. **Notebook prose** — generate on-demand per user via AI (personal, slower first load) OR pre-seed shared prose for the 3 built-in units (instant, identical for everyone, ~$0)? I recommend **shared pre-seeded prose** for built-in units + on-demand for custom units.
2. **Google sign-in** — add it alongside email/password? (Default in Lovable Cloud is yes; you only mentioned email/password.)
3. **Migration of existing local progress** — should we auto-import a logged-out user's localStorage data into their account on first login, or start fresh?

### Delivery Order
1. Migration (tables + RLS + grants)
2. Auth page + header user menu + route guard
3. "A-Level" → "IGCSE (0495)" rename
4. Notebook page shell + Sources tab
5. TipTap ruled-notebook editor + toolbar + highlight/underline
6. Comments (margin sticky notes) + autosave
7. Textbook prose generation (shared seed for built-in units)
8. Cloud-sync existing flashcard progress + exam attempts
