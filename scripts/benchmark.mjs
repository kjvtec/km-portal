async function benchmark() {
  console.log("=== BENCHMARKING REFACTORED PRODUCTION ===");

  // 1. Homepage Latency
  const t0 = performance.now();
  const res1 = await fetch("https://km-portal-gamma.vercel.app");
  const html = await res1.text();
  const t1 = performance.now();
  console.log("1. Homepage TTFB + Load:", (t1 - t0).toFixed(0), "ms");
  console.log("   HTML Size:", (html.length / 1024).toFixed(1), "KB");

  // 2. Search API First Query (Cold / Parallel DB query)
  const t2 = performance.now();
  const resSearch1 = await fetch("https://km-portal-gamma.vercel.app/api/search?q=Tolerance+Limit");
  const json1 = await resSearch1.json();
  const t3 = performance.now();
  console.log("2. Search API (Cold Parallel):", (t3 - t2).toFixed(0), "ms", "Matches:", json1.results?.length);

  // 3. Search API Cached Query (In-Memory LRU Cache)
  const t4 = performance.now();
  const resSearch2 = await fetch("https://km-portal-gamma.vercel.app/api/search?q=Tolerance+Limit");
  const json2 = await resSearch2.json();
  const t5 = performance.now();
  console.log("3. Search API (In-Memory Cache Hit):", (t5 - t4).toFixed(0), "ms", "Matches:", json2.results?.length);

  // 4. Static PDF Caching Headers
  const resPdf = await fetch("https://km-portal-gamma.vercel.app/docs/DSD-PTTRM-JIFFY-RETAIL-V1.0_Signed.pdf", {
    method: "HEAD"
  });
  console.log("4. PDF Headers:");
  console.log("   Cache-Control:", resPdf.headers.get("cache-control"));
  console.log("   Accept-Ranges:", resPdf.headers.get("accept-ranges"));
  console.log("   Content-Length MB:", (Number(resPdf.headers.get("content-length")) / 1024 / 1024).toFixed(2));
}
benchmark();
