import fs from "fs";
import { PDFParse } from "pdf-parse";

async function extractAllBrDetails() {
  console.log("Loading PDF and ba-br-structure.json...");
  const baData = JSON.parse(fs.readFileSync("./data/ba-br-structure.json", "utf-8"));
  const buf = fs.readFileSync("./public/docs/DSD-PTTRM-JIFFY-RETAIL-V1.0_Signed.pdf");
  
  const parser = new PDFParse({ data: buf });
  const res = await parser.getText();
  await parser.destroy();

  const pages = res.text.split(/-- \d+ of \d+ --/);
  console.log("Extracted pages count:", pages.length);

  const brDetails = {};

  // For each BA and BR item
  for (const [baCode, items] of Object.entries(baData)) {
    for (const item of items) {
      if (!item.code || !item.page) continue;
      
      const pageIndex = item.page - 1; // 0-based
      // Search in pageIndex, pageIndex + 1, and pageIndex - 1 to find where the BR code starts
      let bestPage = item.page;
      let fullContent = "";

      // Check current page, next page, previous page
      const candidates = [pageIndex, pageIndex + 1, pageIndex - 1];
      for (const p of candidates) {
        if (p >= 0 && p < pages.length) {
          const pageStr = pages[p] || "";
          if (pageStr.includes(item.code)) {
            bestPage = p + 1; // 1-based page in PDF
            fullContent = pageStr;
            // Also append next page if requirement continues
            if (p + 1 < pages.length) {
              const nextPageStr = pages[p + 1] || "";
              if (!nextPageStr.match(/BR-\d{2}-\d{2}/)) {
                fullContent += "\n\n" + nextPageStr;
              }
            }
            break;
          }
        }
      }

      if (!fullContent && pageIndex >= 0 && pageIndex < pages.length) {
        fullContent = pages[pageIndex] || "";
      }

      // Clean up headers and footers
      const cleanedLines = fullContent
        .split("\n")
        .filter(line => {
          const l = line.trim();
          if (!l) return false;
          if (l.includes("Design Specification Document (DSD)")) return false;
          if (l.includes("JIFFY RETAIL POS Replacement Project for PTTRM")) return false;
          if (l.includes("PTT Retail Management Company Limited: Strictly Confidential")) return false;
          if (l.match(/^Page \d+ of \d+$/)) return false;
          return true;
        });

      brDetails[item.code] = {
        code: item.code,
        title: item.title,
        baCode: baCode,
        page: bestPage,
        content: cleanedLines.slice(0, 40).join("\n"),
      };
    }
  }

  console.log(`Successfully mapped ${Object.keys(brDetails).length} BR details!`);
  
  // Test sample
  console.log("\nSample BR-01-01-04:\n", brDetails["BR-01-01-04"]);
  console.log("\nSample BR-05-02-12:\n", brDetails["BR-05-02-12"]);

  fs.writeFileSync("./data/br-details.json", JSON.stringify(brDetails, null, 2), "utf-8");
  console.log("Saved to ./data/br-details.json");
}

extractAllBrDetails().catch(console.error);
