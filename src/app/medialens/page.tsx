import { MediaLensWorkspace } from "@/components/MediaLensWorkspace";
import { InstrumentShell } from "@/components/InstrumentShell";

export default function MediaLensPage() {
  return (
    <InstrumentShell
      index="01"
      label="MediaLens"
      title="Media narrative comparison"
      description="Select an event window, then read Western, Middle Eastern, and financial coverage side by side — tone, frames, and omissions made visible."
      accentClass="text-west"
      frameColumns={[
        { label: "Right", accentClass: "text-west" },
        { label: "center", accentClass: "text-mena" },
        { label: "middle east", accentClass: "text-finance", align: "right" },
      ]}
    >
      <MediaLensWorkspace />
    </InstrumentShell>
  );
}
