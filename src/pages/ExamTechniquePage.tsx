import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { GraduationCap, CheckCircle2, XCircle, Lightbulb, PenLine, Quote } from "lucide-react";

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
              Cambridge IGCSE Sociology — exam technique for the 10-mark Evaluate question.
            </p>
          </div>
        </div>
      </motion.div>

      {/* FORMAT */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-accent/20 text-accent text-xs font-semibold px-3 py-1">Evaluate</span>
          <h2 className="font-display text-xl font-bold text-foreground">10-mark question</h2>
        </div>

        <div className="rounded-xl bg-card border border-border p-5 space-y-2">
          <p className="text-sm text-foreground">
            <strong>Format:</strong> "Evaluate the extent to which [statement]." You must give arguments on both sides and reach a clear judgement.
          </p>
          <div className="text-xs text-muted-foreground italic">
            Example: <em>"Evaluate the extent to which the nuclear family is the most important type of family in modern industrial society."</em>
          </div>
        </div>

        <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-4 flex gap-3">
          <Lightbulb size={20} className="text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-display font-semibold text-foreground text-sm mb-1">The golden rule</p>
            <p className="text-xs text-muted-foreground">
              A <strong>one-sided</strong> answer caps at <strong>5/10</strong>. To reach <strong>8+</strong> you need both sides <em>and</em> a reasoned conclusion.
            </p>
          </div>
        </div>
      </section>

      {/* STRUCTURE */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-foreground">The 8–10 mark structure</h2>

        <div className="rounded-xl bg-card border border-border p-5">
          <ol className="space-y-3 text-sm text-foreground">
            <li><strong>1. Brief intro (1 sentence)</strong> — define the key term from the question.</li>
            <li><strong>2. 2–3 FOR arguments</strong> — each with theory / sociologist / evidence.</li>
            <li><strong>3. 2–3 AGAINST arguments</strong> — same depth, alternative perspectives.</li>
            <li><strong>4. Conclusion with judgement</strong> — weigh both sides, commit to a position.</li>
          </ol>
        </div>

        <div className="rounded-xl bg-card border border-border p-5">
          <h3 className="font-display font-semibold text-foreground mb-3">Marking bands</h3>
          <div className="space-y-2 text-xs">
            <div className="flex gap-3"><span className="font-bold text-accent w-16 flex-shrink-0">8–10</span><span className="text-muted-foreground">Two+ contrasting perspectives, multiple family types, specific evidence, balanced strengths/limitations, reasoned conclusion.</span></div>
            <div className="flex gap-3"><span className="font-bold text-accent w-16 flex-shrink-0">5–7</span><span className="text-muted-foreground">Competent both-sided answer, some theory, basic conclusion.</span></div>
            <div className="flex gap-3"><span className="font-bold text-accent w-16 flex-shrink-0">1–4</span><span className="text-muted-foreground">Basic / largely one-sided / no judgement.</span></div>
          </div>
        </div>
      </section>

      {/* SENTENCE STARTERS */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Quote size={18} className="text-accent" />
          <h2 className="font-display text-xl font-bold text-foreground">Sentence starters</h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-xl bg-card border border-border p-4 space-y-2">
            <p className="font-display font-semibold text-foreground text-sm">Introduction</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• "The nuclear family refers to…"</li>
              <li>• "There are arguments on both sides of this view…"</li>
            </ul>
          </div>
          <div className="rounded-xl bg-card border border-border p-4 space-y-2">
            <p className="font-display font-semibold text-foreground text-sm">FOR points</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• "One reason supporting this view is…"</li>
              <li>• "Functionalists such as Murdock argue that…"</li>
              <li>• "Furthermore, evidence shows…"</li>
            </ul>
          </div>
          <div className="rounded-xl bg-card border border-border p-4 space-y-2">
            <p className="font-display font-semibold text-foreground text-sm">AGAINST points</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• "However, this view can be challenged because…"</li>
              <li>• "On the other hand, feminists argue…"</li>
              <li>• "An alternative perspective is…"</li>
            </ul>
          </div>
          <div className="rounded-xl bg-card border border-border p-4 space-y-2">
            <p className="font-display font-semibold text-foreground text-sm">Conclusion</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• "On balance, the evidence suggests…"</li>
              <li>• "Overall, the view is more/less convincing because…"</li>
              <li>• "While both sides have merit, ultimately…"</li>
            </ul>
          </div>
        </div>
      </section>

      {/* DEVELOPING ARGUMENTS */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-foreground">Developing each argument (PEEL)</h2>

        <div className="rounded-xl bg-card border border-border p-5">
          <ul className="space-y-3 text-sm text-foreground">
            <li><strong>P — Point.</strong> State the claim clearly. <em>"One strength of the nuclear family is its ability to perform primary socialisation."</em></li>
            <li><strong>E — Evidence.</strong> Name a sociologist, theory, study, statistic or real example. <em>"Parsons argued the nuclear family is 'functionally fit' for industrial society."</em></li>
            <li><strong>E — Explain.</strong> Show <em>why</em> the evidence supports the point. <em>"This is because parents teach children norms and values needed to integrate into society."</em></li>
            <li><strong>L — Link.</strong> Tie back to the question. <em>"This supports the view that the nuclear family is the most important type."</em></li>
          </ul>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-xl bg-success/5 border border-success/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={16} className="text-success" />
              <p className="font-display font-semibold text-foreground text-sm">Do</p>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Name sociologists / theories</li>
              <li>• Use sociological terms (norms, socialisation, patriarchy)</li>
              <li>• Refer to multiple family types (extended, lone-parent, reconstituted)</li>
              <li>• Commit to a judgement at the end</li>
            </ul>
          </div>
          <div className="rounded-xl bg-destructive/5 border border-destructive/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <XCircle size={16} className="text-destructive" />
              <p className="font-display font-semibold text-foreground text-sm">Avoid</p>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• One-sided answers (caps at 5)</li>
              <li>• Listing points without development</li>
              <li>• "Both have merits" with no judgement</li>
              <li>• Common-sense answers without theory</li>
            </ul>
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
            <p className="text-xs opacity-80">Try the 10-mark Evaluate question — AI marks it using this rubric.</p>
          </div>
        </div>
      </Link>
    </div>
  );
}
