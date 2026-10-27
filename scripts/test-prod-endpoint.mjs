const prodUrl = "https://km-portal-gamma.vercel.app";

async function testSearch() {
  console.log("Testing Search API on Production...");
  const res = await fetch(`${prodUrl}/api/search?q=WAC`);
  const data = await res.json();
  console.log("Search HTTP status:", res.status);
  console.log("Matches found:", data.results?.length);
  if (data.results && data.results.length > 0) {
    console.log("Top match:", data.results[0].content.slice(0, 120));
  }
}

async function testChat() {
  console.log("\nTesting Chat Streaming API on Production...");
  const res = await fetch(`${prodUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: "WAC คำนวณตอนไหนบ้าง สรุปเป็นข้อๆ" }],
    }),
  });

  console.log("Chat HTTP status:", res.status);
  if (!res.ok) {
    console.error("Chat error:", await res.text());
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let done = false;
  process.stdout.write("Answer: ");
  while (!done) {
    const { value, done: isDone } = await reader.read();
    done = isDone;
    if (value) {
      process.stdout.write(decoder.decode(value, { stream: true }));
    }
  }
  console.log("\nDone!");
}

async function main() {
  await testSearch();
  await testChat();
}

main().catch(console.error);
