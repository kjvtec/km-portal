import fs from "fs";

const toc = fs.readFileSync("d:\\BCN\\JFFPOS\\km-portal\\scripts\\extracted-toc.txt", "utf-8");
const ba09Idx = toc.indexOf("BA-09-Data Definition & Data Dictionary");
console.log(toc.slice(ba09Idx, ba09Idx + 6000));
