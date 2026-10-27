import fs from "fs";
import { PDFParse } from "pdf-parse";

async function checkPages() {
  const filePath = "D:\\BCN\\JFFPOS\\DSD PTTRM JIFFY RETAIL V1.0_20260928-Signed.pdf";
  const buffer = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  await parser.destroy();

  const text = result.text;
  const pageMatches = text.match(/-- \d+ of \d+ --/g) || [];
  console.log("Total page markers found:", pageMatches.length);
  console.log("First 5 page markers:", pageMatches.slice(0, 5));
  console.log("Last 5 page markers:", pageMatches.slice(-5));
}

checkPages().catch(console.error);
