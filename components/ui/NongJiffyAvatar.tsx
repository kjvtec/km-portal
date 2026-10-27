import React from "react";

interface NongJiffyAvatarProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function NongJiffyAvatar({
  className = "",
  size = "md",
}: NongJiffyAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  const selectedSize = className ? className : sizeClasses[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-2xl overflow-hidden bg-white border border-slate-200/90 shadow-sm select-none ${selectedSize}`}
      title="น้อง Jiffy (AI Assistant)"
    >
      <img
        src="/images/nong-jiffy.png"
        alt="น้อง Jiffy (AI Assistant)"
        className="w-full h-full object-cover"
        style={{
          // Center clearly on the face, red cap, blue hair, and happy smile
          objectPosition: "44% 48%",
          transform: "scale(1.18)",
        }}
      />
    </div>
  );
}
