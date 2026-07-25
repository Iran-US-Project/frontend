import Link from "next/link";

export type FrameColumn = {
  label: string;
  accentClass: string;
  href?: string;
  align?: "left" | "right";
};

type FramePlaneProps = {
  columns: [FrameColumn, FrameColumn, FrameColumn];
  /** banner = instrument pages; hero = landing full-bleed */
  variant?: "hero" | "banner";
  className?: string;
};

function ColumnBody({
  column,
  variant,
}: {
  column: FrameColumn;
  variant: "hero" | "banner";
}) {
  const top = variant === "hero" ? "top-16" : "top-14 sm:top-16";
  const side =
    column.align === "right"
      ? variant === "hero"
        ? "right-6 sm:right-10"
        : "right-5 sm:right-8"
      : variant === "hero"
        ? "left-6 sm:left-10"
        : "left-5 sm:left-8";

  return (
    <>
      <p
        className={`absolute ${top} ${side} font-mono text-[10px] uppercase tracking-[0.2em] ${column.accentClass} opacity-75`}
      >
        {column.label}
      </p>
      <div className="frame-plane__lines">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
    </>
  );
}

export function FramePlane({
  columns,
  variant = "banner",
  className = "",
}: FramePlaneProps) {
  const isHero = variant === "hero";

  return (
    <div
      className={`frame-plane ${
        isHero
          ? "absolute inset-0"
          : "relative h-[min(36vh,260px)] w-full sm:h-[280px]"
      } ${className}`}
    >
      {columns.map((column) => {
        const colClass = `frame-plane__col ${column.accentClass}${
          column.href ? " transition-opacity hover:opacity-90" : ""
        }`;

        if (column.href) {
          return (
            <Link key={column.label} href={column.href} className={colClass}>
              <ColumnBody column={column} variant={variant} />
            </Link>
          );
        }

        return (
          <div key={column.label} className={colClass}>
            <ColumnBody column={column} variant={variant} />
          </div>
        );
      })}

      <div className="pointer-events-none absolute bottom-0 left-[33.333%] top-0 w-px bg-border/90" />
      <div className="pointer-events-none absolute bottom-0 left-[66.666%] top-0 w-px bg-border/90" />
    </div>
  );
}
