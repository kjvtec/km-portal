import React from "react";

export function JiffyLogo({ className = "h-16 w-16" }: { className?: string }) {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full drop-shadow-md select-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Yellow/Gold Ring */}
        <circle cx="60" cy="60" r="58" fill="#FFB800" stroke="#E5A600" strokeWidth="2" />
        
        {/* Inner Blue Circle */}
        <circle cx="60" cy="60" r="51" fill="#0047BA" />
        
        {/* Subtle Inner Glow/Gradient */}
        <circle cx="60" cy="60" r="51" fill="url(#blueGrad)" opacity="0.4" />

        {/* Yellow Ribbon/Underline Swoosh under text */}
        <path
          d="M 32 75 C 50 78, 75 76, 92 63 C 78 72, 48 74, 30 73 Z"
          fill="#FFB800"
        />

        {/* Jiffy Text (Bold, Cursive Italic Stylized SVG Paths) */}
        <g fill="#FFFFFF" style={{ filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.3))" }}>
          {/* Letter J */}
          <path
            d="M 40 37 C 42 37, 43 38, 43 40 C 43 42, 41 45, 39 49 C 37 54, 35 60, 35 65 C 35 70, 32 75, 27 75 C 23 75, 20 72, 20 68 C 20 64, 23 62, 26 62 C 28 62, 29 63, 29 65 C 29 67, 28 68, 27 68 C 27 69, 28 70, 29 70 C 31 70, 32 67, 33 63 C 34 58, 36 51, 38 45 C 38 43, 38 41, 37 40 C 36 39, 36 38, 38 37 Z"
          />
          {/* Dot of i */}
          <circle cx="45" cy="45" r="3" />
          {/* Letter i */}
          <path
            d="M 46 51 L 43 71 C 43 73, 44 74, 46 74 C 48 74, 50 72, 51 70 L 52 71 C 50 74, 47 76, 44 76 C 41 76, 39 74, 39 71 C 39 69, 40 66, 41 62 L 43 51 Z"
          />
          {/* Letter f (1) */}
          <path
            d="M 58 37 C 61 37, 63 39, 62 42 C 61 44, 59 47, 57 51 L 62 51 L 61 54 L 56 54 L 52 74 C 50 81, 47 86, 43 86 C 41 86, 40 85, 40 83 C 40 81, 41 80, 43 80 C 44 80, 45 81, 45 82 C 46 82, 47 81, 48 78 L 51 64 L 48 64 L 49 61 L 52 61 L 54 51 C 55 46, 57 41, 57 39 C 57 38, 56 38, 55 38 C 54 38, 52 39, 51 40 L 50 39 C 52 38, 55 37, 58 37 Z"
          />
          {/* Letter f (2) */}
          <path
            d="M 70 37 C 73 37, 75 39, 74 42 C 73 44, 71 47, 69 51 L 74 51 L 73 54 L 68 54 L 64 74 C 62 81, 59 86, 55 86 C 53 86, 52 85, 52 83 C 52 81, 53 80, 55 80 C 56 80, 57 81, 57 82 C 58 82, 59 81, 60 78 L 63 64 L 60 64 L 61 61 L 64 61 L 66 51 C 67 46, 69 41, 69 39 C 69 38, 68 38, 67 38 C 66 38, 64 39, 63 40 L 62 39 C 64 38, 67 37, 70 37 Z"
          />
          {/* Letter y */}
          <path
            d="M 77 51 L 74 65 C 73 68, 74 70, 76 70 C 78 70, 81 67, 83 62 L 85 51 L 89 51 L 84 72 C 81 81, 77 86, 72 86 C 69 86, 68 84, 68 82 C 68 80, 70 79, 72 79 C 73 79, 74 80, 74 81 C 75 81, 76 80, 77 78 L 78 73 C 75 75, 73 76, 71 76 C 68 76, 67 73, 67 69 C 67 65, 68 61, 70 56 L 72 51 Z"
          />
        </g>

        {/* Gradients */}
        <defs>
          <radialGradient
            id="blueGrad"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(45 40) rotate(50) scale(60)"
          >
            <stop stopColor="#60A5FA" />
            <stop offset="1" stopColor="#0047BA" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}
