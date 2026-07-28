import Link from "next/link";
import type { ReactNode } from "react";
import { FramePlane, type FrameColumn } from "@/components/FramePlane";

type InstrumentShellProps = {
  index: string;
  label: string;
  title: string;
  description: string;
  accentClass: string;
  frameColumns: [FrameColumn, FrameColumn, FrameColumn];
  children: ReactNode;
};

export function InstrumentShell({
  index,
  label,
  title,
  description,
  accentClass,
  frameColumns,
  children,
}: InstrumentShellProps) {
  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-5%,#f7f8fa_0%,transparent_60%)]" />
        <div className="paper-grain absolute inset-0" />
      </div>

      <div className="relative z-10">
        <header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between px-6 pt-7 sm:px-8">
          <Link
            href="/"
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted transition-colors hover:text-foreground"
          >
            ← Research hub
          </Link>
          <p className="pointer-events-none font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
            {label} · 2025–2026
          </p>
        </header>

        {/* Animated frame asset — wording matches this instrument */}
        <div className="relative">
          <FramePlane columns={frameColumns} variant="banner" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background to-transparent" />
        </div>

        <main className="mx-auto max-w-6xl px-6 pb-20 pt-10 sm:px-8">
          <div className="animate-reveal max-w-3xl">
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-[11px] tabular-nums text-muted">
                {index}
              </span>
              <span
                className={`font-mono text-[11px] uppercase tracking-[0.14em] ${accentClass}`}
              >
                {label}
              </span>
            </div>

            <h1 className="mt-4 font-display text-[clamp(2.25rem,6vw,3.75rem)] font-medium leading-[1.05] tracking-[-0.02em] text-foreground">
              {title}
            </h1>

            <div className="animate-rule mt-5 h-px w-16 bg-accent" />

            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted sm:text-base">
              {description}
            </p>
          </div>

          <div className="animate-reveal-1 mt-12">{children}</div>
        </main>
      </div>
    </div>
  );
}
