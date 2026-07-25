import { CapabilityRow } from "@/components/CapabilityRow";
import { FramePlane } from "@/components/FramePlane";

const capabilities = [
  {
    index: "01",
    region: "MediaLens",
    title: "Media narrative comparison",
    description:
      "Same events, three frames. Compare how Western, Middle Eastern, and financial outlets cover the conflict — spin, omissions, and stance side by side.",
    accentClass: "text-west",
    delayClass: "animate-reveal-1",
    href: "/medialens",
  },
  {
    index: "02",
    region: "GraphRAG",
    title: "Graph analysis",
    description:
      "Trace entities, actors, and relationships through an interactive knowledge graph built from the article corpus.",
    accentClass: "text-mena",
    delayClass: "animate-reveal-2",
    href: "/graph",
  },
  {
    index: "03",
    region: "LLM",
    title: "Fine-tuned intelligence",
    description:
      "Ask a model trained on 2,200+ Iran–US articles — answers grounded in source text, not generic summaries.",
    accentClass: "text-finance",
    delayClass: "animate-reveal-3",
    href: "/llm",
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
          <div className="relative min-h-[48vh] flex-1">
            <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 pt-7 sm:px-10">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
                2025–2026 corpus
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
                Three instruments
              </p>
            </header>

            <FramePlane
              variant="hero"
              columns={[
                {
                  label: "MediaLens",
                  accentClass: "text-west",
                  href: "/medialens",
                },
                {
                  label: "GraphRAG",
                  accentClass: "text-mena",
                  href: "/graph",
                },
                {
                  label: "LLM",
                  accentClass: "text-finance",
                  href: "/llm",
                  align: "right",
                },
              ]}
            />

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-t from-background to-transparent" />
          </div>

          <div className="relative z-20 mx-auto w-full max-w-6xl px-6 pb-14 pt-2 sm:px-8 sm:pb-16">
            <p className="animate-reveal font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
              Welcome to
            </p>

            <h1 className="animate-reveal mt-3 max-w-3xl font-display text-[clamp(2.75rem,9vw,5.75rem)] font-medium leading-[0.95] tracking-[-0.03em] text-foreground">
              Iran–US
              <span className="mt-1 block text-[0.72em] font-normal italic text-foreground/90">
                War Research Hub
              </span>
            </h1>

            <div className="animate-rule mt-6 h-px w-20 bg-accent" />

            <div className="mt-8 grid gap-8 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] sm:items-end sm:gap-12 lg:gap-20">
              <div className="animate-reveal-1 max-w-xl">
                <p className="font-display text-[1.2rem] font-normal leading-snug text-foreground sm:text-[1.35rem]">
                  A workspace for investigating coverage, connections, and
                  questions across the conflict archive.
                </p>
                <p className="mt-4 text-[15px] leading-relaxed text-muted sm:text-base">
                  Three instruments on one corpus — narrative comparison,
                  knowledge graphs, and a fine-tuned model — built for
                  researchers, not summaries.
                </p>
              </div>

              <div className="animate-reveal-2 flex flex-col gap-3 sm:items-end sm:text-right">
                <a
                  href="#capabilities"
                  className="inline-flex w-fit items-center bg-[#12151a] px-5 py-3 text-[13px] font-medium tracking-wide text-[#f4f5f7] transition-opacity hover:opacity-80"
                >
                  Enter the archive
                </a>
                <span className="font-mono text-[11px] text-muted">
                  2,286 articles indexed
                </span>
              </div>
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
                  Instruments
                </p>
                <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
                  Choose a way in
                </h2>
              </div>
              <p className="hidden max-w-[15rem] text-right text-sm leading-relaxed text-muted sm:block">
                Same archive. Three modes of inquiry — pick the lens that fits
                the question.
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
            Iran–US war research hub
          </p>
          <p className="text-sm text-muted">
            MediaLens · GraphRAG · LLM · 2025–2026
          </p>
        </footer>
      </div>
    </div>
  );
}
