const groqKey = "YOUR_GROQ_KEY_HERE";

async function testGroq() {
  const res = await fetch("https://api.groq.com/openai/v1/models", {
    headers: {
      Authorization: `Bearer ${groqKey}`,
    },
  });
  const data = await res.json();
  if (data.data) {
    console.log("All Groq models:", data.data.map((m) => m.id));
  } else {
    console.error("Groq error:", data);
  }
}

testGroq().catch(console.error);
