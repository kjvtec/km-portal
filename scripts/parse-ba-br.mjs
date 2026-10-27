import fs from "fs";

const toc = fs.readFileSync("d:\\BCN\\JFFPOS\\km-portal\\scripts\\extracted-toc.txt", "utf-8");
const lines = toc.split(/\r?\n/);

const bas = {
  "BA-01": [],
  "BA-02": [],
  "BA-03": [],
  "BA-04": [],
  "BA-05": [],
  "BA-06": [],
  "BA-07": [],
  "BA-08": [],
  "BA-09": [],
};

let currentBA = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  const baMatch = line.match(/BA-(0[1-9])/);
  if (baMatch) {
    currentBA = `BA-${baMatch[1]}`;
  }

  if (currentBA && currentBA !== "BA-09") {
    // Check for BR pattern
    const brMatch = line.match(/(BR-\d{2}-\d{2}(-\d{2})?)\s+(.+?)(?:\s*\.{4,}\s*(\d+))?$/);
    if (brMatch) {
      const code = brMatch[1];
      let title = brMatch[3].replace(/\.{3,}.*$/, "").trim();
      const page = brMatch[4];
      
      if (!bas[currentBA].some(item => item.code === code)) {
        bas[currentBA].push({
          code,
          title,
          page: page ? parseInt(page, 10) : undefined
        });
      }
    }
  } else if (currentBA === "BA-09") {
    // Extract tables or sections in BA-09
    const tableMatch = line.match(/^([a-z0-9_]+)\s*\.{4,}\s*(\d+)$/);
    if (tableMatch) {
      const tableName = tableMatch[1];
      const page = parseInt(tableMatch[2], 10);
      if (!bas["BA-09"].some(item => item.code === tableName)) {
        bas["BA-09"].push({
          code: `Table: ${tableName}`,
          title: `Data Dictionary โครงสร้างตาราง ${tableName}`,
          page
        });
      }
    } else {
      const sectionMatch = line.match(/^(\d+\.\s+[^\.]+?)\s*\.{4,}\s*(\d+)$/);
      if (sectionMatch) {
        bas["BA-09"].push({
          code: `Section ${sectionMatch[1].slice(0, 2)}`,
          title: sectionMatch[1].trim(),
          page: parseInt(sectionMatch[2], 10)
        });
      }
    }
  }
}

for (const [ba, list] of Object.entries(bas)) {
  console.log(`${ba}: found ${list.length} sub-items`);
}

fs.writeFileSync("d:\\BCN\\JFFPOS\\km-portal\\data\\ba-br-structure.json", JSON.stringify(bas, null, 2), "utf-8");
console.log("Updated data/ba-br-structure.json successfully");
