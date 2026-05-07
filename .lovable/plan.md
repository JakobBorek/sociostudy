## Goal

Turn the three uploaded PDFs (Unit 2 — Identity: Self and Society, parts 2.1, 2.2, 2.3) into built-in units on the site, in the same `StudyTopic` format used by Unit 1. Once added, flashcards, quiz, and Unit Progress will pick them up automatically — no extra wiring.

## What I already know

- The PDFs are scanned textbook pages (no embedded text), so I need OCR.
- I'll use the Lovable AI Gateway (Gemini vision) via a `/tmp` script to read each page image and extract structured topics.
- Format per topic: `{ id, term, definition, pros[], cons[], notes?[], unit }`.
- Format per unit: `{ id, title, shortTitle, description, icon }`.

## Steps

1. Render every page of `2.1.pdf`, `2.2.pdf`, `2.3.pdf` to JPGs at 200dpi (already done for 2.1).
2. Send the page images to Gemini with a strict prompt: extract key terms / concepts, each with a clear definition and (where applicable) pros, cons, and short example notes. Output JSON matching the `StudyTopic` shape.
3. Manually sanity-check the JSON: merge duplicates, trim definitions, ensure pros/cons are short bullets, drop filler ("learning intentions", chapter intros).
4. Add three new entries to `units` in `src/data/studyContent.ts`:
   - `2.1` — Identity: Self and Society — Culture, Norms & Values (icon 🧬)
   - `2.2` — Socialisation & Agencies (icon 👨‍👩‍👧)
   - `2.3` — Conformity, Social Control & Sub-cultures (icon ⚖️)
   (Exact titles confirmed after OCR pass.)
5. Append all extracted topics to the `topics` array with `unit: "2.1" | "2.2" | "2.3"`.
6. No other code changes needed — `StudyDataContext`, flashcards, quiz generator, dashboard, and Unit Progress already iterate over `units` / `topics`.

## What I need from you

Nothing — I have enough in the PDFs. Two small choices:

- **Depth**: do you want comprehensive coverage (every key term in the chapter, ~15–25 cards per sub-unit) or a tighter exam-prep set (~8–12 cards per sub-unit)?
- **Style of pros/cons**: keep them only where the textbook frames a concept that way (e.g. theories, methods), and leave plain-definition terms with empty pros/cons (same pattern Unit 1.3 already uses). Confirm or override.

Approve and I'll OCR all three PDFs and drop the units in.