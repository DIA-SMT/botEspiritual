"use client";

import {
  FormEvent,
  KeyboardEvent,
  SVGProps,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type AvatarState = "idle" | "thinking" | "speaking";

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
    SpeechRecognition?: new () => BrowserSpeechRecognition;
  }
}

const initialMessage: Message = {
  role: "assistant",
  content:
    "Bienvenido. Soy tu guia espiritual para esta Semana Santa en El Rosedal, Parque 9 de Julio. Puedo acompanarte con reflexiones sobre el Via Crucis, ayudas para orar, rezos breves, mensajes de esperanza y tambien orientarte sobre el recorrido, el ingreso y los horarios del encuentro.",
};

const IDLE_AVATAR_VIDEOS = ["/asentamiento.mp4", "/animacionManos.mp4"] as const;

const AVATAR_VIDEO_BY_STATE: Record<AvatarState, string> = {
  idle: IDLE_AVATAR_VIDEOS[0],
  thinking: "/pensamiento.mp4",
  speaking: "/habla.mp4",
};

function CrossIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
      <path d="M12 4v16" strokeLinecap="round" />
      <path d="M7.5 8.5h9" strokeLinecap="round" />
    </svg>
  );
}

function CrownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
      <path d="M5 15.5c2.1-4.8 3.2-7.2 3.2-7.2.7 1.3 1.9 2 3.8 2s3.1-.7 3.8-2c0 0 1.1 2.4 3.2 7.2" />
      <path d="M6.5 18h11" strokeLinecap="round" />
      <circle cx="8.3" cy="7.7" r="1" />
      <circle cx="12" cy="6.5" r="1" />
      <circle cx="15.7" cy="7.7" r="1" />
    </svg>
  );
}

function PathIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
      <path d="M5 18c3.8-1 5.3-4.3 7-7.4 1.5-2.7 3.2-4.8 7-4.6" strokeLinecap="round" />
      <path d="M15.4 5.9H19v3.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MicIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
      <path d="M12 4a2.5 2.5 0 0 1 2.5 2.5v5a2.5 2.5 0 0 1-5 0v-5A2.5 2.5 0 0 1 12 4Z" />
      <path d="M6.8 11.3a5.2 5.2 0 0 0 10.4 0" strokeLinecap="round" />
      <path d="M12 16.5V20" strokeLinecap="round" />
      <path d="M9.5 20h5" strokeLinecap="round" />
    </svg>
  );
}

function StopIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <rect x="6.5" y="6.5" width="11" height="11" rx="2.5" />
    </svg>
  );
}

function MenuIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
    </svg>
  );
}

function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  );
}

function ArrowLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" {...props}>
      <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SidebarContent() {
  return (
    <div className="flex h-full flex-col">
      <div className="relative z-10 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-[1.4rem] border border-amber-200/30 bg-white/10 text-amber-300 shadow-lg shadow-black/10">
          <CrossIcon className="h-7 w-7" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.34em] text-amber-300/90">Semana Santa</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">Guía Espiritual</h2>
        </div>
      </div>

      <div className="relative z-10 mt-10 grid gap-4">
        <div className="rounded-[1.6rem] border border-white/10 bg-white/8 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-200/20 bg-white/10 text-amber-200">
              <PathIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Via Crucis</p>
              <p className="mt-1 text-sm leading-6 text-purple-100/85">
                Acompañamiento para comprender el sentido espiritual de cada estación y del camino de la cruz.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.6rem] border border-white/10 bg-white/8 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-200/20 bg-white/10 text-amber-200">
              <CrownIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Reflexión y Esperanza</p>
              <p className="mt-1 text-sm leading-6 text-purple-100/85">
                Mensajes sobrios para la contemplación, la fe y el encuentro comunitario durante las celebraciones.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-auto rounded-[1.8rem] border border-amber-200/15 bg-gradient-to-br from-white/10 to-transparent p-6">
        <div className="grid grid-cols-[20px_1fr_20px] items-center gap-3 text-amber-300/90">
          <span className="h-px bg-current" />
          <span className="text-center text-xs uppercase tracking-[0.34em]">Via Lucis in Cruce</span>
          <span className="h-px bg-current" />
        </div>
        <p className="mt-4 text-sm leading-7 text-purple-100/95">
          Un espacio contemplativo pensado para el evento, el recogimiento y la participación en Semana Santa.
        </p>
      </div>
    </div>
  );
}

function pickMaleVoice(voices: SpeechSynthesisVoice[]) {
  const spanishVoices = voices.filter((v) => v.lang.toLowerCase().startsWith("es"));
  
  // High quality / Premium hints
  const premiumHint = /(siri|premium|enhanced|hq|high|neural|google)/i;
  // Male hints
  const maleHint = /(male|mascul|diego|carlos|jorge|juan|miguel|pablo|antonio|raul|federico|martin|tomas|lucas|enrique|ricardo|victor|esteban|guillermo|alberto|sergio|alejandro|pascual|javier|rodrigo|oscar|alfonso|mateo|alvaro|gonzalo|german|facundo|felipe|sebastian|ignacio|bautista|marco|hugo|adriano|marcus)/i;
  // Female blacklist
  const femaleBlacklist = /(female|hembra|mujer|zira|sabrina|helena|laura|lucia|paulina|monica|angela|conchita|marta|elena|rosa|esperanza|victoria|juana|teresa|isabel|sofia|maria|lupita|claudia|silvia|patricia|daria|clara|valentina|camila|martina|catalina|antonella|renata|olivia|florencia|agostina)/i;

  const getBestInList = (list: SpeechSynthesisVoice[]) => {
    const valid = list.filter((v) => !femaleBlacklist.test(v.name));
    if (!valid.length && !list.length) return null;
    const pool = valid.length ? valid : list;
    return (
      pool.find((v) => premiumHint.test(v.name) && maleHint.test(v.name)) ||
      pool.find((v) => maleHint.test(v.name)) ||
      pool[0]
    );
  };

  // 1. Try to find the best Spanish male voice
  const bestSpanish = getBestInList(spanishVoices);
  if (bestSpanish && (maleHint.test(bestSpanish.name) || !femaleBlacklist.test(bestSpanish.name))) {
    return bestSpanish;
  }

  // 2. If no Spanish male voice, search across ALL available voices (e.g., English male)
  const bestAny = getBestInList(voices);
  return bestAny || (spanishVoices.length ? spanishVoices[0] : voices[0]);
}


function muteVideoElement(video: HTMLVideoElement | null) {
  if (!video) return;
  video.muted = true;
  video.defaultMuted = true;
  video.volume = 0;
}

function sanitizeSpeechText(text: string) {
  return text
    .replace(/([A-Za-zÃƒÆ’Ã‚ÂÃƒÆ’Ã¢â‚¬Â°ÃƒÆ’Ã‚ÂÃƒÆ’Ã¢â‚¬Å“ÃƒÆ’Ã…Â¡ÃƒÆ’Ã‚Â¡ÃƒÆ’Ã‚Â©ÃƒÆ’Ã‚Â­ÃƒÆ’Ã‚Â³ÃƒÆ’Ã‚ÂºÃƒÆ’Ã¢â‚¬ËœÃƒÆ’Ã‚Â±]+)\/([A-Za-zÃƒÆ’Ã‚ÂÃƒÆ’Ã¢â‚¬Â°ÃƒÆ’Ã‚ÂÃƒÆ’Ã¢â‚¬Å“ÃƒÆ’Ã…Â¡ÃƒÆ’Ã‚Â¡ÃƒÆ’Ã‚Â©ÃƒÆ’Ã‚Â­ÃƒÆ’Ã‚Â³ÃƒÆ’Ã‚ÂºÃƒÆ’Ã¢â‚¬ËœÃƒÆ’Ã‚Â±]+)/g, "$1")
    .replace(/[ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢Ãƒâ€šÃ‚Â·]/g, ". ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarMode, setAvatarMode] = useState(false);
  const [avatarState, setAvatarState] = useState<AvatarState>("idle");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voiceInputSupported, setVoiceInputSupported] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [idleVideoIndex, setIdleVideoIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const avatarVideoRef = useRef<HTMLVideoElement | null>(null);
  const idlePrimaryVideoRef = useRef<HTMLVideoElement | null>(null);
  const idleSecondaryVideoRef = useRef<HTMLVideoElement | null>(null);
  const avatarSectionRef = useRef<HTMLElement | null>(null);
  const messagesContainerRef = useRef<HTMLElement | null>(null);
  const shouldStickToBottomRef = useRef(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);

  const latestAssistantMessage = useMemo(
    () => [...messages].reverse().find((message) => message.role === "assistant") || null,
    [messages]
  );

  useEffect(() => {
    setSpeechSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    setVoiceInputSupported(
      typeof window !== "undefined" &&
      Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
    );

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      if ("onvoiceschanged" in window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateAppHeight = () => {
      const vv = window.visualViewport;
      const height = vv ? Math.round(vv.height) : window.innerHeight;
      const offset = vv ? Math.round(vv.offsetTop) : 0;

      document.documentElement.style.setProperty("--app-height", `${height}px`);

      if (avatarMode && offset > 0) {
        window.scrollTo(0, offset);
      }
    };

    updateAppHeight();
    window.addEventListener("resize", updateAppHeight);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", updateAppHeight);
      window.visualViewport.addEventListener("scroll", updateAppHeight);
    }

    return () => {
      window.removeEventListener("resize", updateAppHeight);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", updateAppHeight);
        window.visualViewport.removeEventListener("scroll", updateAppHeight);
      }
    };
  }, [avatarMode]);

  useEffect(() => {
    if (!shouldStickToBottomRef.current || avatarMode) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading, avatarMode]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [input]);

  useEffect(() => {
    if (avatarMode) return;
    stopAudio();
    stopRecording();
    setAvatarState("idle");
  }, [avatarMode]);

  useEffect(() => {
    if (!avatarMode) {
      setIdleVideoIndex(0);
      return;
    }

    if (avatarState !== "idle") {
      idlePrimaryVideoRef.current?.pause();
      idleSecondaryVideoRef.current?.pause();
      return;
    }

    const activeVideo = idleVideoIndex === 0 ? idlePrimaryVideoRef.current : idleSecondaryVideoRef.current;
    const inactiveVideo = idleVideoIndex === 0 ? idleSecondaryVideoRef.current : idlePrimaryVideoRef.current;

    muteVideoElement(activeVideo);
    muteVideoElement(inactiveVideo);

    if (inactiveVideo) {
      inactiveVideo.pause();
      inactiveVideo.currentTime = 0;
    }

    if (activeVideo) {
      activeVideo.currentTime = 0;
      void activeVideo.play().catch(() => undefined);
    }
  }, [avatarMode, avatarState, idleVideoIndex]);

  useEffect(() => {
    muteVideoElement(avatarVideoRef.current);
    muteVideoElement(idlePrimaryVideoRef.current);
    muteVideoElement(idleSecondaryVideoRef.current);
  }, [avatarMode, avatarState, idleVideoIndex]);

  function stopAudio() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;
    setAvatarState((current) => (current === "thinking" ? current : "idle"));
  }

  function handleAvatarVideoEnded() {
    if (avatarState !== "idle") return;

    const nextIndex = idleVideoIndex === 0 ? 1 : 0;
    const currentVideo = idleVideoIndex === 0 ? idlePrimaryVideoRef.current : idleSecondaryVideoRef.current;
    const nextVideo = nextIndex === 0 ? idlePrimaryVideoRef.current : idleSecondaryVideoRef.current;

    muteVideoElement(currentVideo);
    muteVideoElement(nextVideo);

    if (nextVideo) {
      nextVideo.currentTime = 0;
      void nextVideo.play().catch(() => undefined);
    }

    window.setTimeout(() => {
      if (currentVideo) {
        currentVideo.pause();
        currentVideo.currentTime = 0;
      }
    }, 180);

    setIdleVideoIndex(nextIndex);
  }

  function stopRecording() {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsRecording(false);
  }

  function speakAssistantReply(text: string) {
    if (!avatarMode || !speechSupported || typeof window === "undefined" || !("speechSynthesis" in window)) {
      setAvatarState("idle");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(sanitizeSpeechText(text));
    const preferredVoice = pickMaleVoice(window.speechSynthesis.getVoices());

    if (preferredVoice) {
      utterance.voice = preferredVoice;
      utterance.lang = preferredVoice.lang;
    } else {
      utterance.lang = "es-AR";
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setAvatarState("speaking");
    utterance.onend = () => {
      utteranceRef.current = null;
      setAvatarState("idle");
    };
    utterance.onerror = () => {
      utteranceRef.current = null;
      setAvatarState("idle");
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }

  async function sendMessage(content: string) {
    if (!content.trim() || isLoading) return;

    shouldStickToBottomRef.current = true;

    if (avatarMode) {
      textareaRef.current?.blur();
      avatarSectionRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      setAvatarState("thinking");
      stopAudio();
    }

    const nextMessages: Message[] = [...messages, { role: "user", content: content.trim() }];
    setMessages([...nextMessages, { role: "assistant", content: "" }]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "No se pudo enviar el mensaje.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantReply = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        assistantReply += decoder.decode(value, { stream: true });

        setMessages((current) => {
          const updated = [...current];
          updated[updated.length - 1] = {
            role: "assistant",
            content: assistantReply,
          };
          return updated;
        });
      }

      if (!assistantReply.trim()) {
        throw new Error("La respuesta llego vacia.");
      }

      if (avatarMode) {
        speakAssistantReply(assistantReply);
      } else {
        setAvatarState("idle");
      }
    } catch (err) {
      setMessages((current) =>
        current.filter(
          (message, index) =>
            !(
              index === current.length - 1 &&
              message.role === "assistant" &&
              !message.content
            )
        )
      );

      const message = err instanceof Error ? err.message : "Ocurrio un error inesperado.";
      setError(message);
      setAvatarState("idle");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    if (avatarMode && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(""));
    }

    await sendMessage(input);

    if (avatarMode && typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (!avatarMode && typeof window !== "undefined" && window.innerWidth < 768) {
      textareaRef.current?.blur();
      window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 60);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit();
    }
  }

  function handleMessagesScroll() {
    const container = messagesContainerRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    shouldStickToBottomRef.current = distanceFromBottom < 96;
  }

  function toggleRecording() {
    if (!voiceInputSupported || typeof window === "undefined") return;

    if (avatarMode && "speechSynthesis" in window) {
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(""));
    }

    if (isRecording) {
      stopRecording();
      return;
    }

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return;

    const recognition = new Recognition();
    recognition.lang = "es-AR";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || "")
        .join(" ")
        .trim();

      if (transcript) {
        setInput(transcript);
        void sendMessage(transcript);
      }
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setIsRecording(false);
    };
    recognition.onerror = () => {
      recognitionRef.current = null;
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    setIsRecording(true);
    recognition.start();
  }

  return (
    <main className="fixed inset-0 flex overflow-hidden bg-white text-slate-900" style={{ height: "var(--app-height, 100dvh)", minHeight: "var(--app-height, 100dvh)" }}>
      <section className="relative mx-auto flex h-full w-full max-w-7xl px-0 py-0 sm:px-3 sm:py-3 xl:px-5 xl:py-5">
        <div className="grid h-full w-full min-h-0 overflow-hidden bg-white/92 shadow-[0_24px_60px_-32px_rgba(76,29,149,0.22)] sm:rounded-[2rem] xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="relative hidden overflow-hidden border-r border-purple-100/80 bg-[linear-gradient(180deg,rgba(70,16,25,0.98),rgba(88,28,135,0.96))] xl:flex xl:flex-col xl:p-8">
            <SidebarContent />
          </aside>

          <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
            <header className={["relative z-10 shrink-0 border-b border-purple-100/80 bg-white/88 px-4 pb-3 pt-[max(0.85rem,env(safe-area-inset-top))] sm:px-5 sm:pb-4 md:px-7", avatarMode ? "hidden md:flex bg-transparent border-b-0 px-0 pb-0 pt-0" : "flex"].join(" ")}>
              <div className="flex w-full items-start justify-between gap-3 sm:gap-4">
                {!avatarMode && (
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen(true)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-100 bg-white text-slate-700 shadow-sm transition hover:bg-purple-50 xl:hidden"
                    aria-label="Abrir menú"
                  >
                    <MenuIcon className="h-5 w-5" />
                  </button>
                )}

                <div className={["min-w-0 flex-1", avatarMode ? "hidden md:block" : "block"].join(" ")}>
                  <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-amber-700 sm:text-[11px]">
                    Semana Santa en San Miguel de Tucumán
                  </p>
                  <h1 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl md:text-[2rem] lg:mt-2">
                    Guía Espiritual
                  </h1>
                  <p className="mt-1 max-w-xl text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6 lg:mt-2">
                    Acompañamiento espiritual para el Via Crucis y la reflexión.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setAvatarMode((current) => !current)}
                  className={[
                    "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] transition sm:px-5 sm:py-2.5 sm:text-xs sm:tracking-[0.18em]",
                    avatarMode
                      ? "border-amber-300 bg-amber-50/90 text-amber-800 shadow-sm"
                      : "border-purple-100 bg-white text-slate-700 shadow-sm hover:bg-purple-50",
                  ].join(" ")}
                >
                  <CrossIcon className="h-4 w-4" />
                  <span>{avatarMode ? "Volver" : "Avatar"}</span>
                </button>
              </div>
            </header>

            {avatarMode ? (
              <section
                ref={avatarSectionRef}
                className={["relative z-10 flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto", avatarMode ? "p-0 sm:px-5 sm:py-4 md:px-6 lg:overflow-hidden lg:px-7" : "px-3 py-3 sm:px-5 sm:py-4 md:px-6"].join(" ")}
              >
                {avatarMode && (
                  <button
                    type="button"
                    onClick={() => setAvatarMode(false)}
                    className="absolute left-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/40 text-slate-900 shadow-lg backdrop-blur-md transition hover:bg-white/60 md:hidden"
                    aria-label="Cerrar avatar"
                  >
                    <ArrowLeftIcon className="h-6 w-6" />
                  </button>
                )}
                <div className="mx-auto grid h-full w-full max-w-5xl min-h-0 flex-1 grid-cols-1 gap-0 sm:gap-3 md:gap-4 lg:grid-cols-[minmax(280px,0.9fr)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)_auto] lg:items-stretch">
                  <div className="flex min-h-0 w-full flex-1 flex-col gap-2 md:max-w-3xl md:self-center lg:max-h-full lg:max-w-none">
                    <div className={["relative flex w-full flex-col overflow-hidden border-purple-100 bg-white shadow-2xl transition-[height] duration-300 sm:rounded-[1.5rem] sm:border sm:shadow-[0_18px_40px_-28px_rgba(88,28,135,0.22)]", isInputFocused ? "h-[25vh]" : "h-[65vh] sm:h-auto sm:min-h-[420px] sm:flex-1"].join(" ")}>
                      <div className="relative min-h-0 w-full flex-1 bg-slate-900">
                        {avatarState === "idle" ? (
                          <>
                            <video
                              ref={idlePrimaryVideoRef}
                              src={IDLE_AVATAR_VIDEOS[0]}
                              autoPlay
                              muted
                              playsInline
                              preload="auto"
                              onEnded={idleVideoIndex === 0 ? handleAvatarVideoEnded : undefined}
                              onLoadedMetadata={(event) => muteVideoElement(event.currentTarget)}
                              className={[
                                "absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-300",
                                idleVideoIndex === 0 ? "opacity-100" : "opacity-0 pointer-events-none",
                              ].join(" ")}
                            />
                            <video
                              ref={idleSecondaryVideoRef}
                              src={IDLE_AVATAR_VIDEOS[1]}
                              muted
                              playsInline
                              preload="auto"
                              onEnded={idleVideoIndex === 1 ? handleAvatarVideoEnded : undefined}
                              onLoadedMetadata={(event) => muteVideoElement(event.currentTarget)}
                              className={[
                                "absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-300",
                                idleVideoIndex === 1 ? "opacity-100" : "opacity-0 pointer-events-none",
                              ].join(" ")}
                            />
                          </>
                        ) : (
                          <video
                            ref={avatarVideoRef}
                            key={avatarState}
                            src={AVATAR_VIDEO_BY_STATE[avatarState]}
                            autoPlay
                            muted
                            playsInline
                            loop
                            onLoadedMetadata={(event) => muteVideoElement(event.currentTarget)}
                            className="h-full w-full object-cover object-top"
                          />
                        )}
                      </div>

                    </div>

                    <div className="mb-2 grid w-full grid-cols-2 gap-3 px-4 sm:mb-0 sm:px-0 lg:hidden">
                      <button
                        type="button"
                        onClick={stopAudio}
                        disabled={avatarState !== "speaking"}
                        className="flex items-center justify-center gap-2 rounded-2xl bg-white/90 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-700 shadow-sm ring-1 ring-purple-100 transition hover:bg-white disabled:opacity-40 sm:py-3 sm:text-xs"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                        Detener
                      </button>

                      <button
                        type="button"
                        onClick={toggleRecording}
                        disabled={!voiceInputSupported || isLoading}
                        className={[
                          "flex items-center justify-center gap-2 rounded-2xl py-4 text-[11px] font-bold uppercase tracking-[0.12em] shadow-md transition disabled:opacity-50 sm:py-3 sm:text-xs",
                          isRecording
                            ? "bg-amber-100 text-amber-900 ring-2 ring-amber-400 animate-pulse"
                            : "bg-purple-600 text-white shadow-purple-200 hover:bg-purple-700",
                        ].join(" ")}
                      >
                        <MicIcon className="h-3.5 w-3.5" />
                        {isRecording ? "Grabando" : "Hablar"}
                      </button>
                    </div>
                  </div>

                  <div className="hidden min-h-0 flex-col gap-3 lg:flex">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={stopAudio}
                        disabled={avatarState !== "speaking"}
                        className="flex items-center justify-center gap-2 rounded-2xl bg-white p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-700 shadow-sm ring-1 ring-purple-100 transition hover:bg-slate-50 disabled:opacity-40"
                      >
                        <StopIcon className="h-4 w-4" />
                        Detener
                      </button>

                      <button
                        type="button"
                        onClick={toggleRecording}
                        disabled={!voiceInputSupported || isLoading}
                        className={[
                          "flex items-center justify-center gap-2 rounded-2xl p-4 text-xs font-bold uppercase tracking-[0.12em] shadow-lg transition disabled:opacity-50",
                          isRecording
                            ? "bg-amber-100 text-amber-900 ring-2 ring-amber-400 animate-pulse"
                            : "bg-purple-600 text-white shadow-purple-300 hover:bg-purple-700",
                        ].join(" ")}
                      >
                        <MicIcon className="h-4 w-4" />
                        {isRecording ? "Grabando" : "Hablar"}
                      </button>
                    </div>
                    <div className="shrink-0 rounded-[1.4rem] border border-purple-100 bg-white p-4 shadow-[0_18px_40px_-28px_rgba(88,28,135,0.16)]">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-700">Avatar espiritual</p>
                      <p className="mt-2 text-[13px] leading-6 text-slate-700">
                        {avatarState === "thinking" &&
                          "El guia esta preparando la respuesta para acompanarte en tu consulta."}
                        {avatarState === "speaking" &&
                          "El guia esta respondiendo con voz mientras se reproduce el video de habla."}
                        {avatarState === "idle" &&
                          "El guia esta disponible para recibir nuevas preguntas, rezos o pedidos de orientacion."}
                      </p>
                    </div>

                    {latestAssistantMessage && (
                      <div className="flex min-h-0 flex-1 flex-col rounded-[1.4rem] border border-purple-100 bg-white p-4 shadow-[0_18px_40px_-28px_rgba(88,28,135,0.16)]">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-700">Ultima respuesta</p>
                        <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1 text-[13px] leading-6 text-slate-700">
                          {latestAssistantMessage.content}
                        </div>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleSubmit} className="w-full bg-white px-4 pb-6 pt-2 shadow-[0_-10px_20px_-10px_rgba(88,28,135,0.08)] sm:rounded-[1.4rem] sm:border sm:border-purple-100 sm:p-2 sm:shadow-[0_18px_40px_-28px_rgba(88,28,135,0.16)] md:max-w-3xl md:self-center lg:col-span-2 lg:max-w-none lg:self-end">
                    <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-end">
                      <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Escribe tu mensaje..."
                        rows={1}
                        className="min-h-[52px] w-full flex-1 resize-none overflow-y-auto rounded-[1rem] bg-transparent px-3 py-3 text-base text-slate-900 outline-none placeholder:text-slate-400 sm:text-sm"
                        disabled={isLoading}
                      />
                      <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="inline-flex h-12 w-full shrink-0 items-center justify-center rounded-full bg-purple-900 px-5 text-sm font-semibold text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                      >
                        {isLoading ? "Guiando..." : "Enviar"}
                      </button>
                    </div>
                    <p className="mt-2 hidden text-xs leading-5 text-slate-500 lg:block">
                      La voz se reproducira en tono masculino cuando el navegador disponga de una voz en espanol compatible.
                    </p>
                  </form>
                </div>
              </section>
            ) : (
              <>
                <section
                  ref={messagesContainerRef}
                  onScroll={handleMessagesScroll}
                  className="relative z-10 min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-5 sm:py-4 md:px-7"
                >
                  <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-3 sm:gap-4">
                    {messages.map((message, index) => {
                      const isUser = message.role === "user";
                      const isStreamingBubble =
                        isLoading &&
                        index === messages.length - 1 &&
                        message.role === "assistant";

                      return (
                        <div
                          key={`${message.role}-${index}`}
                          className={`flex ${isUser ? "justify-end" : "justify-start"} animate-[fadeIn_0.35s_ease]`}
                        >
                          <div
                            className={[
                              "max-w-[92%] rounded-[1.45rem] px-4 py-3 text-sm leading-6 shadow-sm sm:max-w-[82%] sm:rounded-[1.7rem] sm:px-5 sm:leading-7 md:max-w-[76%]",
                              isUser
                                ? "border border-slate-200/80 bg-white text-slate-900 shadow-[0_12px_35px_-22px_rgba(15,23,42,0.42)]"
                                : "border border-purple-100/80 bg-gradient-to-br from-purple-50 to-white text-slate-800 shadow-[0_18px_40px_-28px_rgba(88,28,135,0.35)]",
                            ].join(" ")}
                          >
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-500 sm:text-[11px] sm:tracking-[0.28em]">
                              {isUser ? "Tu" : "Guia"}
                            </p>
                            <p className="whitespace-pre-wrap break-words">
                              {isUser ? message.content : message.content.replace(/\*\*/g, "")}
                              {isStreamingBubble && (
                                <span className="ml-1 inline-block h-5 w-[2px] animate-pulse rounded-full bg-amber-500 align-middle" />
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {error && (
                      <div className="rounded-[1.35rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
                        {error}
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </section>

                <form
                  onSubmit={handleSubmit}
                  className="relative z-10 shrink-0 border-t border-purple-100/80 bg-white/88 px-3 pb-[calc(0.85rem+env(safe-area-inset-bottom))] pt-3 sm:px-5 sm:pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pt-4 md:px-7"
                >
                  <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
                    <div className="flex items-end gap-2 rounded-[1.5rem] border border-purple-100/80 bg-white p-2 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.18)] sm:gap-3 sm:rounded-[1.75rem]">
                      <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => setIsInputFocused(false)}
                        placeholder="Escribe tu mensaje..."
                        rows={1}
                        className="min-h-[50px] flex-1 resize-none overflow-y-auto rounded-[1.1rem] bg-transparent px-3 py-3 text-base text-slate-900 outline-none placeholder:text-slate-400 sm:min-h-[52px] sm:px-4 sm:text-sm"
                        disabled={isLoading}
                      />
                      <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-purple-900 px-4 text-sm font-medium text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60 sm:h-12 sm:px-5"
                      >
                        {isLoading ? "Guiando..." : "Enviar"}
                      </button>
                    </div>

                    <div className="text-center text-[10px] leading-4 text-amber-700 sm:text-right sm:text-xs">
                      Diseñado por la Dirección de Inteligencia Artificial de la Municipalidad de San Miguel de Tucumán
                    </div>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Mobile Drawer */}
      <div
        className={[
          "fixed inset-0 z-[100] transition-opacity duration-300 xl:hidden",
          isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
      >
        <div
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />
        <aside
          className={[
            "absolute inset-y-0 left-0 w-[280px] bg-[linear-gradient(180deg,rgba(70,16,25,1),rgba(88,28,135,1))] p-6 shadow-2xl transition-transform duration-300 ease-out sm:w-[320px]",
            isMenuOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-200/30 bg-white/10 text-amber-300">
                <CrossIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-amber-300/80 font-medium">Semana Santa</p>
                <p className="text-lg font-bold tracking-tight text-white">Guía Espiritual</p>
              </div>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-white/70 hover:bg-white/10 transition-colors"
              aria-label="Cerrar menú"
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="mt-10 grid gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-amber-200">
                  <PathIcon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Via Crucis</p>
                  <p className="mt-1 text-xs leading-5 text-purple-100/70">
                    Acompañamiento espiritual en cada estación del camino de la cruz.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-amber-200">
                  <CrownIcon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Reflexión y Esperanza</p>
                  <p className="mt-1 text-xs leading-5 text-purple-100/70">
                    Mensajes para la contemplación y el encuentro durante las celebraciones.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-10">
            <div className="rounded-2xl border border-amber-200/10 bg-gradient-to-br from-white/5 to-transparent p-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-amber-300/60 font-semibold mb-3">Vía Lucis in Cruce</p>
              <p className="text-xs leading-6 text-purple-100/80">
                Un espacio contemplativo para el recogimiento y la participación en comunidad.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}



