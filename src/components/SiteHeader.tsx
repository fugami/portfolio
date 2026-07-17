import Link from "next/link";

/**
 * The "J.M." monogram header used on individual project pages and the 404.
 * (The home page renders its own interactive header.)
 */
export default function SiteHeader(_props?: { variant?: "full" | "monogram" }) {
  return (
    <header className="px-8 pt-8 sm:px-12">
      <Link
        href="/"
        className="inline-block font-hand text-5xl leading-none text-ink-strong"
        aria-label="Home"
      >
        J.M.
      </Link>
    </header>
  );
}
