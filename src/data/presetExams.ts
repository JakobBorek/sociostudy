// Preset IGCSE Sociology 0495 Paper 1-style mock exams for free users.
// These are static practice papers (no AI generation, no AI marking).

export interface PresetPart {
  id: string;
  label: string;
  marks: number;
  command: string;
  prompt: string;
}
export interface PresetQuestion {
  number: number;
  heading: string;
  source?: { title: string; text: string };
  parts: PresetPart[];
}
export interface PresetPaper {
  title: string;
  instructions: string;
  questions: PresetQuestion[];
}

const INSTRUCTIONS =
  "Answer all questions. The number of marks is given in brackets [ ] at the end of each question or part question.";

function q(
  number: number,
  heading: string,
  source: PresetQuestion["source"] | undefined,
  parts: Array<[string, number, string, string]>,
): PresetQuestion {
  return {
    number,
    heading,
    source,
    parts: parts.map(([command, marks, prompt, idSuffix]) => ({
      id: `q${number}${idSuffix}`,
      label: `(${idSuffix})`,
      marks,
      command,
      prompt,
    })),
  };
}

/* ---------------- Unit 1.1 — Perspectives & Research Design ---------------- */
const UNIT_1_1: PresetPaper = {
  title: "Paper 1 Practice — Theory & Methods (Perspectives)",
  instructions: INSTRUCTIONS,
  questions: [
    q(1, "Section A — Sociological perspectives",
      { title: "Source A", text: "Functionalists argue that social institutions such as the family and education exist because they perform vital functions for society as a whole. Conflict theorists disagree, claiming these institutions mainly serve the interests of powerful groups." },
      [
        ["Define", 2, "Define the term 'social institution'.", "a"],
        ["Describe", 4, "Describe two features of the functionalist perspective.", "b"],
        ["Explain", 6, "Explain how Marxists view the role of education in society.", "c"],
        ["Explain", 8, "Explain why interpretivist sociologists prefer qualitative research methods.", "d"],
      ]),
    q(2, "Section B — Designing research", undefined, [
      ["Define", 2, "Define the term 'hypothesis'.", "a"],
      ["Describe", 4, "Describe two reasons why sociologists carry out a pilot study.", "b"],
      ["Explain", 6, "Explain how researchers can ensure their work is ethical.", "c"],
      ["Discuss", 15, "To what extent is it possible to study society scientifically?", "d"],
    ]),
  ],
};

/* ---------------- Unit 1.2 — Research Methods ---------------- */
const UNIT_1_2: PresetPaper = {
  title: "Paper 1 Practice — Research Methods",
  instructions: INSTRUCTIONS,
  questions: [
    q(1, "Section A — Methods in context",
      { title: "Source A", text: "A sociologist wants to find out about teenagers' experiences of social media. She is considering using either questionnaires or unstructured interviews." },
      [
        ["Define", 2, "Define the term 'primary data'.", "a"],
        ["Describe", 4, "Describe two advantages of using questionnaires.", "b"],
        ["Explain", 6, "Explain why some sociologists prefer unstructured interviews.", "c"],
        ["Explain", 8, "Explain the strengths and limitations of using participant observation.", "d"],
      ]),
    q(2, "Section B — Choosing a method", undefined, [
      ["Define", 2, "Define the term 'validity'.", "a"],
      ["Describe", 4, "Describe two ethical issues sociologists must consider.", "b"],
      ["Explain", 6, "Explain why covert observation is sometimes criticised.", "c"],
      ["Discuss", 15, "To what extent are quantitative methods more useful than qualitative methods in sociology?", "d"],
    ]),
  ],
};

/* ---------------- Unit 1.3 — Sampling ---------------- */
const UNIT_1_3: PresetPaper = {
  title: "Paper 1 Practice — Sampling Methods",
  instructions: INSTRUCTIONS,
  questions: [
    q(1, "Section A — Selecting a sample",
      { title: "Source A", text: "Before carrying out research, sociologists must decide who to study. The choice of sampling technique affects how representative the findings will be." },
      [
        ["Define", 2, "Define the term 'sampling frame'.", "a"],
        ["Describe", 4, "Describe two features of random sampling.", "b"],
        ["Explain", 6, "Explain why stratified sampling can produce more representative results.", "c"],
        ["Explain", 8, "Explain why snowball sampling is sometimes used to study hard-to-reach groups.", "d"],
      ]),
    q(2, "Section B — Limitations of sampling", undefined, [
      ["Define", 2, "Define the term 'representative sample'.", "a"],
      ["Describe", 4, "Describe two limitations of quota sampling.", "b"],
      ["Explain", 6, "Explain why a large sample is not always a good sample.", "c"],
      ["Discuss", 15, "To what extent does the sampling method chosen determine the success of a piece of sociological research?", "d"],
    ]),
  ],
};

/* ---------------- Unit secondary — Secondary Data ---------------- */
const UNIT_SECONDARY: PresetPaper = {
  title: "Paper 1 Practice — Secondary Data Sources",
  instructions: INSTRUCTIONS,
  questions: [
    q(1, "Section A — Official statistics",
      { title: "Source A", text: "Governments publish official statistics on crime, education and health. Sociologists use these as a source of secondary data, but many warn that statistics can be misleading." },
      [
        ["Define", 2, "Define the term 'secondary data'.", "a"],
        ["Describe", 4, "Describe two advantages of using official statistics.", "b"],
        ["Explain", 6, "Explain why crime statistics may not give a true picture of crime in society.", "c"],
        ["Explain", 8, "Explain the usefulness of historical documents in sociological research.", "d"],
      ]),
    q(2, "Section B — Media and digital sources", undefined, [
      ["Define", 2, "Define the term 'content analysis'.", "a"],
      ["Describe", 4, "Describe two reasons why sociologists study the media.", "b"],
      ["Explain", 6, "Explain why personal documents such as diaries may lack representativeness.", "c"],
      ["Discuss", 15, "To what extent are secondary data sources more useful than primary data in sociology?", "d"],
    ]),
  ],
};

/* ---------------- Unit 2.1 — Identity ---------------- */
const UNIT_2_1: PresetPaper = {
  title: "Paper 1 Practice — Culture, Identity & Socialisation",
  instructions: INSTRUCTIONS,
  questions: [
    q(1, "Section A — Becoming a member of society",
      { title: "Source A", text: "Children are not born with a sense of identity. Through socialisation, they learn the norms and values of their culture from agencies such as the family, school, peer group and media." },
      [
        ["Define", 2, "Define the term 'norms'.", "a"],
        ["Describe", 4, "Describe two ways the family acts as an agency of primary socialisation.", "b"],
        ["Explain", 6, "Explain how the hidden curriculum socialises pupils in school.", "c"],
        ["Explain", 8, "Explain what studies of feral children tell us about the nature–nurture debate.", "d"],
      ]),
    q(2, "Section B — Identity in society", undefined, [
      ["Define", 2, "Define the term 'social identity'.", "a"],
      ["Describe", 4, "Describe two ways peer groups can influence identity.", "b"],
      ["Explain", 6, "Explain why sociologists describe gender as a social construction.", "c"],
      ["Discuss", 15, "To what extent is identity shaped more by nurture than by nature?", "d"],
    ]),
  ],
};

/* ---------------- Unit 2.2 — Social Control & Sub-cultures ---------------- */
const UNIT_2_2: PresetPaper = {
  title: "Paper 1 Practice — Social Control & Sub-cultures",
  instructions: INSTRUCTIONS,
  questions: [
    q(1, "Section A — Conformity and deviance",
      { title: "Source A", text: "All societies have ways of encouraging members to conform to expected behaviour. Those who break norms may be labelled as deviant and face informal or formal sanctions." },
      [
        ["Define", 2, "Define the term 'social control'.", "a"],
        ["Describe", 4, "Describe two examples of informal social control.", "b"],
        ["Explain", 6, "Explain how the media can act as an agency of social control.", "c"],
        ["Explain", 8, "Explain why young people may join sub-cultures.", "d"],
      ]),
    q(2, "Section B — Sub-cultures", undefined, [
      ["Define", 2, "Define the term 'sub-culture'.", "a"],
      ["Describe", 4, "Describe two features of a youth sub-culture you have studied.", "b"],
      ["Explain", 6, "Explain why some sub-cultures are seen as deviant.", "c"],
      ["Discuss", 15, "To what extent is formal social control more effective than informal social control?", "d"],
    ]),
  ],
};

/* ---------------- Unit 2.3 — Identities in a Global World ---------------- */
const UNIT_2_3: PresetPaper = {
  title: "Paper 1 Practice — Identities in a Global World",
  instructions: INSTRUCTIONS,
  questions: [
    q(1, "Section A — Globalisation and identity",
      { title: "Source A", text: "Globalisation has increased contact between cultures. Some sociologists argue this creates new, hybrid identities, while others worry about the loss of traditional cultures." },
      [
        ["Define", 2, "Define the term 'globalisation'.", "a"],
        ["Describe", 4, "Describe two ways in which globalisation has affected national identity.", "b"],
        ["Explain", 6, "Explain what is meant by a 'hybrid identity'.", "c"],
        ["Explain", 8, "Explain how the global media can influence young people's identities.", "d"],
      ]),
    q(2, "Section B — Cultural change", undefined, [
      ["Define", 2, "Define the term 'cultural diversity'.", "a"],
      ["Describe", 4, "Describe two reasons why migration affects identity.", "b"],
      ["Explain", 6, "Explain why some traditional cultures resist globalisation.", "c"],
      ["Discuss", 15, "To what extent has globalisation created a single global culture?", "d"],
    ]),
  ],
};

/* ---------------- Unit 3.1 — Stratification & Inequality ---------------- */
const UNIT_3_1: PresetPaper = {
  title: "Paper 1 Practice — Social Stratification & Inequality",
  instructions: INSTRUCTIONS,
  questions: [
    q(1, "Section A — Class and inequality",
      { title: "Source A", text: "Sociologists use the term social stratification to describe the way societies are divided into layers, with some groups having more wealth, power and status than others." },
      [
        ["Define", 2, "Define the term 'social stratification'.", "a"],
        ["Describe", 4, "Describe two features of a class-based society.", "b"],
        ["Explain", 6, "Explain how life chances are affected by social class.", "c"],
        ["Explain", 8, "Explain why poverty continues to exist in modern societies.", "d"],
      ]),
    q(2, "Section B — Other forms of stratification", undefined, [
      ["Define", 2, "Define the term 'gender inequality'.", "a"],
      ["Describe", 4, "Describe two examples of ethnic inequality.", "b"],
      ["Explain", 6, "Explain how age can be a basis for inequality.", "c"],
      ["Discuss", 15, "To what extent is social class still the most important form of stratification today?", "d"],
    ]),
  ],
};

/* ---------------- General — mixed paper ---------------- */
const GENERAL: PresetPaper = {
  title: "Paper 1 Practice — General Mixed Paper",
  instructions: INSTRUCTIONS,
  questions: [
    q(1, "Section A — Theory & methods",
      { title: "Source A", text: "Sociologists use a variety of research methods to study society. The choice of method depends on the topic, the theoretical perspective of the researcher, and practical considerations." },
      [
        ["Define", 2, "Define the term 'qualitative data'.", "a"],
        ["Describe", 4, "Describe two strengths of using interviews in sociological research.", "b"],
        ["Explain", 6, "Explain why positivists prefer quantitative methods.", "c"],
        ["Explain", 8, "Explain the ethical issues sociologists must consider when carrying out research.", "d"],
      ]),
    q(2, "Section B — Culture, identity and socialisation", undefined, [
      ["Define", 2, "Define the term 'socialisation'.", "a"],
      ["Describe", 4, "Describe two ways in which the education system socialises children.", "b"],
      ["Explain", 6, "Explain how the media can shape identity.", "c"],
      ["Explain", 8, "Explain why sociologists argue that gender roles are socially constructed.", "d"],
    ]),
    q(3, "Section C — Social inequality", undefined, [
      ["Define", 2, "Define the term 'life chances'.", "a"],
      ["Describe", 4, "Describe two reasons why women may earn less than men.", "b"],
      ["Explain", 6, "Explain how ethnicity can affect a person's experiences in society.", "c"],
      ["Discuss", 15, "To what extent is modern society becoming more equal?", "d"],
    ]),
  ],
};

const PAPERS: Record<string, PresetPaper> = {
  "1.1": UNIT_1_1,
  "1.2": UNIT_1_2,
  "1.3": UNIT_1_3,
  "secondary": UNIT_SECONDARY,
  "2.1": UNIT_2_1,
  "2.2": UNIT_2_2,
  "2.3": UNIT_2_3,
  "3.1": UNIT_3_1,
  general: GENERAL,
};

export function getPresetPaper(unitId: string): PresetPaper {
  return PAPERS[unitId] ?? GENERAL;
}

export function hasPresetPaper(unitId: string): boolean {
  return Boolean(PAPERS[unitId]);
}
