import fs from "fs";
import { PDFParse } from "pdf-parse";

async function extractAllBRs() {
  const filePath = "D:\\BCN\\JFFPOS\\DSD PTTRM JIFFY RETAIL V1.0_20260928-Signed.pdf";
  const buffer = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  await parser.destroy();

  const text = result.text;
  
  // Table of Contents is roughly pages 3 to 16
  const tocStart = text.indexOf("Table of Contents");
  const tocEnd = text.indexOf("CHAPTER A. Document Overview and Project Background", tocStart + 500);
  
  const tocText = text.slice(tocStart, tocEnd > 0 ? tocEnd : tocStart + 45000);
  console.log("TOC length:", tocText.length);
  
  // Save TOC text to file to inspect
  fs.writeFileSync("d:\\BCN\\JFFPOS\\km-portal\\scripts\\extracted-toc.txt", tocText, "utf-8");
  console.log("Saved extracted-toc.txt");
}

extractAllBRs().catch(console.error);
