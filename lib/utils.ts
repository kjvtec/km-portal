import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | Date): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Automatically transforms page references like "หน้า 558", "หน้า 32-62" into
 * clickable PDF links pointing directly to that page in the Signed DSD document.
 * Protects any already-formatted markdown links to avoid double-wrapping.
 */
export function autoLinkPageNumbers(text: string): string {
  if (!text) return text;

  const links: string[] = [];
  const placeholderText = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match) => {
    links.push(match);
    return `__MD_LINK_${links.length - 1}__`;
  });

  const pageRegex = /หน้า\s*(\d{1,4})(?:\s*(?:[\/\-]|ถึง)\s*\d{1,4})?/g;

  const linked = placeholderText.replace(pageRegex, (match, pageNum) => {
    const page = parseInt(pageNum, 10);
    if (page >= 1 && page <= 1004) {
      return `[${match}](/docs/DSD-PTTRM-JIFFY-RETAIL-V1.0_Signed.pdf#page=${page})`;
    }
    return match;
  });

  return linked.replace(/__MD_LINK_(\d+)__/g, (_, idx) => links[Number(idx)]);
}
