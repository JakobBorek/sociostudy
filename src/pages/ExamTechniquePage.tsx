import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  CheckCircle2,
  XCircle,
  Lightbulb,
  PenLine,
  Quote,
  Sparkles,
  Clock,
  ListChecks,
} from "lucide-react";

type Section = {
  marks: string;
  title: string;
  examples: string[];
  structure: string[];
  starters: { label: string; items: string[] }[];
  example: { question: string; answer: { label: string; text: string }[]; verdict: string };
};

const SECTIONS: Section[] = [
  {
    marks: "2 marks",
    title: "Identify",
    examples: [
      "Identify two differences between…",
      "Give two examples of…",
    ],
    structure: ["Identify point 1 (1 mark)", "Identify point 2 (1 mark)"],
    starters: [
      {
        label: "Sentence starters",
        items: [
          "One difference is that…",
          "Firstly,… / Secondly,…",
          "An example of this is…",
          "This contrasts with…",
        ],
      },
    ],
    example: {
      question:
        "Identify two differences between the nuclear family and the extended family.",
      answer: [
        {
          label: "Answer",
          text:
            "One difference is that the nuclear family consists of two generations (parents and children), whereas the extended family includes three or more generations. Secondly, the nuclear family typically lives in one household, but the extended family may live across multiple properties.",
        },
      ],
      verdict: "2/2 — two clear, distinct differences.",
    },
  },
  {
    marks: "3–6 marks",
    title: "Explain",
    examples: [
      "Explain why…",
      "Explain three reasons…",
      "Explain what is meant by…",
    ],
    structure: [
      "3-mark: 1 point + 2 developments",
      "6-mark: 2–3 points, each with development",
      "Golden rule: Point + Development = 2 marks",
    ],
    starters: [
      {
        label: "Open the point",
        items: [
          "One reason is that…",
          "This is because…",
          "A key factor is…",
          "This occurs because…",
        ],
      },
      {
        label: "Develop the point",
        items: [
          "For example,…",
          "This means that…",
          "As a result,…",
          "Research shows that…",
          "[Theorist] argues that…",
        ],
      },
    ],
    example: {
      question: "Explain three reasons why divorce rates have increased in the UK. (6 marks)",
      answer: [
        {
          label: "Reason 1",
          text:
            "One reason is that legal barriers to divorce have reduced. Historically, divorce required proof of adultery or cruelty; now couples can divorce by mutual consent.",
        },
        {
          label: "Reason 2",
          text:
            "Secondly, changing social attitudes mean divorce is no longer heavily stigmatised. In the 1950s divorced people faced shame; today it is normalised.",
        },
        {
          label: "Reason 3",
          text:
            "Thirdly, increased female economic independence means women are no longer financially dependent on marriage and can leave unhappy relationships.",
        },
      ],
      verdict: "6/6 — three reasons, each developed.",
    },
  },
  {
    marks: "4 marks",
    title: "Strength & Limitation",
    examples: [
      "Evaluate the strength and limitation of…",
      "What is one strength and one limitation of this method?",
    ],
    structure: [
      "Strength + development (2 marks)",
      "Limitation + development (2 marks)",
    ],
    starters: [
      {
        label: "Strengths",
        items: [
          "One strength is that…",
          "An advantage of this approach is…",
          "This method works well because…",
        ],
      },
      {
        label: "Limitations",
        items: [
          "However, a limitation is…",
          "A weakness of this is…",
          "A problem with this is…",
        ],
      },
    ],
    example: {
      question:
        "Evaluate the strength and limitation of using questionnaires to research family attitudes. (4 marks)",
      answer: [
        {
          label: "Strength",
          text:
            "One strength is that questionnaires can reach a large number of respondents quickly and cheaply, generating representative data more reliable than a small sample.",
        },
        {
          label: "Limitation",
          text:
            "However, respondents may give socially desirable answers — claiming 'equal relationships' when one partner does most housework, because they want to appear modern.",
        },
      ],
      verdict: "4/4 — both points developed with reasoning.",
    },
  },
  {
    marks: "7–8 marks",
    title: "Short Explanation",
    examples: [
      "Examine two sociological explanations for…",
      "Explain how … (with application)",
    ],
    structure: [
      "Brief intro — define key concept",
      "Point 1 + Development (2 marks)",
      "Point 2 + Development (2 marks)",
      "Apply to scenario / study (2–3 marks)",
      "One-sentence conclusion",
    ],
    starters: [
      {
        label: "Intro",
        items: [
          "[Concept] refers to…",
          "This is important because…",
        ],
      },
      {
        label: "Points",
        items: [
          "Firstly,… / A key factor is…",
          "Sociological research shows…",
        ],
      },
      {
        label: "Application",
        items: [
          "In this scenario, this is relevant because…",
          "We can see this in the passage where…",
        ],
      },
    ],
    example: {
      question: "Examine two sociological explanations for why some students underachieve. (8 marks)",
      answer: [
        {
          label: "Explanation 1",
          text:
            "Firstly, Bourdieu's cultural capital suggests middle-class students have language and knowledge that schools value, while working-class students lack this advantage and face lower expectations.",
        },
        {
          label: "Explanation 2",
          text:
            "Secondly, Rosenthal and Jacobson showed teacher expectations create a self-fulfilling prophecy: students labelled as low-ability internalise this and underachieve.",
        },
      ],
      verdict: "7–8/8 — two explanations with research backing.",
    },
  },
  {
    marks: "10–14 marks",
    title: "Evaluate",
    examples: [
      "Evaluate the extent to which…",
      "Assess the claim that…",
    ],
    structure: [
      "Intro — define terms, signal balance",
      "Perspective 1 + evaluation (3–4 marks)",
      "Perspective 2 + evaluation (3–4 marks)",
      "Alternative viewpoint (1–2 marks)",
      "Weigh the evidence (1–2 marks)",
      "Conclusion with clear judgement (1–2 marks)",
    ],
    starters: [
      {
        label: "Intro",
        items: [
          "The extent to which [X] is valid depends on…",
          "Sociologists disagree about…",
        ],
      },
      {
        label: "Perspective 1",
        items: [
          "From a [theory] perspective…",
          "[Theorist] argues that…",
          "Evidence to support this includes…",
        ],
      },
      {
        label: "Perspective 2 / counter",
        items: [
          "However, this view has limitations…",
          "In contrast, [other theorist] argues…",
          "More recent research demonstrates…",
        ],
      },
      {
        label: "Weigh & conclude",
        items: [
          "Balancing these perspectives…",
          "On balance, the evidence suggests…",
          "In conclusion, [judgement] because…",
        ],
      },
    ],
    example: {
      question: "Evaluate the extent to which gender inequality in the UK workplace has been eliminated. (10 marks)",
      answer: [
        {
          label: "Intro",
          text:
            "Gender inequality has reduced due to legal change and shifting attitudes, yet substantial inequalities persist, especially in senior positions.",
        },
        {
          label: "P1 — Progress",
          text:
            "The Equal Pay Act (1970) and Equality Act (2010) outlawed unequal pay; 65% of graduates are now women, and many professions have female leaders.",
        },
        {
          label: "Evaluation",
          text:
            "However, enforcement is weak — many women still earn 15–20% less than men in comparable roles, and progress is uneven across sectors.",
        },
        {
          label: "P2 — Persistence",
          text:
            "Feminists point to the glass ceiling: only 10% of FTSE 100 CEOs are women. Women do ~60% more housework, creating a 'double burden'.",
        },
        {
          label: "Alternative",
          text:
            "Inequality intersects with class and ethnicity — working-class and BME women face compound discrimination.",
        },
        {
          label: "Conclusion",
          text:
            "Therefore inequality has been substantially reduced but not eliminated; significant gaps remain at the top and across intersecting identities.",
        },
      ],
      verdict: "9–10/10 — balanced, evidence-rich, reasoned judgement.",
    },
  },
];

const MISTAKES = [
  { mistake: "Just stating facts without explaining", fix: "Always ask 'why?' or 'so what?' — add development" },
  { mistake: "One-sided evaluation", fix: "Use 'However' and 'In contrast' to show both sides" },
  { mistake: "No sociological terminology", fix: "Use theory names, key concepts, sociologist surnames" },
  { mistake: "Forgetting to apply to the scenario", fix: "Link every point back to the specific question" },
  { mistake: "Writing too little for long answers", fix: "Aim for 300–400 words on a 10-mark question" },
  { mistake: "Weak or missing conclusion", fix: "Finish with: 'In conclusion, [judgement] because…'" },
];

const TIMINGS = [
  ["2-mark", "~4 min"],
  ["4-mark", "~7 min"],
  ["6-mark", "~9 min"],
  ["8-mark", "~12 min"],
  ["10-mark", "~15 min"],
  ["12-mark", "~18 min"],
  ["14-mark", "~20 min"],
];

const CHECKLIST = [
  "Every point has at least one sentence of development",
  "Used 2+ sociological theories or researchers",
  "Applied answer to the question (not just general knowledge)",
  "For evaluations: shown both sides + clear conclusion",
  "Correct terminology ('family structures vary', not 'families are different')",
  "Checked spelling of sociologist names and key concepts",
];

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
              Complete <span className="text-gradient">Answer Structure</span> Guide
            </h1>
            <p className="text-primary-foreground/70 text-sm">
              Cambridge IGCSE Sociology — templates, sentence starters, and worked examples for every question type.
            </p>
          </div>
        </div>
      </motion.div>

      {/* GOLDEN RULE */}
      <div className="rounded-xl bg-accent/10 border border-accent/30 p-5 flex gap-3">
        <Sparkles className="text-accent flex-shrink-0 mt-0.5" size={22} />
        <div>
          <p className="font-display font-bold text-foreground mb-1">The golden rule</p>
          <p className="text-sm text-foreground">
            <strong>Point + Development = Marks.</strong> A point alone usually scores 1. A point with an example, research, or theory link scores 2. Never just state — always explain <em>why</em> or <em>how</em>.
          </p>
        </div>
      </div>

      {/* QUESTION TYPES */}
      {SECTIONS.map((s, idx) => (
        <section key={idx} className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded-full bg-accent/20 text-accent text-xs font-semibold px-3 py-1">
              {s.marks}
            </span>
            <h2 className="font-display text-xl font-bold text-foreground">{s.title}</h2>
          </div>

          <div className="rounded-xl bg-card border border-border p-5 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Example questions</p>
            <ul className="text-sm text-foreground space-y-1">
              {s.examples.map((e, i) => (
                <li key={i} className="italic text-muted-foreground">"{e}"</li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-card border border-border p-5">
            <h3 className="font-display font-semibold text-foreground mb-3">Structure</h3>
            <ol className="space-y-1 text-sm text-foreground list-decimal list-inside">
              {s.structure.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>

          <div className="rounded-xl bg-card border border-border p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Quote size={16} className="text-accent" />
              <h3 className="font-display font-semibold text-foreground">Sentence starters</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {s.starters.map((group, i) => (
                <div key={i} className="rounded-lg bg-secondary/40 p-3">
                  <p className="font-semibold text-foreground text-xs mb-2">{group.label}</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {group.items.map((item, j) => (
                      <li key={j}>• {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-card border border-border p-5 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Worked example</p>
            <p className="text-sm font-medium text-foreground italic">Q: {s.example.question}</p>
            <div className="space-y-2">
              {s.example.answer.map((part, i) => (
                <div key={i} className="rounded-lg bg-secondary/30 p-3">
                  <p className="text-xs font-semibold text-accent mb-1">{part.label}</p>
                  <p className="text-sm text-foreground">{part.text}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-success">
              <CheckCircle2 size={14} /> {s.example.verdict}
            </div>
          </div>
        </section>
      ))}

      {/* COMMON MISTAKES */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-foreground">Common mistakes</h2>
        <div className="rounded-xl bg-card border border-border overflow-hidden">
          {MISTAKES.map((m, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-2 border-b border-border last:border-b-0">
              <div className="p-3 flex gap-2 items-start bg-destructive/5">
                <XCircle size={14} className="text-destructive flex-shrink-0 mt-1" />
                <p className="text-xs text-foreground">{m.mistake}</p>
              </div>
              <div className="p-3 flex gap-2 items-start bg-success/5">
                <CheckCircle2 size={14} className="text-success flex-shrink-0 mt-1" />
                <p className="text-xs text-foreground">{m.fix}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TIMING */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-accent" />
          <h2 className="font-display text-xl font-bold text-foreground">Time management</h2>
        </div>
        <div className="rounded-xl bg-card border border-border p-5">
          <p className="text-xs text-muted-foreground mb-3">2-hour exam — rough timings per question type:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TIMINGS.map(([q, t], i) => (
              <div key={i} className="rounded-lg bg-secondary/40 p-2 text-center">
                <p className="text-xs font-semibold text-foreground">{q}</p>
                <p className="text-xs text-accent">{t}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg bg-accent/10 border border-accent/30 p-3 flex gap-2">
            <Lightbulb size={14} className="text-accent flex-shrink-0 mt-0.5" />
            <p className="text-xs text-foreground">
              <strong>Pro tip:</strong> spend 30 seconds planning evaluation answers — jot down P1, P2, Alternative, Conclusion before writing.
            </p>
          </div>
        </div>
      </section>

      {/* CHECKLIST */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ListChecks size={18} className="text-accent" />
          <h2 className="font-display text-xl font-bold text-foreground">Pre-submission checklist</h2>
        </div>
        <div className="rounded-xl bg-card border border-border p-5">
          <ul className="space-y-2">
            {CHECKLIST.map((item, i) => (
              <li key={i} className="flex gap-2 items-start text-sm text-foreground">
                <CheckCircle2 size={16} className="text-success flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
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
