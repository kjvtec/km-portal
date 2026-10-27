# VTEC Retail KM - AI Knowledge Management Portal

ระบบ **AI Knowledge Management & RAG Assistant** สำหรับระบบปฏิบัติการหลังร้านและคลังสินค้าสาขา **Jiffy Convenience Store (PTTRM)** ตามข้อกำหนดเชิงลึก **DSD BA06** พัฒนาด้วย **Next.js (App Router)** เพื่อ Deploy ขึ้น **Vercel** และจัดเก็บข้อมูลบน **Supabase (PostgreSQL + pgvector)**

---

## 🚀 คุณสมบัติเด่น (Features)

1. **AI RAG Chat Assistant (ถาม-ตอบอัจฉริยะแบบ Streaming):**
   - ถามคำถามเชิงเทคนิคและกฎเกณฑ์ธุรกิจ (เช่น *"WAC คำนวณตอนไหนบ้าง?"*, *"ทำไม PO ห้ามเกิน 15 หลัก?"*, *"เงื่อนไข Tolerance ±5% ตรวจสอบอย่างไร?"*)
   - ดึงข้อมูลอ้างอิงตรงจากฐานความรู้ DSD BA06 ผ่าน **Cosine Similarity Vector Search (pgvector)**
   - แสดงผลข้อความตอบกลับแบบ Real-time Streaming พร้อม Markdown Tables และลิงก์อ้างอิง

2. **Document Ingestion Pipeline (การนำเข้าและแปลงเอกสารอัตโนมัติ):**
   - รองรับไฟล์ **Markdown (.md)**, **PDF (.pdf)**, **Word (.docx)** และ **Text (.txt)**
   - ระบบ **Auto-Chunking** แบ่งท่อนเนื้อหา ~1,000 ตัวอักษรพร้อม Overlap 150 ตัวอักษร
   - สร้างเวกเตอร์ขนาด 1,536 มิติด้วย **OpenAI `text-embedding-3-small`**
   - บันทึกลงตาราง `document_chunks` พร้อม **HNSW Index** เพื่อการค้นหาที่รวดเร็วระดับมิลลิวินาที

3. **One-Click Initial Seeding (ปุ่มเดียวพร้อมใช้งาน):**
   - มีปุ่มคลิกเดียวที่หน้า Dashboard เพื่อแปลงไฟล์ `PROJECT_KNOWLEDGE_BASE_VTEC_RETAIL.md` (ครอบคลุมทั้ง 43 ข้อกำหนด DSD BA06) เข้าสู่ระบบทันที

4. **Web Markdown Editor (พิมพ์สร้างบทความในตัว):**
   - หน้าเขียนบทความและคู่มือระบบพร้อมแถบสลับ Preview Markdown แบบสด

5. **คลังเอกสาร (Documents Explorer):**
   - หน้าแสดงรายการเอกสารทั้งหมด พร้อมจำนวน Chunks และเนื้อหาตัวอย่าง
   - หน้ารายละเอียดเอกสารจัดรูปแบบ Typography พร้อม Sidebar แสดง Metadata

---

## 🛠️ Tech Stack

- **Frontend & Fullstack:** Next.js 16 (App Router, Server Components & Route Handlers)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4, Lucide React Icons
- **Database:** Supabase PostgreSQL with `pgvector` extension
- **AI & Embeddings:** OpenAI (`text-embedding-3-small` + `gpt-4o-mini`) via Vercel AI SDK
- **Hosting:** Vercel (Edge & Serverless)

---

## 📦 ขั้นตอนการติดตั้งและใช้งาน (Quick Start)

### 1. ตั้งค่า Supabase Database

1. สมัครหรือเข้าสู่ระบบที่ [Supabase.com](https://supabase.com) แล้วสร้างโปรเจกต์ใหม่
2. ไปที่เมนู **SQL Editor** ใน Supabase Dashboard
3. คัดลอกโค้ดทั้งหมดในไฟล์ [`supabase/schema.sql`](./supabase/schema.sql) ไปวางและกด **Run**
   - โค้ดจะทำการเปิด Extension `vector`
   - สร้างตาราง `workspaces`, `documents`, `document_chunks`
   - สร้างฟังก์ชัน RPC `match_document_chunks` สำหรับทำ Similarity Search
   - สร้าง Workspace เริ่มต้น `JFFPOS Retail (PTTRM)`

### 2. ตั้งค่า Environment Variables

คัดลอกไฟล์ `.env.example` ไปเป็น `.env.local`:

```bash
cp .env.example .env.local
```

กรอกค่าคอนฟิกูเรชันใน `.env.local`:

```env
# Supabase Configuration (ดูได้ที่ Supabase Project Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# OpenAI API Key (ดูได้ที่ platform.openai.com/api-keys)
OPENAI_API_KEY=sk-proj-...
```

### 3. รันโปรเจกต์ในเครื่อง (Local Development)

```bash
npm run dev
```

เปิดบราวเซอร์ไปที่ [http://localhost:3000](http://localhost:3000)

### 4. นำเข้าข้อมูลเริ่มต้น (Seed Data)

1. เปิดหน้าแรก [http://localhost:3000](http://localhost:3000)
2. คลิกปุ่ม **"คลิกเพื่อ Seed ข้อมูลทันที"** ในกล่องสีฟ้า
3. ระบบจะอ่านไฟล์ `PROJECT_KNOWLEDGE_BASE_VTEC_RETAIL.md` แบ่ง Chunk สร้าง Embedding และบันทึกลง Supabase
4. เข้าไปที่เมนู **"AI RAG Chat"** เพื่อเริ่มทดลองถาม-ตอบคำถามได้ทันที!

---

## ☁️ ขั้นตอนการ Deploy สู่ Vercel

1. Push โค้ดโปรเจกต์ขึ้น **GitHub / GitLab**
2. เข้าสู่ [Vercel.com](https://vercel.com) แล้วกด **"Add New Project"**
3. เลือก Repository `km-portal`
4. ในหน้า **Configure Project**:
   - เพิ่ม **Environment Variables** 4 ตัว ได้แก่:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `OPENAI_API_KEY`
5. กดปุ่ม **"Deploy"**
6. เมื่อ Deploy สำเร็จ สามารถเข้าใช้งานระบบผ่าน URL ที่ Vercel มอบให้ได้ทันที
