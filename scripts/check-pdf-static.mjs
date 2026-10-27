async function check() {
  const { PDFParse } = await import("pdf-parse");
  console.log("Static methods on PDFParse:", Object.getOwnPropertyNames(PDFParse));
}
check();
