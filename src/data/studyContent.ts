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
    id: "1.2",
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
  {
    id: "2.1",
    title: "Identity: Self & Society",
    shortTitle: "Identity",
    description: "Culture, norms, values, roles, socialisation & key perspectives",
    icon: "🧬",
  },
  {
    id: "2.2",
    title: "Social Control & Sub-cultures",
    shortTitle: "Social Control",
    description: "Formal/informal control, sanctions, ISA/RSA, sub-cultures",
    icon: "⚖️",
  },
  {
    id: "2.3",
    title: "Identities in a Global World",
    shortTitle: "Global Identity",
    description: "Age, gender, ethnicity, class, globalisation & hybrid identities",
    icon: "🌍",
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

  // UNIT 1.2
  {
    id: "primary-data",
    term: "Primary Data",
    definition: "Data collected by the researcher themselves.",
    pros: ["Data is up to date", "Reliable"],
    cons: ["Might be biased by interviewer", "Time consuming"],
    unit: "1.2",
  },
  {
    id: "secondary-data",
    term: "Secondary Data",
    definition: "Data collected by another researcher (older/primary data).",
    pros: ["Less time consuming (if online)", "Easy to access"],
    cons: ["Might be out of date", "Validity/reliability might not be provable"],
    unit: "1.2",
  },
  {
    id: "quantitative-data",
    term: "Quantitative Data",
    definition: "Numerical data used for statistics. Primary: MCQs in structured questionnaires/interviews. Secondary: numerical data from official statistics.",
    pros: ["Reliable", "Can identify patterns"],
    cons: ["Less in-depth", "May miss context"],
    unit: "1.2",
  },
  {
    id: "qualitative-data",
    term: "Qualitative Data",
    definition: "Descriptive data rather than numerical. Primary: detailed info from unstructured interview / participant observation. Secondary: historical/personal documents, diaries, media content.",
    pros: ["More in depth", "More valid"],
    cons: ["Time consuming", "Hard to generalise (if small sample)"],
    unit: "1.2",
  },
  {
    id: "questionnaires",
    term: "Questionnaires",
    definition: "A list of questions used in social surveys. Self-Completion → Respondents answer without guidance from researcher.",
    pros: ["No interviewer bias/effect", "Can reach large populations"],
    cons: ["Maybe low response rate", "Misinterpretation leading to 'wrong' answers"],
    unit: "1.2",
  },
  {
    id: "structured-interviews",
    term: "Structured Interviews",
    definition: "A list of face-to-face asked questions by an interviewer.",
    pros: ["Higher response rate", "Researcher can explain questions"],
    cons: ["Risk of interviewer bias/effect"],
    unit: "1.2",
  },
  {
    id: "unstructured-interviews",
    term: "Unstructured Interviews",
    definition: "A 'relaxed' discussion-style interview using brief prompts.",
    pros: ["Produces valid data", "Easier to achieve 'Verstehen'"],
    cons: ["Extremely time consuming", "Small unrepresentative samples → hard to generalise"],
    unit: "1.2",
  },
  {
    id: "semi-structured-interviews",
    term: "Semi-Structured Interviews",
    definition: "Interviewer has an 'interview guide' which allows changing order of questions or adding follow-up questions. Can have open AND closed questions.",
    pros: ["More flexible while maintaining structure", "Achieves consistent results"],
    cons: ["Less flexible than unstructured", "More time consuming"],
    unit: "1.2",
  },
  {
    id: "group-interviews",
    term: "Group Interviews",
    definition: "An interview or discussion conducted in a group setting.",
    pros: ["Can give real-life impression"],
    cons: ["Difficult to record, because people can talk over each other"],
    unit: "1.2",
  },
  {
    id: "participant-observation",
    term: "Participant Observation",
    definition: "Researcher investigates by actively joining the group.",
    pros: ["Highly valid, because researcher experienced it"],
    cons: ["Interviewer's presence → 'Hawthorne Effect' might influence the group's behaviour"],
    unit: "1.2",
  },
  {
    id: "non-participant-observation",
    term: "Non-Participant Observation",
    definition: "Researcher investigates a group without joining them.",
    pros: ["No Hawthorne Effect", "Allows the researcher to observe group IRL"],
    cons: ["Unethical if done without consent", "Doesn't give context for certain behaviour"],
    unit: "1.2",
  },
  {
    id: "covert-observation",
    term: "Covert Observation",
    definition: "Hidden observation without the group knowing they're being observed.",
    pros: ["Gives true picture", "Highly valid"],
    cons: ["Unethical if lack of consent"],
    unit: "1.2",
  },
  {
    id: "overt-observation",
    term: "Overt Observation",
    definition: "Group is fully aware that it's being studied.",
    pros: ["Easier to use/combine multiple research methods ('triangulation')", "More ethical"],
    cons: ["Hawthorne Effect", "Refusal of participants"],
    unit: "1.2",
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

  // UNIT 2.1, 2.2, 2.3 (AI-extracted from textbook)
  {
    id: "2.1-culture",
    term: "Culture",
    definition: "The way of life of a society, encompassing its norms, values, customs, language, and beliefs that are passed down through generations.",
    pros: [],
    cons: [],
    notes: ["Culture is learned through the process of socialisation.", "It shapes how individuals think, behave, and perceive the world around them."],
    unit: "2.1",
  },
  {
    id: "2.1-social-construction",
    term: "Social construction",
    definition: "The concept that social phenomena, situations, and events are created and defined by the society in which they exist, rather than being natural or biologically determined.",
    pros: [],
    cons: [],
    unit: "2.1",
  },
  {
    id: "2.1-norms",
    term: "Norms",
    definition: "The unwritten rules of behaviour that a society expects from its members in specific situations. They provide guidelines on how to act.",
    pros: [],
    cons: [],
    notes: ["Examples include queuing for a bus or the expected way to greet someone.", "Norms that are widely accepted over time are known as 'customs'."],
    unit: "2.1",
  },
  {
    id: "2.1-values",
    term: "Values",
    definition: "The shared standards within a culture that are used to judge whether a particular behaviour is right or wrong. They are underlying beliefs about what is considered important and desirable.",
    pros: [],
    cons: [],
    notes: ["For example, a society might place a high value on wealth, honesty, or family."],
    unit: "2.1",
  },
  {
    id: "2.1-status",
    term: "Status",
    definition: "A social position that a person holds within a society. A status can either be 'ascribed' (fixed at birth, like ethnicity) or 'achieved' (gained through effort, like a job).",
    pros: [],
    cons: [],
    unit: "2.1",
  },
  {
    id: "2.1-role",
    term: "Role",
    definition: "The set of behaviours, expectations, and norms attached to a particular social status. A person's role is how they are expected to act based on their position in society.",
    pros: [],
    cons: [],
    notes: ["For example, the role of a 'doctor' involves expectations of professionalism, knowledge, and patient care."],
    unit: "2.1",
  },
  {
    id: "2.1-social-identity",
    term: "Social identity",
    definition: "An individual's perception of themselves, which is formed through social interaction and is partly based on their understanding of how other people see them.",
    pros: [],
    cons: [],
    unit: "2.1",
  },
  {
    id: "2.1-the-nature-nurture-debate",
    term: "The nature-nurture debate",
    definition: "A long-standing sociological debate about the extent to which human personality and behaviour are determined by biological factors (nature) or by social environment and culture (nurture).",
    pros: [],
    cons: [],
    notes: ["Most sociologists argue that nurture plays the most significant role, as behaviour is learned via socialisation."],
    unit: "2.1",
  },
  {
    id: "2.1-socialisation",
    term: "Socialisation",
    definition: "The lifelong process through which individuals learn the norms, values, and culture of their society, enabling them to become functioning members.",
    pros: [],
    cons: [],
    unit: "2.1",
  },
  {
    id: "2.1-agencies-of-socialisation",
    term: "Agencies of socialisation",
    definition: "The various groups and institutions that are responsible for carrying out the process of socialisation throughout an individual's life.",
    pros: [],
    cons: [],
    notes: ["Key agencies include the family, the education system, peer groups, the media, religion, and the workplace."],
    unit: "2.1",
  },
  {
    id: "2.1-primary-socialisation",
    term: "Primary socialisation",
    definition: "The first and most crucial stage of socialisation, occurring during infancy and early childhood, where individuals learn basic norms and values, primarily from their family.",
    pros: [],
    cons: [],
    unit: "2.1",
  },
  {
    id: "2.1-secondary-socialisation",
    term: "Secondary socialisation",
    definition: "Socialisation that occurs later in life, beyond the family unit. It involves learning the specific norms and roles for new situations, such as school, peer groups, or employment.",
    pros: [],
    cons: [],
    unit: "2.1",
  },
  {
    id: "2.1-hidden-curriculum",
    term: "Hidden curriculum",
    definition: "The informal learning that takes place in the education system, separate from the official academic curriculum. It teaches pupils unspoken values such as conformity, punctuality, and respect for authority.",
    pros: [],
    cons: [],
    unit: "2.1",
  },
  {
    id: "2.1-social-control",
    term: "Social control",
    definition: "The methods used by a society to ensure its members conform to established norms and values. It can be enforced through rewards (positive sanctions) or punishments (negative sanctions).",
    pros: [],
    cons: [],
    unit: "2.1",
  },
  {
    id: "2.1-feral-children",
    term: "Feral children",
    definition: "Children who have been raised with minimal or no human contact. They have not been socialised in a typical human environment.",
    pros: [],
    cons: [],
    notes: ["The study of feral children provides evidence for the 'nurture' side of the nature-nurture debate, highlighting the importance of socialisation for learning human behaviour."],
    unit: "2.1",
  },
  {
    id: "2.1-functionalism-on-socialisation",
    term: "Functionalism (on socialisation)",
    definition: "A consensus-based sociological perspective that views socialisation as crucial for passing on shared norms and values, thereby maintaining social order, cohesion, and stability.",
    pros: ["Explains how social order is possible and how society remains stable.", "Shows the importance of institutions like the family in creating shared culture."],
    cons: ["Overlooks conflict, power differences, and inequality in society.", "Can present people as passively accepting all social norms without question."],
    unit: "2.1",
  },
  {
    id: "2.1-marxism-on-socialisation",
    term: "Marxism (on socialisation)",
    definition: "A conflict-based sociological perspective arguing that socialisation serves the interests of the ruling class (bourgeoisie) by teaching the working class (proletariat) to accept capitalist ideology and their own exploitation.",
    pros: ["Highlights how socialisation can reproduce class inequality.", "Draws attention to the role of ideology in maintaining an unequal society."],
    cons: ["Over-emphasises social class as the main source of conflict, downplaying other factors like gender or ethnicity.", "Largely ignores the possibility of social mobility."],
    unit: "2.1",
  },
  {
    id: "2.1-feminism-on-socialisation",
    term: "Feminism (on socialisation)",
    definition: "A conflict-based sociological perspective focused on how socialisation reinforces patriarchy and gender inequality. It argues that individuals are socialised into distinct gender roles that disadvantage women.",
    pros: ["Reveals that gender roles are socially constructed rather than being natural.", "Highlights systemic inequalities between men and women that other theories may miss."],
    cons: ["Can be criticised for downplaying progress made towards gender equality.", "Some perspectives may focus too heavily on gender as the sole source of inequality."],
    unit: "2.1",
  },
  {
    id: "2.1-ann-oakley-s-gender-role-socialisation",
    term: "Ann Oakley's gender role socialisation",
    definition: "The work of a feminist sociologist identifying four primary ways that families and parents socialise children into specific gender roles from an early age.",
    pros: [],
    cons: [],
    notes: ["Manipulation: Praising or discouraging behaviour based on gender stereotypes.", "Canalisation: Directing children's interests towards gender-appropriate toys and activities.", "Verbal Appellations: Using different words and phrases for boys ('handsome') and girls ('pretty').", "Different Activities: Encouraging participation in tasks around the home based on gender."],
    unit: "2.1",
  },
  {
    id: "2.1-patriarchy",
    term: "Patriarchy",
    definition: "A social system or organisation where men hold the primary positions of power and authority, and are dominant over women and children.",
    pros: [],
    cons: [],
    notes: ["Feminist theory uses this concept to describe the systemic dominance of men in society."],
    unit: "2.1",
  },
  {
    id: "2.2-social-control",
    term: "Social control",
    definition: "The ways in which society persuades or forces individuals to conform to its norms and values. Social control can be either formal or informal.",
    pros: [],
    cons: [],
    notes: ["Most people conform to norms most of the time due to socialisation and the presence of social control."],
    unit: "2.2",
  },
  {
    id: "2.2-informal-social-control",
    term: "Informal social control",
    definition: "Ways of controlling behaviour imposed by people without a formal role to do this, such as peers, family, or the media.",
    pros: [],
    cons: [],
    notes: ["Examples include a disapproving look, ostracism, or social media 'likes'."],
    unit: "2.2",
  },
  {
    id: "2.2-formal-social-control",
    term: "Formal social control",
    definition: "Social control imposed by people or organisations who have the authority to implement rules or laws.",
    pros: [],
    cons: [],
    notes: ["Agencies of formal control include the police, the courts, the penal system, and the government."],
    unit: "2.2",
  },
  {
    id: "2.2-sanctions",
    term: "Sanctions",
    definition: "Reactions to behaviour that serve to reinforce norms. Sanctions can be positive (rewards) or negative (punishments), and can be applied formally or informally.",
    pros: [],
    cons: [],
    notes: ["Positive formal sanction: a medal or a promotion.", "Negative informal sanction: being ostracised by friends."],
    unit: "2.2",
  },
  {
    id: "2.2-consensus-views-functionalism",
    term: "Consensus views: functionalism",
    definition: "The functionalist perspective that sees social control as a positive and essential process for maintaining social stability and value consensus. It convinces people to conform because it is the right thing to do.",
    pros: ["Explains why most people conform and societies remain stable."],
    cons: ["Does not question who benefits from the existing social order.", "Largely ignores the role of power and conflict in society."],
    unit: "2.2",
  },
  {
    id: "2.2-mile-durkheim",
    term: "Émile Durkheim",
    definition: "A key functionalist sociologist who argued that societies need a shared set of values, a value consensus, to regulate individuals' behaviour and prevent anomie (a state of normlessness).",
    pros: [],
    cons: [],
    unit: "2.2",
  },
  {
    id: "2.2-conflict-views-marxism-and-feminism",
    term: "Conflict views: Marxism and feminism",
    definition: "The perspective that sees social control as a negative process, used by powerful groups to maintain their power and control over the rest of society.",
    pros: ["Highlights power inequalities and social conflict.", "Questions who benefits from the existing social structure."],
    cons: ["Can over-emphasise conflict and resistance, failing to explain social stability."],
    notes: ["Marxists see it as a tool of the ruling class; feminists see it as a tool of men in a patriarchal society."],
    unit: "2.2",
  },
  {
    id: "2.2-louis-althusser",
    term: "Louis Althusser",
    definition: "A Marxist sociologist who argued that capitalist societies use two types of institutions to apply social control: the Ideological State Apparatus (ISA) and the Repressive State Apparatus (RSA).",
    pros: [],
    cons: [],
    unit: "2.2",
  },
  {
    id: "2.2-ideological-state-apparatus-isa",
    term: "Ideological State Apparatus (ISA)",
    definition: "Althusser's term for institutions that use informal social control to persuade people that the norms and values of the ruling class are correct. If successful, people will conform against their own interests.",
    pros: [],
    cons: [],
    notes: ["Includes agencies like schools, the media, and religion."],
    unit: "2.2",
  },
  {
    id: "2.2-repressive-state-apparatus-rsa",
    term: "Repressive State Apparatus (RSA)",
    definition: "Althusser's term for institutions that use formal social control and force to maintain order when informal control fails. It includes the police, courts, and armed forces.",
    pros: [],
    cons: [],
    unit: "2.2",
  },
  {
    id: "2.2-feminist-view-of-social-control",
    term: "Feminist view of social control",
    definition: "A conflict perspective that focuses on the ways men in patriarchal societies socially control women. This control can be exerted through family expectations, gendered subject choices in education, and media portrayals.",
    pros: [],
    cons: [],
    unit: "2.2",
  },
  {
    id: "2.2-coercion",
    term: "Coercion",
    definition: "The use or threat of force or violence to compel someone to do something they do not want to do.",
    pros: [],
    cons: [],
    notes: ["Formal agencies like the police may use coercion, for example, using a Taser against a suspect."],
    unit: "2.2",
  },
  {
    id: "2.2-digital-surveillance",
    term: "Digital surveillance",
    definition: "The use of digital technology to observe and control behaviour. This has become a key method of formal and informal social control in modern societies.",
    pros: [],
    cons: [],
    notes: ["Examples include CCTV cameras, internet monitoring by governments, and tracking by advertisers."],
    unit: "2.2",
  },
  {
    id: "2.2-ostracism",
    term: "Ostracism",
    definition: "A form of informal social control where a community rejects and isolates an offender for unacceptable behaviour, without involving formal agencies.",
    pros: [],
    cons: [],
    notes: ["The text suggests that having few 'likes' on social media can be a modern form of ostracism."],
    unit: "2.2",
  },
  {
    id: "2.2-sub-culture",
    term: "Sub-culture",
    definition: "A group of people within a larger culture which has its own distinctive norms and values that may deviate from the mainstream.",
    pros: [],
    cons: [],
    notes: ["Joining a sub-culture can be a form of resistance to social control."],
    unit: "2.2",
  },
  {
    id: "2.2-youth-sub-culture",
    term: "Youth sub-culture",
    definition: "A sub-culture of adolescents or young adults who are usually distinguishable by their style, dress and/or musical preferences.",
    pros: [],
    cons: [],
    notes: ["Can provide a sense of autonomy and identity for young people.", "Neo-Marxists saw 1970s working-class youth sub-cultures as a form of resistance to ruling-class control."],
    unit: "2.2",
  },
  {
    id: "2.2-protest-group",
    term: "Protest group",
    definition: "A group of people who protest in order to bring about a change in society. They can be seen as a type of sub-culture, often organised transnationally.",
    pros: [],
    cons: [],
    notes: ["Examples include Black Lives Matter and the School Strike for Climate movement."],
    unit: "2.2",
  },
  {
    id: "2.2-angela-mcrobbie",
    term: "Angela McRobbie",
    definition: "A sociologist who criticised early sub-culture studies for ignoring girls. She suggested girls also had sub-cultures, but they were less visible and often based in the home, which she called 'bedroom sub-cultures'.",
    pros: [],
    cons: [],
    unit: "2.2",
  },
  {
    id: "2.2-online-sub-cultures",
    term: "Online sub-cultures",
    definition: "Groups of people who connect online through social media or other websites. They share distinct norms and values, often related to a particular interest or issue.",
    pros: [],
    cons: [],
    notes: ["The K-pop fandom is given as an example of a transnational online youth sub-culture."],
    unit: "2.2",
  },
  {
    id: "2.2-religious-sub-cultures",
    term: "Religious sub-cultures",
    definition: "A sub-culture based on religious faith and practices which are distinct from those of the wider culture. Members are required to conform to different norms and values.",
    pros: [],
    cons: [],
    unit: "2.2",
  },
  {
    id: "2.3-age-and-identity",
    term: "Age and Identity",
    definition: "Refers to how societies group people based on age, assigning them different roles, rights, and responsibilities. In modern societies, these age-related identities are formally structured, while in traditional societies they were often based on biological changes or life events.",
    pros: [],
    cons: [],
    notes: ["The age at which certain legal rights are acquired, such as driving or voting, varies significantly between different countries."],
    unit: "2.3",
  },
  {
    id: "2.3-generation-age-cohort",
    term: "Generation & Age Cohort",
    definition: "A 'generation' consists of members of the same age group, whose shared experiences can create a 'generation gap' in attitudes compared to others. A more specific term is 'age cohort,' which refers to a group born at a particular time sharing common historical events, such as 'baby boomers' or 'millennials'.",
    pros: [],
    cons: [],
    notes: ["Key cohorts include Generation X (1965-1980), Millennials (1981-1996), and Generation Z (1997-2010)."],
    unit: "2.3",
  },
  {
    id: "2.3-parsons-instrumental-expressive-roles",
    term: "Parsons' Instrumental & Expressive Roles",
    definition: "The functionalist theory from Talcott Parsons that gender roles are natural and determined by biology. He argued that men perform the 'instrumental role' as the financial provider and leader, while women perform the 'expressive role,' providing emotional support and care.",
    pros: [],
    cons: ["This functionalist view has been heavily criticised for justifying gender inequality and failing to account for cultural variations in gender roles."],
    unit: "2.3",
  },
  {
    id: "2.3-oakley-mead-s-research-on-gender",
    term: "Oakley & Mead's Research on Gender",
    definition: "Influential research that demonstrates gender is a social construct rather than being purely biological. Ann Oakley argued that gender roles are learned, while Margaret Mead's anthropological study of tribes in New Guinea showed how gendered behaviours and expectations vary significantly across different cultures.",
    pros: ["Provides strong evidence that gender identity is culturally determined and not fixed."],
    cons: [],
    notes: ["Mead's study included the Arapesh (where both men and women were gentle), the Mundugumor (both were aggressive), and the Tchambuli (where gender roles were the reverse of those in the West)."],
    unit: "2.3",
  },
  {
    id: "2.3-hegemonic-masculinity",
    term: "Hegemonic Masculinity",
    definition: "The dominant, socially constructed idea of what a 'real man' should be. This often includes being competitive, aggressive, emotionally reserved, and a successful breadwinner, creating a standard that many men feel pressured to conform to.",
    pros: [],
    cons: [],
    notes: ["Traditional ideas about masculinity are changing, with greater acceptance of men showing emotion or taking on primary caregiver roles."],
    unit: "2.3",
  },
  {
    id: "2.3-ethnic-identity",
    term: "Ethnic Identity",
    definition: "A sense of identity based on belonging to a group with a shared cultural background, including elements like language, religion, ancestry, norms, and traditions. Sociology treats ethnicity as a social construct that is distinct from the biological concept of race.",
    pros: ["Can be a strong source of pride and belonging."],
    cons: ["Membership in a minority ethnic group can be a source of prejudice, discrimination, and social inequality."],
    unit: "2.3",
  },
  {
    id: "2.3-national-identity",
    term: "National Identity",
    definition: "A form of social identity based on a sense of belonging to a particular nation-state. This identity is socially constructed and promoted through national symbols (e.g., flags, anthems), national events, and a shared sense of history and culture.",
    pros: [],
    cons: [],
    notes: ["Theorist Benedict Anderson described nations as 'imagined communities' because their members feel a bond despite never meeting."],
    unit: "2.3",
  },
  {
    id: "2.3-social-class-identity",
    term: "Social Class Identity",
    definition: "An identity based on a person's economic position within society, which is influenced by their occupation, income, wealth, and status. It shapes an individual's life chances and cultural tastes, and is typically divided into the upper, middle, and working classes.",
    pros: [],
    cons: [],
    notes: ["The upper class historically used 'conspicuous consumption' (spending on luxury goods) to signify their status.", "Traditional working-class identity was rooted in manual labour and strong communities, but has declined with the loss of these industries."],
    unit: "2.3",
  },
  {
    id: "2.3-digital-self-and-virtual-communities",
    term: "Digital Self and Virtual Communities",
    definition: "The 'digital self' is the identity a person constructs and portrays online, which can differ from their offline identity. This has enabled the formation of 'virtual communities,' where individuals connect with others who share similar interests or backgrounds, regardless of geographical location.",
    pros: ["Allows exploration of different identities.", "Connects people with shared interests or issues.", "Can be used to campaign against prejudice."],
    cons: ["Creates 'digital divides' between those with and without access.", "Can lead to 'echo chambers' and disinformation.", "Carries risks of online bullying and hate speech."],
    unit: "2.3",
  },
  {
    id: "2.3-madianou-and-miller-2011",
    term: "Madianou and Miller (2011)",
    definition: "A key study on Filipino migrant workers in the UK, which investigated how digital technology transformed their family lives. The researchers found that technologies like Skype allowed these mothers to maintain their central family role and actively parent 'from a distance' in a way previous generations could not.",
    pros: [],
    cons: [],
    notes: ["The study is a key example of how globalisation and new technologies can change family roles and identities."],
    unit: "2.3",
  },
  {
    id: "2.3-globalisation",
    term: "Globalisation",
    definition: "The process through which the world is becoming increasingly interconnected and interdependent. This is driven by rapid advances in communication, transport, and technology, facilitating the global flow of capital, goods, people, and culture.",
    pros: ["Can increase cultural exchange and diversity.", "May lead to economic growth and interconnectedness."],
    cons: ["Can lead to cultural imperialism and the loss of local traditions.", "May increase inequality between nations."],
    unit: "2.3",
  },
  {
    id: "2.3-global-culture",
    term: "Global Culture",
    definition: "The idea that globalisation is leading to the emergence of a single, shared culture across the entire world, often seen as a Westernised or Americanised consumer culture. This culture is spread by global brands, media, and migration.",
    pros: [],
    cons: ["Critics argue this is a form of cultural imperialism that erodes local identities.", "The idea is countered by evidence of cultural resistance and the rise of hybrid identities."],
    unit: "2.3",
  },
  {
    id: "2.3-hybrid-identities",
    term: "Hybrid Identities",
    definition: "Identities that are formed by mixing and combining elements from two or more different cultures. This concept suggests that globalisation does not just destroy local cultures, but can also create new and unique cultural fusions.",
    pros: [],
    cons: [],
    notes: ["An example is a 'BrAsian' identity in the UK, which blends elements of British and South Asian cultures."],
    unit: "2.3",
  },
  {
    id: "2.3-cultural-imperialism",
    term: "Cultural Imperialism",
    definition: "A critical view of globalisation that argues it is a one-way process in which the powerful culture of Western nations, particularly the USA, is imposed on the rest of the world. This process is seen as eroding local cultures and traditions.",
    pros: [],
    cons: ["This theory is often criticised for underestimating the ability of local cultures to resist or adapt foreign cultural influences."],
    notes: ["This is sometimes referred to as 'Americanisation' or 'Westernisation'."],
    unit: "2.3",
  },
  {
    id: "2.3-cultural-defence",
    term: "Cultural Defence",
    definition: "The act of a culture resisting external influences and protecting its own values and traditions in response to the perceived threat of globalisation. It is a form of resistance against cultural imperialism.",
    pros: [],
    cons: [],
    notes: ["Examples include religious fundamentalist movements or state-level actions like France's limits on foreign music on the radio or China's internet censorship."],
    unit: "2.3",
  },
  {
    id: "2.3-multiculturalism",
    term: "Multiculturalism",
    definition: "A term describing a society where many different ethnic groups and cultures coexist while maintaining their own distinct identities. It advocates for tolerance and cultural diversity, contrasting with an assimilationist model where minorities are expected to adopt the dominant culture.",
    pros: ["Can promote tolerance and provide security for minority communities.", "Enriches society with cultural diversity."],
    cons: ["Critics suggest it can lead to social fragmentation and a lack of integration.", "Can be seen as idealistic, as it may overlook inter-group conflicts."],
    unit: "2.3",
  },
  {
    id: "2.3-postmodernist-pick-and-mix-identity",
    term: "Postmodernist 'Pick-and-Mix' Identity",
    definition: "The postmodernist theory that in the contemporary world, identity is no longer fixed by traditional structures like class, gender, or nationality. Instead, individuals are free to choose their identity from a wide range of options, 'picking and mixing' styles and cultural elements as if shopping in a postmodern 'supermarket of style,' primarily through consumer choices.",
    pros: ["Recognises the increased fluidity and choice in forming identities today."],
    cons: ["Often criticised for overstating the degree of choice and ignoring persistent inequalities like poverty which limit these choices."],
    unit: "2.3",
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
