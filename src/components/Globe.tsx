export default function Globe({ className = "" }: { className?: string }) {
  return (
    <span className={`relative inline-block ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/uploads/Globe2.svg"
        alt=""
        className="absolute inset-0 h-full w-full transition-opacity duration-200 group-hover:opacity-0"
        aria-hidden="true"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/uploads/Globesvg.svg"
        alt=""
        className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        aria-hidden="true"
      />
    </span>
  );
}
