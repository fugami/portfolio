import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export default function NotFound() {
  return (
    <main className="min-h-screen">
      <SiteHeader variant="monogram" />
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-hand text-6xl text-ink-strong">Not found</h1>
        <p className="mt-4 font-hand text-2xl text-ink/70">
          That page wandered off.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block font-hand text-2xl text-ink underline underline-offset-4"
        >
          ← Back to the timeline
        </Link>
      </div>
    </main>
  );
}
