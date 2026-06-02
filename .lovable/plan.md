## Goal

Add **Unit 3.1 — What is social stratification?** to the built-in study content, sourced from the uploaded `3.1.pdf` (Cambridge IGCSE Sociology coursebook, Unit 3, section 3.1). Once added, it will automatically appear in Units, Flashcards, Quiz (including the new Section filter — picking "Section 3" will work for free), Dashboard progress, and Exam Skills practice.

## What the PDF covers

Section 3.1 introduces social stratification and inequality. Key concepts include:

- Social stratification, social inequality, social differentiation
- Open vs closed societies
- Status: ascribed vs achieved
- Power, life chances, meritocracy
- Poverty: absolute vs relative, poverty trap, wealth
- Modern slavery & human trafficking
- Stratification by age, gender (patriarchy, gendered division of labour), ethnicity (cultural racism), social class
- Capitalism
- The Indian caste system (closed-society example)

## Plan

1. Add a new entry to `units` in `src/data/studyContent.ts`:
   - `id: "3.1"`, title: "Social Stratification & Inequality", shortTitle: "Stratification", icon: ⚖️ (or 📊 — happy to swap)
2. Append ~14–18 new `StudyTopic` entries with `unit: "3.1"` covering the key terms above. Each topic gets a concise definition; pros/cons used only where the concept has clear strengths/limitations (e.g. meritocracy, open vs closed society, absolute vs relative poverty). Plain definitions (e.g. "ascribed status") will have empty pros/cons, matching the existing Unit 1.3 pattern.
3. No other code changes — `StudyDataContext`, flashcards, quiz generator, Section filter ("3"), dashboard and Exam Skills page already iterate over `units` / `topics` dynamically.

## Two small choices

- **Depth**: tight exam-prep set (~12 cards) or comprehensive (~18–20 cards)? Default: comprehensive.
- **Icon**: ⚖️ is already used by old Unit 2.2 — I'll use **📊** for 3.1 to keep icons distinct. Say the word if you'd prefer something else (🪜, 🏛️, 💰).

Approve and I'll add the unit.