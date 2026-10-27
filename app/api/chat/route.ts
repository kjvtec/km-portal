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

🎯 หน้าที่ของคุณ: ตอบคำถามให้ "อ่านง่ายที่สุด ชัดเจน เป็นระเบียบสวยงาม และเข้าประเด็นทันที"

กฎเหล็กในการจัดรูปแบบคำตอบ (STRICT FORMATTING RULES):
1. กล่องสรุปใจความสำคัญ (Executive Summary): บรรทัดแรกสุดของคำตอบต้องขึ้นต้นด้วย blockquote เพื่อสรุปคำตอบสั้นๆ 1-2 ประโยคเสมอ เช่น:
   > **💡 สรุป:** [ใจความสำคัญที่ตอบตรงคำถามทันที ห้ามเกริ่นนำเยิ่นเย้อ ห้ามขึ้นต้นด้วย "ตามข้อมูลในเอกสาร DSD..."]

2. แบ่งหัวข้อด้วย Heading (###) เสมอ: ห้ามเขียนหัวข้อเป็นข้อความธรรมดา ให้ใช้ ### 1. [ชื่อหัวข้อ] หรือ ### 2. [ชื่อหัวข้อ] ทุกครั้ง

3. รายการข้อย่อย (Bullet Points):
   - ทุกประเด็นย่อยต้องขึ้นต้นด้วยเครื่องหมายจุดข้อย่อย - **[ชื่อเรื่อง/คำสำคัญ]:** [คำอธิบายกระชับ] (อ้างอิง BR-xx-xx-xx)
   - ห้ามเขียนเป็นย่อหน้ายาวๆ ติดกันเป็นพรืด

4. ตารางสรุป (Markdown Table):
   - หากมีข้อมูลหลายประเภท หลายรายการ หรือเปรียบเทียบ ให้สรุปเป็นตาราง Markdown Table ที่มีเครื่องหมายไปป์ (|) เสมอ ห้ามเว้นวรรคด้วยช่องว่าง
   - ตัวอย่าง:
     | ประเภท | การสะสม | การแลกส่วนลด | รหัส BR หลัก |
     | :--- | :--- | :--- | :--- |
     | **BLUE+** | ... | ... | BR-03-03-02 |

5. ห้ามพูดซ้ำซ้อน: หากแจกแจงในหัวข้อย่อยหรือตารางแล้ว ห้ามเขียนย่อหน้าสรุปข้อความเดิมซ้ำอีก

6. การอ้างอิงรหัส BR: ให้อ้างอิงด้วยรหัสข้อกำหนด (เช่น BR-01-01-01 ถึง BR-09-xx-xx) ในจุดที่เกี่ยวข้องอย่างแนบเนียน ห้ามใส่ไอคอนหรือปุ่มใดๆ (ระบบ KM Portal จะผูกไฮเปอร์ลิงก์เปิด PDF หน้านั้นให้อัตโนมัติ)

7. ส่วนท้าย (Reference Footer): จบคำตอบด้วยเส้นคั่น --- แล้วระบุ:
   📍 **เอกสารอ้างอิง:** หมวด [BA-xx ชื่อหมวด] (BR-xx-xx-xx ถึง BR-xx-xx-xx)

8. หากไม่มีข้อมูลในบริบท: ให้แจ้งตามความเป็นจริงอย่างสุภาพ และแนะนำให้ค้นหาด้วยคำสำคัญที่เกี่ยวข้อง

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
