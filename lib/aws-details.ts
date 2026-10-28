import awsDetailsRaw from "../data/aws-details.json";

export interface AwsDetail {
  code: string;
  title: string;
  section: string;
  page: number;
  summary: string;
  content: string;
}

const awsDetails = awsDetailsRaw as Record<string, AwsDetail>;

const aliasMap: Record<string, string> = {
  EKS: "AWS-04.1",
  KUBERNETES: "AWS-04.1",
  AURORA: "AWS-04.2",
  REDIS: "AWS-04.2",
  DATABASE: "AWS-04.2",
  DB: "AWS-04.2",
  STORAGE: "AWS-04.2",
  OPENVPN: "AWS-05",
  VPN: "AWS-05",
  NETWORK: "AWS-03",
  VPC: "AWS-03",
  SUBNET: "AWS-03",
  CIDR: "AWS-03",
  DNS: "AWS-02.2",
  CNAME: "AWS-02.2",
  ACCOUNT: "AWS-01",
  "MULTI-ACCOUNT": "AWS-01",
  TRAFFIC: "AWS-02",
  FLOW: "AWS-02",
  WAF: "AWS-04.3",
  CLOUDFRONT: "AWS-04.3",
  ALB: "AWS-04.3",
  SECRET: "AWS-06",
  SECRETS: "AWS-06",
  PASSWORD: "AWS-06",
  OPERATIONAL: "AWS-07",
  CAUTION: "AWS-07",
  TEST: "AWS-08",
  CHECKLIST: "AWS-08",
  CHANGELOG: "AWS-09",
  "PAGE-1": "AWS-01",
  "PAGE-2": "AWS-03",
  "PAGE-3": "AWS-04.1",
  "PAGE-4": "AWS-05",
  "PAGE-5": "AWS-06",
  "PAGE-6": "AWS-08",
};

export function getAwsDetail(codeOrQuery: string): AwsDetail | null {
  if (!codeOrQuery) return null;
  const clean = codeOrQuery.trim().toUpperCase().replace(/^#/, "");

  // Direct match
  if (awsDetails[clean]) {
    return awsDetails[clean];
  }

  // Alias match
  const mapped = aliasMap[clean];
  if (mapped && awsDetails[mapped]) {
    return awsDetails[mapped];
  }

  // Check if string contains "PAGE 3" or "หน้า 3"
  const pageMatch = clean.match(/(?:PAGE|หน้า)[-_\s]*([1-6])/i);
  if (pageMatch) {
    const p = parseInt(pageMatch[1], 10);
    const byPage = Object.values(awsDetails).find((item) => item.page === p);
    if (byPage) return byPage;
  }

  // Substring match in keys
  const keyMatch = Object.keys(awsDetails).find((k) =>
    k.toUpperCase().includes(clean) || clean.includes(k.toUpperCase())
  );
  if (keyMatch) return awsDetails[keyMatch];

  return null;
}

export function getAllAwsDetails(): AwsDetail[] {
  return Object.values(awsDetails);
}
