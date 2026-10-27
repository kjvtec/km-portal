async function check() {
  const mod = await import("pdf-parse");
  console.log("Keys:", Object.keys(mod));
  console.log("Default:", mod.default);
  console.log("Type of mod:", typeof mod);
}
check();
