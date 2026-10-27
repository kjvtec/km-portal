import fs from "fs";
import { PDFParse } from "pdf-parse";

async function listBAs() {
  const filePath = "D:\\BCN\\JFFPOS\\DSD PTTRM JIFFY RETAIL V1.0_20260928-Signed.pdf";
  const buffer = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  await parser.destroy();

  const text = result.text;
  const baMatches = text.match(/BA-\d{2}[^\n\r]+/g) || [];
  const uniqueBAs = Array.from(new Set(baMatches.map((s) => s.trim())));
  console.log("Found BAs in document:");
  uniqueBAs.forEach((ba) => console.log(ba));
}

listBAs().catch(console.error);
