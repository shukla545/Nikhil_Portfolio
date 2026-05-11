export type AgentAction =
  | { type: "scroll"; target: string; label: string }
  | { type: "highlightProject"; projectId: string; label: string }
  | { type: "filterSkills"; skillGroup: string; label: string }
  | { type: "showResume"; label: string }
  | { type: "openContact"; prefill?: string; label: string }
  | { type: "externalLink"; url: string; label: string };

type KnowledgeItem = {
  id: string;
  title: string;
  tags: string[];
  text: string;
};

export type RetrievedContext = KnowledgeItem & { score: number };

export const agentProfile = {
  name: "Nikhil Shukla",
  email: "nikhilshukla8652@gmail.com"
};

const knowledgeBase: KnowledgeItem[] = [
  {
    id: "campusnest",
    title: "CampusNest",
    tags: ["campusnest", "marketplace", "mern", "tcet", "deployment"],
    text:
      "CampusNest is a TCET-focused marketplace where students buy and sell used books, notes, journals, roller scales, drafter sets, calculators, lab coats, mini-project material, engineering equipment, and other study items. It helps juniors save money and seniors recover value from old material. New students join around August, so seniors should upload old material early. Live site: https://campusnest.online/."
  },
  {
    id: "skillbridge",
    title: "SkillBridge",
    tags: ["skillbridge", "rag", "placement", "openai", "whisper", "huggingface"],
    text:
      "SkillBridge is an AI Placement Intelligence Platform built with Node.js, MongoDB, RAG, and fine-tuned LLMs. It transforms unstructured TnP data into actionable placement insights, supports multilingual career mentoring, and includes an AI video interview simulator using OpenAI Whisper and HuggingFace DistilRoBERTa emotion analysis."
  },
  {
    id: "bridge-ai",
    title: "Bridge-AI",
    tags: ["bridge", "fastapi", "langchain", "career", "embeddings"],
    text:
      "Bridge-AI is an Academic-to-Career Translation Engine built with Python, FastAPI, LangChain, React, Express, MongoDB, OpenAI LLMs, and Render. It extracts skills from academic PDFs using vector search, calculates a Career Readiness Score, compares expertise against job descriptions, and generates resumes and learning roadmaps."
  },
  {
    id: "techtrendydeals",
    title: "TechTrendyDeals",
    tags: ["affiliate", "amazon", "react", "node", "seo"],
    text:
      "TechTrendyDeals is a full-stack affiliate ecosystem built with React, Node.js, and Amazon Partner API logic. It is an SEO-optimized blog platform on a custom domain and verified as an Amazon Affiliate Partner, with server-side affiliate logic and secure APIs."
  },
  {
    id: "skills",
    title: "Skills",
    tags: ["skills", "technology", "stack", "mern", "backend", "frontend"],
    text:
      "Nikhil's skills include Generative AI, LangChain, RAG, Pinecone, ChromaDB, OpenAI, Hugging Face, TensorFlow, fine-tuning, embeddings, Node.js, Express.js, FastAPI, REST APIs, MongoDB, MySQL, React.js, JavaScript, Tailwind CSS, HTML5, CSS3, Python, Java, C, Git, GitHub, Vercel, Render, Postman, and VS Code."
  },
  {
    id: "achievements",
    title: "Achievements",
    tags: ["hackathon", "mumbaihacks", "amuhack", "winner", "finalist"],
    text:
      "Nikhil was a Grand Finalist at MumbaiHacks 2025, selected from 27,000+ global applicants and competing among 3,500+ builders. He secured 2nd place at AMUHACK National Level Hackathon among 100+ teams and is a 5x national hackathon finalist."
  },
  {
    id: "experience",
    title: "Experience",
    tags: ["experience", "esummit", "tcet", "affiliate", "work"],
    text:
      "Nikhil was an Organizing Technical Member at E-Summit TCET from Nov 2025 to Feb 2026, helping build the official E-Summit website, responsive UI, registration system, and technical operations. He also works as a freelance affiliate marketing specialist, engineering TechTrendyDeals."
  },
  {
    id: "repos",
    title: "GitHub Repositories",
    tags: ["github", "repo", "repositories", "code"],
    text:
      "Nikhil's GitHub profile is https://github.com/nikhil-shukl. Public/pinned work includes Bridge-AI, LLM_Projects, smartly-buy-frontend, Java-DSA-Practice, and Backend_Practice."
  }
];

export function retrieveContext(message: string): RetrievedContext[] {
  const terms = message
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  return knowledgeBase
    .map((item) => {
      const haystack = `${item.title} ${item.tags.join(" ")} ${item.text}`.toLowerCase();
      const score = terms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0);
      return { ...item, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .filter((item) => item.score > 0);
}

export function planActions(message: string): AgentAction[] {
  const text = message.toLowerCase();
  const actions: AgentAction[] = [];

  if (text.includes("campusnest")) {
    actions.push({ type: "highlightProject", projectId: "campusnest", label: "Highlight CampusNest" });
  }
  if (text.includes("best ai") || text.includes("best project") || text.includes("ai project") || text.includes("bridge")) {
    actions.push({ type: "highlightProject", projectId: "bridge-ai", label: "Highlight Bridge-AI" });
  }
  if (text.includes("skill") || text.includes("technology") || text.includes("tech stack") || text.includes("mern")) {
    actions.push({
      type: "filterSkills",
      skillGroup: text.includes("mern") || text.includes("backend") ? "backend" : "ai",
      label: text.includes("mern") || text.includes("backend") ? "Filter backend skills" : "Filter AI skills"
    });
  }
  if (text.includes("resume") || text.includes("cv") || text.includes("dikhao")) {
    actions.push({ type: "showResume", label: "Show resume" });
  }
  if (text.includes("github") || text.includes("repo")) {
    actions.push({ type: "scroll", target: "repos", label: "Show GitHub repos" });
  }
  if (text.includes("meeting") || text.includes("contact") || text.includes("hire") || text.includes("book")) {
    actions.push({
      type: "openContact",
      label: "Open contact",
      prefill: "Hi Nikhil, I saw your AI portfolio and would like to discuss an opportunity."
    });
  }
  if (text.includes("open campusnest") || text.includes("visit campusnest")) {
    actions.push({ type: "externalLink", url: "https://campusnest.online/", label: "Open CampusNest" });
  }

  return actions;
}

export function fallbackAnswer(message: string, context: RetrievedContext[]): string {
  const text = message.toLowerCase();
  const joinedContext = context.map((item) => item.text).join("\n");

  if (text.includes("why hire") || text.includes("hire")) {
    return "Nikhil is a strong hire because he combines AI systems with full stack product execution. He has a deployed product in CampusNest, RAG and agentic AI work through SkillBridge and Bridge-AI, hackathon proof, and real monetization experience through TechTrendyDeals.";
  }

  if (text.includes("stand out")) {
    return "Nikhil stands out because he combines AI and full stack engineering into product-ready experiences. CampusNest is live, SkillBridge and Bridge-AI show RAG and agentic AI depth, and TechTrendyDeals proves real monetization work.";
  }

  if (text.includes("about") || text.includes("yourself")) {
    return "Nikhil Shukla is a B.E. Information Technology student at TCET Mumbai. He builds AI-integrated full stack products with MERN, RAG, LangChain, OpenAI, embeddings, FastAPI, MongoDB, and deployment workflows.";
  }

  if (text.includes("best ai") || text.includes("best project") || text.includes("ai project")) {
    return "Nikhil's strongest AI project direction is Bridge-AI and SkillBridge. Bridge-AI extracts skills from academic PDFs, uses embeddings for role matching, calculates career readiness, and generates resume or roadmap guidance. CampusNest is his strongest deployed product.";
  }

  if (text.includes("contact") || text.includes("touch") || text.includes("meeting")) {
    return `You can contact Nikhil at ${agentProfile.email} or through his LinkedIn profile. The portfolio contact panel can prefill a message and show email and meeting actions.`;
  }

  if (text.includes("backend") || text.includes("architecture")) {
    return "Nikhil's backend architecture is layered. He uses Node.js and Express for APIs, MongoDB for data, authentication, retrieval services, OpenAI or LangChain service layers, and deployment boundaries. His AI systems follow ingestion, chunking, embeddings, vector retrieval, LLM response, and frontend streaming.";
  }

  if (text.includes("campusnest")) {
    return "CampusNest is a TCET-focused marketplace. Juniors can find used books, notes, journals, drafter sets, calculators, lab coats, and project material. Seniors can upload unused items and recover value. It is live at https://campusnest.online/.";
  }

  if (text.includes("achievement") || text.includes("hackathon") || text.includes("winner")) {
    return "Nikhil was a Grand Finalist at MumbaiHacks 2025, selected from 27,000+ global applicants. He also secured 2nd place at AMUHACK National Level Hackathon and is a 5x national hackathon finalist.";
  }

  if (text.includes("education") || text.includes("college") || text.includes("tcet")) {
    return "Nikhil is pursuing B.E. Information Technology at Thakur College of Engineering and Technology, Mumbai, from 2024 to 2028. He also completed higher secondary education in Computer Science.";
  }

  if (text.includes("experience") || text.includes("e-summit")) {
    return "Nikhil worked as an Organizing Technical Member for E-Summit at TCET. He helped build the official website, registration system, and handled technical operations during the event.";
  }

  if (joinedContext) {
    return `Here is the most relevant context from Nikhil's portfolio: ${joinedContext}`;
  }

  return "Nikhil is an AI-integrated full stack developer. You can ask about CampusNest, SkillBridge, Bridge-AI, backend architecture, MERN stack, resume, GitHub repos, achievements, education, experience, or hiring fit.";
}
