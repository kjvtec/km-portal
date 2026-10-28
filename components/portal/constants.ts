import { BusinessModule } from "./types";

export const allSuggestedQuestions = [
  // BA-01: Organization & Master Data
  {
    label: "โครงสร้างองค์กร 5 ระดับ (BA-01)",
    query: "โครงสร้างองค์กร Organization Structure ใน BA-01 มีลำดับชั้นระดับใดบ้าง?",
  },
  {
    label: "การกำหนดสิทธิ์ระดับ Shop & Merchant (BA-01)",
    query: "การกำหนดระดับ Company, Brand และการบริหารจัดการ Shop ใน BA-01 มีเงื่อนไขอย่างไร?",
  },
  {
    label: "Vendor & Product Assignment (BA-01)",
    query: "การผูก Vendor กับ Product และการกำหนดสถานะสินค้าใน BA-01 ทำงานอย่างไร?",
  },

  // BA-02: HQ & Report Management
  {
    label: "รายงานสรุปยอดขายประจำวัน DSR (BA-02)",
    query: "รายงานสรุปยอดขายประจำวัน Daily Sales Report (DSR) ใน BA-02 สรุปข้อมูลอะไรบ้าง?",
  },
  {
    label: "การตั้งค่า Price Group ตามโซน (BA-02)",
    query: "การจัดการข้อมูล Price Group, Price Book และการกำหนดราคาสินค้าตามสาขาใน BA-02 ทำอย่างไร?",
  },
  {
    label: "โครงสร้าง Category Group (BA-02)",
    query: "การจัด Product Hierarchy 3 ระดับ (Department, Category, Subcategory) ใน BA-02 กำหนดไว้อย่างไร?",
  },

  // BA-03: CRM & Promotions
  {
    label: "การคำนวณโปรโมชั่น Mix & Match (BA-03)",
    query: "ระบบคำนวณส่วนลดโปรโมชั่น Mix & Match และ Tier Discount ใน BA-03 มีกฎเกณฑ์อย่างไร?",
  },
  {
    label: "การใช้คูปองและสิทธิ์สมาชิก Jiffy (BA-03)",
    query: "เงื่อนไขการใช้คูปองส่วนลด สิทธิ์สมาชิก และ Voucher หน้าร้าน Jiffy ใน BA-03 กำหนดไว้อย่างไร?",
  },
  {
    label: "การแลกคะแนนสะสม Blue Card (BA-03)",
    query: "การสะสมและแลกคะแนน Blue Card รวมถึงบัตรเครดิต KBank ใน BA-03 ทำงานอย่างไร?",
  },

  // BA-04: Payment & Blueplus+
  {
    label: "การเชื่อมต่อ API Blueplus+ Wallet (BA-04)",
    query: "การเชื่อมต่อ Blueplus+ Wallet และ Payment Gateway ใน BA-04 มีสเปกทางเทคนิคอย่างไร?",
  },
  {
    label: "การชำระเงินด้วย QR Payment & EDC (BA-04)",
    query: "ขั้นตอนการชำระเงินด้วย QR PromptPay, TrueMoney และเครื่องรูดบัตร EDC ใน BA-04 ทำงานอย่างไร?",
  },
  {
    label: "กฎการ Void บิลและการ Refund คืนเงิน (BA-04)",
    query: "เงื่อนไขและข้อจำกัดในการยกเลิกบิล (Void) และการคืนเงิน (Refund) ใน BA-04 กำหนดไว้อย่างไร?",
  },

  // BA-05: Store Front Operations
  {
    label: "การคืนสินค้าหน้าร้าน 7 วัน (BA-05)",
    query: "เงื่อนไขการคืนสินค้าหน้าร้าน (Return Policy) ใน BA-05 กำหนดย้อนหลังได้ไม่เกินกี่วันและต้องใช้อะไรบ้าง?",
  },
  {
    label: "ขั้นตอนการเปิดกะ ปิดกะ และ Cash In/Out (BA-05)",
    query: "ขั้นตอนการเปิดกะ ปิดกะ ตรวจสอบเงินสดในลิ้นชัก และการนำเงินเข้า-ออก (Cash In / Out) ใน BA-05 มีอะไรบ้าง?",
  },
  {
    label: "การตรวจสอบลายนิ้วมือ Cashier & Manager (BA-05)",
    query: "การสร้างพนักงานใหม่ การเก็บลายนิ้วมือ และการอนุมัติสิทธิ์ Manager Override ใน BA-05 ทำงานอย่างไร?",
  },
  {
    label: "การขายสินค้ายกแพ็ค & UOM (BA-05)",
    query: "การสแกนบาร์โค้ดสินค้ายกแพ็คและการตัดสต็อกตามหน่วยย่อย UOM หน้าร้านใน BA-05 มีขั้นตอนอย่างไร?",
  },

  // BA-06: Store Back & Inventory
  {
    label: "เกณฑ์ Tolerance Limit ±5% (BA-06)",
    query: "เกณฑ์ผ่อนผัน Tolerance Limit ในการรับสินค้าของ BA-06 กำหนดไว้อย่างไรและอยู่หน้าไหน?",
  },
  {
    label: "รอบการคำนวณ WAC ต้นทุนสินค้า (BA-06)",
    query: "WAC (Weighted Average Cost) ในระบบ POS Vtec Retail คำนวณตอนไหนบ้าง สรุปเป็นข้อๆ?",
  },
  {
    label: "รูปแบบเลขที่ใบสั่งซื้อ PO ≤ 15 หลัก (BA-06)",
    query: "ข้อกำหนดรูปแบบและโครงสร้างเลขที่ใบสั่งซื้อ PO (PO Number Format) ใน BA-06 กำหนดไว้อย่างไร?",
  },
  {
    label: "ระบบแนะนำการสั่งซื้ออัตโนมัติ (Suggest Order) (BA-06)",
    query: "ระบบสั่งซื้อสินค้าตามปริมาณแนะนำอัตโนมัติ (Suggest Order Mode) ใน BR-06-01-04 คำนวณจากปัจจัยใดบ้าง?",
  },
  {
    label: "การตรวจนับสต็อก Cycle Count (BA-06)",
    query: "ขั้นตอนการตรวจนับสต็อกสินค้า (Cycle Count และ Physical Count) ใน BA-06 มีกระบวนการอย่างไร?",
  },
  {
    label: "การตัดจ่ายสินค้าชำรุด Waste (BA-06)",
    query: "การบันทึกตัดจ่ายสินค้าชำรุดเสียหายและหมดอายุ (Waste Management) ใน BA-06 ทำอย่างไร?",
  },
  {
    label: "การโอนสินค้าระหว่างสาขา STO (BA-06)",
    query: "ขั้นตอนการทำเอกสารโอนสินค้าระหว่างสาขา (Store to Store Transfer - STO) ใน BA-06 ทำงานอย่างไร?",
  },

  // BA-07: Branch Ordering & DC
  {
    label: "การรับสินค้าเข้า DC วังน้อย (BA-07)",
    query: "กระบวนการสั่งซื้อและรับสินค้าเข้าคลังสินค้า DC วังน้อย (รหัส 99001) ใน BA-07 มีขั้นตอนอย่างไร?",
  },
  {
    label: "ข้อกำหนด Cut-off Time สั่งสินค้า (BA-07)",
    query: "รอบเวลาสั่งสินค้า Cut-off Time และ Lead Time การกระจายสินค้าของ DC วังน้อยใน BA-07 กำหนดไว้อย่างไร?",
  },
  {
    label: "การส่งตรงจากผู้ผลิต Direct Delivery (BA-07)",
    query: "กระบวนการจัดส่งสินค้าตรงจากผู้ผลิต (Direct Supplier Delivery) ใน BA-07 ต่างจากการส่งผ่าน DC อย่างไร?",
  },

  // BA-08: E-Tax via IES
  {
    label: "การออก E-Tax ผ่าน IES (BA-08)",
    query: "การออกใบกำกับภาษีอิเล็กทรอนิกส์ E-Tax ผ่าน IES ใน BA-08 มีรูปแบบและข้อกำหนดอย่างไร?",
  },
  {
    label: "การขอใบกำกับภาษีเต็มรูปย้อนหลัง (BA-08)",
    query: "การขอใบกำกับภาษีเต็มรูปผ่านระบบออนไลน์หรือที่สาขาใน BA-08 มีขั้นตอนและเงื่อนไขเวลาอย่างไร?",
  },

  // BA-09: Data Dictionary & Schemas
  {
    label: "โครงสร้างตาราง shop_categorygroup (BA-09)",
    query: "Data Dictionary โครงสร้างตาราง shop_categorygroup ใน BA-09 มีฟิลด์อะไรบ้างและอยู่หน้าไหน?",
  },
  {
    label: "Data Views & Mapping Schemas (BA-09)",
    query: "ภาพรวมโครงสร้างตารางฐานข้อมูลและ Data Views หลักในหมวด BA-09 สรุปเป็นหัวข้อสำคัญมีอะไรบ้าง?",
  },

  // AWS Cloud Architecture & Infrastructure (DEV Environment v1.5)
  {
    label: "สถาปัตยกรรม AWS Multi-Account",
    query: "โครงสร้าง AWS Multi-Account ของระบบ PTTRM VTEC JIFFY POS ใน DEV มี Account ใดบ้างและแบ่งหน้าที่อย่างไร?",
  },
  {
    label: "การไหลของทราฟฟิก & CNAME",
    query: "เส้นทางการไหลของทราฟฟิก (Traffic Flow) จาก CloudFront ไปยัง EKS Pods และการตั้งค่า DNS CNAME ทำอย่างไร?",
  },
  {
    label: "สเปก EKS Cluster & Node Group",
    query: "Amazon EKS Cluster (vtechq-eks-dev) ใช้ Kubernetes เวอร์ชันใด มี Node Group สเปกอะไร และมี Add-on อะไรบ้าง?",
  },
  {
    label: "ขั้นตอนเชื่อมต่อ OpenVPN เข้า EKS/DB",
    query: "ขั้นตอนการเชื่อมต่อ OpenVPN Access Server เข้าสู่เครือข่ายภายในเพื่อสั่งงาน EKS และฐานข้อมูลต้องทำอย่างไร?",
  },
  {
    label: "สเปก Aurora PostgreSQL & Redis",
    query: "ฐานข้อมูล Amazon Aurora PostgreSQL และ ElastiCache Redis ใน DEV มีขนาด Instance, พอร์ต และนโยบายความปลอดภัยอย่างไร?",
  },
  {
    label: "VPC CIDR & การแบ่ง Subnet 3 AZ",
    query: "สถาปัตยกรรมโครงข่าย VPC, วง IP หลัก (Primary CIDR), Pod Secondary CIDR และการจัดแบ่ง Subnet ใน 3 Availability Zones เป็นอย่างไร?",
  },
];

export const suggestedQuestions = allSuggestedQuestions.slice(0, 7);

export const businessModules: BusinessModule[] = [
  {
    code: "BA-01",
    name: "โครงสร้างข้อมูลหลัก",
    en: "Key Data Structure",
    desc: "Company > Brand > Region > District > Shop, Product & Vendor Assignment",
    pages: "หน้า 32 - 62",
    startPage: 32,
  },
  {
    code: "BA-02",
    name: "การจัดการส่วนกลาง & รายงาน",
    en: "HQ & Report Management",
    desc: "ข้อมูล Brand, Shop Category, ช่องทางการขาย, Price Group และรายงาน DSR",
    pages: "หน้า 63 - 276",
    startPage: 63,
  },
  {
    code: "BA-03",
    name: "ระบบสมาชิก & โปรโมชั่น",
    en: "CRM & Promotion",
    desc: "Mix & Match, คูปอง, สิทธิ์สมาชิก และโปรโมชั่นหน้าร้าน Jiffy",
    pages: "หน้า 277 - 355",
    startPage: 277,
  },
  {
    code: "BA-04",
    name: "การชำระเงิน & Blueplus+",
    en: "Payment & Blueplus+",
    desc: "เชื่อมต่อ API Blueplus+ Wallet, Payment Gateway, การสะสมแต้ม และการคืนเงิน",
    pages: "หน้า 356 - 401",
    startPage: 356,
  },
  {
    code: "BA-05",
    name: "การปฏิบัติงานหน้าร้าน",
    en: "Store Front Operations",
    desc: "กระบวนการขาย POS หน้าร้าน, การคืนสินค้าภายใน 7 วัน, Cash In / Cash Out",
    pages: "หน้า 402 - 449",
    startPage: 402,
  },
  {
    code: "BA-06",
    name: "การปฏิบัติงานหลังร้าน & สต็อก",
    en: "Store Back & Inventory",
    desc: "PO ≤ 15 หลัก, รับสินค้า e-Invoice ตรวจ Tolerance ±5%, โอนสินค้า, ตรวจนับสต็อก และ WAC",
    pages: "หน้า 450 - 685",
    startPage: 450,
  },
  {
    code: "BA-07",
    name: "สั่งสินค้าสาขา & DC วังน้อย",
    en: "Branch Ordering & DC",
    desc: "เติมสินค้าคงคลัง DC วังน้อย (99001), Cut-off Time, Smart Order และ Direct Supplier",
    pages: "หน้า 686 - 732",
    startPage: 686,
  },
  {
    code: "BA-08",
    name: "การเชื่อมต่อ E-Tax ผ่าน IES",
    en: "E-Tax Integration",
    desc: "จัดทำ ออก และส่งข้อมูลใบกำกับภาษีอิเล็กทรอนิกส์ผ่านระบบ IES ตามกรมสรรพากร",
    pages: "หน้า 733 - 758",
    startPage: 733,
  },
  {
    code: "BA-09",
    name: "Data Dictionary & Definition",
    en: "Data Definition",
    desc: "พจนานุกรมข้อมูล, โครงสร้างตารางฐานข้อมูล, Data Views และตาราง Mapping ข้อมูล",
    pages: "หน้า 759 - 1004",
    startPage: 759,
  },
];
