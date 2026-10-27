import { BusinessModule } from "./types";

export const suggestedQuestions = [
  {
    label: "โครงสร้างองค์กร 5 ระดับ (BA-01)",
    query: "โครงสร้างองค์กร Organization Structure ใน BA-01 มีลำดับชั้นระดับใดบ้าง?",
  },
  {
    label: "เกณฑ์ Tolerance Limit ±5% (BA-06)",
    query: "เกณฑ์ผ่อนผัน Tolerance Limit ในการรับสินค้าของ BA-06 กำหนดไว้อย่างไรและอยู่หน้าไหน?",
  },
  {
    label: "การรับสินค้าเข้า DC วังน้อย (BA-07)",
    query: "กระบวนการสั่งซื้อและรับสินค้าเข้าคลังสินค้า DC วังน้อย (99001) ใน BA-07 มีขั้นตอนอย่างไร?",
  },
  {
    label: "การชำระเงิน & Blueplus+ (BA-04)",
    query: "การเชื่อมต่อ Blueplus+ Wallet และการสะสมแต้มสมาชิกใน BA-03 / BA-04 ทำงานอย่างไร?",
  },
  {
    label: "การคืนสินค้าหน้าร้าน 7 วัน (BA-05)",
    query: "เงื่อนไขการคืนสินค้าหน้าร้านใน BA-05 กำหนดย้อนหลังได้ไม่เกินกี่วัน?",
  },
  {
    label: "รอบการคำนวณ WAC (ต้นทุนสินค้า)",
    query: "WAC ในระบบ POS Vtec Retail คำนวณตอนไหนบ้าง สรุปเป็นข้อๆ",
  },
  {
    label: "การออก E-Tax ผ่าน IES (BA-08)",
    query: "การออกใบกำกับภาษีอิเล็กทรอนิกส์ E-Tax ผ่าน IES ใน BA-08 มีรูปแบบอย่างไร?",
  },
];

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
