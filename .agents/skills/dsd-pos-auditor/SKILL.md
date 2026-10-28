---
name: dsd-pos-auditor
description: |
  Expert knowledge and validation engine for PTTRM JIFFY RETAIL POS Replacement Project (Signed DSD V1.0, 1,004 pages).
  Use this skill whenever working with, querying, or verifying retail POS business requirements across BA-01 to BA-09,
  BR requirement codes (BR-01-01 to BR-09-xx), official PDF page citations, WAC costing, PO tolerance limit (±5%),
  return policies, promotion rules, and database data dictionary schemas.
---

# DSD POS Auditor & Knowledge Engine

A specialized skill for the **JIFFY RETAIL POS Replacement Project (PTTRM)** based on the official signed System Design Specification (**Signed DSD V1.0, 1,004 pages** dated 28 Sep 2026).

---

## 1. Master Structure of DSD V1.0 (9 Business Modules)

The DSD document is divided into 9 official business areas (BA-01 to BA-09):

| Module Code | Module Name (Thai) | English Scope | Page Range | Main Topics | Total BR Rules |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **BA-01** | โครงสร้างข้อมูลหลัก | Key Data Structure | หน้า 32 - 62 | 6 หัวข้อ | 22 ข้อ |
| **BA-02** | การจัดการส่วนกลาง & รายงาน | HQ & Report Management | หน้า 63 - 276 | 10 หัวข้อ | 63 ข้อ |
| **BA-03** | ระบบสมาชิก & โปรโมชั่น | CRM & Promotion | หน้า 277 - 355 | 2 หัวข้อ | 22 ข้อ |
| **BA-04** | การชำระเงิน & Blueplus+ | Payment & Blueplus+ | หน้า 356 - 401 | 4 หัวข้อ | 29 ข้อ |
| **BA-05** | การปฏิบัติงานหน้าร้าน | Store Front Operations | หน้า 402 - 547 | 7 หัวข้อ | 62 ข้อ |
| **BA-06** | การปฏิบัติงานหลังร้าน & สต็อก | Store Back & Inventory | หน้า 548 - 685 | 11 หัวข้อ | 53 ข้อ |
| **BA-07** | สั่งสินค้าสาขา & DC วังน้อย | Branch Ordering & DC | หน้า 686 - 732 | 7 หัวข้อ | 20 ข้อ |
| **BA-08** | การเชื่อมต่อ E-Tax ผ่าน IES | E-Tax Integration via IES | หน้า 733 - 758 | 3 หัวข้อ | 14 ข้อ |
| **BA-09** | Data Definition & Schemas | Data Definition & Dictionary | หน้า 759 - 1004 | 2 ส่วนหลัก | 114 ตาราง/วิว |

**เอกสารรวมทั้งสิ้น:** 1,004 หน้า, 50 หัวข้อหลัก (BR-xx-xx), 285+ รหัสข้อกำหนดย่อย (BR Items) และ 112 โครงสร้างตารางฐานข้อมูล

---

## 2. Strict Auditing Rules & Ground Truths

When answering or auditing queries about DSD specifications, follow these mandatory rules:

### A. Module BA-06 (Store Back & Inventory)
- **จำนวนหัวข้อหลัก:** มี **11 หัวข้อหลัก (BR-06-01 ถึง BR-06-11)** เสมอ (ห้ามตอบ 5 หรือ 12 ข้อเด็ดขาด)
- **จำนวนข้อกำหนดย่อย:** มี **53 ข้อ** (42 ข้อย่อย + 11 หัวข้อหลัก) ครอบคลุมหน้า 548 - 685
- **รายชื่อ 11 หัวข้อหลัก:**
  1. `BR-06-01`: การสั่งซื้อสินค้า (Procurement & Suggest Order Mode) [หน้า 551] (5 ข้อย่อย)
  2. `BR-06-02`: Smart Order - ระบบแยกใบสั่งซื้ออัตโนมัติตาม Supplier (Auto Split PO & Numbering) [หน้า 564] (1 ข้อย่อย)
  3. `BR-06-03`: การส่งรายการสั่งซื้อและการอนุมัติ (Order Submission & Approval) [หน้า 568] (5 ข้อย่อย)
  4. `BR-06-04`: การรับสินค้า (Receiving: PO/Manual/Invoice, Tolerance ±5%, WAC) [หน้า 585] (6 ข้อย่อย)
  5. `BR-06-05`: การคืนสินค้าให้ผู้ขาย (Return To Vendor - RTV) [หน้า 611] (5 ข้อย่อย)
  6. `BR-06-06`: การโอนสินค้า: Inventory Transfer (Store to Store Transfer - STO) [หน้า 628] (3 ข้อย่อย)
  7. `BR-06-07`: การตรวจนับและปรับสต็อก (Inventory Counting & Adjustment, Blind Count) [หน้า 549/642] (5 ข้อย่อย)
  8. `BR-06-08`: การจัดการสินค้าหมดอายุ/เสียหาย (Waste & Damage Management) [หน้า 658] (3 ข้อย่อย)
  9. `BR-06-09`: การจัดการสินค้าฝากขาย (Consignment Management) [หน้า 666] (4 ข้อย่อย)
  10. `BR-06-10`: การจัดการป้ายราคาและบาร์โค้ด (Price Tag and Label Management) [หน้า 673] (3 ข้อย่อย)
  11. `BR-06-11`: การใช้งานเครื่องพกพา HHT / Mobile Device สำหรับงานหลังร้าน [หน้า 679] (3 ข้อย่อย)

### B. เกณฑ์ธุรกิจสำคัญที่ต้องจำให้แม่นยำ (Key Retail Business Rules)
- **PO Number Format (`BR-06-01-01`):** ความยาวเลขที่ใบสั่งซื้อไม่เกิน 15 หลัก ประกอบด้วย `[Prefix][YYMM][Branch Code][Running Number]`
- **Tolerance Limit (`BR-06-04-03` หน้า 592):** เกณฑ์ผ่อนผันการรับสินค้าเกินจากใบสั่งซื้อได้ไม่เกิน **±5%** ของจำนวนที่สั่งซื้อ
- **WAC Calculation (`BR-06-04-05` หน้า 601):** Weighted Average Costing คำนวณใหม่เมื่อมีธุรกรรมการรับสินค้าเข้า (GRN) โดยสูตร `[(สต็อกเดิม x ต้นทุนเดิม) + (รับใหม่ x ต้นทุนใหม่)] / (สต็อกรวมใหม่)`
- **Return Policy หน้าร้าน (`BR-05-02-14` / `BR-05-02-15` หน้า 402/417):** รองรับการคืนสินค้าภายในระยะเวลาไม่เกิน **7 วัน** นับจากวันที่ออกใบเสร็จ พร้อมใบเสร็จตัวจริง
- **DC วังน้อย (`BR-07-01` หน้า 687):** รหัสคลังกระจายสินค้าหลักคือ `99001` (คลัง Chill `99002`, Cross Dock `99003`, พระราม 2 `99098`)
- **E-Tax Integration (`BA-08` หน้า 733):** เชื่อมต่อผ่านระบบ IES (INEXT Electronic System) พร้อมกลไก Retry และ Queue เมื่อระบบปลายทางขัดข้อง

---

## 3. Standard Answer Formatting

1. **Executive Summary Blockquote:**
   > **💡 สรุป:** [ตอบตรงประเด็นทันที ระบุตัวเลข/คำตอบสั้น 1-2 ประโยค]
2. **Markdown Table:** ใช้ตารางเสมอเมื่อแจกแจงรายการหรือหัวข้อ
3. **Hyperlinks:** ผูกรหัสข้อกำหนด `BR-xx-xx-xx` เพื่อให้ระบบเปิด PDF และเนื้อหาได้ทันที
4. **Zero Chinese Tokens:** ห้ามมีอักขระหรือคำภาษาจีนแม้แต่ตัวเดียวในคำตอบ ให้ใช้ภาษาไทยมาตรฐานและคำศัพท์ภาษาอังกฤษในวงเล็บ
