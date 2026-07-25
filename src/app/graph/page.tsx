import { InstrumentShell } from "@/components/InstrumentShell";

const entities = [
  { name: "United States", type: "State", degree: "—" },
  { name: "Iran", type: "State", degree: "—" },
  { name: "IAEA", type: "Org", degree: "—" },
  { name: "Strait of Hormuz", type: "Place", degree: "—" },
  { name: "Sanctions package", type: "Event", degree: "—" },
];

const edges = [
  { from: "United States", rel: "imposes", to: "Sanctions package" },
  { from: "Iran", rel: "controls", to: "Strait of Hormuz" },
  { from: "IAEA", rel: "inspects", to: "Iran" },
];

export default function GraphPage() {
  return (
    <InstrumentShell
      index="02"
      label="GraphRAG"
      title="Graph analysis"
      description="Explore entities, actors, and relationships extracted from the article corpus. Scaffold canvas — live GraphRAG wiring comes next."
      accentClass="text-mena"
      frameColumns={[
        { label: "Entities", accentClass: "text-west" },
        { label: "Relations", accentClass: "text-mena" },
        { label: "Context", accentClass: "text-finance", align: "right" },
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
        {/* Canvas */}
        <section className="relative min-h-[420px] border border-border bg-paper/80 lg:min-h-[520px]">
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between border-b border-border px-5 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
              Knowledge graph
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-mena">
              Idle
            </p>
          </div>

          {/* Abstract node field */}
          <div className="absolute inset-0 flex items-center justify-center pt-10" aria-hidden>
            <svg
              viewBox="0 0 640 400"
              className="h-full w-full max-w-3xl opacity-70"
            >
              <line x1="180" y1="120" x2="320" y2="200" stroke="var(--border)" strokeWidth="1" />
              <line x1="320" y1="200" x2="460" y2="110" stroke="var(--border)" strokeWidth="1" />
              <line x1="320" y1="200" x2="280" y2="300" stroke="var(--border)" strokeWidth="1" />
              <line x1="320" y1="200" x2="480" y2="280" stroke="var(--border)" strokeWidth="1" />
              <line x1="180" y1="120" x2="120" y2="240" stroke="var(--border)" strokeWidth="1" />

              <circle cx="180" cy="120" r="28" fill="rgba(26,58,82,0.12)" stroke="var(--west)" strokeWidth="1" />
              <circle cx="460" cy="110" r="22" fill="rgba(143,29,44,0.1)" stroke="var(--mena)" strokeWidth="1" />
              <circle cx="320" cy="200" r="36" fill="rgba(45,74,62,0.1)" stroke="var(--finance)" strokeWidth="1" />
              <circle cx="280" cy="300" r="18" fill="rgba(26,58,82,0.08)" stroke="var(--west)" strokeWidth="1" />
              <circle cx="480" cy="280" r="20" fill="rgba(143,29,44,0.08)" stroke="var(--mena)" strokeWidth="1" />
              <circle cx="120" cy="240" r="16" fill="rgba(45,74,62,0.08)" stroke="var(--finance)" strokeWidth="1" />

              <text x="180" y="124" textAnchor="middle" className="fill-foreground" style={{ fontSize: 9, fontFamily: "var(--font-mono)" }}>
                US
              </text>
              <text x="460" y="114" textAnchor="middle" className="fill-foreground" style={{ fontSize: 9, fontFamily: "var(--font-mono)" }}>
                Iran
              </text>
              <text x="320" y="204" textAnchor="middle" className="fill-foreground" style={{ fontSize: 9, fontFamily: "var(--font-mono)" }}>
                Event
              </text>
            </svg>
          </div>

          <p className="absolute bottom-4 left-5 font-mono text-[11px] text-muted">
            Scaffold — pan / zoom / expand not connected
          </p>
        </section>

        {/* Entity list */}
        <aside className="border border-border bg-paper/60">
          <div className="border-b border-border px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
              Entities
            </p>
          </div>
          <ul>
            {entities.map((entity) => (
              <li
                key={entity.name}
                className="border-b border-border px-4 py-3 last:border-b-0"
              >
                <p className="text-sm font-medium text-foreground">
                  {entity.name}
                </p>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                  {entity.type} · deg {entity.degree}
                </p>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      {/* Relations */}
      <section className="mt-8 border border-border">
        <div className="border-b border-border px-5 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            Sample relations
          </p>
        </div>
        <ul>
          {edges.map((edge) => (
            <li
              key={`${edge.from}-${edge.rel}-${edge.to}`}
              className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-border px-5 py-3 text-sm last:border-b-0"
            >
              <span className="text-foreground">{edge.from}</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-mena">
                {edge.rel}
              </span>
              <span className="text-right text-foreground">{edge.to}</span>
            </li>
          ))}
        </ul>
      </section>
    </InstrumentShell>
  );
}
