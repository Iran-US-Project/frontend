import {
  REPORT_OUTLET_COLUMNS,
  stanceForOutlet,
  type AspectStanceRow,
  type ComparisonReportData,
  type NarrativeDifference,
} from "@/lib/analysis-types";

type ComparisonReportProps = {
  eventTitle: string;
  report: ComparisonReportData;
  meta?: {
    articleCount: number;
    outletCount: number;
    cached: boolean;
    generatedAt: string;
  };
};

function stanceToneClass(stance: string): string {
  const value = stance.toLowerCase();
  if (value.includes("favorable") || value.includes("support")) {
    return "text-mena";
  }
  if (value.includes("critical") || value.includes("skeptical")) {
    return "text-west";
  }
  if (value.includes("neutral")) {
    return "text-muted";
  }
  return "text-foreground";
}

function AspectStanceTable({ rows }: { rows: AspectStanceRow[] }) {
  return (
    <div className="overflow-x-auto border border-border">
      <table className="w-full min-w-[520px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-paper">
            <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              Aspect
            </th>
            {REPORT_OUTLET_COLUMNS.map((outlet) => (
              <th
                key={outlet}
                className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted"
              >
                {outlet}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.aspect} className="border-b border-border last:border-b-0">
              <td className="px-4 py-3 font-medium text-foreground">{row.aspect}</td>
              {REPORT_OUTLET_COLUMNS.map((outlet) => {
                const stance = stanceForOutlet(row.stances, outlet);
                return (
                  <td
                    key={`${row.aspect}-${outlet}`}
                    className={`px-4 py-3 ${stanceToneClass(stance)}`}
                  >
                    {stance}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function NarrativeOutletCard({ item }: { item: NarrativeDifference }) {
  return (
    <article className="border border-border bg-background/40 px-4 py-4">
      <h3 className="font-display text-lg text-foreground">{item.outlet}</h3>
      <dl className="mt-3 space-y-3 text-sm">
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            Tone
          </dt>
          <dd className="mt-1 text-foreground/90">{item.tone}</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            Primary frame
          </dt>
          <dd className="mt-1 text-foreground/90">{item.frame}</dd>
        </div>
        {item.loadedWords.length > 0 ? (
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              Loaded language
            </dt>
            <dd className="mt-2 flex flex-wrap gap-1.5">
              {item.loadedWords.map((word) => (
                <span
                  key={word}
                  className="border border-border bg-paper px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-foreground/80"
                >
                  {word}
                </span>
              ))}
            </dd>
          </div>
        ) : null}
        {item.omittedContext.length > 0 ? (
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              Omitted context
            </dt>
            <dd className="mt-2">
              <ul className="space-y-1.5 text-muted">
                {item.omittedContext.map((point) => (
                  <li key={point} className="border-l border-border pl-3">
                    {point}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ) : null}
      </dl>
    </article>
  );
}

export function ComparisonReport({
  eventTitle,
  report,
  meta,
}: ComparisonReportProps) {
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

      <div className="space-y-8 px-5 py-5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            Development summary
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            {report.developmentSummary}
          </p>
        </div>

        {report.discrepancies.length > 0 ? (
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
        ) : null}

        {report.keyPoints.length > 0 ? (
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              Key takeaways
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
        ) : null}

        {report.narrativeDifferences.length > 0 ? (
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              Narrative framing differences
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {report.narrativeDifferences.map((item) => (
                <NarrativeOutletCard key={item.outlet} item={item} />
              ))}
            </div>
          </div>
        ) : null}

        {report.aspectStances && report.aspectStances.length > 0 ? (
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              Aspect stances
            </p>
            <div className="mt-4">
              <AspectStanceTable rows={report.aspectStances} />
            </div>
          </div>
        ) : null}
      </div>

      {meta ? (
        <footer className="border-t border-border px-5 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            Analyzed {meta.articleCount}{" "}
            {meta.articleCount === 1 ? "article" : "articles"} across{" "}
            {meta.outletCount}{" "}
            {meta.outletCount === 1 ? "outlet" : "outlets"} ·{" "}
            {meta.cached ? "cached" : "fresh"} · generated{" "}
            {new Date(meta.generatedAt).toLocaleString()}
          </p>
        </footer>
      ) : null}
    </section>
  );
}
