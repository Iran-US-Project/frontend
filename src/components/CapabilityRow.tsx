import Link from "next/link";

type CapabilityProps = {
  index: string;
  region: string;
  title: string;
  description: string;
  accentClass: string;
  delayClass: string;
  href: string;
};

export function CapabilityRow({
  index,
  region,
  title,
  description,
  accentClass,
  delayClass,
  href,
}: CapabilityProps) {
  return (
    <Link
      href={href}
      className={`capability-row group grid grid-cols-[auto_1fr_auto] items-baseline gap-x-6 gap-y-2 border-t border-border py-8 sm:grid-cols-[4.5rem_7rem_1fr_auto] ${delayClass}`}
    >
      <span className="font-mono text-[11px] tabular-nums text-muted">
        {index}
      </span>
      <span
        className={`hidden font-mono text-[11px] uppercase tracking-[0.14em] sm:block ${accentClass}`}
      >
        {region}
      </span>
      <div className="col-span-2 sm:col-span-1">
        <h3 className="font-display text-2xl font-medium tracking-tight text-foreground sm:text-[1.65rem]">
          {title}
        </h3>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-muted">
          {description}
        </p>
      </div>
      <span
        aria-hidden
        className="font-display text-xl text-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent"
      >
        →
      </span>
    </Link>
  );
}
