import fs from "fs";

const content = fs.readFileSync("data/seed-knowledge-base.md", "utf-8");
const matches = content.match(/BR-[0-9\-]+/g);
console.log("Unique BR codes found:", Array.from(new Set(matches)));
