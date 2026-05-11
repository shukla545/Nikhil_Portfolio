"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUp,
  Bot,
  Briefcase,
  CalendarDays,
  ChevronDown,
  Code2,
  Download,
  ExternalLink,
  FileText,
  Github,
  GraduationCap,
  Linkedin,
  Mail,
  Menu,
  Mic,
  MicOff,
  Pause,
  Sparkles,
  SquarePen,
  Trophy,
  Volume2,
  VolumeX,
  X
} from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ComponentType, RefObject } from "react";
import {
  achievements,
  education,
  experience,
  profile,
  projects,
  repos,
  skillGroups,
  type Project
} from "@/data/portfolio";

type ChatRole = "assistant" | "user";
type VisualTopic = "projects" | "achievements" | "skills" | "experience" | "education" | "resume" | "contact";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  uiComponent?: VisualTopic;
  actions?: AgentAction[];
};

type AgentAction =
  | { type: "scroll"; target: string; label: string }
  | { type: "highlightProject"; projectId: string; label: string }
  | { type: "filterSkills"; skillGroup: string; label: string }
  | { type: "showResume"; label: string }
  | { type: "openContact"; prefill?: string; label: string }
  | { type: "externalLink"; url: string; label: string };

type StreamEvent =
  | { type: "token"; value: string }
  | { type: "action"; value: AgentAction }
  | { type: "done" }
  | { type: "error"; value: string };

type SpeechRecognitionResultEvent = {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
};

type SpeechRecognitionInstance = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";
const welcomeSpeech =
  "Welcome. You are now entering the portfolio of Nikhil Shukla, an AI-powered full stack developer who builds real-world projects using MERN, Generative AI, and Agentic AI. This AI assistant can show you his projects, explain technical decisions in simple words, and answer anything about his skills and engineering journey.";

const commands: Array<{
  command: string;
  topic?: VisualTopic;
  label: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { command: "/projects", topic: "projects", label: "Explore Projects", icon: Code2 },
  { command: "/achievements", topic: "achievements", label: "Achievements", icon: Trophy },
  { command: "/skills", topic: "skills", label: "Tech Stack", icon: Briefcase },
  { command: "/experience", topic: "experience", label: "Experience", icon: Sparkles },
  { command: "/education", topic: "education", label: "Education", icon: GraduationCap },
  { command: "/resume", topic: "resume", label: "View Resume", icon: FileText },
  { command: "/contact", topic: "contact", label: "Get in Touch", icon: Mail }
];

const greetingOptions = [
  { label: "Tell me about yourself", value: "Tell me about Nikhil Shukla", icon: Bot },
  { label: "What makes you stand out?", value: "What makes Nikhil stand out?", icon: Sparkles },
  { label: "Walk me through your best project", value: "/projects", icon: Code2 },
  { label: "What's in your tech toolkit?", value: "/skills", icon: Briefcase },
  { label: "How do I get in touch?", value: "/contact", icon: Mail }
];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

function commandToTopic(text: string): VisualTopic | null {
  const normalized = text.trim().toLowerCase();
  const exact = commands.find((item) => item.command === normalized);
  if (exact?.topic) {
    return exact.topic;
  }

  if (normalized.includes("project") || normalized.includes("campusnest") || normalized.includes("github")) return "projects";
  if (normalized.includes("achievement") || normalized.includes("hackathon") || normalized.includes("winner")) return "achievements";
  if (normalized.includes("skill") || normalized.includes("stack") || normalized.includes("toolkit") || normalized.includes("technology")) return "skills";
  if (normalized.includes("experience") || normalized.includes("e-summit") || normalized.includes("work")) return "experience";
  if (normalized.includes("education") || normalized.includes("college") || normalized.includes("tcet")) return "education";
  if (normalized.includes("resume") || normalized.includes("cv")) return "resume";
  if (normalized.includes("contact") || normalized.includes("email") || normalized.includes("touch") || normalized.includes("meeting")) return "contact";
  return null;
}

function topicLabel(topic: VisualTopic) {
  const labels: Record<VisualTopic, string> = {
    projects: "Show me your projects",
    achievements: "Show achievements",
    skills: "Show technical skills",
    experience: "Show experience",
    education: "Show education",
    resume: "Show resume",
    contact: "How can I contact Nikhil?"
  };
  return labels[topic];
}

function topicIntro(topic: VisualTopic) {
  const intros: Record<VisualTopic, string> = {
    projects:
      "Here are Nikhil's strongest projects. CampusNest gets special treatment because it is a real deployed product with a clear campus problem.",
    achievements:
      "Here are Nikhil's key achievements from hackathons and competitive technical events.",
    skills:
      "Here is Nikhil's technical toolkit, grouped by AI, backend, frontend, data, and deployment skills.",
    experience:
      "Here is Nikhil's practical experience across campus technical operations and real-world affiliate product work.",
    education:
      "Here is Nikhil's education background and engineering foundation.",
    resume:
      "Here is Nikhil's resume. You can view it inside the portfolio or download the PDF.",
    contact:
      "Here are the best ways to contact Nikhil for roles, collaborations, internships, or project opportunities."
  };
  return intros[topic];
}

function localReply(input: string) {
  const text = input.toLowerCase();

  if (text.includes("campusnest")) {
    return "CampusNest is Nikhil's flagship deployed product. It is a TCET-focused marketplace where juniors can buy used books, notes, journals, drafter sets, calculators, lab coats, and engineering material while seniors recover value from unused items.";
  }

  if (text.includes("stand out") || text.includes("hire")) {
    return "Nikhil stands out because he combines full stack engineering with real AI product execution. He has built deployed products like CampusNest, RAG systems like SkillBridge and Bridge-AI, and a monetized affiliate platform through TechTrendyDeals.";
  }

  if (text.includes("architecture") || text.includes("backend")) {
    return "Nikhil's backend approach is layered and practical. He uses Node.js and Express for APIs, MongoDB for data, FastAPI for Python AI services, and RAG pipelines with chunking, embeddings, vector retrieval, and OpenAI responses.";
  }

  if (text.includes("yourself") || text.includes("about")) {
    return "Nikhil Shukla is a B.E. Information Technology student at TCET Mumbai. He builds AI-powered full stack projects using MERN, LangChain, RAG, OpenAI, FastAPI, MongoDB, and modern deployment workflows.";
  }

  return "Nikhil is an AI-powered full stack developer focused on MERN, Generative AI, RAG systems, and Agentic AI. You can ask me about his projects, skills, resume, education, achievements, or engineering journey.";
}

export function PortfolioExperience() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showBanner, setShowBanner] = useState(true);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voicePromptOpen, setVoicePromptOpen] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [highlightedProject, setHighlightedProject] = useState<string | null>(null);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [contactPrefill, setContactPrefill] = useState("");
  const [externalAction, setExternalAction] = useState<AgentAction | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const speak = useCallback(
    (text: string, force = false) => {
      if (((!voiceEnabled || isMuted) && !force) || typeof window === "undefined" || !("speechSynthesis" in window)) {
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/\s+/g, " ").slice(0, 720));
      const voices = window.speechSynthesis.getVoices();
      const maleVoice =
        voices.find((voice) => /microsoft ravi|ravi|david|mark|guy|male|english india|en-in/i.test(voice.name)) ||
        voices.find((voice) => voice.lang.toLowerCase().startsWith("en"));
      if (maleVoice) utterance.voice = maleVoice;
      utterance.lang = "en-IN";
      utterance.pitch = 0.72;
      utterance.rate = 0.88;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    },
    [isMuted, voiceEnabled]
  );

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth", force = false) => {
    window.setTimeout(() => {
      const container = scrollRef.current;
      if (!container) return;
      if (!force) {
        const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
        if (distanceFromBottom > 80) return;
      }
      container.scrollTo({ top: container.scrollHeight, behavior });
    }, 80);
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const onScroll = () => {
      const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      setShowScrollButton(distanceFromBottom > 120);
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  useLayoutEffect(() => {
    const last = messages[messages.length - 1];
    if (!last) return;
    if (last.role === "user" || last.content === "" || isStreaming) {
      scrollToBottom("smooth", true);
    } else {
      scrollToBottom("smooth");
    }
  }, [isStreaming, messages, scrollToBottom]);

  useLayoutEffect(() => {
    const textarea = inputRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(Math.max(textarea.scrollHeight, 30), 160)}px`;
  }, [input]);

  const enableVoice = useCallback(() => {
    setVoiceEnabled(true);
    setIsMuted(false);
    setVoicePromptOpen(false);
    window.setTimeout(() => speak(welcomeSpeech, true), 160);
  }, [speak]);

  const toggleMute = useCallback(() => {
    if (!voiceEnabled) {
      enableVoice();
      return;
    }

    setIsMuted((current) => {
      const next = !current;
      if (next && typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      return next;
    });
  }, [enableVoice, voiceEnabled]);

  const executeAction = useCallback(
    (action: AgentAction) => {
      if (action.type === "highlightProject") {
        setHighlightedProject(action.projectId);
        setTimeout(() => setHighlightedProject(null), 4500);
        return;
      }
      if (action.type === "showResume") {
        setResumeOpen(true);
        return;
      }
      if (action.type === "openContact") {
        setContactPrefill(action.prefill || "Hi Nikhil, I saw your AI portfolio and would like to connect.");
        return;
      }
      if (action.type === "externalLink") {
        setExternalAction(action);
      }
    },
    []
  );

  const addVisualTopic = useCallback(
    (topic: VisualTopic) => {
      setShowBanner(false);
      setIsSidebarOpen(false);

      const user: ChatMessage = {
        id: uid("user"),
        role: "user",
        content: topicLabel(topic)
      };
      const assistant: ChatMessage = {
        id: uid("assistant"),
        role: "assistant",
        content: topicIntro(topic),
        uiComponent: topic
      };

      setMessages((current) => [...current, user, assistant]);
      if (topic === "resume") setResumeOpen(true);
      if (topic === "contact") {
        setContactPrefill("Hi Nikhil, I saw your AI portfolio and would like to discuss an opportunity.");
      }
      speak(topicIntro(topic));
      scrollToBottom("smooth", true);
    },
    [scrollToBottom, speak]
  );

  const parseStream = useCallback(
    async (response: Response, assistantId: string) => {
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";
      const actions: AgentAction[] = [];

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() ?? "";

        for (const chunk of chunks) {
          const dataLine = chunk.split("\n").find((line) => line.startsWith("data:"));
          if (!dataLine) continue;
          const event = JSON.parse(dataLine.slice(5).trim()) as StreamEvent;
          if (event.type === "token") {
            fullText += event.value;
            setMessages((current) =>
              current.map((message) =>
                message.id === assistantId ? { ...message, content: fullText, actions } : message
              )
            );
          }
          if (event.type === "action") {
            actions.push(event.value);
            executeAction(event.value);
            setMessages((current) =>
              current.map((message) =>
                message.id === assistantId ? { ...message, content: fullText, actions: [...actions] } : message
              )
            );
          }
        }
      }

      return fullText;
    },
    [executeAction]
  );

  const sendMessage = useCallback(
    async (raw?: string) => {
      const text = (raw ?? input).trim();
      if (!text || isStreaming) return;

      const topic = commandToTopic(text);
      if (topic) {
        setInput("");
        addVisualTopic(topic);
        return;
      }

      setShowBanner(false);
      setInput("");
      const user: ChatMessage = { id: uid("user"), role: "user", content: text };
      const assistantId = uid("assistant");
      setMessages((current) => [...current, user, { id: assistantId, role: "assistant", content: "" }]);
      setIsStreaming(true);
      scrollToBottom("smooth", true);

      try {
        const response = await fetch(`${apiUrl}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text })
        });
        if (!response.ok) throw new Error(`Assistant API failed: ${response.status}`);
        const spoken = await parseStream(response, assistantId);
        speak(spoken);
      } catch {
        const reply = localReply(text);
        setMessages((current) =>
          current.map((message) => (message.id === assistantId ? { ...message, content: reply } : message))
        );
        speak(reply);
      } finally {
        setIsStreaming(false);
      }
    },
    [addVisualTopic, input, isStreaming, parseStream, scrollToBottom, speak]
  );

  const newChat = useCallback(() => {
    setMessages([]);
    setShowBanner(true);
    setInput("");
    setIsSidebarOpen(false);
    setExternalAction(null);
    setHighlightedProject(null);
    window.setTimeout(() => {
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      inputRef.current?.focus();
    }, 100);
  }, []);

  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      setInput("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript || "";
      setInput(transcript);
      void sendMessage(transcript);
    };
    recognitionRef.current = recognition;
    recognition.start();
  }, [sendMessage]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return (
    <main className="fixed inset-0 flex overflow-hidden bg-[#202123] text-white">
      <AnimatePresence>
        {isSidebarOpen ? (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/55 lg:hidden"
            aria-label="Close sidebar overlay"
          />
        ) : null}
      </AnimatePresence>

      <Sidebar
        isOpen={isSidebarOpen}
        newChat={newChat}
        onTopicSelect={addVisualTopic}
        close={() => setIsSidebarOpen(false)}
      />

      <section className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#202123]">
        <MobileHeader
          openSidebar={() => setIsSidebarOpen(true)}
          voiceEnabled={voiceEnabled}
          isMuted={isMuted}
          toggleMute={toggleMute}
          enableVoice={enableVoice}
        />

        <VoiceControl
          voiceEnabled={voiceEnabled}
          isMuted={isMuted}
          toggleMute={toggleMute}
        />

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-8 scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent"
          style={{ scrollbarGutter: "stable" }}
        >
          <div className="mx-auto max-w-5xl space-y-6 pb-8">
            {showBanner ? <GreetingBanner onSelect={(value) => void sendMessage(value)} /> : null}

            {messages.map((message) => (
              <ChatBubble
                key={message.id}
                message={message}
                highlightedProject={highlightedProject}
                setResumeOpen={setResumeOpen}
                contactPrefill={contactPrefill}
                setContactPrefill={setContactPrefill}
                executeAction={executeAction}
              />
            ))}

            {isStreaming && <TypingIndicator />}
          </div>
        </div>

        <div className="relative shrink-0 px-4 pb-4">
          <div className="mx-auto max-w-5xl">
            <CommandInput
              input={input}
              setInput={setInput}
              inputRef={inputRef}
              sendMessage={sendMessage}
              isStreaming={isStreaming}
              isListening={isListening}
              startListening={startListening}
              stopListening={stopListening}
            />
            <div className="mt-2 flex items-center justify-center gap-3 text-xs text-white/42">
              <span>Type / for commands</span>
              <span className="h-1 w-1 rounded-full bg-white/25" />
              <button
                onClick={() => {
                  toggleMute();
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-white/58 transition hover:text-white"
              >
                {voiceEnabled && !isMuted ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                {voiceEnabled && !isMuted ? "Mute voice" : voiceEnabled ? "Voice muted" : "Voice off"}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showScrollButton ? (
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                onClick={() => scrollToBottom("smooth", true)}
                className="absolute -top-12 left-1/2 grid h-10 w-10 -translate-x-1/2 place-items-center rounded-full border border-white/10 bg-[#2f3035] shadow-lg"
                aria-label="Scroll to latest message"
              >
                <ChevronDown className="h-5 w-5" />
              </motion.button>
            ) : null}
          </AnimatePresence>
        </div>
      </section>

      <AnimatePresence>
        {voicePromptOpen ? (
          <VoicePrompt
            enableVoice={enableVoice}
            skip={() => setVoicePromptOpen(false)}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {externalAction?.type === "externalLink" ? (
          <ExternalLinkToast action={externalAction} close={() => setExternalAction(null)} />
        ) : null}
      </AnimatePresence>

      <ResumeModal open={resumeOpen} setOpen={setResumeOpen} />
    </main>
  );
}

function VoiceControl({
  voiceEnabled,
  isMuted,
  toggleMute
}: {
  voiceEnabled: boolean;
  isMuted: boolean;
  toggleMute: () => void;
}) {
  const active = voiceEnabled && !isMuted;
  return (
    <button
      onClick={toggleMute}
      className={cx(
        "fixed right-5 top-5 z-30 hidden items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold shadow-xl backdrop-blur-md transition lg:inline-flex",
        active
          ? "border-indigo-400/45 bg-indigo-500/15 text-indigo-100 hover:bg-indigo-500/25"
          : "border-white/12 bg-zinc-900/80 text-white/70 hover:text-white"
      )}
      aria-label={active ? "Mute portfolio voice" : "Enable portfolio voice"}
      title={active ? "Mute voice" : voiceEnabled ? "Voice muted" : "Enable voice"}
    >
      {active ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
      {active ? "Mute Voice" : voiceEnabled ? "Voice Muted" : "Voice Off"}
    </button>
  );
}

function Sidebar({
  isOpen,
  newChat,
  onTopicSelect,
  close
}: {
  isOpen: boolean;
  newChat: () => void;
  onTopicSelect: (topic: VisualTopic) => void;
  close: () => void;
}) {
  const navItems = [
    { id: "projects" as VisualTopic, label: "Explore Projects", icon: Code2 },
    { id: "achievements" as VisualTopic, label: "Achievements", icon: Trophy },
    { id: "skills" as VisualTopic, label: "Tech Stack", icon: Briefcase },
    { id: "experience" as VisualTopic, label: "Experience", icon: Sparkles },
    { id: "education" as VisualTopic, label: "Education", icon: GraduationCap },
    { id: "resume" as VisualTopic, label: "View Resume", icon: FileText }
  ];

  return (
    <aside
      className={cx(
        "fixed left-0 top-0 z-50 flex h-[100dvh] w-80 flex-col overflow-y-auto border-r border-white/10 bg-[#18191f] transition-transform duration-300 lg:relative lg:w-[480px] lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <button
        onClick={close}
        className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-lg bg-white/5 lg:hidden"
        aria-label="Close sidebar"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="relative z-10 flex flex-col px-6 pb-3 pt-8">
        <div className="mb-5 flex justify-center">
          <div className="relative h-28 w-28 rounded-full ring-2 ring-indigo-500/40 ring-offset-4 ring-offset-[#18191f]">
            <div className="relative h-full w-full overflow-hidden rounded-full bg-white/5">
              <Image
                src={profile.photo}
                alt={profile.name}
                fill
                priority
                className="object-cover object-[50%_18%]"
                sizes="112px"
              />
            </div>
          </div>
        </div>

        <p className="mb-3 text-center text-[14px] font-black uppercase tracking-[0.28em] text-indigo-400">
          AI Full-Stack Developer
        </p>
        <h1 className="mb-4 text-center text-4xl font-black tracking-normal text-white">{profile.name}</h1>
        <p className="mx-auto mb-4 max-w-sm text-center text-lg font-light leading-8 text-zinc-200">
          I built this AI assistant from my projects, resume, and experiences. It can explain my engineering journey in a real conversation.
        </p>

        <div className="mb-5 flex justify-center gap-9">
          <a href={profile.github} target="_blank" rel="noreferrer" className="grid h-12 w-12 place-items-center rounded-xl text-white transition hover:scale-110 hover:text-indigo-400" aria-label="GitHub">
            <Github className="h-8 w-8" />
          </a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer" className="grid h-12 w-12 place-items-center rounded-xl text-white transition hover:scale-110 hover:text-indigo-400" aria-label="LinkedIn">
            <Linkedin className="h-8 w-8" />
          </a>
          <a href={`mailto:${profile.email}`} className="grid h-12 w-12 place-items-center rounded-xl text-white transition hover:scale-110 hover:text-indigo-400" aria-label="Email">
            <Mail className="h-8 w-8" />
          </a>
        </div>

        <div className="h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
      </div>

      <div className="px-6 py-6">
        <button
          onClick={newChat}
          className="flex w-full items-center gap-5 rounded-2xl border border-white/12 bg-white/[0.045] px-5 py-4 text-left text-2xl font-bold text-white transition hover:border-indigo-400/40"
        >
          <SquarePen className="h-5 w-5 text-white/56" />
          New Chat
        </button>
      </div>

      <nav className="flex-1 space-y-2 px-6 pb-6">
        <p className="mb-4 flex items-center gap-3 text-base font-black uppercase tracking-normal text-zinc-100">
          <span className="h-[2px] w-6 rounded-full bg-indigo-500" />
          Visual Content
        </p>

        {navItems.map(({ id, label, icon: Icon }, index) => (
          <motion.button
            key={id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04 }}
            onClick={() => onTopicSelect(id)}
            className="group flex w-full items-center gap-5 rounded-2xl px-5 py-4 text-left text-xl font-bold text-zinc-100 transition hover:bg-indigo-500/10 hover:text-white"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-indigo-400/25 bg-indigo-500/10 text-indigo-300 transition group-hover:bg-indigo-500/20">
              <Icon className="h-5 w-5" />
            </span>
            {label}
          </motion.button>
        ))}
      </nav>
    </aside>
  );
}

function MobileHeader({
  openSidebar,
  voiceEnabled,
  isMuted,
  toggleMute,
  enableVoice
}: {
  openSidebar: () => void;
  voiceEnabled: boolean;
  isMuted: boolean;
  toggleMute: () => void;
  enableVoice: () => void;
}) {
  return (
    <header className="flex shrink-0 items-center gap-4 border-b border-white/10 px-4 py-3 lg:hidden">
      <button onClick={openSidebar} className="rounded-md p-1 transition hover:bg-white/8" aria-label="Open sidebar">
        <Menu className="h-6 w-6" />
      </button>
      <span className="text-xl tracking-wide">
        <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text pr-1 font-black italic text-transparent">
          AI
        </span>
        <span className="ml-1 font-light text-white/80">Portfolio</span>
      </span>
      <button
        onClick={voiceEnabled ? toggleMute : enableVoice}
        className="ml-auto grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-indigo-300"
        aria-label="Toggle voice"
      >
        {voiceEnabled && !isMuted ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
      </button>
    </header>
  );
}

function GreetingBanner({ onSelect }: { onSelect: (value: string) => void }) {
  return (
    <div className="flex w-full flex-col items-center justify-center px-2 md:px-4">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/50 via-zinc-900/80 to-zinc-900/80" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(165,180,252,0.16) 1px, transparent 0)",
            backgroundSize: "20px 20px"
          }}
        />

        <div className="relative z-10 p-5 text-center backdrop-blur-[2px] md:p-10">
          <p className="mx-auto text-balance text-2xl font-bold text-white md:text-4xl">
            Welcome to Nikhil Shukla&apos;s portfolio.
          </p>
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.45 }}
          >
            <h2 className="mx-auto mt-5 max-w-3xl text-balance bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-xl font-black leading-8 text-transparent md:text-2xl">
              Talk to an AI assistant trained on his projects, skills, resume, and engineering journey.
            </h2>
            <p className="mx-auto pb-4 pt-4 text-balance text-base text-white/72 md:text-lg">
              Ask anything, or click a topic below to get started.
            </p>

            <div className="grid w-full gap-3 md:grid-cols-2">
              {greetingOptions.map(({ label, value, icon: Icon }) => (
                <button
                  key={label}
                  onClick={() => onSelect(value)}
                  className="group flex h-auto items-center justify-start gap-3 rounded-xl border border-white/12 bg-white/[0.035] px-4 py-4 text-left transition hover:scale-[1.02] hover:border-indigo-400/50 hover:bg-indigo-500/10"
                >
                  <Icon className="h-5 w-5 shrink-0 text-zinc-400 transition group-hover:text-indigo-300" />
                  <span className="text-base font-light leading-tight text-zinc-100">{label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({
  message,
  highlightedProject,
  setResumeOpen,
  contactPrefill,
  setContactPrefill,
  executeAction
}: {
  message: ChatMessage;
  highlightedProject: string | null;
  setResumeOpen: (value: boolean) => void;
  contactPrefill: string;
  setContactPrefill: (value: string) => void;
  executeAction: (action: AgentAction) => void;
}) {
  if (message.role === "user") {
    return (
      <div className="flex w-full justify-end">
        <div className="max-w-[82%] rounded-3xl border border-zinc-800 bg-[#2f3035] px-5 py-3 shadow-sm md:max-w-[95%]">
          <p className="whitespace-pre-wrap break-words text-base leading-relaxed text-white md:text-lg">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="mb-3 max-w-[95%] px-4 text-white/88 md:px-5">
        {message.content ? (
          <p className="whitespace-pre-wrap text-base font-light leading-8 tracking-wide md:text-lg">{message.content}</p>
        ) : (
          <TypingIndicator />
        )}
        {message.actions?.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.actions.map((action) => (
              <button
                key={`${message.id}-${action.label}`}
                onClick={() => executeAction(action)}
                className="rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-200"
              >
                {action.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      {message.uiComponent ? (
        <VisualMessage
          topic={message.uiComponent}
          highlightedProject={highlightedProject}
          setResumeOpen={setResumeOpen}
          contactPrefill={contactPrefill}
          setContactPrefill={setContactPrefill}
        />
      ) : null}
    </div>
  );
}

function VisualMessage({
  topic,
  highlightedProject,
  setResumeOpen,
  contactPrefill,
  setContactPrefill
}: {
  topic: VisualTopic;
  highlightedProject: string | null;
  setResumeOpen: (value: boolean) => void;
  contactPrefill: string;
  setContactPrefill: (value: string) => void;
}) {
  if (topic === "projects") return <ProjectsVisual highlightedProject={highlightedProject} />;
  if (topic === "achievements") return <AchievementsVisual />;
  if (topic === "skills") return <SkillsVisual />;
  if (topic === "experience") return <ExperienceVisual />;
  if (topic === "education") return <EducationVisual />;
  if (topic === "resume") return <ResumeVisual setResumeOpen={setResumeOpen} />;
  return <ContactVisual contactPrefill={contactPrefill} setContactPrefill={setContactPrefill} />;
}

function ProjectsVisual({ highlightedProject }: { highlightedProject: string | null }) {
  const campusNest = projects.find((project) => project.id === "campusnest")!;
  const otherProjects = projects.filter((project) => project.id !== "campusnest");
  return (
    <div className="mb-8 grid gap-5">
      <ProjectFeature project={campusNest} highlighted={highlightedProject === campusNest.id} />
      <div className="grid gap-4 md:grid-cols-3">
        {otherProjects.map((project) => (
          <ProjectMini key={project.id} project={project} highlighted={highlightedProject === project.id} />
        ))}
      </div>
      <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-indigo-300">GitHub Repos</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {repos.map((repo) => (
            <a
              key={repo.name}
              href={repo.href}
              target="_blank"
              rel="noreferrer"
              className="group rounded-xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-indigo-400/50"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-black">{repo.name}</span>
                <ExternalLink className="h-4 w-4 text-white/36 group-hover:text-indigo-300" />
              </div>
              <p className="mt-2 text-sm leading-6 text-white/58">{repo.description}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProjectFeature({ project, highlighted }: { project: Project; highlighted: boolean }) {
  return (
    <article
      className={cx(
        "overflow-hidden rounded-2xl border bg-zinc-900",
        highlighted ? "project-highlight border-indigo-400/80" : "border-white/10"
      )}
    >
      <div className="grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="p-5 md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-indigo-300">{project.eyebrow}</p>
          <h3 className="mt-3 text-3xl font-black md:text-4xl">{project.name}</h3>
          <p className="mt-4 text-base leading-8 text-white/72">{project.headline}</p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <MiniBrief label="Problem" copy={project.problem} />
            <MiniBrief label="Solution" copy={project.solution} />
            <MiniBrief label="Impact" copy={project.impact} />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {project.stack.map((item) => (
              <span key={item} className="rounded-full bg-white/7 px-3 py-1 text-xs text-white/65">
                {item}
              </span>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {project.live ? (
              <a href={project.live} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-indigo-400 px-5 py-3 text-sm font-black text-white">
                Live Demo
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : null}
            {project.repo ? (
              <a href={project.repo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/12 px-5 py-3 text-sm font-bold text-white">
                Repository
                <Github className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </div>
        <div className="border-t border-white/10 bg-[#17181f] p-5 lg:border-l lg:border-t-0">
          <div className="rounded-2xl border border-indigo-400/25 bg-indigo-500/10 p-5">
            <p className="text-sm font-black text-indigo-200">AI Summary</p>
            <p className="mt-3 text-sm leading-7 text-white/70">{project.aiSummary}</p>
          </div>
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] p-5">
            <p className="mb-4 text-sm font-black">Architecture</p>
            <div className="grid gap-3">
              {project.architecture.map((step, index) => (
                <div key={step} className="flex items-center gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-indigo-500/16 text-xs font-black text-indigo-200">
                    {index + 1}
                  </span>
                  <span className="text-sm text-white/68">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function ProjectMini({ project, highlighted }: { project: Project; highlighted: boolean }) {
  return (
    <article
      className={cx(
        "rounded-2xl border bg-zinc-900 p-5",
        highlighted ? "project-highlight border-indigo-400/80" : "border-white/10"
      )}
    >
      <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-300">{project.eyebrow}</p>
      <h3 className="mt-3 text-2xl font-black">{project.name}</h3>
      <p className="mt-3 text-sm leading-6 text-white/62">{project.headline}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {project.stack.slice(0, 4).map((item) => (
          <span key={item} className="rounded-full bg-white/7 px-3 py-1 text-xs text-white/58">
            {item}
          </span>
        ))}
      </div>
    </article>
  );
}

function MiniBrief({ label, copy }: { label: string; copy: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-white/42">{label}</p>
      <p className="mt-2 text-sm leading-6 text-white/64">{copy}</p>
    </div>
  );
}

function AchievementsVisual() {
  return (
    <div className="mb-8 grid gap-4 md:grid-cols-3">
      {achievements.map((achievement) => (
        <div key={achievement.title} className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
          <Trophy className="mb-4 h-7 w-7 text-indigo-300" />
          <h3 className="text-xl font-black">{achievement.title}</h3>
          <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-indigo-300">{achievement.meta}</p>
          <p className="mt-4 text-sm leading-7 text-white/62">{achievement.detail}</p>
        </div>
      ))}
    </div>
  );
}

function SkillsVisual() {
  return (
    <div className="mb-8 grid gap-5">
      {skillGroups.map((group) => (
        <div key={group.id} className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
          <h3 className="text-2xl font-black">{group.title}</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {group.items.map((item) => (
              <span key={item} className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-2 text-sm text-white/72">
                {item}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ExperienceVisual() {
  return (
    <div className="mb-8 grid gap-4 md:grid-cols-2">
      {experience.map((item) => (
        <TimelineCard key={item.title} {...item} />
      ))}
    </div>
  );
}

function EducationVisual() {
  return (
    <div className="mb-8 grid gap-4 md:grid-cols-2">
      {education.map((item) => (
        <TimelineCard key={item.title} {...item} />
      ))}
    </div>
  );
}

function TimelineCard({ title, org, period, detail }: { title: string; org: string; period: string; detail?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
      <h3 className="text-xl font-black">{title}</h3>
      <p className="mt-2 text-indigo-300">{org}</p>
      <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-white/42">{period}</p>
      {detail ? <p className="mt-4 text-sm leading-7 text-white/62">{detail}</p> : null}
    </div>
  );
}

function ResumeVisual({ setResumeOpen }: { setResumeOpen: (value: boolean) => void }) {
  return (
    <div className="mb-8 rounded-2xl border border-white/10 bg-zinc-900 p-6">
      <h3 className="text-3xl font-black">{profile.name}</h3>
      <p className="mt-2 text-indigo-300">{profile.role}</p>
      <p className="mt-4 max-w-3xl text-base leading-8 text-white/66">{profile.summary}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={() => setResumeOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-indigo-400 px-5 py-3 text-sm font-black text-white"
        >
          <FileText className="h-4 w-4" />
          View Resume
        </button>
        <a
          href={profile.resume}
          download
          className="inline-flex items-center gap-2 rounded-full border border-white/12 px-5 py-3 text-sm font-bold text-white"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </a>
      </div>
    </div>
  );
}

function ContactVisual({
  contactPrefill,
  setContactPrefill
}: {
  contactPrefill: string;
  setContactPrefill: (value: string) => void;
}) {
  const subject = encodeURIComponent("Opportunity for Nikhil Shukla");
  const body = encodeURIComponent(contactPrefill || "Hi Nikhil,\n\nI saw your AI portfolio and would like to connect.");
  return (
    <div className="mb-8 rounded-2xl border border-white/10 bg-zinc-900 p-6">
      <textarea
        value={contactPrefill}
        onChange={(event) => setContactPrefill(event.target.value)}
        rows={6}
        className="w-full resize-none rounded-2xl border border-white/10 bg-[#2f3035] p-4 text-base leading-7 text-white outline-none placeholder:text-white/35 focus:border-indigo-400/60"
        placeholder="Hi Nikhil, I saw your AI portfolio and would like to discuss..."
      />
      <div className="mt-5 flex flex-wrap gap-3">
        <a href={`mailto:${profile.email}?subject=${subject}&body=${body}`} className="inline-flex items-center gap-2 rounded-full bg-indigo-400 px-5 py-3 text-sm font-black text-white">
          <Mail className="h-4 w-4" />
          Email Nikhil
        </a>
        <a href={profile.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/12 px-5 py-3 text-sm font-bold text-white">
          <Linkedin className="h-4 w-4" />
          LinkedIn
        </a>
        <a
          href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
            "Meeting with Nikhil Shukla"
          )}&details=${encodeURIComponent("Discuss AI/full-stack opportunity with Nikhil Shukla.")}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-white/12 px-5 py-3 text-sm font-bold text-white"
        >
          <CalendarDays className="h-4 w-4" />
          Meeting
        </a>
      </div>
    </div>
  );
}

function CommandInput({
  input,
  setInput,
  inputRef,
  sendMessage,
  isStreaming,
  isListening,
  startListening,
  stopListening
}: {
  input: string;
  setInput: (value: string) => void;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  sendMessage: (value?: string) => Promise<void>;
  isStreaming: boolean;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
}) {
  const isCommandPaletteOpen = input.startsWith("/") && !input.includes(" ");
  const filteredCommands = useMemo(() => {
    const query = input.slice(1).toLowerCase();
    return commands.filter((item) => item.command.slice(1).includes(query) || item.label.toLowerCase().includes(query));
  }, [input]);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void sendMessage();
      }}
      className="relative"
    >
      {isCommandPaletteOpen ? (
        <div className="absolute bottom-[calc(100%+10px)] left-0 right-0 mx-auto max-w-xl overflow-hidden rounded-2xl border border-white/12 bg-zinc-900 p-2 shadow-2xl">
          {filteredCommands.length ? (
            filteredCommands.map(({ command, label, icon: Icon }) => (
              <button
                key={command}
                type="button"
                onClick={() => void sendMessage(command)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-indigo-500/12"
              >
                <Icon className="h-4 w-4 text-indigo-300" />
                <span className="font-bold">{command}</span>
                <span className="text-sm text-white/48">{label}</span>
              </button>
            ))
          ) : (
            <p className="px-3 py-3 text-sm text-white/52">Try /projects, /skills, /resume, or /contact</p>
          )}
        </div>
      ) : null}

      <div className="relative flex w-full items-end rounded-3xl border border-[#3f4046] bg-[#2f3035]/95 p-2.5 transition-all duration-300 focus-within:border-indigo-400/55">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void sendMessage();
            }
          }}
          rows={1}
          disabled={isStreaming}
          placeholder="Ask me anything or type / for commands..."
          className="max-h-[160px] min-h-[30px] flex-1 resize-none bg-transparent py-2 pl-3 pr-2 text-base text-gray-100 outline-none placeholder:text-gray-300"
        />
        <button
          type="button"
          onClick={isListening ? stopListening : startListening}
          disabled={isStreaming}
          className={cx(
            "ml-1 grid h-10 w-10 shrink-0 place-items-center rounded-full transition disabled:opacity-40",
            isListening ? "bg-red-500 text-white" : "bg-white/7 text-white/70 hover:text-white"
          )}
          aria-label={isListening ? "Stop voice input" : "Start voice input"}
        >
          {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>
        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          className="ml-2 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-indigo-400 text-white transition hover:scale-110 disabled:scale-100 disabled:opacity-40"
          aria-label="Send message"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-5 py-3 text-white/54">
      <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-300" />
      <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-300 [animation-delay:120ms]" />
      <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-300 [animation-delay:240ms]" />
    </div>
  );
}

function VoicePrompt({ enableVoice, skip }: { enableVoice: () => void; skip: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-4 backdrop-blur-md"
    >
      <motion.div
        initial={{ y: 22, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 22, scale: 0.98 }}
        className="w-full max-w-2xl rounded-3xl border border-white/12 bg-[#18191f] p-6 text-center shadow-2xl"
      >
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-indigo-500/15 text-indigo-300">
          <Volume2 className="h-8 w-8" />
        </div>
        <h2 className="mt-5 text-3xl font-black">Enable AI Voice</h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-white/70">
          The assistant will speak in clear English and welcome visitors with a calm male-style AI voice. You can mute it anytime.
        </p>
        <p className="mx-auto mt-4 max-w-xl rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm leading-7 text-white/62">
          {welcomeSpeech}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button onClick={enableVoice} className="flex-1 rounded-full bg-indigo-400 px-5 py-4 text-sm font-black text-white">
            Allow Voice
          </button>
          <button onClick={skip} className="flex-1 rounded-full border border-white/12 bg-white/5 px-5 py-4 text-sm font-bold text-white/72">
            Continue Silent
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ExternalLinkToast({ action, close }: { action: AgentAction; close: () => void }) {
  if (action.type !== "externalLink") return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 14 }}
      className="fixed right-5 top-5 z-[90] flex max-w-sm items-center gap-3 rounded-2xl border border-indigo-400/35 bg-zinc-900 p-3 shadow-2xl"
    >
      <span className="min-w-0 flex-1 truncate text-sm font-bold">{action.label}</span>
      <a href={action.url} target="_blank" rel="noreferrer" className="rounded-full bg-indigo-400 px-3 py-1.5 text-xs font-black">
        Open
      </a>
      <button onClick={close} aria-label="Close link prompt">
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

function ResumeModal({ open, setOpen }: { open: boolean; setOpen: (value: boolean) => void }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-black/78 p-3 backdrop-blur-xl sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ y: 28, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 28, scale: 0.98 }}
            className="mx-auto flex h-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/14 bg-zinc-900"
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-indigo-300" />
                <p className="font-bold">Nikhil Shukla Resume</p>
              </div>
              <div className="flex items-center gap-2">
                <a href={profile.resume} download className="grid h-10 w-10 place-items-center rounded-full bg-white/8 text-white hover:text-indigo-300" aria-label="Download resume">
                  <Download className="h-4 w-4" />
                </a>
                <button onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full bg-white/8 text-white hover:text-red-300" aria-label="Close resume">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <iframe className="h-full w-full bg-white" src={profile.resume} title="Nikhil Shukla resume PDF" />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}
