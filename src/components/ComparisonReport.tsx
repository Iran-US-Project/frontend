import type { ComparisonReportData } from "@/lib/event-coverage";

type ComparisonReportProps = {
  eventTitle: string;
  report: ComparisonReportData;
};

export function ComparisonReport({ eventTitle, report }: ComparisonReportProps) {
  return (
    <section className="mt-10 border border-border bg-paper/80">
      <header className="border-b border-border px-5 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-west">
          Cross-regional report
        </p>
        <h2 className="mt-1 font-display text-xl font-medium text-foreground">
          {eventTitle}
        </h2>
      </header>

      <div className="space-y-6 px-5 py-5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            Summary
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            {report.summary}
          </p>
        </div>

        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            Key discrepancies
          </p>
          <ul className="mt-3 space-y-2">
            {report.discrepancies.map((item) => (
              <li
                key={item}
                className="border-l-2 border-accent/50 pl-3 text-sm leading-relaxed text-foreground/90"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            Key points
          </p>
          <ul className="mt-3 space-y-2">
            {report.keyPoints.map((item) => (
              <li
                key={item}
                className="border-l border-border pl-3 text-sm leading-relaxed text-muted"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
