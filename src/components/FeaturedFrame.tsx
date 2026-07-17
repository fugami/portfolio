"use client";

import { useId } from "react";

// A hand-drawn rectangle that stretches to fill its (relative) parent. Used to
// box "featured" project rows. preserveAspectRatio="none" lets it stretch while
// non-scaling-stroke keeps the ink line a constant weight, and the turbulence
// filter gives it the wobbly, overshooting-corner sketch look from the boards.

export default function FeaturedFrame({ className = "" }: { className?: string }) {
  const id = `frame-rough-${useId().replace(/:/g, "")}`;
  return (
    <svg
      className={className}
      viewBox="0 0 1000 100"
      preserveAspectRatio="none"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <defs>
        <filter id={id} x="-5%" y="-15%" width="110%" height="130%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.06" numOctaves={2} seed={4} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <path
        d="M16 14 L986 9 L990 88 L12 92 L15 6"
        filter={`url(#${id})`}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
