import fs from "fs";
import { PDFParse } from "pdf-parse";

async function inspectPdf() {
  const filePath = "D:\\BCN\\JFFPOS\\DSD PTTRM JIFFY RETAIL V1.0_20260928-Signed.pdf";
  console.log("Reading file buffer...");
  const buffer = fs.readFileSync(filePath);
  console.log("Buffer size:", buffer.length);

  try {
    const parser = new PDFParse({ data: buffer });
    console.log("Getting text...");
    const result = await parser.getText();
    console.log("Extracted text length:", result.text?.length);
    console.log("Sample text:\n", result.text?.slice(0, 1500));
    await parser.destroy();
  } catch (err) {
    console.error("PDF parse error:", err);
  }
}

inspectPdf().catch(console.error);
