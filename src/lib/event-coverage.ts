import type { TimelineEvent } from "@/lib/timeline-events";

export type RegionalFrame = {
  region: "western" | "mena" | "financial";
  regionLabel: string;
  accent: string;
  wash: string;
  tone: string;
  frame: string;
  facts: string[];
};

export type ComparisonReportData = {
  summary: string;
  discrepancies: string[];
  keyPoints: string[];
};

export type EventCoverage = {
  sources: RegionalFrame[];
  analysis?: {
    sources: RegionalFrame[];
    report: ComparisonReportData;
  };
};

const REGION_META = {
  western: {
    regionLabel: "Right",
    accent: "text-west",
    wash: "bg-west/[0.06]",
  },
  mena: {
    regionLabel: "center",
    accent: "text-mena",
    wash: "bg-mena/[0.06]",
  },
  financial: {
    regionLabel: "middle east",
    accent: "text-finance",
    wash: "bg-finance/[0.06]",
  },
} as const;

function frame(
  region: keyof typeof REGION_META,
  tone: string,
  headline: string,
  facts: string[],
): RegionalFrame {
  return { region, tone, frame: headline, facts, ...REGION_META[region] };
}

const COVERAGE_BY_EVENT: Record<string, EventCoverage> = {
  "iran-israel-war-2025": {
    sources: [
      frame(
        "western",
        "Alarmist · punitive",
        "Preemptive strike on nuclear threat",
        [
          "Centers Israeli/US coordination and IRGC leadership losses",
          "Frames Natanz and Fordow strikes as degrading enrichment capacity",
          "Highlights civilian risk but foregrounds regime accountability",
        ],
      ),
      frame(
        "mena",
        "Defiant · retaliatory",
        "Aggression met with national resolve",
        [
          "Emphasizes Operation True Promise III as lawful retaliation",
          "Reports GCC energy sites as collateral of regional escalation",
          "Omits command-structure decapitation in early headlines",
        ],
      ),
      frame(
        "financial",
        "Risk-off · volatile",
        "Energy shock priced in",
        [
          "Brent spike on Hormuz-adjacent supply fears",
          "Insurance and shipping reroutes dominate wire copy",
          "Limited discussion of diplomatic off-ramps in first 48h",
        ],
      ),
    ],
    analysis: {
      sources: [
        frame(
          "western",
          "Alarmist · punitive",
          "Decapitation strike breaks escalation taboo",
          [
            "Command kills treated as turning point, not side detail",
            "Nuclear sites framed as time-sensitive threat reduction",
          ],
        ),
        frame(
          "mena",
          "Defiant · retaliatory",
          "Sovereignty narrative overrides casualty accounting",
          [
            "Retaliation cycles foregrounded over leadership vacuum",
            "Regional solidarity language masks intra-GCC energy anxiety",
          ],
        ),
        frame(
          "financial",
          "Risk-off · volatile",
          "Markets price war duration, not morality",
          [
            "Oil volatility leads; diplomacy treated as lagging indicator",
            "Shipping risk premiums persist after headline ceasefire talk",
          ],
        ),
      ],
      report: {
        summary:
          "Western outlets lead with preemptive threat reduction and leadership decapitation; Middle Eastern coverage stresses retaliation and sovereignty while downplaying command losses; financial wires compress the conflict into energy volatility and insurance spreads. The same 12-day window is narrated as deterrence success, national resistance, and commodity shock — rarely in the same article.",
        discrepancies: [
          "IRGC leadership killings appear in Western ledes but are absent or minimized in early regional summaries",
          "GCC refinery strikes are prominent in financial and regional energy reporting, peripheral in Western political framing",
          "Ceasefire language diverges: Western copy treats pause as tactical; regional copy frames it as imposed aggression",
        ],
        keyPoints: [
          "Nuclear infrastructure strikes anchor Western legitimacy claims",
          "Retaliation branding (True Promise III) organizes MENA timeline sequencing",
          "Oil and insurance metrics drive financial narrative persistence after military pause",
        ],
      },
    },
  },
  "hormuz-crisis": {
    sources: [
      frame(
        "western",
        "Confrontational",
        "Freedom of navigation under threat",
        [
          "US Fifth Fleet posture and escort proposals lead coverage",
          "Iranian closure claims challenged by allied governments",
        ],
      ),
      frame(
        "mena",
        "Assertive",
        "Strategic leverage in Iranian hands",
        [
          "Transit restrictions framed as response to external pressure",
          "Domestic audiences told Hormuz control is non-negotiable",
        ],
      ),
      frame(
        "financial",
        "Urgent",
        "Supply chokepoint repriced",
        [
          "Brent and tanker rates move on single headlines",
          "Analyst notes stress LNG and refined product exposure",
        ],
      ),
    ],
    analysis: {
      sources: [
        frame("western", "Confrontational", "Naval deterrence narrative", [
          "Escort missions and alliance burden-sharing emphasized",
        ]),
        frame("mena", "Assertive", "Sovereign control of vital passage", [
          "Closure rhetoric tied to sanctions and security guarantees",
        ]),
        frame("financial", "Urgent", "Macro shock via energy corridor", [
          "Volatility persists even when military headlines soften",
        ]),
      ],
      report: {
        summary:
          "Hormuz coverage splits between naval deterrence (Western), sovereignty assertion (MENA), and commodity repricing (financial). Each cluster uses different success metrics: mission freedom, territorial control, and basis-point moves.",
        discrepancies: [
          "Western copy stresses international law; regional copy stresses reciprocal pressure",
          "Financial outlets omit domestic Iranian rationales almost entirely",
        ],
        keyPoints: [
          "Single strait headline moves multiple asset classes",
          "Escort talk signals perceived insurance market failure",
        ],
      },
    },
  },
  "supreme-leader": {
    sources: [
      frame(
        "western",
        "Speculative",
        "Succession vacuum and instability",
        [
          "Khamenei death reported as regime inflection point",
          "Exiled opposition voices amplified in English-language press",
        ],
      ),
      frame(
        "mena",
        "Solemn · contested",
        "Mourning and legitimacy questions",
        [
          "State media mourning rituals dominate domestic framing",
          "Assembly of Experts debate reported with varying emphasis",
        ],
      ),
      frame(
        "financial",
        "Cautious",
        "Geopolitical premium on hold",
        [
          "Markets pause for leadership clarity before repricing risk",
          "Sanctions path uncertainty tied to succession outcome",
        ],
      ),
    ],
    analysis: {
      sources: [
        frame("western", "Speculative", "Power vacuum opens policy window", [
          "Regime change rhetoric competes with stability warnings",
        ]),
        frame("mena", "Solemn · contested", "Ritual legitimacy under strain", [
          "Burial choreography vs. protest symbolism split audiences",
        ]),
        frame("financial", "Cautious", "Event risk without immediate repricing", [
          "Oil holds range until succession signals clarify policy",
        ]),
      ],
      report: {
        summary:
          "Supreme Leader succession coverage exposes the widest frame gap in the corpus: Western outlets foreground instability and opposition hopes; regional outlets balance mourning, ritual, and quiet succession politics; financial press waits for policy signals before moving risk premia.",
        discrepancies: [
          "Legitimacy of successor named in state media vs. questioned in Western editorials",
          "Humanitarian and protest angles uneven across regions",
        ],
        keyPoints: [
          "Burial timeline acts as narrative anchor across all three clusters",
          "Financial delay reflects uncertainty premium, not disinterest",
        ],
      },
    },
  },
};

function fallbackCoverage(event: TimelineEvent): EventCoverage {
  const excerpt = event.description;
  return {
    sources: [
      frame("western", "Neutral · developing", "Incident under active reporting", [
        excerpt,
        "Wire services emphasize official statements and allied reactions",
      ]),
      frame("mena", "Regional · contextual", "Local stakes foregrounded", [
        excerpt,
        "Regional outlets stress sovereignty and neighborhood security",
      ]),
      frame("financial", "Market-aware", "Second-order effects tracked", [
        excerpt,
        "Energy and sanctions channels noted where relevant",
      ]),
    ],
    analysis: {
      sources: [
        frame("western", "Neutral · developing", "Incident under active reporting", [
          "Official statements and allied reactions drive early framing",
        ]),
        frame("mena", "Regional · contextual", "Local stakes foregrounded", [
          "Sovereignty and neighborhood security emphasized",
        ]),
        frame("financial", "Market-aware", "Second-order effects tracked", [
          "Energy and sanctions channels dominate follow-on copy",
        ]),
      ],
      report: {
        summary: `Automated synthesis placeholder for “${event.title}”. Regional clusters diverge on which facts are treated as causal versus contextual.`,
        discrepancies: [
          "Western ledes prioritize institutional responses; regional ledes prioritize domestic impact",
          "Financial coverage lags political headlines by one news cycle",
        ],
        keyPoints: [
          "Event window anchored by corpus keyword cluster",
          "Tone shifts as wire volume peaks in the selected date range",
        ],
      },
    },
  };
}

export function getEventCoverage(eventId: string, event?: TimelineEvent): EventCoverage {
  return COVERAGE_BY_EVENT[eventId] ?? fallbackCoverage(event!);
}

export type AnalysisStatus = "idle" | "running" | "complete";
