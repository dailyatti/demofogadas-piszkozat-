import fs from 'node:fs';

const file = "C:\\Users\\djatt\\Downloads\\demó fogadás\\assets\\js\\app.js";
try {
  const content = fs.readFileSync(file, "utf8");
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes("function renderTipstersTable") || line.includes("renderTipstersTable()")) {
      console.log(`Line ${i+1}: ${line.trim()}`);
      // Print 50 lines from here
      console.log(lines.slice(i, i+60).join('\n'));
      break;
    }
  }
} catch (err) {
  console.error(err);
}
