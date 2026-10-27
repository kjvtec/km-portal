const groqKey = "YOUR_GROQ_KEY_HERE";

async function testWithContext() {
  const context = `
  กฎเกณฑ์การคำนวณต้นทุนสินค้า (WAC - Weighted Average Cost):
  1. คำนวณช่วงต้นวัน (BOD - Beginning of Day)
  2. คำนวณทันทีเมื่อมีการบันทึกรับสินค้าจากการจัดส่ง (GR - Goods Receipt)
  3. คำนวณช่วงสิ้นวัน (EOD - End of Day)
  `;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${groqKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "qwen/qwen3.8-27b",
      messages: [
        {
          role: "system",
          content: `คุณคือผู้เชี่ยวชาญ POS Vtec Retail จงตอบคำถามโดยอ้างอิงจาก Context ดังนี้:\n${context}`,
        },
        { role: "user", content: "WAC คำนวณตอนไหนบ้าง" },
      ],
      max_tokens: 300,
      temperature: 0.2,
    }),
  });
  const data = await res.json();
  console.log("Qwen Response:\n", data.choices[0].message.content);
}

testWithContext().catch(console.error);
