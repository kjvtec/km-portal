const groqKey = "YOUR_GROQ_KEY_HERE";

async function testChat(model) {
  console.log(`Testing model: ${model}`);
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${groqKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: "system", content: "You are a helpful retail expert." },
        { role: "user", content: "สรุปสั้นๆ 1 ประโยคว่า WAC ย่อมาจากอะไร" },
      ],
      max_tokens: 100,
    }),
  });
  const data = await res.json();
  if (data.choices) {
    console.log("Response:", data.choices[0].message.content);
  } else {
    console.error("Chat error:", data);
  }
}

async function main() {
  await testChat("qwen/qwen3.8-27b");
  await testChat("openai/gpt-oss-120b");
}

main().catch(console.error);
