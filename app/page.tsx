"use client";

import { FormEvent, KeyboardEvent, SVGProps, useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const initialMessage: Message = {
  role: "assistant",
  content:
    "Bienvenido. Soy tu guia espiritual para esta Semana Santa en El Rosedal, Parque 9 de Julio. Puedo orientarte sobre el Via Crucis inmersivo, los horarios y el recorrido, pero tambien acompanarte con reflexiones, ayudas para orar, rezos breves, mensajes de esperanza y consultas sobre el sentido espiritual de este tiempo.",
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

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesContainerRef = useRef<HTMLElement | null>(null);
  const shouldStickToBottomRef = useRef(true);

  useEffect(() => {
    if (!shouldStickToBottomRef.current) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [input]);

  async function handleSubmit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    const content = input.trim();
    if (!content || isLoading) return;

    shouldStickToBottomRef.current = true;

    const nextMessages: Message[] = [...messages, { role: "user", content }];
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
    } finally {
      setIsLoading(false);
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

  return (
    <main className="relative flex h-[100dvh] overflow-hidden bg-transparent text-slate-900">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-52 w-52 -translate-x-1/2 rounded-full bg-amber-300/20 blur-3xl sm:h-64 sm:w-64" />
        <div className="absolute left-[6%] top-[10%] h-56 w-56 rounded-full bg-purple-900/10 blur-3xl sm:h-72 sm:w-72" />
        <div className="absolute bottom-[8%] right-[4%] h-64 w-64 rounded-full bg-red-200/20 blur-3xl sm:h-80 sm:w-80" />
      </div>

      <section className="relative mx-auto flex h-full w-full max-w-7xl px-0 py-0 sm:px-3 sm:py-3 xl:px-5 xl:py-5">
        <div className="grid h-full w-full min-h-0 overflow-hidden bg-white/74 shadow-[0_30px_80px_-30px_rgba(76,29,149,0.45)] backdrop-blur-xl sm:rounded-[2rem] xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="relative hidden overflow-hidden border-r border-purple-100/80 bg-[linear-gradient(180deg,rgba(70,16,25,0.96),rgba(88,28,135,0.94))] xl:flex xl:flex-col xl:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.22),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.07),transparent_38%)]" />
            <div className="absolute right-8 top-10 h-40 w-40 rounded-full border border-amber-300/20" />
            <div className="absolute bottom-10 left-8 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl" />

            <div className="relative z-10 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[1.4rem] border border-amber-200/30 bg-white/10 text-amber-300 shadow-lg shadow-black/10">
                <CrossIcon className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.34em] text-amber-300/90">Semana Santa</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">Guia Espiritual</h2>
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
                      Acompanamiento para comprender el sentido espiritual de cada estacion y del camino de la cruz.
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
                    <p className="text-sm font-semibold text-white">Reflexion y Esperanza</p>
                    <p className="mt-1 text-sm leading-6 text-purple-100/85">
                      Mensajes sobrios para la contemplacion, la fe y el encuentro comunitario durante las celebraciones.
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
                Un espacio contemplativo pensado para el evento, el recogimiento y la participacion en Semana Santa.
              </p>
            </div>
          </aside>

          <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
            <div className="pointer-events-none absolute inset-0 opacity-70">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(88,28,135,0.08),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.08),transparent_22%)]" />
              <div className="absolute right-3 top-3 h-20 w-20 rounded-full border border-amber-300/20 sm:right-6 sm:top-6 sm:h-24 sm:w-24" />
              <div className="absolute left-1/2 top-4 h-14 w-px -translate-x-1/2 bg-gradient-to-b from-amber-300/0 via-amber-300/60 to-amber-300/0 sm:top-6 sm:h-16" />
              <div className="absolute left-1/2 top-[2.7rem] h-px w-10 -translate-x-1/2 bg-gradient-to-r from-amber-300/0 via-amber-300/70 to-amber-300/0 sm:top-[3.35rem] sm:w-12" />
            </div>

            <header className="relative z-10 shrink-0 border-b border-purple-100/80 bg-white/70 px-4 pb-3 pt-[max(0.85rem,env(safe-area-inset-top))] backdrop-blur sm:px-5 sm:pb-4 md:px-7">
              <div className="flex items-start justify-between gap-3 sm:gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-amber-600 sm:text-[11px]">
                    Semana Santa en San Miguel de Tucuman
                  </p>
                  <h1 className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl md:text-[2rem]">
                    Guia Espiritual
                  </h1>
                  <p className="mt-2 max-w-xl text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">
                    Un chatbot de acompanamiento para el Via Crucis, la reflexion y el sentido espiritual de las celebraciones.
                  </p>
                </div>

                <div className="hidden items-center gap-2 rounded-full border border-amber-200 bg-amber-50/85 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-amber-700 md:inline-flex">
                  <CrossIcon className="h-4 w-4" />
                  <span>Via Crucis</span>
                </div>
              </div>

              <div className="mt-4 hidden grid-cols-1 gap-2 sm:grid sm:grid-cols-3 xl:hidden">
                <div className="rounded-2xl border border-purple-100 bg-white/85 px-3 py-3 text-left">
                  <div className="flex items-center gap-2 text-amber-700">
                    <PathIcon className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-[0.16em]">Via Crucis</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-purple-100 bg-white/85 px-3 py-3 text-left">
                  <div className="flex items-center gap-2 text-amber-700">
                    <CrownIcon className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-[0.16em]">Reflexion</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-purple-100 bg-white/85 px-3 py-3 text-left">
                  <div className="flex items-center gap-2 text-amber-700">
                    <CrossIcon className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-[0.16em]">Esperanza</span>
                  </div>
                </div>
              </div>
            </header>

            <section
              ref={messagesContainerRef}
              onScroll={handleMessagesScroll}
              className="relative z-10 min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-5 sm:py-4 md:px-7"
            >
              <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-3 sm:gap-4">
                {messages.map((message, index) => {
                  const isUser = message.role === "user";
                  const isStreamingBubble =
                    isLoading && index === messages.length - 1 && message.role === "assistant";

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
                          {message.content}
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
              className="relative z-10 shrink-0 border-t border-purple-100/80 bg-white/78 px-3 pb-[calc(0.85rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:px-5 sm:pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pt-4 md:px-7"
            >
              <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
                <div className="flex items-end gap-2 rounded-[1.5rem] border border-purple-100/80 bg-white/92 p-2 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.34)] sm:gap-3 sm:rounded-[1.75rem]">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Escribe tu mensaje sobre el Via Crucis, una reflexion o una consulta espiritual..."
                    rows={1}
                    className="min-h-[50px] flex-1 resize-none overflow-y-auto rounded-[1.1rem] bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 sm:min-h-[52px] sm:px-4"
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
                  Diseñado por la Dirección de Inteligencia artificial de la muncipalidad de San Miguel de Tucumán
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}


