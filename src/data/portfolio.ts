export type Project = {
  id: string;
  name: string;
  eyebrow: string;
  period: string;
  headline: string;
  problem: string;
  solution: string;
  impact: string;
  stack: string[];
  architecture: string[];
  challenges: string[];
  live?: string;
  repo?: string;
  featured?: boolean;
  aiSummary: string;
};

export type SkillGroup = {
  id: string;
  title: string;
  items: string[];
};

export const profile = {
  name: "Nikhil Shukla",
  role: "AI-integrated Full-Stack Developer",
  location: "Mumbai, India",
  email: "nikhilshukla8652@gmail.com",
  phone: "+91-8652440318",
  github: "https://github.com/nikhil-shukl",
  linkedin: "https://www.linkedin.com/in/nikhil-shukla-962b41317",
  resume: "/nikhil-shukla-resume.pdf",
  photo: "/nikhil-shukla.jpg",
  headline:
    "I build production-ready MERN platforms, RAG systems, and agentic AI experiences that turn messy data into useful decisions.",
  summary:
    "Performance-driven B.E. Information Technology student at TCET, Mumbai, specializing in AI-integrated full-stack development. Grand Finalist at MumbaiHacks 2025 and AMUHACK national hackathon runner-up with hands-on work across LangChain, RAG, OpenAI, Node.js, React, MongoDB, FastAPI, embeddings, and deployment."
};

export const achievements = [
  {
    title: "Grand Finalist, MumbaiHacks 2025",
    meta: "World Record AI Event",
    detail:
      "Selected from 27,000+ global applicants and competed among 3,500+ builders in a world-record agentic AI hackathon."
  },
  {
    title: "Winner, 2nd Place, AMUHACK National Hackathon",
    meta: "Feb 2026",
    detail:
      "Runner-up among 100+ teams after multiple rounds and a final shortlist of the top 50 teams."
  },
  {
    title: "5x National Hackathon Finalist",
    meta: "2025-2026",
    detail:
      "Recognized repeatedly for rapid prototyping and AI-driven solution building across national platforms."
  }
];

export const projects: Project[] = [
  {
    id: "campusnest",
    name: "CampusNest",
    eyebrow: "Flagship TCET marketplace",
    period: "2026",
    headline:
      "A TCET-focused marketplace where students buy and sell used study material, engineering tools, notes, and lab essentials.",
    problem:
      "Many juniors spend heavily on books, journals, drafter sets, calculators, lab coats, and mini-project material while seniors keep useful items unused.",
    solution:
      "CampusNest creates a focused student-to-student marketplace where seniors upload material early and juniors can discover affordable items when admissions peak around August.",
    impact:
      "Helps juniors save money, helps seniors recover value, and keeps TCET study resources circulating inside the campus community.",
    stack: ["MERN", "React", "Node.js", "Express", "MongoDB", "Auth", "Responsive UI"],
    architecture: [
      "Student listing flow",
      "Local marketplace catalog",
      "Search and item discovery",
      "Seller contact handoff",
      "Deployment on custom domain"
    ],
    challenges: [
      "Designing trust for a campus-only marketplace",
      "Keeping upload and discovery fast for students",
      "Writing copy that motivates seniors before August demand"
    ],
    live: "https://campusnest.online/",
    featured: true,
    aiSummary:
      "CampusNest is Nikhil's most product-oriented project: a real deployed marketplace with a clear user problem, local community focus, and practical execution."
  },
  {
    id: "skillbridge",
    name: "SkillBridge",
    eyebrow: "AI placement intelligence",
    period: "March 2026",
    headline:
      "A placement intelligence platform that converts unstructured training and placement data into structured career guidance.",
    problem:
      "Students receive scattered placement updates, role expectations, and preparation advice that are hard to turn into a clear plan.",
    solution:
      "Built a custom RAG pipeline with Node.js and vector search, plus a fine-tuned AI guidance layer for multilingual mentoring.",
    impact:
      "Gives students context-aware placement advice, resume direction, and interview preparation from their actual data.",
    stack: [
      "Node.js",
      "React",
      "MongoDB",
      "OpenAI API",
      "Whisper",
      "HuggingFace",
      "face-api.js",
      "Recharts",
      "Clerk"
    ],
    architecture: [
      "TnP data ingestion",
      "Chunking and embeddings",
      "Vector retrieval",
      "LLM guidance model",
      "Interview simulator feedback"
    ],
    challenges: [
      "Turning noisy placement data into reliable retrieval chunks",
      "Balancing multilingual support with technical accuracy",
      "Combining speech, emotion, and role-fit signals"
    ],
    repo: "https://github.com/nikhil-shukl",
    featured: true,
    aiSummary:
      "SkillBridge proves Nikhil can combine backend systems, retrieval, AI evaluation, and practical student workflows."
  },
  {
    id: "bridge-ai",
    name: "Bridge-AI",
    eyebrow: "Academic-to-career engine",
    period: "Feb 2026",
    headline:
      "An AI ecosystem that extracts technical skills from academic PDFs and maps them to job-role readiness.",
    problem:
      "Students struggle to translate academic work into industry-ready skills, resumes, and roadmaps.",
    solution:
      "Used FastAPI, LangChain, embeddings, and MERN flows to calculate career readiness and recommend targeted next steps.",
    impact:
      "Won top honors at AMUHACKS 5.0 and demonstrated an end-to-end AI career mentor architecture.",
    stack: ["Python", "FastAPI", "LangChain", "React", "Express", "MongoDB", "OpenAI", "Render"],
    architecture: [
      "PDF skill extraction",
      "Skill embedding comparison",
      "Role-match engine",
      "Career readiness scoring",
      "AI mentor output"
    ],
    challenges: [
      "Extracting clean skill signals from academic PDFs",
      "Comparing user expertise against real job descriptions",
      "Making the roadmap actionable instead of generic"
    ],
    repo: "https://github.com/nikhil-shukl/-Bridge-AI",
    featured: true,
    aiSummary:
      "Bridge-AI is a clean example of Nikhil's agentic AI direction: parse documents, reason over skills, and produce career actions."
  },
  {
    id: "techtrendydeals",
    name: "TechTrendyDeals",
    eyebrow: "Affiliate ecosystem",
    period: "2025-present",
    headline:
      "A full-stack affiliate platform verified as an Amazon Affiliate Partner, built for SEO-driven product discovery.",
    problem:
      "Affiliate content often becomes static, hard to manage, and disconnected from real monetization workflows.",
    solution:
      "Designed and deployed a custom blog and product curation system with server-side affiliate logic and secure APIs.",
    impact:
      "Created a real-world revenue platform and sharpened Nikhil's product, SEO, backend, and deployment instincts.",
    stack: ["React", "Node.js", "Express", "Amazon Partner API", "SEO", "Custom APIs"],
    architecture: [
      "Product curation",
      "Affiliate API layer",
      "SEO pages",
      "Tracking logic",
      "Custom domain deployment"
    ],
    challenges: [
      "Keeping affiliate logic secure",
      "Balancing SEO content with fast page performance",
      "Designing monetization without hurting user trust"
    ],
    repo: "https://github.com/nikhil-shukl/smartly-buy-frontend",
    aiSummary:
      "TechTrendyDeals shows that Nikhil can ship beyond demos: he has built monetized, deployed systems with real operational constraints."
  }
];

export const skillGroups: SkillGroup[] = [
  {
    id: "ai",
    title: "AI & Agents",
    items: [
      "Generative AI",
      "LangChain",
      "RAG",
      "Vector Databases",
      "OpenAI API",
      "Hugging Face",
      "Embeddings",
      "Fine-tuning",
      "TensorFlow"
    ]
  },
  {
    id: "backend",
    title: "Backend",
    items: ["Node.js", "Express.js", "FastAPI", "REST APIs", "Postman", "Auth", "API Design"]
  },
  {
    id: "frontend",
    title: "Frontend",
    items: ["React.js", "Next.js", "JavaScript ES6+", "Tailwind CSS", "HTML5", "CSS3", "Framer Motion"]
  },
  {
    id: "data",
    title: "Data & DB",
    items: ["MongoDB", "MySQL", "Vector Search", "Pinecone", "ChromaDB", "NumPy", "Pandas", "Scikit-learn"]
  },
  {
    id: "tools",
    title: "Tools & Deploy",
    items: ["Git", "GitHub", "Vercel", "Render", "VS Code", "Antigravity Browser", "Railway-ready APIs"]
  }
];

export const experience = [
  {
    title: "Organizing Technical Member",
    org: "E-Summit, TCET Mumbai",
    period: "Nov 2025-Feb 2026",
    detail:
      "Built responsive UI components and registration flows for the official E-Summit website, then managed technical operations and registration desk support during flagship events."
  },
  {
    title: "Affiliate Marketing Specialist",
    org: "Freelance",
    period: "June 2025-present",
    detail:
      "Engineered and managed TechTrendyDeals, a verified Amazon Affiliate platform using SEO-driven product curation and custom APIs."
  }
];

export const education = [
  {
    title: "B.E. Information Technology",
    org: "Thakur College of Engineering and Technology, Mumbai",
    period: "Aug 2024-Aug 2028"
  },
  {
    title: "Higher Secondary Education, Computer Science",
    org: "Model College of Commerce & Science, Mumbai",
    period: "Completed"
  }
];

export const repos = [
  {
    name: "Bridge-AI",
    description: "Academic-to-career AI system with skill extraction and role matching.",
    language: "JavaScript",
    href: "https://github.com/nikhil-shukl/-Bridge-AI"
  },
  {
    name: "LLM_Projects",
    description: "Generative AI and RAG implementations using LangChain, FAISS, OpenAI, and Ollama.",
    language: "Jupyter Notebook",
    href: "https://github.com/nikhil-shukl/LLM_Projects"
  },
  {
    name: "smartly-buy-frontend",
    description: "Affiliate blog frontend with React, Tailwind, and SEO-first product pages.",
    language: "JavaScript",
    href: "https://github.com/nikhil-shukl/smartly-buy-frontend"
  },
  {
    name: "Backend_Practice",
    description: "Node.js, Express.js, and MongoDB backend practice systems.",
    language: "JavaScript",
    href: "https://github.com/nikhil-shukl/Backend_Practice"
  }
];

export const suggestedPrompts = [
  "How did Nikhil build CampusNest?",
  "Show his best AI project",
  "Explain his backend architecture",
  "What technologies does he know?",
  "Why hire him?",
  "Resume dikhao",
  "CampusNest ka architecture explain karo"
];
