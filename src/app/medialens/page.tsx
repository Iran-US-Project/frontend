import { InstrumentShell } from "@/components/InstrumentShell";

const frames = [
  {
    region: "Western",
    accent: "text-west",
    wash: "bg-west/[0.06]",
    tone: "—",
    frame: "Awaiting analysis",
    facts: ["Emphasized facts will appear here", "Loaded phrasing extracted per outlet"],
  },
  {
    region: "Middle East",
    accent: "text-mena",
    wash: "bg-mena/[0.06]",
    tone: "—",
    frame: "Awaiting analysis",
    facts: ["Emphasized facts will appear here", "Omitted context surfaced against peers"],
  },
  {
    region: "Financial",
    accent: "text-finance",
    wash: "bg-finance/[0.06]",
    tone: "—",
    frame: "Awaiting analysis",
    facts: ["Emphasized facts will appear here", "Market and sanctions framing"],
  },
];

const timelineSlots = [
  { date: "2025-06", label: "Escalation window" },
  { date: "2025-09", label: "Diplomatic track" },
  { date: "2026-01", label: "Sanctions cycle" },
  { date: "2026-03", label: "Regional spillover" },
];

export default function MediaLensPage() {
  return (
    <InstrumentShell
      index="01"
      label="MediaLens"
      title="Media narrative comparison"
      description="Select an event window, then read Western, Middle Eastern, and financial coverage side by side — tone, frames, and omissions made visible."
      accentClass="text-west"
      frameColumns={[
        { label: "Western", accentClass: "text-west" },
        { label: "Middle East", accentClass: "text-mena" },
        { label: "Financial", accentClass: "text-finance", align: "right" },
      ]}
    >
      {/* Query scaffold */}
      <section className="border border-border bg-paper/80">
        <div className="flex flex-col gap-4 border-b border-border px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex-1">
            <label
              htmlFor="event-query"
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted"
            >
              Event or keyword
            </label>
            <input
              id="event-query"
              type="text"
              placeholder="e.g. Strait of Hormuz closure, nuclear talks…"
              disabled
              className="mt-2 w-full border-0 bg-transparent font-display text-lg text-foreground outline-none placeholder:text-muted/50 disabled:cursor-not-allowed"
            />
          </div>
          <button
            type="button"
            disabled
            className="shrink-0 bg-foreground/40 px-5 py-3 text-[13px] font-medium tracking-wide text-paper disabled:cursor-not-allowed"
          >
            Run comparison
          </button>
        </div>

        <div className="grid grid-cols-2 border-b border-border sm:grid-cols-4">
          {timelineSlots.map((slot) => (
            <button
              key={slot.date}
              type="button"
              disabled
              className="border-r border-border px-4 py-4 text-left last:border-r-0 disabled:cursor-not-allowed"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                {slot.date}
              </span>
              <span className="mt-1 block text-sm text-foreground/70">
                {slot.label}
              </span>
            </button>
          ))}
        </div>

        <p className="px-5 py-3 font-mono text-[11px] text-muted">
          Scaffold — agent pipeline (fetch → frame → synthesize) not wired yet
        </p>
      </section>

      {/* Side-by-side matrix */}
      <section className="mt-10">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 className="font-display text-2xl font-medium text-foreground">
            Framing matrix
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            Three regions
          </span>
        </div>

        <div className="grid border border-border md:grid-cols-3">
          {frames.map((col) => (
            <article
              key={col.region}
              className={`border-b border-border md:border-b-0 md:border-r md:last:border-r-0 ${col.wash}`}
            >
              <header className="border-b border-border px-5 py-4">
                <p
                  className={`font-mono text-[10px] uppercase tracking-[0.18em] ${col.accent}`}
                >
                  {col.region}
                </p>
                <p className="mt-2 font-display text-xl text-foreground">
                  {col.frame}
                </p>
                <p className="mt-1 font-mono text-[11px] text-muted">
                  Tone · {col.tone}
                </p>
              </header>
              <ul className="space-y-3 px-5 py-5">
                {col.facts.map((fact) => (
                  <li
                    key={fact}
                    className="border-l border-border pl-3 text-sm leading-relaxed text-muted"
                  >
                    {fact}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* Stance placeholder */}
      <section className="mt-10 border border-border bg-paper/60 px-5 py-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
          Aspect stance
        </p>
        <p className="mt-3 max-w-lg font-display text-xl text-foreground">
          Diplomacy · Sovereignty · Sanctions · Liquidity
        </p>
        <p className="mt-2 text-sm text-muted">
          Radar scores populate after synthesis. Scaffold only.
        </p>
      </section>
    </InstrumentShell>
  );
}
