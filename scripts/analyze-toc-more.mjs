import fs from "fs";
import { PDFParse } from "pdf-parse";

async function analyze() {
  const filePath = "D:\\BCN\\JFFPOS\\DSD PTTRM JIFFY RETAIL V1.0_20260928-Signed.pdf";
  const buffer = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  await parser.destroy();

  const text = result.text;
  const tocIndex = text.indexOf("Table of Contents");
  console.log(text.slice(tocIndex, tocIndex + 8000));
}

analyze().catch(console.error);
