import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { searchSimilarChunks } from "@/lib/ai/search";

export const maxDuration = 45; // Support longer streaming for Vercel

function getLanguageModel() {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (groqApiKey) {
    const groq = createOpenAI({
      baseURL: "https://api.groq.com/openai/v1",
      apiKey: groqApiKey,
    });
    return groq("qwen/qwen3.8-27b");
  }

  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (openaiApiKey) {
    const openai = createOpenAI({
      apiKey: openaiApiKey,
    });
    return openai("gpt-4o-mini");
  }

  throw new Error(
    "Missing AI API key. Please configure GROQ_API_KEY or OPENAI_API_KEY."
  );
}

export async function POST(req: Request) {
  try {
    const { messages, workspaceId } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages array is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get the latest user query
    const latestUserMessage = [...messages].reverse().find((m) => m.role === "user");
    const query = latestUserMessage ? latestUserMessage.content : "";

    // 1. Perform retrieval if there is a query
    let contextText = "";
    const sourceDocuments: Array<{ title: string; similarity: number }> = [];

    if (query && query.trim().length > 0) {
      try {
        const matchedChunks = await searchSimilarChunks(query, {
          workspaceId,
          threshold: 0.2,
          limit: 6,
        });

        if (matchedChunks.length > 0) {
          contextText = matchedChunks
            .map(
              (chunk, i) =>
                `--- [เอกสารอ้างอิงที่ ${i + 1}: ${chunk.title} (ความเกี่ยวข้อง: ${(chunk.similarity * 100).toFixed(0)}%)] ---\n${chunk.content}`
            )
            .join("\n\n");

          for (const chunk of matchedChunks) {
            if (!sourceDocuments.some((s) => s.title === chunk.title)) {
              sourceDocuments.push({
                title: chunk.title,
                similarity: chunk.similarity,
              });
            }
          }
        }
      } catch (err) {
        console.warn("Could not retrieve semantic context:", err);
      }
    }

    // 2. Build system instruction
    const systemPrompt = `คุณคือ "น้อง Jiffy" ผู้ช่วย AI ประจำระบบ VTEC Retail Knowledge Base และผู้เชี่ยวชาญเอกสารข้อกำหนดการออกแบบระบบ DSD PTTRM JIFFY RETAIL V1.0 (Signed ฉบับทางการ 1,004 หน้า หมวด BA-01 ถึง BA-09)

หลักการจัดรูปแบบคำตอบให้อ่านง่าย สบายตา เป็นระเบียบ และไม่ซ้ำซ้อน:
1. เข้าประเด็นทันที (Direct Answer): ตอบตรงคำถามใน 1 ประโยคแรกอย่างชัดเจน ห้ามเกริ่นนำเยิ่นเย้อ (ห้ามขึ้นต้นด้วย "ตามข้อมูลในเอกสาร DSD PTTRM..." หรือทวนชื่อเอกสารยาวๆ เด็ดขาด)
2. จัดระเบียบด้วย Bullet Points หรือ Numbered List:
   - ใช้เครื่องหมายจุดข้อย่อย (- ) หรือลำดับตัวเลข (1. 2. 3.) ให้เป็นระเบียบชัดเจน
   - แยกหัวข้อย่อยและเน้นตัวหนา เช่น:
     - **หัวข้อหลัก/ระดับ:** คำอธิบายกระชับ ชัดเจน (อ้างอิง BR-xx-xx-xx)
3. ห้ามเขียนเนื้อหาซ้ำซ้อน (No Redundancy): หากแจกแจงข้อย่อยหรือขั้นตอนแล้ว ห้ามเขียนย่อหน้าสรุปข้อความเดิมซ้ำอีก
4. การอ้างอิงรหัส BR: ให้อ้างอิงด้วยรหัสข้อกำหนด (เช่น BR-01-01-01 ถึง BR-09-xx-xx) ในจุดที่เกี่ยวข้องอย่างแนบเนียน ห้ามใส่ไอคอนหรือสัญลักษณ์ปุ่มตกแต่งใดๆ มาทำให้รกตา (ระบบ KM Portal จะผูกไฮเปอร์ลิงก์เปิด PDF หน้านั้นให้อัตโนมัติ)
5. ใช้ตาราง Markdown: หากเป็นข้อมูลเปรียบเทียบ ค่าพารามิเตอร์ หรือโครงสร้างฟิลด์ ให้จัดเป็นตารางที่อ่านง่าย
6. สรุปหมวดอ้างอิงท้ายคำตอบ: ระบุสั้นๆ 1 บรรทัดท้ายคำตอบ เช่น:
   📍 **เอกสารอ้างอิง:** หมวด BA-01 โครงสร้างข้อมูลหลัก (BR-01-01-01 ถึง BR-01-01-04)
7. หากไม่มีข้อมูลในบริบท: ให้แจ้งตามความเป็นจริงอย่างสุภาพ และแนะนำให้ค้นหาด้วยคำสำคัญที่เกี่ยวข้อง

${contextText ? `### ข้อมูลบริบทที่ดึงมาจากฐานความรู้ (Context):\n${contextText}` : "### คำแนะนำ: ไม่พบเอกสารที่เกี่ยวข้องโดยตรง ให้ตอบตามข้อมูลทั่วไปหรือขอคำค้นหาเพิ่มเติม"}`;

    // Filter out system messages from messages array to prevent provider validation errors
    const userAndAssistantMessages = messages.filter(
      (m: { role: string }) => m.role === "user" || m.role === "assistant"
    );

    // 3. Stream text response
    const model = getLanguageModel();
    const result = streamText({
      model,
      system: systemPrompt,
      messages: userAndAssistantMessages,
    });

    return result.toTextStreamResponse();
  } catch (error: unknown) {
    console.error("Chat API error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
