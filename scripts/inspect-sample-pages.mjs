import fs from "fs";
import { PDFParse } from "pdf-parse";

async function inspectSamplePages() {
  const filePath = "D:\\BCN\\JFFPOS\\DSD PTTRM JIFFY RETAIL V1.0_20260928-Signed.pdf";
  const buffer = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  await parser.destroy();

  const text = result.text;
  const pages = text.split(/-- \d+ of \d+ --/);
  console.log("Total split pages:", pages.length);

  [32, 100, 402, 550, 686].forEach((pageNum) => {
    if (pages[pageNum]) {
      console.log(`\n================ PAGE ${pageNum} ================\n`);
      console.log(pages[pageNum].trim().slice(0, 600));
    }
  });
}

inspectSamplePages().catch(console.error);
