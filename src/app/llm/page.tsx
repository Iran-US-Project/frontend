"use client";

import { FormEvent, useState } from "react";
import { InstrumentShell } from "@/components/InstrumentShell";

const prompts = [
  "How did Western and Middle Eastern outlets differ on the Hormuz incident?",
  "What actors appear most often in sanctions coverage?",
  "Summarize diplomatic framing in June 2025.",
];

type Message = {
  role: "user" | "assistant" | "system";
  body: string;
};

export default function LlmPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      body: "Scaffold chat — fine-tuned model and retrieval not connected yet. Questions will echo locally until the API is wired.",
    },
  ]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", body: trimmed },
      {
        role: "assistant",
        body: "Response pending. This instrument will ground answers in the 2,286-article corpus with source citations.",
      },
    ]);
    setInput("");
  }

  return (
    <InstrumentShell
      index="03"
      label="LLM"
      title="Fine-tuned intelligence"
      description="Ask questions against a model oriented on the Iran–US archive. Answers will cite sources once the chat backend is connected."
      accentClass="text-finance"
      frameColumns={[
        { label: "Query", accentClass: "text-west" },
        { label: "Corpus", accentClass: "text-mena" },
        { label: "Grounded", accentClass: "text-finance", align: "right" },
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <section className="flex min-h-[480px] flex-col border border-border bg-paper/80">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
              Session
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-finance">
              Offline
            </p>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-6">
            {messages.map((message, i) => (
              <div
                key={`${message.role}-${i}`}
                className={
                  message.role === "user"
                    ? "ml-8 border-l-2 border-foreground pl-4"
                    : message.role === "assistant"
                      ? "mr-8 border-l-2 border-finance/50 pl-4"
                      : "border-l border-border pl-4"
                }
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                  {message.role === "user"
                    ? "You"
                    : message.role === "assistant"
                      ? "Model"
                      : "System"}
                </p>
                <p className="mt-1.5 text-[15px] leading-relaxed text-foreground">
                  {message.body}
                </p>
              </div>
            ))}
          </div>

          <form
            onSubmit={onSubmit}
            className="border-t border-border px-5 py-4"
          >
            <label
              htmlFor="llm-input"
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted"
            >
              Ask the archive
            </label>
            <div className="mt-2 flex gap-3">
              <input
                id="llm-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pose a research question…"
                className="min-w-0 flex-1 border-0 bg-transparent font-display text-lg text-foreground outline-none placeholder:text-muted/50"
              />
              <button
                type="submit"
                className="shrink-0 bg-[#12151a] px-5 py-3 text-[13px] font-medium tracking-wide text-[#f4f5f7] transition-opacity hover:opacity-80"
              >
                Send
              </button>
            </div>
          </form>
        </section>

        <aside className="border border-border bg-paper/60">
          <div className="border-b border-border px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
              Starter prompts
            </p>
          </div>
          <ul>
            {prompts.map((prompt) => (
              <li key={prompt} className="border-b border-border last:border-b-0">
                <button
                  type="button"
                  onClick={() => setInput(prompt)}
                  className="w-full px-4 py-3 text-left text-sm leading-relaxed text-muted transition-colors hover:bg-foreground/[0.03] hover:text-foreground"
                >
                  {prompt}
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </InstrumentShell>
  );
}
