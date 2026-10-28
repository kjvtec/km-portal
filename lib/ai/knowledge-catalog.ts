import baBrStructureRaw from "../../data/ba-br-structure.json";
import awsDetailsRaw from "../../data/aws-details.json";
import brDetailsRaw from "../../data/br-details.json";

export interface BaModuleMeta {
  code: string;
  name: string;
  enName: string;
  pages: string;
  startPage: number;
  endPage: number;
  totalItems: number;
  mainTopicsCount: number;
  mainTopics: Array<{
    code: string;
    title: string;
    page: number;
    subItemsCount?: number;
  }>;
  description: string;
}

export interface AwsTopicMeta {
  code: string;
  title: string;
  page: number;
  summary: string;
}

// Master official catalog for BA-01 to BA-09
export const officialBaModules: Record<string, BaModuleMeta> = {
  "BA-01": {
    code: "BA-01",
    name: "โครงสร้างข้อมูลหลัก",
    enName: "Key Data Structure",
    pages: "หน้า 32 - 62",
    startPage: 32,
    endPage: 62,
    totalItems: 22,
    mainTopicsCount: 6,
    description: "Company (Merchant) > Brand > Region > District > Shop, Product & Vendor Assignment",
    mainTopics: [
      { code: "BR-01-01", title: "Organization Structure (Company, Brand, Region, District, Shop)", page: 33, subItemsCount: 4 },
      { code: "BR-01-02", title: "Product Hierarchy (Department, Category, Subcategory, Item, Barcode)", page: 39, subItemsCount: 5 },
      { code: "BR-01-03", title: "Vendor Hierarchy (Vendor Group & Vendor Mapping)", page: 48, subItemsCount: 3 },
      { code: "BR-01-04", title: "Vendor Product Assignment (ความสัมพันธ์ Vendor กับสินค้าตามสาขา)", page: 54, subItemsCount: 2 },
      { code: "BR-01-05", title: "Product Assortment (Shop - Item Relationship การจำหน่ายตามสาขา)", page: 58, subItemsCount: 1 },
      { code: "BR-01-06", title: "Organization Product Assignment (การสืบทอดสินค้าตามระดับองค์กร)", page: 60, subItemsCount: 1 },
    ],
  },
  "BA-02": {
    code: "BA-02",
    name: "การจัดการส่วนกลาง & รายงาน",
    enName: "HQ & Report Management",
    pages: "หน้า 63 - 276",
    startPage: 63,
    endPage: 276,
    totalItems: 63,
    mainTopicsCount: 10,
    description: "ข้อมูล Brand, Shop Category, ช่องทางการขาย, Price Group, สิทธิ์ผู้ใช้ และรายงาน DSR",
    mainTopics: [
      { code: "BR-02-01", title: "การจัดการข้อมูล Brand", page: 67, subItemsCount: 1 },
      { code: "BR-02-02", title: "การจัดการข้อมูลร้านค้า และกลุ่มร้านค้า", page: 71, subItemsCount: 1 },
      { code: "BR-02-03", title: "การจัดการช่องทางการขาย (Sale Channels)", page: 74, subItemsCount: 2 },
      { code: "BR-02-04", title: "การจัดการข้อมูลสินค้า (Product Master & Barcode)", page: 77, subItemsCount: 11 },
      { code: "BR-02-05", title: "การจัดการช่วงเวลาราคาสินค้า (Price Book & Sale Mode)", page: 97, subItemsCount: 9 },
      { code: "BR-02-06", title: "การจัดการข้อมูลผู้ขายและจัดซื้อ (Vendor & Purchasing)", page: 110, subItemsCount: 2 },
      { code: "BR-02-07", title: "การจัดการสิทธิ์ผู้ใช้งาน (User & Role Permission)", page: 114, subItemsCount: 4 },
      { code: "BR-02-08", title: "การตั้งค่าระบบ POS และสาขา (POS Station & Branch Config)", page: 128, subItemsCount: 5 },
      { code: "BR-02-09", title: "การจัดการเงินสด (Cash Management) และเหตุผล (Reason Code)", page: 65, subItemsCount: 3 },
      { code: "BR-02-10", title: "รายงานส่วนกลาง (Reports - DSR, Sales, Hourly, Inventory, Audit)", page: 154, subItemsCount: 15 },
    ],
  },
  "BA-03": {
    code: "BA-03",
    name: "ระบบสมาชิก & โปรโมชั่น",
    enName: "CRM & Promotion",
    pages: "หน้า 277 - 355",
    startPage: 277,
    endPage: 355,
    totalItems: 22,
    mainTopicsCount: 2,
    description: "Mix & Match, คูปองส่วนลด, สิทธิ์สมาชิก Blue Card / Blueplus+ และโปรโมชั่นหน้าร้าน Jiffy",
    mainTopics: [
      { code: "BR-03-01", title: "การจัดการโปรโมชั่น (Price Off, Bundle, Mix & Match, Step Discount, Tier)", page: 278, subItemsCount: 10 },
      { code: "BR-03-02", title: "การจัดการคูปอง, Voucher และสิทธิ์สมาชิก Blueplus+ (Coupon, Discount Voucher, Member Points)", page: 323, subItemsCount: 10 },
    ],
  },
  "BA-04": {
    code: "BA-04",
    name: "การชำระเงิน & Blueplus+",
    enName: "Payment & Blueplus+",
    pages: "หน้า 356 - 401",
    startPage: 356,
    endPage: 401,
    totalItems: 29,
    mainTopicsCount: 4,
    description: "เชื่อมต่อ API Blueplus+ Wallet, QR PromptPay, TrueMoney, EDC และการคืนเงิน Refund",
    mainTopics: [
      { code: "BR-04-01", title: "Payment Configuration (ตั้งค่า MID/TID, EDC, Payment Gateway)", page: 357, subItemsCount: 3 },
      { code: "BR-04-02", title: "Payment Processing (เงินสด, QR Payment, บัตรเครดิต, Blueplus+ Wallet)", page: 362, subItemsCount: 13 },
      { code: "BR-04-03", title: "การคืนสินค้าและคืนเงินผ่านโปรแกรม POS (Refund & Return Payment)", page: 389, subItemsCount: 8 },
      { code: "BR-04-04", title: "การเติมเงิน blueplus+ ผ่านโปรแกรม POS (Top-up Transaction)", page: 399, subItemsCount: 1 },
    ],
  },
  "BA-05": {
    code: "BA-05",
    name: "การปฏิบัติงานหน้าร้าน",
    enName: "Store Front Operations",
    pages: "หน้า 402 - 547",
    startPage: 402,
    endPage: 547,
    totalItems: 62,
    mainTopicsCount: 7,
    description: "กระบวนการขาย POS หน้าร้าน, สแกนลายนิ้วมือ, การคืนสินค้าภายใน 7 วัน, Cash In/Cash Out, ปิดกะ/ปิดวัน",
    mainTopics: [
      { code: "BR-05-01", title: "การสร้างพนักงานใหม่, สแกนลายนิ้วมือ และการเปิดกะ (Shift Open & Biometrics)", page: 402, subItemsCount: 5 },
      { code: "BR-05-02", title: "การขายสินค้าที่ POS, ยกเลิกบิล, คืนสินค้า 7 วัน และธุรกรรมหน้าร้าน (Sales & Store Operations)", page: 417, subItemsCount: 23 },
      { code: "BR-05-03", title: "การขายผ่านช่องทางอื่นนอกเหนือจาก POS (Delivery & External Channels)", page: 473, subItemsCount: 2 },
      { code: "BR-05-04", title: "การปัดเศษตามวิธีการรับชำระเงิน (Rounding Rules)", page: 479, subItemsCount: 7 },
      { code: "BR-05-05", title: "ใบกำกับภาษีอย่างย่อและใบกำกับภาษีเต็มรูปหน้าร้าน (Tax Invoice & Receipt)", page: 488, subItemsCount: 10 },
      { code: "BR-05-06", title: "การปิดกะ, ปิดวัน, การฝากเงิน และรายงานสรุปหน้าร้าน (Shift End, End of Day, Drop Cash)", page: 515, subItemsCount: 5 },
      { code: "BR-05-07", title: "การจัดการอื่นๆ การขายแบบ Offline Mode และ Training Mode", page: 541, subItemsCount: 3 },
    ],
  },
  "BA-06": {
    code: "BA-06",
    name: "การปฏิบัติงานหลังร้าน & สต็อกสินค้า",
    enName: "Store Operation & Store Inventory",
    pages: "หน้า 548 - 685",
    startPage: 548,
    endPage: 685,
    totalItems: 53,
    mainTopicsCount: 11,
    description: "การสั่งซื้อสินค้า PO ≤ 15 หลัก, Smart Order, รับสินค้า e-Invoice ตรวจ Tolerance ±5%, คืนสินค้า RTV, โอนสินค้า STO, ตรวจนับสต็อก, สินค้าเสียหาย Waste, ป้ายราคา และ HHT",
    mainTopics: [
      { code: "BR-06-01", title: "การสั่งซื้อสินค้า (Procurement & Suggest Order Mode)", page: 551, subItemsCount: 5 },
      { code: "BR-06-02", title: "Smart Order - ระบบแยกใบสั่งซื้ออัตโนมัติตาม Supplier (Auto Split PO & Numbering)", page: 564, subItemsCount: 1 },
      { code: "BR-06-03", title: "การส่งรายการสั่งซื้อและการอนุมัติ (Order Submission & Approval)", page: 568, subItemsCount: 5 },
      { code: "BR-06-04", title: "การรับสินค้า (Receiving: PO/Manual/Invoice, Tolerance ±5%, WAC recalculation)", page: 585, subItemsCount: 6 },
      { code: "BR-06-05", title: "การคืนสินค้าให้ผู้ขาย (Return To Vendor - RTV)", page: 611, subItemsCount: 5 },
      { code: "BR-06-06", title: "การโอนสินค้า: Inventory Transfer (Store to Store Transfer - STO)", page: 628, subItemsCount: 3 },
      { code: "BR-06-07", title: "การตรวจนับและปรับสต็อก (Inventory Counting & Adjustment, Blind Count)", page: 549, subItemsCount: 5 },
      { code: "BR-06-08", title: "การจัดการสินค้าหมดอายุ/เสียหาย (Waste & Damage Management)", page: 658, subItemsCount: 3 },
      { code: "BR-06-09", title: "การจัดการสินค้าฝากขาย (Consignment Management)", page: 666, subItemsCount: 4 },
      { code: "BR-06-10", title: "การจัดการป้ายราคาและบาร์โค้ด (Price Tag and Label Management)", page: 673, subItemsCount: 3 },
      { code: "BR-06-11", title: "การใช้งานเครื่องพกพา HHT / Mobile Device สำหรับงานหลังร้าน", page: 679, subItemsCount: 3 },
    ],
  },
  "BA-07": {
    code: "BA-07",
    name: "สั่งสินค้าสาขา & DC วังน้อย",
    enName: "Branch Ordering & DC",
    pages: "หน้า 686 - 732",
    startPage: 686,
    endPage: 732,
    totalItems: 20,
    mainTopicsCount: 7,
    description: "กระบวนการสั่งและรับสินค้าผ่านคลัง DC วังน้อย (99001), คลัง Chill (99002), Cross Dock (99003), Direct Supplier Delivery, Cut-off Time และ API Interface",
    mainTopics: [
      { code: "BR-07-01", title: "Process คลัง DC วังน้อย (รหัสคลัง 99001: สั่งซื้อและรับเข้าคลัง)", page: 687, subItemsCount: 3 },
      { code: "BR-07-02", title: "Process คลัง Chill (รหัสคลัง 99002: สินค้าแช่เย็นควบคุมอุณหภูมิ)", page: 694, subItemsCount: 2 },
      { code: "BR-07-03", title: "Process คลัง Cross Dock (รหัสคลัง 99003: กระจายสินค้าด่วน)", page: 700, subItemsCount: 2 },
      { code: "BR-07-04", title: "Process DSD (Direct Supplier Delivery จัดส่งตรงจากผู้ผลิต)", page: 706, subItemsCount: 1 },
      { code: "BR-07-05", title: "Process คลังพระราม 2 (รหัสคลัง 99098: คลังรับคืนและซ่อมบำรุง)", page: 708, subItemsCount: 2 },
      { code: "BR-07-06", title: "การปรับปรุงสต็อกส่วนกลาง (Central Stock Adjustment)", page: 713, subItemsCount: 1 },
      { code: "BR-07-07", title: "Interface API & Data View เชื่อมโยงระบบคลังสินค้า", page: 715, subItemsCount: 2 },
    ],
  },
  "BA-08": {
    code: "BA-08",
    name: "การเชื่อมต่อ E-Tax ผ่าน IES",
    enName: "E-Tax Integration via IES",
    pages: "หน้า 733 - 758",
    startPage: 733,
    endPage: 758,
    totalItems: 14,
    mainTopicsCount: 3,
    description: "การออกใบกำกับภาษีอิเล็กทรอนิกส์ผ่านระบบ IES (INEXT Electronic System) ตามมาตรฐานกรมสรรพากร, การ Retry ส่งข้อมูล และการจัดการ Error",
    mainTopics: [
      { code: "BR-08-01", title: "ประเภทเอกสารและขอบเขตการใช้งาน E-Tax / Operation Flow", page: 733, subItemsCount: 2 },
      { code: "BR-08-02", title: "การติดตามสถานะการส่ง, กลไก Retry อัตโนมัติ และการจัดการข้อผิดพลาด", page: 744, subItemsCount: 2 },
      { code: "BR-08-03", title: "การเปิด/ปิดระบบ E-Tax แยกรายสาขา และการกำหนดสิทธิ์ผู้จัดการ", page: 751, subItemsCount: 7 },
    ],
  },
  "BA-09": {
    code: "BA-09",
    name: "Data Definition & Data Dictionary",
    enName: "Data Definition",
    pages: "หน้า 759 - 1004",
    startPage: 759,
    endPage: 1004,
    totalItems: 114,
    mainTopicsCount: 2,
    description: "พจนานุกรมข้อมูล, โครงสร้างตารางฐานข้อมูล 112 ตารางหลัก (เช่น shop_data, products, document, ordertransaction, count_sheet), Data Views และ Schemas",
    mainTopics: [
      { code: "Section 1", title: "ภาพรวมพจนานุกรมข้อมูล (Data Dictionary Overview)", page: 759, subItemsCount: 2 },
      { code: "Section 2", title: "รายละเอียดโครงสร้างตารางฐานข้อมูล (Data Dictionary Detail - 112 Tables)", page: 765, subItemsCount: 112 },
    ],
  },
};

// Master official catalog for AWS Cloud Architecture
export const officialAwsTopics: AwsTopicMeta[] = [
  { code: "AWS-01", title: "ข้อมูลบัญชี AWS Multi-Account & โครงสร้างสิทธิ์", page: 1, summary: "Multi-Account (Security, Shared Services, Non-Prod Workload)" },
  { code: "AWS-02", title: "เส้นทางการเชื่อมต่อเครือข่ายและการไหลของทราฟฟิก (Traffic Flow)", page: 2, summary: "CloudFront -> Public ALB -> EKS Ingress Controller -> Pods" },
  { code: "AWS-02.2", title: "การตั้งค่า DNS CNAME & SSL Termination", page: 2, summary: "Route 53 CNAME, ACM SSL/TLS Certificates, Wildcard Domains" },
  { code: "AWS-03", title: "สถาปัตยกรรมเครือข่าย VPC & ซับเน็ต (Subnets 3 AZs)", page: 2, summary: "VPC 10.150.0.0/16, Pod Secondary CIDR 10.151.0.0/16, Public/Private Subnets" },
  { code: "AWS-04.1", title: "Amazon EKS Cluster & Node Group (Kubernetes 1.35)", page: 3, summary: "Cluster vtechq-eks-dev, Node m6i.large, Private Endpoint, CoreDNS, VPC-CNI" },
  { code: "AWS-04.2", title: "Amazon Aurora PostgreSQL 17.5 & ElastiCache Redis 7.1", page: 4, summary: "Aurora pg 17.5 (db.t4g.medium), Redis 7.1 (cache.t4g.small), Multi-AZ, Auth Token" },
  { code: "AWS-04.3", title: "Public Application Load Balancer & AWS WAF", page: 4, summary: "Dualstack ALB, AWS WAF WebACL, Rate Limiting, Core Rule Set" },
  { code: "AWS-05", title: "สถาปัตยกรรม OpenVPN Access Server & Private Access", page: 5, summary: "VPN 10.150.10.10, Profile Config, kubectl & DB Tunneling" },
  { code: "AWS-06", title: "การรักษาความปลอดภัยและจัดการความลับ (AWS Secrets Manager)", page: 5, summary: "Aurora Master Password, Redis Auth Token, KMS CMK Encryption" },
  { code: "AWS-07", title: "สรุปหมายเหตุการดำเนินงาน (Operational Notes)", page: 6, summary: "Backup Policy, Patching Window, Monitoring CloudWatch & Container Insights" },
  { code: "AWS-08", title: "เช็คลิสต์ตรวจสอบระบบ (Verification Checklist)", page: 6, summary: "TC-01 ถึง TC-11 Verification Tests (Result: PASS)" },
  { code: "AWS-09", title: "ประวัติการปรับปรุงเอกสาร (Changelog Summary v1.0 - v1.5)", page: 6, summary: "DailiTech Revision History DEV Environment" },
];

/**
 * Normalizes query string to detect specific module codes
 */
export function detectModuleOrBrCode(query: string): {
  baCode?: string;
  isCountOrListQuery: boolean;
  isOverviewQuery: boolean;
  isAwsQuery: boolean;
  specificBrCode?: string;
  specificAwsCode?: string;
} {
  const q = query.trim().toUpperCase();

  // 1. Detect BA code pattern (BA-01 to BA-09, BA01 to BA09, BA1 to BA9)
  const baMatch = q.match(/\bBA[-_\s]?0?([1-9])\b/i);
  let baCode: string | undefined;
  if (baMatch) {
    const num = baMatch[1];
    baCode = `BA-0${num}`;
  }

  // 2. Detect Specific BR code (BR-01-01, BR-06-04-03, etc.)
  const brMatch = q.match(/\bBR[-_\s]?0?[1-9][-_\s]\d{2}(?:[-_\s]\d{2})?\b/i);
  let specificBrCode: string | undefined;
  if (brMatch) {
    specificBrCode = brMatch[0].replace(/\s+/g, "").replace(/_/g, "-");
  }

  // 3. Detect AWS queries
  const isAwsQuery = /AWS|AMAZON|EKS|AURORA|REDIS|CLOUDFRONT|OPENVPN|VPC|SUBNET|ALB|WAF/i.test(q);
  const awsMatch = q.match(/AWS[-_\s]?(0[1-9](?:\.\d)?)/i);
  let specificAwsCode: string | undefined;
  if (awsMatch) {
    specificAwsCode = `AWS-${awsMatch[1]}`;
  }

  // 4. Detect Intent: Asking for count, list, structure, summary of items
  const isCountOrListQuery =
    /กี่ข้อ|กี่หัวข้อ|มีอะไรบ้าง|มีหัวข้ออะไร|สรุปหัวข้อ|โครงสร้าง|กี่หมวด|มีกี่|หัวข้อหลัก|ข้อย่อย|รายชื่อ|สารบัญ|TABLE OF CONTENTS|LIST|HOW MANY/i.test(
      query
    );

  // 5. Detect general DSD overview
  const isOverviewQuery =
    /DSD มีกี่|กี่หมวด|สรุปหมวด|มีกี่ข้อทั้ง|ภาพรวม DSD|มีกี่หน้า|ทั้ง 9 หมวด|ครบทั้ง 9/i.test(query);

  return {
    baCode,
    isCountOrListQuery,
    isOverviewQuery,
    isAwsQuery,
    specificBrCode,
    specificAwsCode,
  };
}

/**
 * Builds deterministic, verified ground truth context for the AI prompt
 */
export function buildGroundTruthContext(query: string): string {
  const intent = detectModuleOrBrCode(query);
  const contextParts: string[] = [];

  // A. If user asks specifically about a BA module (e.g., BA-06, BA-01)
  if (intent.baCode && officialBaModules[intent.baCode]) {
    const ba = officialBaModules[intent.baCode];
    const lines: string[] = [
      `=== [โครงสร้างและสถิติที่เป็นทางการ 100% ของหมวด ${ba.code}: ${ba.name} (${ba.enName})] ===`,
      `- เอกสารอ้างอิง: DSD PTTRM JIFFY RETAIL V1.0 (${ba.pages})`,
      `- จำนวนหัวข้อหลักทั้งหมด: ${ba.mainTopicsCount} หัวข้อหลัก (${ba.mainTopics[0].code} ถึง ${ba.mainTopics[ba.mainTopics.length - 1].code})`,
      `- จำนวนข้อกำหนดรวมทั้งสิ้น: ${ba.totalItems} ข้อ (รวมหัวข้อหลักและข้อย่อย)`,
      `- คำอธิบายขอบเขต: ${ba.description}`,
      ``,
      `ตารางสรุปหัวข้อหลักทั้งหมด ${ba.mainTopicsCount} หัวข้อของ ${ba.code}:`,
      `| ลำดับ | รหัสหัวข้อหลัก | ชื่อหัวข้อข้อกำหนด (Business Requirement) | จำนวนข้อย่อย | หน้าอ้างอิงใน DSD |`,
      `| :---: | :--- | :--- | :---: | :---: |`,
    ];

    ba.mainTopics.forEach((t, idx) => {
      lines.push(
        `| ${idx + 1} | **${t.code}** | ${t.title} | ${t.subItemsCount ? `${t.subItemsCount} ข้อ` : "-"} | หน้า ${t.page} |`
      );
    });

    lines.push(``);
    lines.push(
      `⚠️ คำสั่งเด็ดขาดสำหรับ AI: เมื่อผู้ใช้ถามว่า ${ba.code} มีกี่ข้อ ให้ตอบอย่างถูกต้องชัดเจนทันทีว่า "มี ${ba.mainTopicsCount} หัวข้อหลัก" (และมีข้อกำหนดย่อยรวมทั้งสิ้น ${ba.totalItems} ข้อ) และต้องแจกแจงรายชื่อหัวข้อหลักทั้ง ${ba.mainTopicsCount} หัวข้อตามตารางด้านบนให้ครบถ้วน ห้ามตอบตกหล่น ห้ามตอบ 5 ข้อ หรือตัวเลขอื่นเด็ดขาด!`
    );

    contextParts.push(lines.join("\n"));
  }

  // B. If user asks about DSD overview or total count across all modules
  if (intent.isOverviewQuery) {
    const lines: string[] = [
      `=== [ภาพรวมโครงสร้างเอกสาร DSD PTTRM JIFFY RETAIL V1.0 ฉบับทางการ (1,004 หน้า) ครบทั้ง 9 หมวด] ===`,
      `| หมวด | ชื่อหมวดภาษาไทย | ขอบเขตหน้าที่สำคัญ | จำนวนหัวข้อหลัก | หน้าอ้างอิง |`,
      `| :--- | :--- | :--- | :---: | :---: |`,
    ];

    Object.values(officialBaModules).forEach((m) => {
      lines.push(
        `| **${m.code}** | ${m.name} | ${m.description} | ${m.mainTopicsCount} หัวข้อ (${m.totalItems} ข้อย่อย) | ${m.pages} |`
      );
    });

    lines.push(``);
    lines.push(
      `สรุปยอดรวมทั้งเอกสาร DSD: มี 9 หมวดธุรกิจ (BA-01 ถึง BA-09), รวม 50 หัวข้อหลัก, 285+ รหัสข้อกำหนด และ 112 ตารางฐานข้อมูล รวมความยาว 1,004 หน้า`
    );

    contextParts.push(lines.join("\n"));
  }

  // C. If user asks about AWS Structure / Topics
  if (intent.isAwsQuery && intent.isCountOrListQuery) {
    const lines: string[] = [
      `=== [โครงสร้างและหัวข้อทั้งหมดของคลังความรู้ AWS Cloud DEV Environment v1.5] ===`,
      `เอกสารอ้างอิง: AWS Resource Summary Report DEV Environment v1.5 โดย DailiTech`,
      `จำนวนหัวข้อหลัก: 8 หมวดหลัก (รวม 12 รหัสหัวข้อย่อย)`,
      `| รหัสหัวข้อ | ชื่อหัวข้อระบบ AWS | หน้าอ้างอิง | สรุปประเด็นสำคัญ |`,
      `| :--- | :--- | :---: | :--- |`,
    ];

    officialAwsTopics.forEach((t) => {
      lines.push(`| [${t.code}] | ${t.title} | หน้า ${t.page} | ${t.summary} |`);
    });

    contextParts.push(lines.join("\n"));
  }

  // D. If user specifically asks for a single BR code (e.g., BR-06-04-03)
  if (intent.specificBrCode) {
    const brKey = intent.specificBrCode.toUpperCase();
    const details = brDetailsRaw as Record<string, { code: string; title: string; baCode: string; page: number; content: string }>;
    if (details[brKey]) {
      const item = details[brKey];
      contextParts.push(
        `=== [ข้อมูลเจาะจงของรหัส ${item.code} จากฐานข้อมูล DSD Signed] ===\n` +
        `รหัส: ${item.code}\n` +
        `หมวด: ${item.baCode}\n` +
        `ชื่อหัวข้อ: ${item.title}\n` +
        `หน้าอ้างอิงใน DSD: หน้า ${item.page}\n` +
        `เนื้อหาข้อกำหนด:\n${item.content}`
      );
    }
  }

  // E. If user specifically asks for a single AWS code (e.g., AWS-04.1)
  if (intent.specificAwsCode) {
    const awsKey = intent.specificAwsCode.toUpperCase();
    const awsMap = awsDetailsRaw as Record<string, { code: string; title: string; page: number; content: string }>;
    if (awsMap[awsKey]) {
      const item = awsMap[awsKey];
      contextParts.push(
        `=== [ข้อมูลเจาะจงของหัวข้อ [${item.code}] จากรายงานสถาปัตยกรรม AWS DEV v1.5] ===\n` +
        `รหัส: [${item.code}]\n` +
        `ชื่อหัวข้อ: ${item.title}\n` +
        `หน้าอ้างอิง: หน้า ${item.page}\n` +
        `เนื้อหารายละเอียด:\n${item.content}`
      );
    }
  }

  return contextParts.join("\n\n");
}
