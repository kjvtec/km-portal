import fs from "fs";
import { PDFParse } from "pdf-parse";

async function analyze() {
  const filePath = "D:\\BCN\\JFFPOS\\DSD PTTRM JIFFY RETAIL V1.0_20260928-Signed.pdf";
  const buffer = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  await parser.destroy();

  const text = result.text;
  console.log("Total text length:", text.length);

  // Look for Table of Contents / Outline
  const tocIndex = text.indexOf("Table of Contents");
  if (tocIndex !== -1) {
    console.log("Found Table of Contents:\n", text.slice(tocIndex, tocIndex + 3000));
  } else {
    const contentsIndex = text.indexOf("สารบัญ");
    if (contentsIndex !== -1) {
      console.log("Found สารบัญ:\n", text.slice(contentsIndex, contentsIndex + 3000));
    } else {
      console.log("TOC keyword not found in standard form, first 3000 chars:\n", text.slice(0, 3000));
    }
  }
}

analyze().catch(console.error);
