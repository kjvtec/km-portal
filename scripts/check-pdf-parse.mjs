async function check() {
  const { PDFParse } = await import("pdf-parse");
  console.log("PDFParse:", PDFParse);
  console.log("PDFParse prototype methods:", Object.getOwnPropertyNames(PDFParse.prototype || {}));
}
check();
