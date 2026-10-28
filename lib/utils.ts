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

// Pre-compiled regular expressions for peak performance
const ARABIC_MATCH_RE = /(?:\b|[\s(])مثل(?:\b|[\s)])/g;
const ARABIC_BARE_RE = /مثل/g;
const ARABIC_CHARS_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g;
const CJK_CHARS_RE = /[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF\u3000-\u303F\uFF00-\uFFEF]/g;
const MULTI_SPACE_RE = /([^\n\S]){2,}/g;

const MD_LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;
const BR_LINK_RE = /(BR-\d{2}-\d{2}(?:-\d{2})?)(?:\s*(?:\(\s*หน้า\s*(\d{1,4})(?:\s*[\/\-]\s*\d{1,4})?\s*\)|หน้า\s*(\d{1,4})(?:\s*[\/\-]\s*\d{1,4})?))?(?:\s*(?=\)))?/g;
const AWS_BRACKET_RE = /\[(AWS-\d{2}(?:\.\d)?(?:\s+[^\]\n]+)?)\](?:\s*(?:\(\s*หน้า\s*([1-6])\s*\)|หน้า\s*([1-6])))?/gi;
const AWS_BARE_RE = /\b(AWS-(?:\d{2}(?:\.\d)?|EKS|OPENVPN|VPN|AURORA|REDIS|NETWORK|VPC|WAF|CLOUDFRONT|ALB|SECRETS))\b(?:\s*(?:\(\s*หน้า\s*([1-6])\s*\)|หน้า\s*([1-6])))?/gi;
const PAGE_STANDALONE_RE = /หน้า\s*(\d{1,4})(?:\s*(?:[\-]|ถึง)\s*\d{1,4})?(?!\s*\/\s*1004)/g;

// Precompiled OCR Split pairs
const THAI_OCR_SPLIT_PAIRS: [RegExp, string][] = [
  [/ท\s+า/g, "ทำ"],
  [/ก\s+า/g, "กำ"],
  [/จ\s+า/g, "จำ"],
  [/ช\s+า/g, "ชำ"],
  [/ส\s+า/g, "สำ"],
  [/ล\s+า/g, "ลำ"],
  [/ด\s+าเนิน/g, "ดำเนิน"],
  [/ค\s+า/g, "คำ"],
  [/น\s+า/g, "นำ"],
  [/ต\s+า/g, "ตำ"],
  [/อ\s+า/g, "อำ"],
  [/ซ\s*[้ิ]?\s*้า/g, "ซ้ำ"],
  [/ซ\s*้า/g, "ซ้ำ"],
  [/ย\s*[้ิ]?\s*้า/g, "ย้ำ"],
  [/น\s*[้ิ]?\s*้า/g, "น้ำ"],
  [/ต\s*[่ิ]?\s*่า/g, "ต่ำ"],
];

// Precompiled OCR Vocab map
const THAI_OCR_VOCAB_MAP: [RegExp, string][] = [
  [/ชาระ/g, "ชำระ"],
  [/จานวน/g, "จำนวน"],
  [/สาหรับ/g, "สำหรับ"],
  [/กาหนด/g, "กำหนด"],
  [/สาเร็จ/g, "สำเร็จ"],
  [/ลาดับ/g, "ลำดับ"],
  [/คานวณ/g, "คำนวณ"],
  [/ดาเนิน/g, "ดำเนิน"],
  [/อานาจ/g, "อำนาจ"],
  [/จาหน่าย/g, "จำหน่าย"],
  [/กาไร/g, "กำไร"],
  [/ใบกากับ/g, "ใบกำกับ"],
  [/ซ้า/g, "ซ้ำ"],
  [/ต่า/g, "ต่ำ"],
  [/ทาการ/g, "ทำการ"],
  [/ทาให้/g, "ทำให้"],
  [/ทาได้/g, "ทำได้"],
  [/ทางาน/g, "ทำงาน"],
  [/ทารายการ/g, "ทำรายการ"],
  [/ทารายงาน/g, "ทำรายงาน"],
  [/ทาเอกสาร/g, "ทำเอกสาร"],
  [/ทารับ/g, "ทำรับ"],
  [/ทาเป็น/g, "ทำเป็น"],
  [/ทาหน้าที่/g, "ทำหน้าที่"],
  [/ไม่ทา/g, "ไม่ทำ"],
  [/นาไป/g, "นำไป"],
  [/นามา/g, "นำมา"],
  [/นาส่ง/g, "นำส่ง"],
  [/นาเข้า/g, "นำเข้า"],
  [/นาออก/g, "นำออก"],
  [/นาเงิน/g, "นำเงิน"],
  [/นาข้อมูล/g, "นำข้อมูล"],
  [/นาระบบ/g, "นำระบบ"],
  [/คาสั่ง/g, "คำสั่ง"],
  [/คาขอ/g, "คำขอ"],
  [/คาอธิบาย/g, "คำอธิบาย"],
  [/คาเตือน/g, "คำเตือน"],
  [/คาถาม/g, "คำถาม"],
  [/คาตอบ/g, "คำตอบ"],
  [/คายืนยัน/g, "คำยืนยัน"],
  [/ตาแหน่ง/g, "ตำแหน่ง"],
  [/สารอง/g, "สำรอง"],
  [/สาเนา/g, "สำเนา"],
  [/สานักงาน/g, "สำนักงาน"],
  [/สารวจ/g, "สำรวจ"],
  [/สาคัญ/g, "สำคัญ"],
  [/สากล/g, "สากล"],
  [/น้ามัน/g, "น้ำมัน"],
  [/น้าหนัก/g, "น้ำหนัก"],
  [/รหัส\s+ที่/g, "รหัสที่"],
  [/ปัด\s+เศษ/g, "ปัดเศษ"],
  [/พิมพ์\s*Slip/g, "พิมพ์ Slip"],
];

/**
 * Sanitizes stray foreign language artifacts (Arabic, Chinese/CJK, fullwidth punctuation)
 * that multilingual LLMs (like Qwen) occasionally leak into Thai responses.
 */
export function sanitizeThaiResponse(text: string): string {
  if (!text) return text;
  let cleaned = text;

  // 1. Common Arabic replacements
  cleaned = cleaned
    .replace(ARABIC_MATCH_RE, (match) => {
      if (match.startsWith("(") && match.endsWith(")")) return "(เช่น)";
      if (match.startsWith("(")) return "(เช่น ";
      if (match.endsWith(")")) return "เช่น)";
      return " เช่น ";
    })
    .replace(ARABIC_BARE_RE, "เช่น")
    .replace(ARABIC_CHARS_RE, "");

  // 2. Fullwidth punctuation normalization (Chinese punctuation to standard)
  cleaned = cleaned
    .replace(/（/g, " (")
    .replace(/）/g, ") ")
    .replace(/：/g, ": ")
    .replace(/，/g, ", ")
    .replace(/。/g, " ")
    .replace(/、/g, ", ")
    .replace(/【/g, " [")
    .replace(/】/g, "] ")
    .replace(/；/g, "; ");

  // 3. Technical & contextual Chinese word replacements (translating to standard Thai retail/cloud terms)
  cleaned = cleaned
    .replace(/副本/g, "ชุดสำรอง")
    .replace(/例如|比如/g, "เช่น")
    .replace(/包括/g, "รวมถึง")
    .replace(/配置/g, "การกำหนดค่า")
    .replace(/节点/g, "โหนด")
    .replace(/集群/g, "คลัสเตอร์")
    .replace(/数据库/g, "ฐานข้อมูล")
    .replace(/服务|服務/g, "บริการ")
    .replace(/容器/g, "คอนเทนเนอร์")
    .replace(/网络|網絡/g, "เครือข่าย")
    .replace(/参数|參數/g, "พารามิเตอร์")
    .replace(/状态|狀態/g, "สถานะ")
    .replace(/错误|錯誤/g, "ข้อผิดพลาด")
    .replace(/成功/g, "สำเร็จ")
    .replace(/失败|失敗/g, "ล้มเหลว")
    .replace(/正常/g, "ปกติ")
    .replace(/异常|異常/g, "ผิดปกติ")
    .replace(/安全/g, "ความปลอดภัย")
    .replace(/访问|訪問/g, "การเข้าถึง")
    .replace(/连接|連接/g, "การเชื่อมต่อ")
    .replace(/权限|權限/g, "สิทธิ์การเข้าถึง")
    .replace(/数量/g, "จำนวน")
    .replace(/用户|用戶/g, "ผู้ใช้")
    .replace(/客户端|客戶端/g, "ไคลเอนต์")
    .replace(/等/g, " เป็นต้น")
    .replace(/的/g, "ของ")
    .replace(/和/g, " และ ")
    .replace(/或/g, " หรือ ");

  // 4. Strict removal of ANY remaining CJK characters (Ideographs, Extensions, Compatibility)
  cleaned = cleaned.replace(CJK_CHARS_RE, "");

  // 5. Clean up any resulting double spaces
  cleaned = cleaned.replace(MULTI_SPACE_RE, " ");

  return cleaned;
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

  let processed = text.replace(MD_LINK_RE, (match, label, url) => {
    return protectLink(label, url);
  });

  // 2. Transform BR codes and absorb any redundant trailing "หน้า XX" or "(หน้า XX)"
  processed = processed.replace(BR_LINK_RE, (match, brCode) => {
    return protectLink(brCode, `/documents/br/${brCode}`);
  });

  // 3. Transform AWS bracketed references
  processed = processed.replace(AWS_BRACKET_RE, (match, title) => {
    const codeMatch = title.match(/AWS-\d{2}(?:\.\d)?/i);
    const code = codeMatch ? codeMatch[0].toUpperCase() : title;
    return protectLink(title, `/documents/aws?sec=${code}`);
  });

  // 4. Transform AWS bare codes
  processed = processed.replace(AWS_BARE_RE, (match, awsCode) => {
    return protectLink(awsCode, `/documents/aws?sec=${awsCode.toUpperCase()}`);
  });

  // 5. Standalone DSD pages
  processed = processed.replace(PAGE_STANDALONE_RE, (match, pageNum) => {
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

/**
 * Cleans Thai OCR artifacts, ligature splits (e.g. 'ท า' -> 'ทำ'),
 * and missing Sara-Am (e.g. 'ชาระ' -> 'ชำระ', 'จานวน' -> 'จำนวน')
 * resulting from PDF text extraction.
 */
export function cleanThaiOcrText(text: string): string {
  if (!text) return text;
  let s = text;

  // 1. Split Sara Am / Sara Aa with space
  for (let i = 0; i < THAI_OCR_SPLIT_PAIRS.length; i++) {
    const [pattern, replacement] = THAI_OCR_SPLIT_PAIRS[i];
    s = s.replace(pattern, replacement);
  }

  // 2. Vocabulary with missing Sara-Am
  for (let i = 0; i < THAI_OCR_VOCAB_MAP.length; i++) {
    const [pattern, replacement] = THAI_OCR_VOCAB_MAP[i];
    s = s.replace(pattern, replacement);
  }

  return s;
}

