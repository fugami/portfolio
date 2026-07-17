"use client";

import { useId } from "react";

// A hand-drawn horizontal pen stroke used to bracket an expanded role.
// When `open` flips true the stroke "draws" itself left→right (dashoffset),
// and it's always absolutely positioned by the caller so it never affects
// the layout of the content around it.

export default function InkRule({
  open = false,
  className = "",
}: {
  open?: boolean;
  className?: string;
}) {
  const id = `rule-rough-${useId().replace(/:/g, "")}`;
  return (
    <svg
      className={className}
      viewBox="0 0 1000 14"
      preserveAspectRatio="none"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <defs>
        <filter id={id} x="-2%" y="-60%" width="104%" height="220%">
          <feTurbulence type="fractalNoise" baseFrequency="0.015 0.4" numOctaves={2} seed={9} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <path
        d="M5 8 Q 250 4 500 7 T 995 7"
        filter={`url(#${id})`}
        vectorEffect="non-scaling-stroke"
        pathLength={1}
        strokeDasharray={1}
        style={{
          strokeDashoffset: open ? 0 : 1,
          transition: "stroke-dashoffset 600ms ease-out",
        }}
      />
    </svg>
  );
}
