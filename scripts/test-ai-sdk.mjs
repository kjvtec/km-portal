import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: "YOUR_GROQ_KEY_HERE",
});

async function testAiSdkStream() {
  console.log("Testing streamText with Groq qwen/qwen3.8-27b...");
  const result = streamText({
    model: groq("qwen/qwen3.8-27b"),
    system: "You are a helpful retail expert.",
    messages: [
      { role: "user", content: "ตอบสั้นๆ 1 ประโยค: POS ย่อมาจากอะไร" },
    ],
  });

  for await (const delta of result.textStream) {
    process.stdout.write(delta);
  }
  console.log("\nDone!");
}

testAiSdkStream().catch(console.error);
