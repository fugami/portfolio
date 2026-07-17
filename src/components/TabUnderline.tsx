"use client";

import { useId } from "react";

// Hand-drawn pen-stroke underline that sits under the active tab. Redraws
// itself each time it becomes active for a written-by-hand feel.

export default function TabUnderline({ className = "" }: { className?: string }) {
  const id = `tabu-rough-${useId().replace(/:/g, "")}`;
  return (
    <svg
      className={className}
      viewBox="0 0 200 18"
      preserveAspectRatio="none"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <defs>
        <filter id={id} x="-3%" y="-60%" width="106%" height="220%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02 0.5" numOctaves={2} seed={5} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <path
        d="M6 11 C 50 7 90 14 130 9 S 188 8 196 12"
        filter={`url(#${id})`}
        vectorEffect="non-scaling-stroke"
        pathLength={1}
        strokeDasharray={1}
        style={{
          strokeDashoffset: 0,
          animation: "tab-draw 450ms ease-out",
        }}
      />
    </svg>
  );
}
