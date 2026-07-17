"use client";

import { useEffect, useState } from "react";

/** Floating "back to top" chip; fades in once the page is scrolled. */
export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Back to top"
      title="Back to top"
      tabIndex={show ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-ink/30 bg-paper font-hand text-3xl leading-none text-ink shadow-[0_10px_24px_-12px_rgba(40,20,15,0.55)] transition-all duration-300 hover:scale-110 hover:text-ink-strong ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
      }`}
    >
      ↑
    </button>
  );
}
