export interface StudyTopic {
  id: string;
  term: string;
  definition: string;
  pros: string[];
  cons: string[];
  notes?: string[];
  unit: string;
}

export interface Unit {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  icon: string;
}

export const units: Unit[] = [
  {
    id: "1.1",
    title: "Sociological Perspectives & Research Design",
    shortTitle: "Perspectives",
    description: "Positivism, Interpretivism, Triangulation, and Longitudinal Studies",
    icon: "🔬",
  },
  {
    id: "1.3",
    title: "Sampling Methods",
    shortTitle: "Sampling",
    description: "Random, Systematic, Stratified, Snowball, and Quota sampling",
    icon: "🎯",
  },
  {
    id: "2.2",
    title: "Research Methods",
    shortTitle: "Methods",
    description: "Primary/Secondary data, interviews, observations, and questionnaires",
    icon: "📋",
  },
  {
    id: "secondary",
    title: "Secondary Data Sources",
    shortTitle: "Secondary Data",
    description: "Official Statistics, Historical Documents, Media & Digital Sources",
    icon: "📚",
  },
];

export const topics: StudyTopic[] = [
  // UNIT 1.1
  {
    id: "positivism",
    term: "Positivism",
    definition: "Focuses on large-scale social structures and produces quantitative data. Less valid — respondents can't explain their answers.",
    pros: [
      "Less biased",
      "Reliable",
      "Can have large samples → generalisation possible",
    ],
    cons: [
      "Hard to study in-depth / objective to achieve 'Verstehen'",
      "Ignores subjectivity",
    ],
    unit: "1.1",
  },
  {
    id: "interpretivism",
    term: "Interpretivism",
    definition: "Focuses on micro-scale individuals and produces qualitative data — more subjective rather than numerical.",
    pros: [
      "Valid — often gives the researcher the true picture, reflecting reality",
      "Gives deep understanding like 'Verstehen'",
    ],
    cons: [
      "Might be biased",
      "Time consuming",
      "Lack of generalisability due to context-related studies",
    ],
    unit: "1.1",
  },
  {
    id: "triangulation",
    term: "Triangulation",
    definition: "The use of two or more research methods in the same research (often Quantitative AND Qualitative data).",
    pros: [
      "Can be used to check reliability/validity of research",
      "Gives the researcher multiple perspectives",
    ],
    cons: [
      "Time consuming",
      "Requires more skill",
      "Hard to combine different approaches",
    ],
    unit: "1.1",
  },
  {
    id: "longitudinal-studies",
    term: "Longitudinal Studies",
    definition: "A study that repeatedly measures the same 'thing' over an extended period to track changes and patterns.",
    pros: [
      "Increases validity",
      "Identifies patterns/change",
      "Achieves 'Verstehen'",
    ],
    cons: [
      "Time consuming",
      "Hawthorne Effect",
      "Participants might get demotivated, leading to less valid outcomes",
    ],
    unit: "1.1",
  },

  // UNIT 1.3
  {
    id: "sampling-frame",
    term: "Sampling Frame",
    definition: "A list of all/most people in a target population. Examples: school registers, census, registers.",
    pros: [],
    cons: [],
    unit: "1.3",
  },
  {
    id: "random-sampling",
    term: "Random Sampling",
    definition: "Sample is chosen randomly from the sampling frame.",
    pros: ["No selection bias"],
    cons: ["Sample might not be representative"],
    unit: "1.3",
  },
  {
    id: "systematic-sampling",
    term: "Systematic Sampling",
    definition: "There is a systematic pattern to decide who is chosen from the sampling frame (e.g. every tenth person).",
    pros: ["No selection bias"],
    cons: ["Might not be representative"],
    unit: "1.3",
  },
  {
    id: "stratified-sampling",
    term: "Stratified Sampling",
    definition: "Dividing the sampling frame into strata (sections), then selecting a sample from each section.",
    pros: ["Highly representative"],
    cons: ["More complex to do rather than just random sampling"],
    unit: "1.3",
  },
  {
    id: "snowball-sampling",
    term: "Snowball Sampling",
    definition: "Finding someone to introduce/connect you with others in the group. Does NOT require a sampling frame.",
    pros: ["Easier to find niche groups"],
    cons: ["Highly possible to be non-representative"],
    notes: ["Example: Find a vegan → vegan community → vegan 2 → vegan community 2"],
    unit: "1.3",
  },
  {
    id: "quota-sampling",
    term: "Quota Sampling",
    definition: "Choosing certain people with certain characteristics to take into the research. No sampling frame required.",
    pros: ["Really representative"],
    cons: ["High selection bias"],
    unit: "1.3",
  },

  // UNIT 2.2
  {
    id: "primary-data",
    term: "Primary Data",
    definition: "Data collected by the researcher themselves.",
    pros: ["Data is up to date", "Reliable"],
    cons: ["Might be biased by interviewer", "Time consuming"],
    unit: "2.2",
  },
  {
    id: "secondary-data",
    term: "Secondary Data",
    definition: "Data collected by another researcher (older/primary data).",
    pros: ["Less time consuming (if online)", "Easy to access"],
    cons: ["Might be out of date", "Validity/reliability might not be provable"],
    unit: "2.2",
  },
  {
    id: "quantitative-data",
    term: "Quantitative Data",
    definition: "Numerical data used for statistics. Primary: MCQs in structured questionnaires/interviews. Secondary: numerical data from official statistics.",
    pros: ["Reliable", "Can identify patterns"],
    cons: ["Less in-depth", "May miss context"],
    unit: "2.2",
  },
  {
    id: "qualitative-data",
    term: "Qualitative Data",
    definition: "Descriptive data rather than numerical. Primary: detailed info from unstructured interview / participant observation. Secondary: historical/personal documents, diaries, media content.",
    pros: ["More in depth", "More valid"],
    cons: ["Time consuming", "Hard to generalise (if small sample)"],
    unit: "2.2",
  },
  {
    id: "questionnaires",
    term: "Questionnaires",
    definition: "A list of questions used in social surveys. Self-Completion → Respondents answer without guidance from researcher.",
    pros: ["No interviewer bias/effect", "Can reach large populations"],
    cons: ["Maybe low response rate", "Misinterpretation leading to 'wrong' answers"],
    unit: "2.2",
  },
  {
    id: "structured-interviews",
    term: "Structured Interviews",
    definition: "A list of face-to-face asked questions by an interviewer.",
    pros: ["Higher response rate", "Researcher can explain questions"],
    cons: ["Risk of interviewer bias/effect"],
    unit: "2.2",
  },
  {
    id: "unstructured-interviews",
    term: "Unstructured Interviews",
    definition: "A 'relaxed' discussion-style interview using brief prompts.",
    pros: ["Produces valid data", "Easier to achieve 'Verstehen'"],
    cons: ["Extremely time consuming", "Small unrepresentative samples → hard to generalise"],
    unit: "2.2",
  },
  {
    id: "semi-structured-interviews",
    term: "Semi-Structured Interviews",
    definition: "Interviewer has an 'interview guide' which allows changing order of questions or adding follow-up questions. Can have open AND closed questions.",
    pros: ["More flexible while maintaining structure", "Achieves consistent results"],
    cons: ["Less flexible than unstructured", "More time consuming"],
    unit: "2.2",
  },
  {
    id: "group-interviews",
    term: "Group Interviews",
    definition: "An interview or discussion conducted in a group setting.",
    pros: ["Can give real-life impression"],
    cons: ["Difficult to record, because people can talk over each other"],
    unit: "2.2",
  },
  {
    id: "participant-observation",
    term: "Participant Observation",
    definition: "Researcher investigates by actively joining the group.",
    pros: ["Highly valid, because researcher experienced it"],
    cons: ["Interviewer's presence → 'Hawthorne Effect' might influence the group's behaviour"],
    unit: "2.2",
  },
  {
    id: "non-participant-observation",
    term: "Non-Participant Observation",
    definition: "Researcher investigates a group without joining them.",
    pros: ["No Hawthorne Effect", "Allows the researcher to observe group IRL"],
    cons: ["Unethical if done without consent", "Doesn't give context for certain behaviour"],
    unit: "2.2",
  },
  {
    id: "covert-observation",
    term: "Covert Observation",
    definition: "Hidden observation without the group knowing they're being observed.",
    pros: ["Gives true picture", "Highly valid"],
    cons: ["Unethical if lack of consent"],
    unit: "2.2",
  },
  {
    id: "overt-observation",
    term: "Overt Observation",
    definition: "Group is fully aware that it's being studied.",
    pros: ["Easier to use/combine multiple research methods ('triangulation')", "More ethical"],
    cons: ["Hawthorne Effect", "Refusal of participants"],
    unit: "2.2",
  },

  // SECONDARY DATA
  {
    id: "official-statistics",
    term: "Official Statistics",
    definition: "Main source of secondary quantitative data. Hard stats don't change over time; soft stats are more open to interpretation.",
    pros: [
      "Usually offers more insider info",
      "More likely to be reliable/representative to identify patterns",
    ],
    cons: [
      "Lack validity",
      "Might be biased because the government can fund the research to present itself in a good light",
    ],
    unit: "secondary",
  },
  {
    id: "historical-personal-documents",
    term: "Historical / Personal Documents",
    definition: "Written sources from the past. Personal: letters, diaries, social media posts, autobiography. Historical: home videos, shopping lists, etc.",
    pros: ["May be highly valid, showing true picture of reality from the time", "Descriptive details"],
    cons: [
      "May be unrepresentative",
      "May be biased/influenced (intentionally) — reflected by personal emotional state",
    ],
    unit: "secondary",
  },
  {
    id: "media-digital-sources",
    term: "Media / Digital Sources",
    definition: "Sources from TV, articles, blogs, vlogs, social media, webpages, and apps.",
    pros: ["Easy access", "Low cost", "Informative", "Can be qualitative or quantitative"],
    cons: ["Can be biased, fake, misleading", "Access may be restricted in some countries"],
    unit: "secondary",
  },
];

// Quiz question generation
export interface QuizQuestion {
  id: string;
  question: string;
  correctAnswer: string;
  options: string[];
  topicId: string;
  unit: string;
}

export function generateQuizQuestions(unitFilter?: string): QuizQuestion[] {
  const filtered = unitFilter ? topics.filter(t => t.unit === unitFilter) : topics;
  const questions: QuizQuestion[] = [];

  filtered.forEach((topic) => {
    // Definition question
    questions.push({
      id: `${topic.id}-def`,
      question: `What is ${topic.term}?`,
      correctAnswer: topic.definition,
      options: generateOptions(topic.definition, filtered.filter(t => t.id !== topic.id).map(t => t.definition)),
      topicId: topic.id,
      unit: topic.unit,
    });

    // Pros question
    if (topic.pros.length > 0) {
      const correctPro = topic.pros[0];
      questions.push({
        id: `${topic.id}-pro`,
        question: `Which is an advantage of ${topic.term}?`,
        correctAnswer: correctPro,
        options: generateOptions(correctPro, [
          ...filtered.flatMap(t => t.cons),
          ...filtered.filter(t => t.id !== topic.id).flatMap(t => t.pros),
        ]),
        topicId: topic.id,
        unit: topic.unit,
      });
    }

    // Cons question
    if (topic.cons.length > 0) {
      const correctCon = topic.cons[0];
      questions.push({
        id: `${topic.id}-con`,
        question: `Which is a disadvantage of ${topic.term}?`,
        correctAnswer: correctCon,
        options: generateOptions(correctCon, [
          ...filtered.flatMap(t => t.pros),
          ...filtered.filter(t => t.id !== topic.id).flatMap(t => t.cons),
        ]),
        topicId: topic.id,
        unit: topic.unit,
      });
    }
  });

  return shuffleArray(questions);
}

function generateOptions(correct: string, pool: string[]): string[] {
  const unique = [...new Set(pool.filter(o => o !== correct))];
  const wrong = shuffleArray(unique).slice(0, 3);
  while (wrong.length < 3) {
    wrong.push("None of the above");
  }
  return shuffleArray([correct, ...wrong]);
}

export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
