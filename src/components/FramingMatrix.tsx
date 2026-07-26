import type { RegionalFrame } from "@/lib/event-coverage";

type FramingMatrixProps = {
  eventTitle: string;
  frames: RegionalFrame[];
  mode: "sources" | "analysis";
  isAnalyzing?: boolean;
};

export function FramingMatrix({
  eventTitle,
  frames,
  mode,
  isAnalyzing = false,
}: FramingMatrixProps) {
  return (
    <section className="mt-10">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-medium text-foreground">
            Framing matrix
          </h2>
          <p className="mt-1 text-sm text-muted">{eventTitle}</p>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
          {mode === "analysis" ? "Synthesized frames" : "Regional source views"}
        </span>
      </div>

      <div
        className={`grid border border-border md:grid-cols-3 ${
          isAnalyzing ? "opacity-60" : ""
        }`}
      >
        {frames.map((col) => (
          <article
            key={col.region}
            className={`border-b border-border md:border-b-0 md:border-r md:last:border-r-0 ${col.wash}`}
          >
            <header className="border-b border-border px-5 py-4">
              <p
                className={`font-mono text-[10px] uppercase tracking-[0.18em] ${col.accent}`}
              >
                {col.regionLabel}
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

      {isAnalyzing && (
        <p className="mt-3 font-mono text-[11px] text-muted">
          Analysis engine running — fetching, framing, synthesizing…
        </p>
      )}
    </section>
  );
}
