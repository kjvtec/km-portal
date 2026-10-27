import baBrData from "../data/ba-br-structure.json" assert { type: "json" };

console.log("BA-01 BRs count:", baBrData["BA-01"].length);
console.log("Sample BA-01:", baBrData["BA-01"].slice(0, 3));
console.log("Sample BA-06:", baBrData["BA-06"].slice(0, 3));
