import fs from "fs";
import { PDFParse } from "pdf-parse";

const PDF_PATH = "D:\\BCN\\JFFPOS\\DSD PTTRM JIFFY RETAIL V1.0_20260928-Signed.pdf";
const OUTPUT_PATH = "d:\\BCN\\JFFPOS\\km-portal\\data\\dsd-signed-chunks.json";

async function exportChunks() {
  console.log("Reading PDF...");
  const buffer = fs.readFileSync(PDF_PATH);
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  await parser.destroy();

  const rawPages = result.text.split(/-- \d+ of \d+ --/);
  const chunks = [];
  let currentBA = "Overview";

  for (let i = 1; i < rawPages.length; i++) {
    const pageNum = i;
    let pageContent = rawPages[i].trim();

    pageContent = pageContent
      .replace(/Design Specification Document \(DSD\)/gi, "")
      .replace(/JIFFY RETAIL POS Replacement Project for PTTRM/gi, "")
      .replace(/PTT Retail Management Company Limited: Strictly Confidential Page \d+ of \d+/gi, "")
      .replace(/Author :[^\n]*\n/gi, "")
      .trim();

    const baMatch = pageContent.match(/BA-\d{2}[^\n\r]+/);
    if (baMatch) {
      currentBA = baMatch[0].trim();
    } else {
      const chapterMatch = pageContent.match(/CHAPTER [A-Z][^\n\r]+/);
      if (chapterMatch) {
        currentBA = chapterMatch[0].trim();
      }
    }

    if (pageContent.length < 30) continue;

    if (pageContent.length > 2500) {
      const half = Math.floor(pageContent.length / 2);
      const splitIdx = pageContent.indexOf("\n", half);
      const part1 = pageContent.slice(0, splitIdx > 0 ? splitIdx : half).trim();
      const part2 = pageContent.slice(splitIdx > 0 ? splitIdx : half).trim();

      chunks.push({
        pageNum,
        ba: currentBA,
        content: `[เอกสาร DSD PTTRM JIFFY RETAIL V1.0 | หน้า ${pageNum}/1004 | หมวด: ${currentBA} (ตอนที่ 1)]\n${part1}`,
      });
      chunks.push({
        pageNum,
        ba: currentBA,
        content: `[เอกสาร DSD PTTRM JIFFY RETAIL V1.0 | หน้า ${pageNum}/1004 | หมวด: ${currentBA} (ตอนที่ 2)]\n${part2}`,
      });
    } else {
      chunks.push({
        pageNum,
        ba: currentBA,
        content: `[เอกสาร DSD PTTRM JIFFY RETAIL V1.0 | หน้า ${pageNum}/1004 | หมวด: ${currentBA}]\n${pageContent}`,
      });
    }
  }

  console.log(`Exporting ${chunks.length} chunks to JSON...`);
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(chunks, null, 2), "utf-8");
  console.log(`Saved successfully to ${OUTPUT_PATH} (${(fs.statSync(OUTPUT_PATH).size / (1024 * 1024)).toFixed(2)} MB)`);
}

exportChunks().catch(console.error);
