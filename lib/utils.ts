import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { getPageForBr } from "./br-map";

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
 * Transforms Business Requirement (BR) codes (e.g. BR-01-01-04, BR-06-01-02)
 * into direct clickable PDF links pointing to the exact page in Signed DSD V1.0.
 * Automatically absorbs any redundant "หน้า XX" following the BR code to keep
 * sentences clean, readable, and free from cluttered badges or icons.
 */
export function autoLinkBrAndCitations(text: string): string {
  if (!text) return text;

  // 1. Protect existing markdown links to avoid double-wrapping
  const links: string[] = [];
  let processed = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match) => {
    links.push(match);
    return `__MD_LINK_${links.length - 1}__`;
  });

  // 2. Transform BR codes and absorb any redundant trailing "หน้า XX" or "(หน้า XX)"
  // Matches: BR code, optional (หน้า X) or หน้า X, and optional trailing spaces before a closing parenthesis
  const brRegex = /(BR-\d{2}-\d{2}(?:-\d{2})?)(?:\s*(?:\(\s*หน้า\s*(\d{1,4})(?:\s*[\/\-]\s*\d{1,4})?\s*\)|หน้า\s*(\d{1,4})(?:\s*[\/\-]\s*\d{1,4})?))?(?:\s*(?=\)))?/g;

  processed = processed.replace(brRegex, (match, brCode, p1, p2) => {
    const explicitPage = p1 || p2;
    const page = explicitPage ? parseInt(explicitPage, 10) : getPageForBr(brCode);
    return `[${brCode}](/docs/DSD-PTTRM-JIFFY-RETAIL-V1.0_Signed.pdf#page=${page})`;
  });

  // 3. For any remaining standalone page ranges like "หน้า 33-37" or "หน้า 558" (exclude "หน้า X/1004")
  const pageRegex = /หน้า\s*(\d{1,4})(?:\s*(?:[\-]|ถึง)\s*\d{1,4})?(?!\s*\/\s*1004)/g;
  processed = processed.replace(pageRegex, (match, pageNum) => {
    const page = parseInt(pageNum, 10);
    if (page >= 1 && page <= 1004) {
      return `[${match}](/docs/DSD-PTTRM-JIFFY-RETAIL-V1.0_Signed.pdf#page=${page})`;
    }
    return match;
  });

  // 4. Restore protected links
  return processed.replace(/__MD_LINK_(\d+)__/g, (_, idx) => links[Number(idx)]);
}

/**
 * Backward-compatible alias
 */
export const autoLinkPageNumbers = autoLinkBrAndCitations;
