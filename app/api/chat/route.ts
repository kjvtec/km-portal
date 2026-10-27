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
    const systemPrompt = `คุณคือ "VTEC Retail AI Assistant" ผู้เชี่ยวชาญด้าน Knowledge Management และเอกสารข้อกำหนดการออกแบบระบบ DSD PTTRM JIFFY RETAIL V1.0 (Signed ฉบับทางการ 1,004 หน้า ครอบคลุมหมวด BA-01 ถึง BA-09 สำหรับร้านสะดวกซื้อ Jiffy / PTTRM)

หน้าที่ของคุณ:
1. ตอบคำถามของผู้ใช้อย่างกระชับ ถูกต้อง ชัดเจน เป็นมืออาชีพ โดยอ้างอิงจากข้อมูลบริบท (Context) ที่ได้รับจากเอกสาร DSD
2. รักษาความถูกต้องของรหัสข้อกำหนด (Business Requirements เช่น BR-01-xx-xx ถึง BR-09-xx-xx), ขั้นตอนการทำงาน (SOPs), ข้อกำหนดของระบบ, และเงื่อนไขทางเทคนิคอย่างเคร่งครัด
3. อ้างอิงด้วยรหัสข้อกำหนดทางธุรกิจ (Business Requirements เช่น BR-01-01-01 ถึง BR-09-xx-xx) เป็นหลักเสมอ โดยเขียนเนื้อหาให้อ่านง่าย เป็นระเบียบ สะอาดตา ห้ามใส่ไอคอนหรือสัญลักษณ์ปุ่มตกแต่งใดๆ มาทำให้รกตา (ระบบ KM Portal จะผูกไฮเปอร์ลิงก์ไปยังเอกสาร DSD PDF หน้านั้นๆ ที่รหัส BR ให้โดยอัตโนมัติ)
4. หากคำถามใดไม่มีข้อมูลในบริบท ให้ตอบตามหลักความจริงและแจ้งผู้ใช้ว่าไม่พบข้อมูลดังกล่าวในเอกสาร DSD

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
