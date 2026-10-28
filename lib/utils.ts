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
 * Sanitizes stray multilingual artifacts (such as Arabic 'مثل' -> 'เช่น', or stray Arabic/foreign tokens)
 * that multilingual LLMs occasionally slip into Thai responses.
 */
export function sanitizeThaiResponse(text: string): string {
  if (!text) return text;
  return text
    // Replace Arabic "مثل" (mithl = such as) with Thai "เช่น"
    .replace(/(?:\b|[\s(])مثل(?:\b|[\s)])/g, (match) => {
      if (match.startsWith("(") && match.endsWith(")")) return "(เช่น)";
      if (match.startsWith("(")) return "(เช่น ";
      if (match.endsWith(")")) return "เช่น)";
      return " เช่น ";
    })
    .replace(/مثل/g, "เช่น")
    // Clean up any stray Arabic script characters accidentally leaked into Thai text
    .replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g, "");
}

/**
 * Transforms Business Requirement (BR) codes (e.g. BR-01-01-04, BR-06-01-02)
 * into direct clickable PDF links pointing to the exact page in Signed DSD V1.0.
 * Automatically absorbs any redundant "หน้า XX" following the BR code to keep
 * sentences clean, readable, and free from cluttered badges or icons.
 */
export function autoLinkBrAndCitations(rawText: string): string {
  if (!rawText) return rawText;
  const text = sanitizeThaiResponse(rawText);

  // 1. Protect existing markdown links to avoid double-wrapping
  const links: string[] = [];
  const protectLink = (label: string, url: string) => {
    links.push(`[${label}](${url})`);
    return `__MD_LINK_${links.length - 1}__`;
  };

  let processed = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, url) => {
    return protectLink(label, url);
  });

  // 2. Transform BR codes and absorb any redundant trailing "หน้า XX" or "(หน้า XX)"
  const brRegex = /(BR-\d{2}-\d{2}(?:-\d{2})?)(?:\s*(?:\(\s*หน้า\s*(\d{1,4})(?:\s*[\/\-]\s*\d{1,4})?\s*\)|หน้า\s*(\d{1,4})(?:\s*[\/\-]\s*\d{1,4})?))?(?:\s*(?=\)))?/g;
  processed = processed.replace(brRegex, (match, brCode) => {
    return protectLink(brCode, `/documents/br/${brCode}`);
  });

  // 3. Transform AWS bracketed references: e.g. [AWS-04.1 Amazon EKS] (หน้า 3) or [AWS-05 OpenVPN]
  const awsBracketRegex = /\[(AWS-\d{2}(?:\.\d)?(?:\s+[^\]\n]+)?)\](?:\s*(?:\(\s*หน้า\s*([1-6])\s*\)|หน้า\s*([1-6])))?/gi;
  processed = processed.replace(awsBracketRegex, (match, title) => {
    const codeMatch = title.match(/AWS-\d{2}(?:\.\d)?/i);
    const code = codeMatch ? codeMatch[0].toUpperCase() : title;
    return protectLink(title, `/documents/aws?sec=${code}`);
  });

  // 4. Transform AWS bare codes: e.g. AWS-04.1, AWS-05 (หน้า 4), AWS-EKS, AWS-OPENVPN
  const awsBareRegex = /\b(AWS-(?:\d{2}(?:\.\d)?|EKS|OPENVPN|VPN|AURORA|REDIS|NETWORK|VPC|WAF|CLOUDFRONT|ALB|SECRETS))\b(?:\s*(?:\(\s*หน้า\s*([1-6])\s*\)|หน้า\s*([1-6])))?/gi;
  processed = processed.replace(awsBareRegex, (match, awsCode) => {
    return protectLink(awsCode, `/documents/aws?sec=${awsCode.toUpperCase()}`);
  });

  // 5. Standalone DSD pages (e.g. หน้า 33-37 or หน้า 558)
  const pageRegex = /หน้า\s*(\d{1,4})(?:\s*(?:[\-]|ถึง)\s*\d{1,4})?(?!\s*\/\s*1004)/g;
  processed = processed.replace(pageRegex, (match, pageNum) => {
    const page = parseInt(pageNum, 10);
    if (page >= 1 && page <= 1004) {
      return protectLink(match, `/docs/DSD-PTTRM-JIFFY-RETAIL-V1.0_Signed.pdf#page=${page}`);
    }
    return match;
  });

  // 6. Restore all protected links
  return processed.replace(/__MD_LINK_(\d+)__/g, (_, idx) => links[Number(idx)]);
}

/**
 * Backward-compatible alias
 */
export const autoLinkPageNumbers = autoLinkBrAndCitations;
