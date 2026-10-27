import fs from "fs";

// Read PNG header to get width and height
const buf = fs.readFileSync("d:\\BCN\\JFFPOS\\km-portal\\public\\images\\nong-jiffy.png");
const width = buf.readUInt32BE(16);
const height = buf.readUInt32BE(20);

console.log(`Image dimensions: ${width} x ${height}`);
