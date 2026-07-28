import { GraphRAGWorkspace } from "@/components/GraphRAGWorkspace";
import { InstrumentShell } from "@/components/InstrumentShell";

export default function GraphPage() {
  return (
    <InstrumentShell
      index="02"
      label="GraphRAG"
      title="Graph analysis"
      description="Trace how developments connect across the corpus — step through the causal timeline and explore the evidence board."
      accentClass="text-mena"
      frameColumns={[
        { label: "Entities", accentClass: "text-west" },
        { label: "Relations", accentClass: "text-mena" },
        { label: "Context", accentClass: "text-finance", align: "right" },
      ]}
    >
      <GraphRAGWorkspace />
    </InstrumentShell>
  );
}
