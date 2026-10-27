import fs from "fs";

const toc = fs.readFileSync("d:\\BCN\\JFFPOS\\km-portal\\scripts\\extracted-toc.txt", "utf-8");
const ba09Idx = toc.indexOf("BA-09");
if (ba09Idx !== -1) {
  console.log("BA-09 TOC:\n", toc.slice(ba09Idx, ba09Idx + 2000));
} else {
  console.log("BA-09 not found in TOC");
}
