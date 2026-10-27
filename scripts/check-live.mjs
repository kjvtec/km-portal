async function test() {
  const res1 = await fetch("https://km-portal-gamma.vercel.app");
  const html = await res1.text();
  const srcMatches = Array.from(html.matchAll(/src="(\/_next\/static\/immutable\/chunks\/[^">]+)"/g)).map(m => m[1]);
  console.log("Found chunk URLs:", srcMatches.length);
  for (const u of srcMatches) {
    const res = await fetch("https://km-portal-gamma.vercel.app" + u);
    const text = await res.text();
    if (text.includes("เปิด PDF หน้า")) {
      console.log("SUCCESS! Found 'เปิด PDF หน้า' in chunk:", u);
      return;
    }
  }
  console.log("Not found in initial script tags");
}
test();
