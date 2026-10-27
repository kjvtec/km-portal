import React from "react";

export function JiffyBottomWave({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-0 ${className}`}>
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className="relative block w-full h-16 sm:h-24"
      >
        {/* Yellow Accent Ribbon Wave */}
        <path
          d="M0,105 C200,90 400,110 600,75 C800,40 1000,55 1200,30 L1200,120 L0,120 Z"
          fill="#FFB800"
        />
        {/* Blue Deep Wave */}
        <path
          d="M0,120 C220,105 450,118 680,88 C900,55 1060,68 1200,48 L1200,120 L0,120 Z"
          fill="#0047BA"
        />
        {/* Deep navy accent subtle wave */}
        <path
          d="M300,120 C500,112 750,110 950,92 C1080,78 1150,75 1200,68 L1200,120 L300,120 Z"
          fill="#00358C"
          opacity="0.85"
        />
      </svg>
    </div>
  );
}
