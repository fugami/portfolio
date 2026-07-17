"use client";

/** Branded fallback for unexpected server errors, in place of Next's default. */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="font-hand text-6xl text-ink-strong">oops.</p>
      <p className="mt-3 max-w-md font-garamond text-xl text-ink/80">
        Something went wrong on our end. It&rsquo;s not you.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 font-garamond text-lg text-ink underline underline-offset-4 transition hover:text-ink-strong"
      >
        try again
      </button>
    </main>
  );
}
