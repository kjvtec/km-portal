import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { supabase } from "./supabase-client.mjs";

const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY || "YOUR_GROQ_KEY_HERE",
});

async function testRAG(query, searchTerm) {
  console.log(`\n========================================`);
  console.log(`User Query: "${query}" (Term: "${searchTerm}")`);
  console.log(`========================================`);

  const { data: matchedChunks } = await supabase.rpc("search_document_chunks_text", {
    query_text: searchTerm,
    match_count: 4,
  });

  const contextText = (matchedChunks || [])
    .map(
      (chunk, i) =>
        `--- [เอกสารอ้างอิงที่ ${i + 1}: ${chunk.title}] ---\n${chunk.content}`
    )
    .join("\n\n");

  const systemPrompt = `คุณคือ "VTEC Retail AI Assistant" ผู้เชี่ยวชาญด้าน Knowledge Management และเอกสารข้อกำหนดการออกแบบระบบ DSD PTTRM JIFFY RETAIL V1.0 (Signed ฉบับทางการ 1,004 หน้า ครอบคลุมหมวด BA-01 ถึง BA-09 สำหรับร้านสะดวกซื้อ Jiffy / PTTRM)

หน้าที่ของคุณ:
1. ตอบคำถามของผู้ใช้อย่างกระชับ ถูกต้อง ชัดเจน เป็นมืออาชีพ โดยอ้างอิงจากข้อมูลบริบท (Context) ที่ได้รับจากเอกสาร DSD
2. รักษาความถูกต้องของรหัสข้อกำหนด (Business Requirements เช่น BR-01-xx-xx ถึง BR-09-xx-xx), ขั้นตอนการทำงาน (SOPs), ข้อกำหนดของระบบ, และเงื่อนไขทางเทคนิคอย่างเคร่งครัด
3. ระบุเลขหน้า (เช่น หน้า X/1004) และหมวด (เช่น BA-01, BA-06) ตามที่ระบุในบริบทของเอกสารอ้างอิงเสมอ เพื่อให้ผู้ใช้สามารถตรวจสอบกลับไปยังเอกสารต้นฉบับได้
4. หากคำถามใดไม่มีข้อมูลในบริบท ให้ตอบตามหลักความจริงและแจ้งผู้ใช้ว่าไม่พบข้อมูลดังกล่าวในเอกสาร DSD

${contextText ? `### ข้อมูลบริบทที่ดึงมาจากฐานความรู้ (Context):\n${contextText}` : "### คำแนะนำ: ไม่พบเอกสารที่เกี่ยวข้องโดยตรง ให้ตอบตามข้อมูลทั่วไปหรือขอคำค้นหาเพิ่มเติม"}`;

  const result = streamText({
    model: groq("qwen/qwen3.8-27b"),
    system: systemPrompt,
    messages: [{ role: "user", content: query }],
  });

  process.stdout.write("AI Answer:\n");
  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }
  console.log("\n");
}

async function main() {
  await testRAG(
    "เกณฑ์ผ่อนผัน Tolerance Limit ในการรับสินค้าของ BA-06 กำหนดไว้อย่างไรและอยู่หน้าไหน",
    "Tolerance Limit"
  );
  await testRAG(
    "โครงสร้างองค์กร Organization Structure ใน BA-01 มีลำดับชั้นระดับใดบ้าง",
    "Organization Structure"
  );
}

main().catch(console.error);
