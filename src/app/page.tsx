import { Activity, BarChart3, Newspaper } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-6 py-16">
      <header className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-widest text-zinc-400">
          MediaLens
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Cross-Source Framing &amp; Bias Discrepancy Engine
        </h1>
        <p className="max-w-2xl text-lg text-zinc-400">
          Compare how Western, Middle Eastern, and financial outlets frame the
          same Iran–US events. Frontend scaffold is running on port 3000.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <Newspaper className="mb-3 h-6 w-6 text-sky-400" />
          <h2 className="font-medium">Timeline</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Filter high-impact events across 2025–2026.
          </p>
        </article>
        <article className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <BarChart3 className="mb-3 h-6 w-6 text-violet-400" />
          <h2 className="font-medium">Matrix</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Side-by-side narrative and framing comparisons.
          </p>
        </article>
        <article className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <Activity className="mb-3 h-6 w-6 text-emerald-400" />
          <h2 className="font-medium">Agent Stream</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Live SSE updates from the multi-agent pipeline.
          </p>
        </article>
      </section>

      <p className="text-sm text-zinc-500">
        Backend API: <code className="text-zinc-300">{API_URL}</code>
      </p>
    </main>
  );
}
