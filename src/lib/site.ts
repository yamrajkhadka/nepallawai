export const siteConfig = {
  name: "Nepal Law AI",
  shortName: "Law AI",
  tagline: "Ask anything about Nepali law.",
  description:
    "AI-powered legal insights for Nepal. Ask in plain language and get answers grounded in the Constitution, the National Civil Code and the National Penal Code — with the exact section cited.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://nepallawai.yamrajkhadka.com.np",
  author: "Yamraj Khadka",
  provisionCount: "5,800+",
} as const;

export type LegalCode = {
  id: string;
  name: string;
  nepali: string;
  year: string;
  summary: string;
  questions: string[];
};

export const legalCodes: LegalCode[] = [
  {
    id: "constitution",
    name: "Constitution of Nepal",
    nepali: "नेपालको संविधान",
    year: "2015",
    summary:
      "Fundamental rights and duties, citizenship, the federal structure and the powers of each branch of government.",
    questions: [
      "What fundamental rights does the Constitution guarantee?",
      "How is citizenship acquired in Nepal?",
    ],
  },
  {
    id: "civil",
    name: "National Civil Code",
    nepali: "मुलुकी देवानी संहिता",
    year: "2017",
    summary:
      "Family and marriage, divorce, property and inheritance, contracts, and the rights of landlords and tenants.",
    questions: ["Rights of tenants in Nepal", "Divorce process in Civil Code"],
  },
  {
    id: "penal",
    name: "National Penal Code",
    nepali: "मुलुकी अपराध संहिता",
    year: "2017",
    summary:
      "Criminal offences and their punishments — from theft and fraud to assault, defamation and homicide.",
    questions: ["What is the penalty for theft?", "What is the punishment for defamation?"],
  },
];

export const faqs = [
  {
    question: "Is this legal advice?",
    answer:
      "No. Nepal Law AI gives general legal information to help you understand the law. It can make mistakes and it doesn't know the details of your situation — for decisions that matter, talk to a licensed advocate in Nepal.",
  },
  {
    question: "Which laws does it cover?",
    answer: `The engine searches ${siteConfig.provisionCount} provisions drawn from the Constitution of Nepal (2015), the National Civil Code (2017) and the National Penal Code (2017).`,
  },
  {
    question: "How do I know where an answer comes from?",
    answer:
      "Every answer opens with the Act, chapter and section it relies on, shown as a citation card above the explanation — so you can look up the original text yourself.",
  },
  {
    question: "Why can an answer take a minute or two?",
    answer:
      "The model runs on modest, free hardware and writes each answer word by word, so you can watch it appear. Questions that have been asked before are answered instantly from a cache. If the engine has been idle it may also need a moment to wake up.",
  },
  {
    question: "Do I need an account?",
    answer:
      "Yes — sign in with Google in one click. Your account is what lets Nepal Law AI save your research, so you can search it and pick it up again on any device.",
  },
  {
    question: "Is it free?",
    answer: "Yes. Nepal Law AI is free to use.",
  },
];

export const sampleQuestions = [
  "What is the penalty for theft?",
  "Rights of tenants in Nepal",
  "Divorce process in Civil Code",
  "What fundamental rights does the Constitution guarantee?",
  "Can a landlord evict a tenant without notice?",
  "How is property divided between heirs?",
  "What is the punishment for defamation?",
  "How is citizenship acquired in Nepal?",
  "What is the legal age of marriage in Nepal?",
  "What are the rights of an arrested person?",
];
