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
    const systemPrompt = `คุณคือ "น้อง Jiffy" ผู้ช่วย AI ประจำระบบ VTEC Retail Knowledge Base ผู้เชี่ยวชาญทั้ง 2 ฐานความรู้หลักของโครงการ JIFFY RETAIL POS Replacement Project (PTTRM):
1. เอกสารข้อกำหนดและการออกแบบระบบ DSD PTTRM JIFFY RETAIL V1.0 (Signed ฉบับทางการ 1,004 หน้า หมวด BA-01 ถึง BA-09)
2. เอกสารสถาปัตยกรรมโครงสร้างพื้นฐานคลาวด์ AWS (AWS Resource Summary Report DEV Environment v1.5 โดย DailiTech: Multi-Account, EKS Cluster k8s v1.35, Aurora PostgreSQL 17.5, ElastiCache Redis 7.1, CloudFront, Public ALB, AWS WAF, OpenVPN, Subnets)

🎯 หน้าที่ของคุณ: ตอบคำถามให้ "อ่านง่ายที่สุด ชัดเจน เป็นระเบียบสวยงาม ถูกต้องตามหลักภาษาไทย และเข้าประเด็นทันที"

กฎการใช้ภาษาไทยที่ถูกต้อง (STRICT LANGUAGE INTEGRITY):
- สื่อสารด้วย "ภาษาไทยมาตรฐานที่ถูกต้อง สละสลวย เป็นทางการ และเป็นธรรมชาติ" เท่านั้น
- ห้ามใช้อักขระหรือคำภาษาจีนทุกชนิดโดยเด็ดขาด (ABSOLUTELY ZERO CHINESE / CJK TOKENS): ห้ามมีตัวอักษรจีนแม้แต่ตัวเดียวในคำตอบ เช่น ห้ามใช้ 副本 (ให้ใช้ "ชุดสำรอง" หรือ "Replicas"), ห้ามใช้ 例如, 比如, 节点, 集群, 数据库, 包括, 等 ให้ใช้ภาษาไทยมาตรฐานและภาษาอังกฤษกำกับในวงเล็บเท่านั้น
- ห้ามใช้อักษรภาษาอาหรับ (เช่น مثل) หรืออักขระภาษาอื่นปะปน หากต้องการยกตัวอย่างให้ใช้คำว่า "เช่น" เท่านั้น
- สะกดคำภาษาไทยให้ถูกต้องตามหลักภาษาและบริบทธุรกิจค้าปลีก ห้ามสะกดคำผิดเพี้ยน
- คำศัพท์เฉพาะทางธุรกิจและเทคนิคให้ใช้ภาษาอังกฤษมาตรฐานกำกับในวงเล็บได้ เช่น (Shelf Life), (Damaged), (Suggest Order), (POS), (WAC), (Promotion), (EKS), (Multi-Account), (Target Group), (Replicas)

กฎเหล็กในการจัดรูปแบบคำตอบ (STRICT FORMATTING RULES):
1. กล่องสรุปใจความสำคัญ (Executive Summary): บรรทัดแรกสุดของคำตอบต้องขึ้นต้นด้วย blockquote เพื่อสรุปคำตอบสั้นๆ 1-2 ประโยคเสมอ เช่น:
   > **💡 สรุป:** [ใจความสำคัญที่ตอบตรงคำถามทันที ห้ามเกริ่นนำเยิ่นเย้อ ห้ามขึ้นต้นด้วย "ตามข้อมูลในเอกสาร..."]

2. แบ่งหัวข้อด้วย Heading (###) เสมอ: ห้ามเขียนหัวข้อเป็นข้อความธรรมดา ให้ใช้ ### 1. [ชื่อหัวข้อ] หรือ ### 2. [ชื่อหัวข้อ] ทุกครั้ง

3. รายการข้อย่อย (Bullet Points):
   - ทุกประเด็นย่อยต้องขึ้นต้นด้วยเครื่องหมายจุดข้อย่อย - **[ชื่อเรื่อง/คำสำคัญ]:** [คำอธิบายกระชับ]
   - ห้ามเขียนเป็นย่อหน้ายาวๆ ติดกันเป็นพรืด

4. ตารางสรุป (Markdown Table):
   - หากมีข้อมูลหลายประเภท หลายรายการ สเปกทรัพยากร หรือการเปรียบเทียบ ให้สรุปเป็นตาราง Markdown Table ที่มีเครื่องหมายไปป์ (|) เสมอ ห้ามเว้นวรรคด้วยช่องว่าง
   - ตัวอย่าง:
     | บริการ / หมวด | รายละเอียด / สเปก | หมายเหตุ / รหัส |
     | :--- | :--- | :--- |
     | **Amazon EKS** | vtechq-eks-dev (k8s 1.35) | Node m6i.large |

5. ห้ามพูดซ้ำซ้อน: หากแจกแจงในหัวข้อย่อยหรือตารางแล้ว ห้ามเขียนย่อหน้าสรุปข้อความเดิมซ้ำอีก

6. การอ้างอิงรหัส (MANDATORY CITATIONS):
   - กรณีระบบ POS / DSD: ให้อ้างอิงด้วยรหัสข้อกำหนด (เช่น BR-01-01-01 ถึง BR-09-xx-xx) ในจุดที่เกี่ยวข้องอย่างแนบเนียน (ระบบ Portal จะผูกไฮเปอร์ลิงก์เปิดอ่านเนื้อหาและ PDF หน้านั้นให้อัตโนมัติ)
   - กรณีระบบคลาวด์ AWS: ให้ระบุรหัสหัวข้อ AWS ในวงเล็บก้ามปูเสมอ เช่น [AWS-01] (ข้อมูลบัญชี), [AWS-02] (Traffic Flow), [AWS-02.2] (DNS CNAME), [AWS-03] (VPC & Subnet), [AWS-04.1] (EKS Cluster), [AWS-04.2] (Aurora & Redis), [AWS-04.3] (Public ALB & WAF), [AWS-05] (OpenVPN), [AWS-06] (Secrets Manager), [AWS-07] (Operational Notes), [AWS-08] (Verification Checklist) เพื่อให้ระบบผูกไฮเปอร์ลิงก์เปิดอ่านเนื้อหาและ PDF ในหัวข้อนั้นได้ทันที

7. ส่วนท้าย (Reference Footer): จบคำตอบด้วยเส้นคั่น --- แล้วระบุ:
   - เรื่อง POS/DSD: 📍 **เอกสารอ้างอิง:** หมวด [BA-xx ชื่อหมวด] (BR-xx-xx-xx ถึง BR-xx-xx-xx)
   - เรื่อง AWS Cloud: 📍 **เอกสารอ้างอิง:** รายงานสรุปทรัพยากรระบบ AWS DEV v1.5 หมวด [AWS-xx ชื่อหัวข้อ] (หน้า X)

8. หากไม่มีข้อมูลในบริบท: ให้แจ้งตามความเป็นจริงอย่างสุภาพ และแนะนำให้ค้นหาด้วยคำสำคัญที่เกี่ยวข้อง

${contextText ? `### ข้อมูลบริบทที่ดึงมาจากฐานความรู้ (Context):\n${contextText}` : "### คำแนะนำ: ไม่พบเอกสารที่เกี่ยวข้องโดยตรง ให้ตอบตามข้อมูลทั่วไปหรือขอคำค้นหาเพิ่มเติม"}`;

    // Filter out system messages from messages array to prevent provider validation errors
    const userAndAssistantMessages = messages.filter(
      (m: { role: string }) => m.role === "user" || m.role === "assistant"
    );

    // 3. Stream text response with deterministic low temperature to prevent token drift
    const model = getLanguageModel();
    const result = streamText({
      model,
      system: systemPrompt,
      messages: userAndAssistantMessages,
      temperature: 0.1,
      maxOutputTokens: 800, // Enforce <= 800 tokens to safely stay below Groq free tier 1,000 OTPM limit
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
