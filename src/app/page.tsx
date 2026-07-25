import { CapabilityRow } from "@/components/CapabilityRow";

const capabilities = [
  {
    index: "01",
    region: "Narrative",
    title: "Media narrative comparison",
    description:
      "Walk the conflict timeline and read Western, Middle Eastern, and financial coverage of the same events side by side.",
    accentClass: "text-west",
    delayClass: "animate-reveal-1",
  },
  {
    index: "02",
    region: "GraphRAG",
    title: "Graph analysis",
    description:
      "Trace entities, actors, and relationships through an interactive knowledge graph built from the article corpus.",
    accentClass: "text-mena",
    delayClass: "animate-reveal-2",
  },
  {
    index: "03",
    region: "LLM",
    title: "Fine-tuned intelligence",
    description:
      "Ask a model trained on 2,200+ Iran–US articles — answers grounded in source text, not generic summaries.",
    accentClass: "text-finance",
    delayClass: "animate-reveal-3",
  },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-5%,#f7f8fa_0%,transparent_60%)]" />
        <div className="paper-grain absolute inset-0" />
      </div>

      <div className="relative z-10">
        <section className="relative flex min-h-[100svh] flex-col">
          {/* Full-bleed framing plane */}
          <div className="relative min-h-[48vh] flex-1">
            <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 pt-7 sm:px-10">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
                2025–2026 corpus
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
                Cross-source framing
              </p>
            </header>

            <div className="frame-plane absolute inset-0" aria-hidden>
              <div className="frame-plane__col text-west">
                <p className="absolute left-6 top-16 font-mono text-[10px] uppercase tracking-[0.2em] text-west/75 sm:left-10">
                  Western
                </p>
                <div className="frame-plane__lines">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </div>
              <div className="frame-plane__col text-mena">
                <p className="absolute left-6 top-16 font-mono text-[10px] uppercase tracking-[0.2em] text-mena/75 sm:left-10">
                  Middle East
                </p>
                <div className="frame-plane__lines">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </div>
              <div className="frame-plane__col text-finance">
                <p className="absolute right-6 top-16 font-mono text-[10px] uppercase tracking-[0.2em] text-finance/75 sm:right-10">
                  Financial
                </p>
                <div className="frame-plane__lines">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </div>
              <div className="absolute bottom-0 left-[33.333%] top-0 w-px bg-border/90" />
              <div className="absolute bottom-0 left-[66.666%] top-0 w-px bg-border/90" />
            </div>

            {/* Fade into copy band */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-t from-background to-transparent" />
          </div>

          <div className="relative z-20 mx-auto w-full max-w-6xl px-6 pb-14 pt-2 sm:px-8 sm:pb-16">
            <p className="animate-reveal font-display text-[clamp(3.5rem,12vw,7rem)] font-medium leading-[0.9] tracking-[-0.03em] text-foreground">
              MediaLens
            </p>

            <div className="animate-rule mt-6 h-px w-20 bg-accent" />

            <h1 className="animate-reveal-1 mt-6 max-w-lg font-display text-[1.4rem] font-normal italic leading-snug text-foreground sm:text-[1.75rem]">
              Same events. Three frames. The bias between them.
            </h1>

            <p className="animate-reveal-2 mt-4 max-w-md text-[15px] leading-relaxed text-muted sm:text-base">
              Compare how Western, Middle Eastern, and financial outlets cover
              the Iran–US conflict — spin, omissions, and stance made visible.
            </p>

            <div className="animate-reveal-3 mt-8 flex flex-wrap items-center gap-5">
              <a
                href="#capabilities"
                className="inline-flex items-center bg-[#12151a] px-5 py-3 text-[13px] font-medium tracking-wide text-[#f4f5f7] transition-opacity hover:opacity-80"
              >
                Enter the archive
              </a>
              <span className="font-mono text-[11px] text-muted">
                2,286 articles indexed
              </span>
            </div>
          </div>
        </section>

        <section
          id="capabilities"
          className="border-t border-border bg-paper/70"
        >
          <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 sm:py-20">
            <div className="mb-2 flex items-end justify-between gap-6">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                  Three instruments
                </p>
                <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
                  How the story is cut
                </h2>
              </div>
              <p className="hidden max-w-[15rem] text-right text-sm leading-relaxed text-muted sm:block">
                Each lens reads the same corpus. Together they show what a
                single source hides.
              </p>
            </div>

            <div className="mt-6 border-b border-border">
              {capabilities.map((item) => (
                <CapabilityRow key={item.index} {...item} />
              ))}
            </div>
          </div>
        </section>

        <footer className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            MediaLens · Iran–US research hub
          </p>
          <p className="text-sm text-muted">
            Framing engine · Dataset 2025–2026
          </p>
        </footer>
      </div>
    </div>
  );
}
