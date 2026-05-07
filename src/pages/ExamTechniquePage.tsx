import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { GraduationCap, CheckCircle2, XCircle, Lightbulb, PenLine } from "lucide-react";

export default function ExamTechniquePage() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-navy rounded-2xl p-8 text-primary-foreground"
      >
        <div className="flex items-start gap-3">
          <GraduationCap className="text-accent flex-shrink-0" size={32} />
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold mb-2">
              How to Write <span className="text-gradient">Evaluate</span> Answers
            </h1>
            <p className="text-primary-foreground/70 text-sm">
              Cambridge IGCSE Sociology — exam technique for Part (e) Discuss [8 marks] and Part (f) Evaluate [14 marks].
            </p>
          </div>
        </div>
      </motion.div>

      {/* DISCUSS */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-accent/20 text-accent text-xs font-semibold px-3 py-1">Part (e)</span>
          <h2 className="font-display text-xl font-bold text-foreground">Discuss [8 marks]</h2>
        </div>

        <div className="rounded-xl bg-card border border-border p-5 space-y-3">
          <p className="text-sm text-foreground">
            <strong>Format:</strong> "Discuss [how/reasons why] [topic]." Your answer should include at least three developed points with evidence.
          </p>
          <div className="text-xs text-muted-foreground italic">
            Example: <em>"Discuss how family functions have changed over time."</em>
          </div>
        </div>

        <div className="rounded-xl bg-card border border-border p-5">
          <h3 className="font-display font-semibold text-foreground mb-3">The 7–8 mark formula</h3>
          <ol className="space-y-3 text-sm text-foreground">
            <li><strong>1. Three distinct points</strong> — one paragraph each. Signal each clearly ("Firstly...", "Another way...", "Finally...").</li>
            <li><strong>2. Each point = PEEL</strong>
              <ul className="mt-1 ml-4 space-y-1 text-muted-foreground">
                <li>• <strong>Point</strong> — state the claim</li>
                <li>• <strong>Evidence</strong> — sociologist, study, statistic, or real example</li>
                <li>• <strong>Explain</strong> — why this happens / what it shows</li>
                <li>• <strong>Link</strong> — back to the question</li>
              </ul>
            </li>
            <li><strong>3. Sociological language</strong> — use concepts (norms, socialisation, stigma, DINK families) and theory (Functionalism, Feminism).</li>
            <li><strong>4. No intro or conclusion needed.</strong> Get straight into Point 1.</li>
            <li><strong>5. Don't evaluate</strong> — the question says <em>discuss</em>, not <em>evaluate</em>. No criticism is credited.</li>
          </ol>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-xl bg-success/5 border border-success/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={16} className="text-success" />
              <p className="font-display font-semibold text-foreground text-sm">Do</p>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• 3 paragraphs, one point each</li>
              <li>• Name sociologists / studies</li>
              <li>• Real-world examples</li>
              <li>• Apply concepts explicitly</li>
            </ul>
          </div>
          <div className="rounded-xl bg-destructive/5 border border-destructive/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <XCircle size={16} className="text-destructive" />
              <p className="font-display font-semibold text-foreground text-sm">Avoid</p>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Long introductions</li>
              <li>• Vague, common-sense answers</li>
              <li>• Run-on paragraphs</li>
              <li>• Criticising the view</li>
            </ul>
          </div>
        </div>
      </section>

      {/* EVALUATE */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-accent/20 text-accent text-xs font-semibold px-3 py-1">Part (f)</span>
          <h2 className="font-display text-xl font-bold text-foreground">Evaluate [14 marks]</h2>
        </div>

        <div className="rounded-xl bg-card border border-border p-5 space-y-3">
          <p className="text-sm text-foreground">
            <strong>Format:</strong> "Evaluate the view that [statement]." Include at least three arguments FOR, three AGAINST, and a conclusion.
          </p>
          <div className="text-xs text-muted-foreground italic">
            Example: <em>"Evaluate the view that the extended family is the best for society."</em>
          </div>
        </div>

        <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-4 flex gap-3">
          <Lightbulb size={20} className="text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-display font-semibold text-foreground text-sm mb-1">The golden rule</p>
            <p className="text-xs text-muted-foreground">
              A <strong>one-sided</strong> answer (only FOR or only AGAINST) <strong>cannot score higher than 6/14</strong>, no matter how good. You MUST cover both sides.
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-card border border-border p-5">
          <h3 className="font-display font-semibold text-foreground mb-3">The 12–14 mark formula</h3>
          <ol className="space-y-3 text-sm text-foreground">
            <li><strong>1. Brief intro</strong> — define key term in one sentence.</li>
            <li><strong>2. Three FOR arguments</strong> — each fully developed (PEEL), each with theory or sociologist.</li>
            <li><strong>3. Three AGAINST arguments</strong> — same depth, same structure. Balance is critical.</li>
            <li><strong>4. Conclusion with judgement</strong> — weigh up both sides and reach a clear position.
              Don't just say "both have merits" — commit: <em>"On balance, X is more convincing because..."</em>
            </li>
          </ol>
        </div>

        <div className="rounded-xl bg-card border border-border p-5">
          <h3 className="font-display font-semibold text-foreground mb-3">Two acceptable structures</h3>
          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg bg-secondary/50 p-3">
              <p className="font-semibold text-foreground mb-1">Option A — Block</p>
              <p className="text-muted-foreground">Intro → 3 FOR → 3 AGAINST → Conclusion</p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-3">
              <p className="font-semibold text-foreground mb-1">Option B — Paired</p>
              <p className="text-muted-foreground">Intro → FOR1+AGAINST1 → FOR2+AGAINST2 → FOR3+AGAINST3 → Conclusion</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-card border border-border p-5">
          <h3 className="font-display font-semibold text-foreground mb-3">Marking bands</h3>
          <div className="space-y-2 text-xs">
            <div className="flex gap-3"><span className="font-bold text-accent w-16 flex-shrink-0">12–14</span><span className="text-muted-foreground">3 developed FOR + 3 developed AGAINST + judgement conclusion + sociological theory throughout.</span></div>
            <div className="flex gap-3"><span className="font-bold text-accent w-16 flex-shrink-0">8–11</span><span className="text-muted-foreground">Both sides covered but uneven; some points partial; some theory.</span></div>
            <div className="flex gap-3"><span className="font-bold text-accent w-16 flex-shrink-0">4–7</span><span className="text-muted-foreground">Both sides attempted but unbalanced. Limited theory.</span></div>
            <div className="flex gap-3"><span className="font-bold text-accent w-16 flex-shrink-0">1–3</span><span className="text-muted-foreground">Largely one-sided, list-like, no judgement.</span></div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <Link
        to="/quiz"
        className="block gradient-amber rounded-xl p-6 text-accent-foreground card-hover"
      >
        <div className="flex items-center gap-3">
          <PenLine size={24} />
          <div className="flex-1">
            <p className="font-display font-bold">Practise now</p>
            <p className="text-xs opacity-80">Try a Discuss or Evaluate question — AI marks it using this rubric.</p>
          </div>
        </div>
      </Link>
    </div>
  );
}
