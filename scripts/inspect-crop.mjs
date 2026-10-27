import fs from "fs";

// Let's inspect the image data or find where Nong Jiffy is
console.log("Checking image file size and properties...");
const stat = fs.statSync("d:\\BCN\\JFFPOS\\km-portal\\public\\images\\nong-jiffy.png");
console.log("Size:", stat.size);
