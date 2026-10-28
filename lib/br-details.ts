import brDetailsRaw from "../data/br-details.json";

export interface BrDetail {
  code: string;
  title: string;
  baCode: string;
  page: number;
  content: string;
}

const brDetails = brDetailsRaw as Record<string, BrDetail>;

export function getBrDetail(code: string): BrDetail | null {
  if (!code) return null;
  const cleanCode = code.trim().toUpperCase();
  if (brDetails[cleanCode]) {
    return brDetails[cleanCode];
  }
  // Try case-insensitive lookup
  const match = Object.keys(brDetails).find(
    (k) => k.toUpperCase() === cleanCode
  );
  return match ? brDetails[match] : null;
}

export function getAllBrDetails(): BrDetail[] {
  return Object.values(brDetails);
}
